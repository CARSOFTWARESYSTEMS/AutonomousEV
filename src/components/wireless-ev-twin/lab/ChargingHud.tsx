"use client";
// Charging in motion, in numbers: the five pads around the receiver with
// their controller state and energisation level, the energy balance between
// what the road delivers, what the motor takes and what the battery gains or
// gives, and the last six seconds of received power (each pad crossing is a
// peak). Everything is read from the road simulation four times a second.
import { useCallback } from "react";
import { runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { LOOK_COLORS, segmentLook, type SegmentLook } from "../three/road/segmentLook";
import { fmt } from "../ui/controls";
import lab from "./lab.module.css";

const LOOK_LABEL: Record<SegmentLook, string> = {
  off: "Off",
  energising: "Soft start",
  active: "Active",
  "de-energising": "Switching off",
  blocked: "Blocked",
  failed: "Failed",
};

const TRACE_SECONDS = 1.5;

export function ChargingHud() {
  const rating = useTwin((s) => Math.max(5000, s.road.receiverRating));
  const read = useCallback(() => {
    const sim = runtime.road;
    const st = sim.state;
    const xRx = st.x + sim.vehicle.receiverOffset;
    // The pad under (or nearest) the receiver, two behind and two ahead.
    let nearest = 0;
    let best = Infinity;
    st.segments.forEach((g, i) => {
      const d = Math.abs(g.x - xRx);
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    const near = best < 3;
    const pads = [-2, -1, 0, 1, 2].map((o) => {
      const g = st.segments[nearest + o];
      return g ? { n: g.index + 1, look: segmentLook(g), level: g.level, offset: g.x - xRx } : null;
    });
    const samples = st.samples;
    const t1 = samples.at(-1)?.t ?? 0;
    const trace: number[] = [];
    for (let i = samples.length - 1; i >= 0 && t1 - samples[i].t <= TRACE_SECONDS; i -= 1) trace.push(samples[i].t - t1, samples[i].pReceived);
    return { pads: near ? pads : [], received: Math.max(0, st.pReceived), traction: st.pTraction, battery: st.pBattery, trace, speed: st.v * 3.6 };
  }, []);
  const v = useSampled(read, 6);
  const scale = Math.max(rating, v.traction * 1.05, Math.abs(v.battery) * 1.05);
  const pct = (p: number) => `${Math.min(100, (Math.abs(p) / scale) * 100).toFixed(1)}%`;
  // Trace: x from −6 s to now, y from 0 to the rating.
  const pts: string[] = [];
  for (let i = 0; i < v.trace.length; i += 2) pts.push(`${(((v.trace[i] + TRACE_SECONDS) / TRACE_SECONDS) * 300).toFixed(1)},${(56 - (Math.min(rating, v.trace[i + 1]) / rating) * 52).toFixed(1)}`);
  return (
    <div className={lab.hud} aria-label="Charging in motion">
      <p className={lab.legendEyebrow}>{`Charging in motion · ${fmt(v.speed, 0)} km/h`}</p>
      <ol className={lab.pads} aria-label="Road pads around the receiver">
        {v.pads.length === 0 ? (
          <li className={lab.padsEmpty}>No pads under the vehicle on this stretch</li>
        ) : (
          v.pads.map((p, i) =>
            p ? (
              <li key={p.n} data-under={i === 2 || undefined}>
                <span className={lab.padNo}>{`Pad ${p.n}`}</span>
                <span className={lab.padBar}>
                  <i style={{ transform: `scaleY(${Math.max(0.04, p.level)})`, background: LOOK_COLORS[p.look] }} />
                </span>
                <span className={lab.padState} style={{ color: p.look === "off" ? undefined : LOOK_COLORS[p.look] }}>
                  {LOOK_LABEL[p.look]}
                </span>
                <span className={lab.padWhere}>{i === 2 ? "Under receiver" : `${p.offset > 0 ? "+" : "−"}${fmt(Math.abs(p.offset), 1)} m`}</span>
              </li>
            ) : (
              <li key={`none-${i}`} aria-hidden="true" />
            ),
          )
        )}
      </ol>
      <dl className={lab.balance}>
        <div data-kind="received">
          <dt>Received from the road</dt>
          <dd>
            <span className={lab.barTrack}>
              <i style={{ width: pct(v.received) }} />
            </span>
            <output>{`${fmt(v.received / 1000, 1)} kW`}</output>
          </dd>
        </div>
        <div data-kind="motor">
          <dt>Taken by the motor</dt>
          <dd>
            <span className={lab.barTrack}>
              <i style={{ width: pct(Math.max(0, v.traction)) }} />
            </span>
            <output>{`${fmt(v.traction / 1000, 1)} kW`}</output>
          </dd>
        </div>
        <div data-kind={v.battery >= 0 ? "charging" : "discharging"}>
          <dt>{v.battery >= 0 ? "Into the battery" : "Drawn from the battery"}</dt>
          <dd>
            <span className={lab.barTrack}>
              <i style={{ width: pct(v.battery) }} />
            </span>
            <output>{`${v.battery >= 0 ? "+" : "−"}${fmt(Math.abs(v.battery) / 1000, 1)} kW`}</output>
          </dd>
        </div>
      </dl>
      <figure className={lab.trace}>
        <svg viewBox="0 0 300 60" preserveAspectRatio="none" role="img" aria-label={`Received power over the last ${TRACE_SECONDS} seconds, 0 to ${fmt(rating / 1000, 0)} kW`}>
          <line x1="0" x2="300" y1="56" y2="56" />
          <polyline points={pts.join(" ")} />
        </svg>
        <figcaption>
          <span>{`−${TRACE_SECONDS} s`}</span>
          <span>Received power · each peak is a pad</span>
          <span>now</span>
        </figcaption>
      </figure>
    </div>
  );
}
