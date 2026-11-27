// MQTT communication model (SP-IOT-001, SP-MATH-011).
//
// A versioned topic namespace, a message schema, a simulated broker with
// per-device identity, TLS and topic ACLs, retained status with last-will
// messages, and the gateway's ingestion rules: schema validation, duplicate
// suppression by event id (idempotent), per-device sequence ordering,
// freshness (STALE) and rate limiting. Commands carry an issuer, a role, an
// expiry and an integrity tag; the device controller validates and
// acknowledges them, and an acknowledgement means "accepted by the local
// controller" — execution is confirmed only by the device's own feedback
// (a barrier's angle), never by the delivery itself. The link model follows
// WPT-IOT-001 (seeded latency, jitter, loss, duplication); the tag is this
// simulator's own check, not cryptography: real devices use TLS client
// certificates and a broker ACL. Device secrets never reach the browser —
// there are none: everything here is synthetic.
import { fnv1a } from "../network";
import { createRng, type Rng } from "../math";
import type { SourceMode } from "./types";

export const NAMESPACE = "evengineer/v1";

export type TopicKind = "telemetry" | "occupancy" | "status" | "commands" | "ack" | "events";

export function topic(kind: TopicKind, site: string, id: string): string {
  if (kind === "events") return `${NAMESPACE}/sites/${site}/events`;
  if (kind === "occupancy") return `${NAMESPACE}/sites/${site}/bays/${id}/occupancy`;
  return `${NAMESPACE}/sites/${site}/devices/${id}/${kind}`;
}

export function parseTopic(t: string): { site: string; kind: TopicKind; id: string | null } | null {
  const m = /^evengineer\/v1\/sites\/([A-Za-z0-9_-]+)\/(?:(devices|bays)\/([A-Za-z0-9_.-]+)\/(telemetry|occupancy|status|commands|ack)|(events))$/.exec(t);
  if (!m) return null;
  if (m[5]) return { site: m[1], kind: "events", id: null };
  const kind = m[4] as TopicKind;
  if ((m[2] === "bays") !== (kind === "occupancy")) return null;
  return { site: m[1], kind, id: m[3] };
}

/** QoS by message type: periodic telemetry at most once; state changes, status, commands and acknowledgements at least once. */
export const QOS: Record<TopicKind, 0 | 1> = { telemetry: 0, occupancy: 1, status: 1, commands: 1, ack: 1, events: 1 };

export const SCHEMA = "evengineer.parking.telemetry/1";

export interface TelemetryMessage {
  schema: typeof SCHEMA;
  eventId: string;
  siteId: string;
  deviceId: string;
  sensorId: string;
  /** Device clock, ms since the epoch (UTC). */
  ts: number;
  seq: number;
  measurement: { raw: number | null; value: number | boolean | string | null };
  unit: string;
  quality: "good" | "suspect" | "bad";
  mode: SourceMode;
}

export function validate(m: unknown): m is TelemetryMessage {
  const x = m as Partial<TelemetryMessage>;
  return !!x && x.schema === SCHEMA && typeof x.eventId === "string" && typeof x.siteId === "string" && typeof x.deviceId === "string" && typeof x.sensorId === "string" && Number.isFinite(x.ts) && Number.isInteger(x.seq) && typeof x.unit === "string" && !!x.measurement && ["good", "suspect", "bad"].includes(x.quality as string) && ["SIMULATED", "RECORDED", "LIVE", "ESTIMATED", "STALE", "INVALID"].includes(x.mode as string);
}

export interface LinkModel {
  latency: number;
  jitter: number;
  loss: number;
  duplicate: number;
  up: boolean;
}

/** The facility LAN (sensor nodes ↔ gateway over Wi-Fi), representative. */
export const DEFAULT_LAN: LinkModel = { latency: 0.012, jitter: 0.006, loss: 0.002, duplicate: 0.004, up: true };

export interface Envelope {
  topic: string;
  qos: 0 | 1;
  retain: boolean;
  payload: TelemetryMessage | Record<string, unknown>;
  client: string;
  sentAt: number;
  arriveAt: number;
  tag: string;
}

export interface Client {
  id: string;
  /** Topics this identity may publish (prefix match) and subscribe to. */
  publish: string[];
  subscribe: string[];
  tls: boolean;
  connected: boolean;
  lastWill: string | null;
}

const KEY = "sp-sim-key";
const tagOf = (topicName: string, payload: unknown) => fnv1a(`${KEY}|${topicName}|${JSON.stringify(payload)}`);

export interface BrokerStats {
  published: number;
  delivered: number;
  lost: number;
  duplicates: number;
  refused: number;
  latencySum: number;
  latencies: number[];
}

/** A simulated broker: identity, TLS, ACLs, retained messages, last will, and a lossy LAN in between. */
export class Broker {
  link: LinkModel;
  readonly clients = new Map<string, Client>();
  readonly retained = new Map<string, Envelope>();
  readonly stats: BrokerStats = { published: 0, delivered: 0, lost: 0, duplicates: 0, refused: 0, latencySum: 0, latencies: [] };
  readonly refusals: { t: number; client: string; topic: string; reason: string }[] = [];
  private queue: Envelope[] = [];
  private rng: Rng;
  constructor(
    seed: number,
    link: LinkModel = DEFAULT_LAN,
    readonly requireTls = true,
  ) {
    this.rng = createRng(seed ^ 0x51f15e);
    this.link = { ...link };
  }

  connect(c: Omit<Client, "connected">): boolean {
    if (this.requireTls && !c.tls) {
      this.refusals.push({ t: 0, client: c.id, topic: "connect", reason: "TLS required" });
      this.stats.refused += 1;
      return false;
    }
    this.clients.set(c.id, { ...c, connected: true });
    return true;
  }

  /** A client drops: its last-will status is published (retained). */
  drop(id: string, t: number) {
    const c = this.clients.get(id);
    if (!c || !c.connected) return;
    c.connected = false;
    if (c.lastWill) {
      const env: Envelope = { topic: c.lastWill, qos: 1, retain: true, payload: { online: false, reason: "last will", at: t }, client: id, sentAt: t, arriveAt: t + this.link.latency, tag: "" };
      env.tag = tagOf(env.topic, env.payload);
      this.retained.set(env.topic, env);
      this.queue.push(env);
    }
  }

  reconnect(id: string) {
    const c = this.clients.get(id);
    if (c) c.connected = true;
  }

  allowed(client: Client, t: string, mode: "publish" | "subscribe") {
    return (mode === "publish" ? client.publish : client.subscribe).some((p) => t === p || (p.endsWith("#") && t.startsWith(p.slice(0, -1))));
  }

  publish(clientId: string, t: string, payload: Envelope["payload"], now: number, retain = false): "queued" | "lost" | "refused" {
    const c = this.clients.get(clientId);
    const parsed = parseTopic(t);
    if (!c || !c.connected || !parsed || !this.allowed(c, t, "publish")) {
      this.stats.refused += 1;
      this.refusals.push({ t: now, client: clientId, topic: t, reason: !c ? "Unknown identity" : !c.connected ? "Not connected" : !parsed ? "Topic outside the namespace" : "Not authorised for this topic" });
      if (this.refusals.length > 200) this.refusals.splice(0, this.refusals.length - 200);
      return "refused";
    }
    this.stats.published += 1;
    const qos = QOS[parsed.kind];
    const env: Envelope = { topic: t, qos, retain, payload, client: clientId, sentAt: now, arriveAt: now, tag: tagOf(t, payload) };
    if (retain) this.retained.set(t, env);
    const l = this.link;
    const lost = !l.up || this.rng.next() < l.loss;
    // QoS 1 retransmits a lost message (once, after a timeout); QoS 0 is simply lost.
    if (lost && (qos === 0 || !l.up)) {
      this.stats.lost += 1;
      return "lost";
    }
    env.arriveAt = now + Math.max(l.latency * 0.2, l.latency + l.jitter * this.rng.normal()) + (lost ? 0.5 : 0);
    this.queue.push(env);
    if (qos === 1 && this.rng.next() < l.duplicate) {
      this.stats.duplicates += 1;
      this.queue.push({ ...env, arriveAt: env.arriveAt + l.latency * (1 + this.rng.next()) });
    }
    return "queued";
  }

  /** Messages that reached the subscriber by `now`, in arrival order. */
  deliver(now: number): Envelope[] {
    if (!this.queue.length) return [];
    const due: Envelope[] = [];
    const later: Envelope[] = [];
    for (const e of this.queue) (e.arriveAt <= now ? due : later).push(e);
    this.queue = later;
    due.sort((a, b) => a.arriveAt - b.arriveAt);
    for (const e of due) {
      this.stats.delivered += 1;
      const lat = e.arriveAt - e.sentAt;
      this.stats.latencySum += lat;
      this.stats.latencies.push(lat);
      if (this.stats.latencies.length > 2000) this.stats.latencies.splice(0, 1000);
    }
    return due;
  }

  /** In-flight messages (for the IoT view). */
  get inFlight(): readonly Envelope[] {
    return this.queue;
  }
}

export interface IngestState {
  seenEvents: Set<string>;
  lastSeq: Map<string, number>;
  /** Token bucket per device. */
  tokens: Map<string, { tokens: number; at: number }>;
  counts: { accepted: number; duplicate: number; outOfOrder: number; stale: number; invalid: number; badTag: number; rateLimited: number };
}

export const newIngest = (): IngestState => ({ seenEvents: new Set(), lastSeq: new Map(), tokens: new Map(), counts: { accepted: 0, duplicate: 0, outOfOrder: 0, stale: 0, invalid: 0, badTag: 0, rateLimited: 0 } });

export type IngestVerdict = "accepted" | "duplicate" | "out-of-order" | "stale" | "invalid" | "bad-tag" | "rate-limited";

/**
 * The gateway's ingestion of one telemetry envelope. Idempotent: a repeated
 * event id is dropped, so a duplicated occupancy message can never open a
 * second session. Out-of-order messages are kept for the record but never
 * regress the device's state. Old messages are marked STALE, not fresh.
 */
export function ingest(st: IngestState, env: Envelope, nowMs: number, freshnessMs: number, ratePerSec = 20): { verdict: IngestVerdict; message: TelemetryMessage | null; mode: SourceMode } {
  const m = env.payload;
  if (tagOf(env.topic, m) !== env.tag) return count("bad-tag", null, "INVALID");
  if (!validate(m)) return count("invalid", null, "INVALID");
  if (st.seenEvents.has(m.eventId)) return count("duplicate", m, m.mode);
  st.seenEvents.add(m.eventId);
  if (st.seenEvents.size > 20000) {
    const first = st.seenEvents.values().next().value as string;
    st.seenEvents.delete(first);
  }
  const bucket = st.tokens.get(m.deviceId) ?? { tokens: ratePerSec, at: nowMs };
  bucket.tokens = Math.min(ratePerSec, bucket.tokens + ((nowMs - bucket.at) / 1000) * ratePerSec);
  bucket.at = nowMs;
  st.tokens.set(m.deviceId, bucket);
  if (bucket.tokens < 1) return count("rate-limited", m, m.mode);
  bucket.tokens -= 1;
  // Ordering is per device, sensor and topic (a row camera reports every bay of its row).
  const key = `${m.deviceId}|${m.sensorId}|${env.topic}`;
  const last = st.lastSeq.get(key) ?? -1;
  if (m.seq <= last) return count("out-of-order", m, m.mode);
  st.lastSeq.set(key, m.seq);
  if (nowMs - m.ts > freshnessMs) return count("stale", m, "STALE");
  return count("accepted", m, m.mode);

  function count(v: IngestVerdict, msg: TelemetryMessage | null, mode: SourceMode) {
    const k = v === "out-of-order" ? "outOfOrder" : v === "bad-tag" ? "badTag" : v === "rate-limited" ? "rateLimited" : v;
    st.counts[k as keyof IngestState["counts"]] += 1;
    return { verdict: v, message: msg, mode };
  }
}

// ── Commands ──────────────────────────────────────────────────────────────

export type Role = "viewer" | "driver" | "operator" | "supervisor" | "automation";

export type CommandAction = "barrier.open" | "barrier.close" | "bay.block" | "bay.unblock" | "bay.release" | "session.approve" | "session.refuse" | "charging.stop" | "alarm.acknowledge" | "lighting.set" | "fan.set";

/** Least privilege: which roles may issue which actions. Viewers (and remote users of a connected POC) issue none. */
export const PERMISSIONS: Record<CommandAction, Role[]> = {
  "barrier.open": ["operator", "supervisor", "automation"],
  "barrier.close": ["operator", "supervisor", "automation"],
  "bay.block": ["operator", "supervisor"],
  "bay.unblock": ["operator", "supervisor"],
  "bay.release": ["supervisor"],
  "session.approve": ["operator", "supervisor"],
  "session.refuse": ["operator", "supervisor"],
  "charging.stop": ["operator", "supervisor", "automation"],
  "alarm.acknowledge": ["operator", "supervisor"],
  "lighting.set": ["operator", "supervisor"],
  "fan.set": ["operator", "supervisor"],
};

export interface Command {
  commandId: string;
  action: CommandAction;
  target: string;
  params: Record<string, number | string | boolean>;
  issuedBy: string;
  role: Role;
  issuedAt: number;
  expiresAt: number;
  tag: string;
}

export const signCommand = (c: Omit<Command, "tag">): Command => ({ ...c, tag: fnv1a(`${KEY}|cmd|${c.commandId}|${c.action}|${c.target}|${c.role}|${c.expiresAt}|${JSON.stringify(c.params)}`) });

export interface CommandCheck {
  ok: boolean;
  reason: string;
}

/** Validation at the device controller: integrity, expiry, authorisation, replay. Interlocks are checked separately by the device. */
export function checkCommand(c: Command, now: number, seen: Set<string>, mode: "simulation" | "connected-read-only" = "simulation"): CommandCheck {
  if (mode === "connected-read-only") return { ok: false, reason: "Connected POC mode is read-only for remote users" };
  const { tag, ...rest } = c;
  if (signCommand(rest).tag !== tag) return { ok: false, reason: "Integrity check failed" };
  if (now > c.expiresAt) return { ok: false, reason: "Command expired" };
  if (now < c.issuedAt - 5) return { ok: false, reason: "Issued in the future (clock skew)" };
  if (seen.has(c.commandId)) return { ok: false, reason: "Replay: command already processed" };
  if (!PERMISSIONS[c.action].includes(c.role)) return { ok: false, reason: `Role ${c.role} may not ${c.action}` };
  return { ok: true, reason: "Valid" };
}

/** Percentile of a sample, by nearest rank. */
export function percentile(xs: readonly number[], p: number): number {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil(p * s.length) - 1))];
}
