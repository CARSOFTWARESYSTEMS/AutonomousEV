"use client";
import { useState } from "react";
import { Clock } from "lucide-react";
import { CREW_PROFILES, ACTIVITY_LABEL, type ActivityKind } from "../data/operations";
import styles from "../station.module.css";

const COLOR: Record<ActivityKind, string> = {
  sleep: "#312e81",
  routine: "#64748b",
  planning: "#0ea5e9",
  science: "#06b6d4",
  maintenance: "#f59e0b",
  exercise: "#10b981",
  meal: "#f472b6",
  comms: "#a78bfa",
  robotics: "#eab308",
  medical: "#ef4444",
  personal: "#94a3b8",
  ops: "#fb923c",
};

// Hours are counted from wake-up at 06:00 (an illustrative clock, not a mission time zone).
const hhmm = (h: number) => {
  const t = (h + 6) % 24;
  return `${String(Math.floor(t)).padStart(2, "0")}:${String(Math.round((t % 1) * 60)).padStart(2, "0")}`;
};

export default function CrewDaySimulator() {
  const [profile, setProfile] = useState<keyof typeof CREW_PROFILES>("research");
  const [sel, setSel] = useState<number | null>(null);
  const p = CREW_PROFILES[profile];
  // Sleep is listed first but occupies the night: shift so the day starts after sleep at 06:00.
  const blocks = [...p.blocks.slice(1), p.blocks[0]];
  const starts: number[] = [];
  const totals: Partial<Record<ActivityKind, number>> = {};
  let clock = 0;
  for (const b of blocks) {
    starts.push(clock);
    clock += b.hours;
    totals[b.kind] = (totals[b.kind] ?? 0) + b.hours;
  }
  return (
    <div className={styles.sim}>
      <div className={styles.simHead}>
        <div>
          <h3>
            <Clock size={18} aria-hidden="true" /> 24 Hours Aboard a Space Station
          </h3>
          <span className={styles.simLabel}>Generic educational schedule — not an official mission timeline.</span>
        </div>
      </div>
      <div className={styles.simWide}>
        <div className={styles.chips} role="group" aria-label="Mission profile" style={{ marginBottom: 14 }}>
          {(Object.keys(CREW_PROFILES) as (keyof typeof CREW_PROFILES)[]).map((k) => (
            <button key={k} type="button" className={styles.chip} aria-pressed={profile === k} onClick={() => { setProfile(k); setSel(null); }}>
              {CREW_PROFILES[k].label}
            </button>
          ))}
        </div>
        <p>{p.summary}</p>
        <div className={styles.dayBar} role="group" aria-label="Day timeline, 06:00 to 06:00. Select a block for details.">
          {blocks.map((b, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={sel === i}
              aria-label={`${hhmm(starts[i])}, ${ACTIVITY_LABEL[b.kind]}, ${b.hours} hours`}
              title={`${ACTIVITY_LABEL[b.kind]} · ${b.hours} h`}
              onClick={() => setSel(i)}
              style={{ flex: b.hours, background: COLOR[b.kind] }}
            />
          ))}
        </div>
        <div className={styles.dayAxis} aria-hidden="true">
          {["06:00", "12:00", "18:00", "24:00", "06:00"].map((t, i) => <span key={i}>{t}</span>)}
        </div>
        <p aria-live="polite" style={{ marginTop: 10, minHeight: 28 }}>
          {sel !== null && (
            <>
              <b style={{ color: "var(--space-text)" }}>{hhmm(starts[sel])} · {ACTIVITY_LABEL[blocks[sel].kind]} ({blocks[sel].hours} h):</b> {blocks[sel].note}
            </>
          )}
        </p>
        <div className={styles.grid2}>
          <ol className={styles.dayList} aria-label="Schedule">
            {blocks.map((b, i) => (
              <li key={i}>
                <time>{hhmm(starts[i])}–{hhmm(starts[i] + b.hours)}</time>
                <i style={{ background: COLOR[b.kind] }} aria-hidden="true" />
                <span>
                  <b style={{ color: "var(--space-text)" }}>{ACTIVITY_LABEL[b.kind]}</b> — {b.note}
                </span>
              </li>
            ))}
          </ol>
          <div>
            <h4>Hours by activity</h4>
            <ul className={styles.dayList}>
              {(Object.entries(totals) as [ActivityKind, number][]).sort((a, b) => b[1] - a[1]).map(([k, h]) => (
                <li key={k}>
                  <span>{h} h</span>
                  <i style={{ background: COLOR[k] }} aria-hidden="true" />
                  <span>{ACTIVITY_LABEL[k]}</span>
                </li>
              ))}
            </ul>
            <p style={{ fontSize: 14, marginTop: 12 }}>
              Crew time is one of a station&apos;s scarcest resources: every hour of maintenance or emergency training is an hour not spent on science.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
