// Simulated communication network (WPT-IOT-001).
//
// Messages travel over named links with latency, jitter, loss, duplication
// and reordering drawn from a seeded generator, so a run is reproducible. Each
// receiver checks sequence numbers (duplicates and replays, out-of-order),
// freshness and a message authentication tag. The message dictionary, frame
// layout and authentication tag are this simulator's own, for teaching: they
// are not a standardised protocol, an OEM CAN database or real cryptography
// (the tag is FNV-1a, which offers no security).
import { createRng, type Rng } from "./math";

export type LinkId = "can" | "vehicle" | "backend" | "cloud" | "road";

export const LINKS: Record<LinkId, { name: string; technology: string; note: string }> = {
  can: { name: "Vehicle CAN", technology: "CAN-FD (simulated)", note: "BMS ↔ VCU inside the vehicle." },
  vehicle: { name: "Vehicle ↔ station", technology: "Wireless LAN, point-to-point (simulated)", note: "Pairing, identification, BMS heartbeat and power set-points." },
  backend: { name: "Station ↔ backend", technology: "WebSocket/JSON, OCPP-style messages (illustrative, not a conformance implementation)", note: "Authorisation and session records. Not used for real-time power control." },
  cloud: { name: "Gateway → cloud", technology: "MQTT-style publish (simulated)", note: "Telemetry for the digital twin and analytics. Never in the safety loop." },
  road: { name: "Road segment bus", technology: "Wired field bus (simulated)", note: "Segment controllers and vehicle detection on the electrified road." },
};

export interface LinkConfig {
  /** Mean one-way latency, s. */
  latency: number;
  /** Standard deviation of latency, s. */
  jitter: number;
  /** Probability a message is lost. */
  loss: number;
  /** Probability a delivered message arrives twice. */
  duplicate: number;
  up: boolean;
  /** Messages older than this on arrival are stale, s. */
  staleAfter: number;
  /** True when the sender signs with the wrong key (simulated authentication failure). */
  badKey: boolean;
}

export const DEFAULT_LINKS: Record<LinkId, LinkConfig> = {
  can: { latency: 0.0008, jitter: 0.0002, loss: 0, duplicate: 0, up: true, staleAfter: 0.05, badKey: false },
  vehicle: { latency: 0.012, jitter: 0.004, loss: 0.002, duplicate: 0, up: true, staleAfter: 0.25, badKey: false },
  backend: { latency: 0.18, jitter: 0.06, loss: 0.001, duplicate: 0, up: true, staleAfter: 5, badKey: false },
  cloud: { latency: 0.12, jitter: 0.05, loss: 0.002, duplicate: 0, up: true, staleAfter: 10, badKey: false },
  road: { latency: 0.004, jitter: 0.001, loss: 0, duplicate: 0, up: true, staleAfter: 0.05, badKey: false },
};

export type Payload = Record<string, number | string | boolean>;

export interface Message {
  id: number;
  seq: number;
  link: LinkId;
  src: string;
  dst: string;
  type: string;
  sentAt: number;
  arriveAt: number;
  payload: Payload;
  /** Hex dump of the frame: type code, sequence, then each field. */
  raw: string;
  tag: string;
  copy?: boolean;
}

export type DeliveryStatus = "ok" | "duplicate" | "out-of-order" | "stale" | "auth-failed";

export interface Delivered extends Message {
  receivedAt: number;
  latency: number;
  status: DeliveryStatus;
}

export interface LinkStats {
  sent: number;
  delivered: number;
  lost: number;
  duplicates: number;
  outOfOrder: number;
  stale: number;
  authFailed: number;
  latencySum: number;
}

const SHARED_KEY = "wevc-sim-key";

/** FNV-1a 32-bit hash, hex. A stand-in tag for teaching: not a cryptographic MAC. */
export function fnv1a(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

const TYPE_CODES = new Map<string, number>();
const typeCode = (type: string) => {
  if (!TYPE_CODES.has(type)) TYPE_CODES.set(type, (Number.parseInt(fnv1a(type).slice(0, 2), 16) % 0xf0) + 0x10);
  return TYPE_CODES.get(type)!;
};

/** The frame as hex: type code (1 byte), sequence (2), then numbers ×100 as int32, booleans as 1 byte, strings as 4 ASCII bytes. */
export function encodeFrame(type: string, seq: number, payload: Payload): string {
  const bytes: number[] = [typeCode(type), (seq >> 8) & 0xff, seq & 0xff];
  for (const value of Object.values(payload)) {
    if (typeof value === "number") {
      const v = Math.round(value * 100) | 0;
      bytes.push((v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff);
    } else if (typeof value === "boolean") bytes.push(value ? 1 : 0);
    else for (let i = 0; i < 4; i++) bytes.push(value.charCodeAt(i) || 0);
  }
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ").toUpperCase();
}

export const messageTag = (key: string, type: string, seq: number, payload: Payload) => fnv1a(`${key}|${type}|${seq}|${JSON.stringify(payload)}`);

/** A deterministic multi-link message bus. */
export class Bus {
  links: Record<LinkId, LinkConfig>;
  readonly stats: Record<LinkId, LinkStats>;
  readonly log: Delivered[] = [];
  private queue: Message[] = [];
  private nextId = 1;
  private seqs = new Map<string, number>();
  private lastSeen = new Map<string, number>();
  private seen = new Map<string, Set<number>>();
  private rng: Rng;
  constructor(
    seed: number,
    links: Record<LinkId, LinkConfig> = DEFAULT_LINKS,
    private readonly logLimit = 400,
  ) {
    this.rng = createRng(seed ^ 0x9e3779b9);
    this.links = structuredClone(links);
    this.stats = Object.fromEntries((Object.keys(LINKS) as LinkId[]).map((id) => [id, { sent: 0, delivered: 0, lost: 0, duplicates: 0, outOfOrder: 0, stale: 0, authFailed: 0, latencySum: 0 }])) as Record<LinkId, LinkStats>;
  }

  /** Sends a message; returns it, or null when the link loses it. */
  send(t: number, link: LinkId, src: string, dst: string, type: string, payload: Payload): Message | null {
    const cfg = this.links[link];
    const key = `${link}|${src}`;
    const seq = ((this.seqs.get(key) ?? 0) + 1) & 0xffff;
    this.seqs.set(key, seq);
    const stats = this.stats[link];
    stats.sent += 1;
    const tag = messageTag(cfg.badKey ? "wrong-key" : SHARED_KEY, type, seq, payload);
    const message: Message = { id: this.nextId++, seq, link, src, dst, type, sentAt: t, arriveAt: t, payload, raw: encodeFrame(type, seq, payload), tag };
    if (!cfg.up || this.rng.next() < cfg.loss) {
      stats.lost += 1;
      return null;
    }
    message.arriveAt = t + Math.max(cfg.latency * 0.2, cfg.latency + cfg.jitter * this.rng.normal());
    this.queue.push(message);
    if (this.rng.next() < cfg.duplicate) this.queue.push({ ...message, id: this.nextId++, copy: true, arriveAt: message.arriveAt + cfg.latency * (0.5 + this.rng.next()) });
    return message;
  }

  /** Every message that has arrived by time t, in arrival order, with the receiver's checks applied. */
  deliver(t: number): Delivered[] {
    if (!this.queue.length) return [];
    const due: Message[] = [];
    const later: Message[] = [];
    for (const m of this.queue) (m.arriveAt <= t ? due : later).push(m);
    this.queue = later;
    due.sort((a, b) => a.arriveAt - b.arriveAt || a.id - b.id);
    return due.map((m) => this.receive(m));
  }

  /** Forget everything in flight (a link reset). */
  clearInFlight(link?: LinkId) {
    this.queue = link ? this.queue.filter((m) => m.link !== link) : [];
  }

  private receive(m: Message): Delivered {
    const cfg = this.links[m.link];
    const stats = this.stats[m.link];
    const key = `${m.link}|${m.src}`;
    const latency = m.arriveAt - m.sentAt;
    let status: DeliveryStatus = "ok";
    const seenSet = this.seen.get(key) ?? new Set<number>();
    if (messageTag(SHARED_KEY, m.type, m.seq, m.payload) !== m.tag) status = "auth-failed";
    else if (seenSet.has(m.seq)) status = "duplicate";
    else if (latency > cfg.staleAfter) status = "stale";
    else if (m.seq < (this.lastSeen.get(key) ?? 0) && (this.lastSeen.get(key) ?? 0) - m.seq < 0x8000) status = "out-of-order";
    if (status === "ok" || status === "out-of-order" || status === "stale") {
      seenSet.add(m.seq);
      if (seenSet.size > 512) seenSet.delete(seenSet.values().next().value as number);
      this.seen.set(key, seenSet);
      if (m.seq > (this.lastSeen.get(key) ?? 0)) this.lastSeen.set(key, m.seq);
    }
    stats.delivered += 1;
    stats.latencySum += latency;
    if (status === "duplicate") stats.duplicates += 1;
    if (status === "out-of-order") stats.outOfOrder += 1;
    if (status === "stale") stats.stale += 1;
    if (status === "auth-failed") stats.authFailed += 1;
    const delivered: Delivered = { ...m, receivedAt: m.arriveAt, latency, status };
    this.log.push(delivered);
    if (this.log.length > this.logLimit) this.log.splice(0, this.log.length - this.logLimit);
    return delivered;
  }
}
