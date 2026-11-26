"use client";
// The IoT view's inspector: choose a communication link and read the latest
// message the simulated bus delivered on it — nothing here is invented: the
// payload, times, sequence, tag and status are the bus's own record. The
// protocol and its authentication tag are simulator-defined, not a
// production protocol or production cryptography.
import { useCallback, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import type { Delivered, LinkId } from "@/lib/wireless-charging/network";
import { runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { fmt } from "../ui/controls";
import lab from "./lab.module.css";

const LINKS: { id: LinkId; label: string; color: string }[] = [
  { id: "can", label: "CAN · BMS → VCU", color: "#ffd166" },
  { id: "vehicle", label: "Vehicle ↔ station", color: "#5ee7ff" },
  { id: "backend", label: "Station ↔ backend", color: "#b388ff" },
  { id: "cloud", label: "Gateway → cloud", color: "#34d399" },
];

const QUALITY: Record<Delivered["status"], string> = {
  ok: "Valid",
  duplicate: "Duplicate — discarded",
  "out-of-order": "Out of order — discarded",
  stale: "Stale — too old to act on",
  "auth-failed": "Rejected — tag did not verify",
};

export function IotInspector() {
  const [link, setLink] = useState<LinkId>("vehicle");
  const [held, setHeld] = useState<Delivered | null>(null);
  const read = useCallback(() => {
    const log = runtime.station.bus.log;
    const counts: Record<string, number> = {};
    let last: Delivered | null = null;
    for (let i = log.length - 1; i >= 0; i--) {
      const m = log[i];
      counts[m.link] = (counts[m.link] ?? 0) + 1;
      if (!last && m.link === link) last = m;
    }
    return { last, counts };
  }, [link]);
  const live = useSampled(read, 2);
  const m = held ?? live.last;
  return (
    <div className={lab.hud} aria-label="IoT message inspector">
      <p className={lab.legendEyebrow}>IoT messages · simulated bus</p>
      <div className={lab.linkPicker} role="radiogroup" aria-label="Communication link">
        {LINKS.map((l) => (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={link === l.id}
            onClick={() => {
              setLink(l.id);
              setHeld(null);
            }}
          >
            <i style={{ background: l.color }} />
            <span>{l.label}</span>
            <small>{live.counts[l.id] ?? 0}</small>
          </button>
        ))}
      </div>
      {m ? (
        <div className={lab.message}>
          <div className={lab.messageHead}>
            <strong>{m.type}</strong>
            <span>
              {m.src} <ArrowRight size={12} aria-hidden="true" /> {m.dst}
            </span>
            <button type="button" className={lab.iconBtn} aria-pressed={Boolean(held)} aria-label={held ? "Follow new messages" : "Hold this message"} onClick={() => setHeld(held ? null : m)}>
              {held ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            </button>
          </div>
          <dl className={lab.messageMeta}>
            <div>
              <dt>Received</dt>
              <dd>{`t = ${fmt(m.receivedAt, 2)} s`}</dd>
            </div>
            <div>
              <dt>Latency</dt>
              <dd>{`${fmt(m.latency * 1000, 0)} ms`}</dd>
            </div>
            <div>
              <dt>Sequence</dt>
              <dd>{m.seq}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd data-status={m.status}>{QUALITY[m.status]}</dd>
            </div>
          </dl>
          <p className={lab.payloadTitle}>Payload</p>
          <dl className={lab.payload}>
            {Object.entries(m.payload).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{String(v)}</dd>
              </div>
            ))}
          </dl>
          <p className={lab.legendFoot}>{`Authentication: simulator-defined tag ${m.tag.slice(0, 12)}… (illustrative, not production cryptography). Safety never depends on these links.`}</p>
        </div>
      ) : (
        <p className={lab.legendNote}>No message delivered on this link yet in this session.</p>
      )}
      <button type="button" className={lab.researchBtn} onClick={() => useTwin.setState({ section: "iot", selected: null })}>
        Open the IoT & Data laboratory
      </button>
    </div>
  );
}
