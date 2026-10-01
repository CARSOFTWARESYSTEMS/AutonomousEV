import { useMemo } from "react";
import { PROVENANCE } from "../data/uflightReferenceAircraft";
import { unitState } from "../simulation/propulsion";
import { vibrationSignal } from "../simulation/signals";
import { useUFlightStore } from "../state/uflightStore";
import { SIGNAL_DOMAINS, SignalChart } from "./charts";
import { Values, useTick } from "./common";
import ui from "../uflight.module.css";

/**
 * The vibration signal from the front bearing of motor 04. Executive: the
 * waveform. Engineer: TIME, FREQUENCY and ORDER views, with the readings.
 */
export default function SignalView() {
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const signalDomain = useUFlightStore((s) => s.signalDomain);
  const setSignalDomain = useUFlightStore((s) => s.setSignalDomain);
  const snapshot = useUFlightStore((s) => s.telemetry.snapshot);
  const faults = useUFlightStore((s) => s.telemetry.inputs.faults);
  const tick = useTick(700);

  const unit = unitState(snapshot.units, "04");
  const severity = faults.scenario === "bearing-degradation" ? faults.severity : 0;
  // Rounded so the signal is rebuilt when the condition changes, not on every store update.
  const rpm = Math.round(unit.rpm / 10) * 10;
  const load = Math.round(unit.load * 50) / 50;
  const level = Math.round(severity * 200) / 200;
  const signal = useMemo(() => vibrationSignal({ rpm, load, severity: level, seed: 1 + tick }), [rpm, load, level, tick]);
  const domain = engineer ? signalDomain : "time";
  const { bearing } = snapshot;

  return (
    <div className={ui.panelSection} data-testid="signal-view">
      <p className={ui.panelHeading}>Vibration · VIB-M04-A</p>
      {engineer && (
        <div className={`${ui.segmented} ${ui.segmentedCompact}`} role="group" aria-label="Signal domain">
          {SIGNAL_DOMAINS.map(({ id, label }) => (
            <button key={id} type="button" className={ui.segment} aria-pressed={signalDomain === id} onClick={() => setSignalDomain(id)}>
              {label}
            </button>
          ))}
        </div>
      )}
      {unit.rpm > 1 ? <SignalChart signal={signal} domain={domain} subject="motor 04, front bearing" /> : <p className={ui.panelText}>Rotor stopped: no vibration signal. The last conclusion is kept.</p>}
      {engineer && (
        <Values
          rows={[
            { label: "RMS level", value: bearing.vibrationRms.toFixed(2), unit: "sim. units", simulated: true },
            { label: "Expected range", value: `${bearing.expectedVibration.min.toFixed(2)}–${bearing.expectedVibration.max.toFixed(2)}` },
            { label: "Bearing feature", value: bearing.spectralFeature.toFixed(2), unit: "× baseline", simulated: true },
            { label: "Baseline limit", value: bearing.featureLimit.toFixed(2), unit: "× baseline" },
            { label: "Shaft speed", value: unit.rpm.toFixed(0), unit: "rpm", simulated: true },
          ]}
        />
      )}
      {!engineer && <p className={ui.panelNote}>{PROVENANCE.signal}</p>}
    </div>
  );
}
