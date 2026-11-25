"use client";
// Smart Wireless EV Charging Station: inputs, faults, the state sequence,
// calculated results with the loss ledger, and sensor telemetry.
import { useCallback } from "react";
import { cabs } from "@/lib/wireless-charging/math";
import { batteryFor, chargingTimeEstimate, ledgerResidual, stationCommand } from "@/lib/wireless-charging/station";
import { NORMAL_SEQUENCE, PHASES } from "@/lib/wireless-charging/stateMachine";
import { packOcv } from "@/lib/wireless-charging/battery";
import { resetEnvironment, runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { AtDepth, Group, Panel, Readout, Select, Slider, Tag, Toggle, fmt } from "../ui/controls";
import ui from "../twin.module.css";

export function StationInputs() {
  const mode = useTwin((s) => s.mode);
  const st = useTwin((s) => s.station);
  const set = useTwin((s) => s.setStation);
  return (
    <Panel title="Station and vehicle" tag="input">
      <Group title="Alignment">
        <Slider label="Lateral offset" value={st.lateral} min={-0.25} max={0.25} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ lateral: v })} />
        <Slider label="Longitudinal offset" value={st.longitudinal} min={-0.25} max={0.25} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ longitudinal: v })} />
        <Slider label="Air gap (winding to winding)" value={st.airGap} min={0.08} max={0.28} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ airGap: v })} />
        <AtDepth mode={mode} min="engineer">
          <Slider label="Receiver rotation" value={st.rotation} min={-30} max={30} step={1} unit="°" onChange={(v) => set({ rotation: v })} hint="Circular pads are rotationally symmetric: no effect in this model." />
        </AtDepth>
        <div className={ui.buttonRow}>
          <button type="button" onClick={() => set({ lateral: st.lateral * 0.15, longitudinal: st.longitudinal * 0.15 })}>
            Re-park precisely
          </button>
        </div>
      </Group>
      <AtDepth mode={mode} min="learn">
        <Group title="Power transfer">
          <Slider label="Charging power (rating at the battery)" value={st.stationPower} min={0} max={22000} step={100} scale={0.001} digits={1} unit="kW" onChange={(v) => set({ stationPower: v })} />
          <Slider label="Operating frequency" value={st.frequency} min={79000} max={90000} step={100} scale={0.001} digits={1} unit="kHz" onChange={(v) => set({ frequency: v })} hint={st.adaptiveResonance ? "Adaptive resonance retunes within 79–90 kHz during resonance checks." : undefined} />
          <Toggle label="Adaptive resonance" checked={st.adaptiveResonance} onChange={(v) => set({ adaptiveResonance: v })} />
        </Group>
      </AtDepth>
      <AtDepth mode={mode} min="engineer">
        <Group title="Coils and compensation">
          <Slider label="Transmitter turns" value={st.txTurns} min={6} max={18} step={1} onChange={(v) => set({ txTurns: v })} />
          <Slider label="Receiver turns" value={st.rxTurns} min={6} max={16} step={1} onChange={(v) => set({ rxTurns: v })} />
          <Slider label="Primary capacitance trim" value={st.c1Trim} min={-0.2} max={0.2} step={0.005} scale={100} unit="%" onChange={(v) => set({ c1Trim: v })} />
          <Slider label="Secondary capacitance trim" value={st.c2Trim} min={-0.2} max={0.2} step={0.005} scale={100} unit="%" onChange={(v) => set({ c2Trim: v })} />
        </Group>
      </AtDepth>
      <Group title="Battery">
        <Slider label="Target SOC" value={st.targetSoc} min={0.2} max={1} step={0.01} scale={100} unit="%" onChange={(v) => set({ targetSoc: v })} />
        <AtDepth mode={mode} min="learn">
          <Slider label="Initial SOC (next arrival)" value={st.initialSoc} min={0.02} max={0.95} step={0.01} scale={100} unit="%" onChange={(v) => set({ initialSoc: v })} />
        </AtDepth>
        <AtDepth mode={mode} min="engineer">
          <Slider label="Battery capacity" value={st.capacityKWh} min={20} max={120} step={1} unit="kWh" onChange={(v) => set({ capacityKWh: v })} />
          <Slider label="Battery temperature (next arrival)" value={st.batteryTemperature} min={-20} max={50} step={1} unit="°C" onChange={(v) => set({ batteryTemperature: v })} />
        </AtDepth>
      </Group>
      <AtDepth mode={mode} min="engineer">
        <Group title="Site">
          <Slider label="Ambient temperature" value={st.ambientTemperature} min={-15} max={48} step={1} unit="°C" onChange={(v) => set({ ambientTemperature: v })} />
          <Slider label="Grid power available" value={st.gridLimit} min={1000} max={30000} step={250} scale={0.001} digits={1} unit="kW" onChange={(v) => set({ gridLimit: v })} />
          <Slider label="Electricity tariff" value={st.tariff} min={2} max={20} step={0.1} unit="₹/kWh" onChange={(v) => set({ tariff: v })} />
        </Group>
      </AtDepth>
      <AtDepth mode={mode} min="research">
        <Group title="Control">
          <Slider label="Ramp rate" value={st.rampRate} min={250} max={10000} step={250} scale={0.001} digits={2} unit="kW/s" onChange={(v) => set({ rampRate: v })} />
          <Slider label="Lateral tolerance" value={st.alignmentToleranceLateral} min={0.02} max={0.2} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ alignmentToleranceLateral: v })} />
          <Slider label="Longitudinal tolerance" value={st.alignmentToleranceLongitudinal} min={0.02} max={0.2} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ alignmentToleranceLongitudinal: v })} />
          <Slider label="Minimum coupling" value={st.kMin} min={0.02} max={0.3} step={0.01} digits={2} onChange={(v) => set({ kMin: v })} />
          <Toggle label="Offline authorisation list" checked={st.offlineAuthorization} onChange={(v) => set({ offlineAuthorization: v })} />
          <Toggle label="Start the next session automatically" checked={st.autoCycle} onChange={(v) => set({ autoCycle: v })} />
        </Group>
      </AtDepth>
      <div className={ui.buttonRow}>
        <button type="button" onClick={() => stationCommand(runtime.station, "arrive")}>Vehicle arrives</button>
        <button type="button" onClick={() => stationCommand(runtime.station, "depart")}>Vehicle departs</button>
        <button type="button" onClick={() => resetEnvironment("station")}>Restart station</button>
      </div>
    </Panel>
  );
}

const LINK_FAULTS = [
  { id: "none", label: "Links healthy" },
  { id: "vehicle-loss", label: "Vehicle link down" },
  { id: "vehicle-lossy", label: "Vehicle link 60 % loss" },
  { id: "vehicle-slow", label: "Vehicle link 400 ms latency" },
  { id: "backend-down", label: "Internet outage (backend + cloud)" },
  { id: "bad-key", label: "Authentication failure (vehicle link)" },
] as const;

export function StationFaults() {
  const f = useTwin((s) => s.faults);
  const set = useTwin((s) => s.setFaults);
  const linkFault = (f.links.vehicle?.up === false ? "vehicle-loss" : f.links.vehicle?.loss ? "vehicle-lossy" : f.links.vehicle?.latency ? "vehicle-slow" : f.links.backend?.up === false ? "backend-down" : f.links.vehicle?.badKey ? "bad-key" : "none") as (typeof LINK_FAULTS)[number]["id"];
  const setLink = (id: (typeof LINK_FAULTS)[number]["id"]) =>
    set({
      links:
        id === "vehicle-loss" ? { vehicle: { up: false } } : id === "vehicle-lossy" ? { vehicle: { loss: 0.6 } } : id === "vehicle-slow" ? { vehicle: { latency: 0.4, staleAfter: 0.25 } } : id === "backend-down" ? { backend: { up: false }, cloud: { up: false } } : id === "bad-key" ? { vehicle: { badKey: true } } : {},
    });
  return (
    <Panel title="Fault injection" tag="input">
      <p className={ui.small}>All faults are simulated. Safety trips act in the same step and take precedence over normal transitions.</p>
      <Toggle danger label="Foreign object on pad" checked={f.foreignObject} onChange={(v) => set({ foreignObject: v })} />
      <Toggle danger label="Living object in protected zone" checked={f.livingObject} onChange={(v) => set({ livingObject: v })} />
      <Toggle danger label="Emergency stop pressed" checked={f.emergencyStop} onChange={(v) => set({ emergencyStop: v })} />
      <Toggle danger label="Isolation fault" checked={f.isolationFault} onChange={(v) => set({ isolationFault: v })} />
      <Toggle danger label="Overcurrent event" checked={f.overcurrentEvent} onChange={(v) => set({ overcurrentEvent: v })} />
      <Toggle danger label="Controller failure (watchdog)" checked={f.controllerFailure} onChange={(v) => set({ controllerFailure: v })} />
      <Toggle danger label="Unauthorised vehicle" checked={f.unauthorizedVehicle} onChange={(v) => set({ unauthorizedVehicle: v })} />
      <Toggle danger label="Station out of service" checked={f.stationUnavailable} onChange={(v) => set({ stationUnavailable: v })} />
      <Toggle danger label="Disable foreign-object detection" checked={f.fodDisabled} onChange={(v) => set({ fodDisabled: v })} hint="Shows what the detector protects against (illustrative object heating)." />
      <Select label="Communication" value={linkFault} options={LINK_FAULTS} onChange={setLink} />
      <Select
        label="Sensor"
        value={(f.disconnectedSensors[0] ?? "none") as string}
        options={[{ id: "none", label: "All sensors connected" }, { id: "bat.soc", label: "BMS SOC disconnected" }, { id: "tx.temp", label: "Pad temperature disconnected" }, { id: "align.lat", label: "Alignment sensor disconnected" }]}
        onChange={(v) => set({ disconnectedSensors: v === "none" ? [] : [v] })}
      />
      <div className={ui.buttonRow}>
        <button type="button" onClick={() => stationCommand(runtime.station, "reset")}>
          Operator reset
        </button>
      </div>
    </Panel>
  );
}

function readStation() {
  const st = runtime.station.state;
  const p = st.point;
  const ss = p.ss;
  return {
    t: st.t,
    phase: st.phase,
    events: st.events.slice(-6),
    k: st.coupler.k,
    M: st.coupler.M,
    L1: st.coupler.L1,
    L2: st.coupler.L2,
    airK: st.coupler.airCore.k,
    f: st.frequency,
    f0: st.design.f0,
    pGrid: p.pGrid,
    pCoil: p.pCoilIn,
    pRx: p.pRectifierIn,
    pBat: p.pBattery,
    eff: p.efficiency,
    link: p.linkEfficiency,
    losses: { ...p.losses },
    totalLoss: p.totalLoss,
    i1: ss ? cabs(ss.i1) : 0,
    i2: ss ? cabs(ss.i2) : 0,
    vc1: ss?.vC1 ?? 0,
    phaseIn: ss ? (ss.phaseIn * 180) / Math.PI : 0,
    zvs: ss ? ss.phaseIn > 0 : null,
    alpha: (p.alpha * 180) / Math.PI,
    rl: p.rl,
    vdc2: p.vdc2,
    limitedBy: st.limitedBy,
    acceptance: st.acceptanceLimit,
    soc: st.battery.soc,
    tBat: st.battery.temperature,
    vBat: st.batteryVoltage,
    iBat: st.batteryCurrent,
    temps: { ...st.temperatures },
    field: st.fieldCentre,
    edge: st.fieldEdge,
    energy: st.energy.batteryTerminals,
    grid: st.energy.grid,
    cost: st.cost,
    session: st.session ? { ...st.session } : null,
    sessions: st.sessions.length,
    estimate: chargingTimeEstimate(runtime.station),
    residual: ledgerResidual(st.energy),
    warnings: [...st.warnings],
    transient: { ...st.transient },
    readings: runtime.station.sensors.readings(st.t),
    ocv: packOcv(batteryFor(runtime.station.params, runtime.station.inputs), st.battery.soc),
  };
}

export function StationSequence() {
  const read = useCallback(() => ({ phase: runtime.station.state.phase, events: runtime.station.state.events.slice(-5) }), []);
  const { phase, events } = useSampled(read, 6);
  const info = PHASES[phase];
  const current = NORMAL_SEQUENCE.indexOf(phase);
  const lastNormal = current >= 0 ? current : (() => {
    for (let i = events.length - 1; i >= 0; i--) {
      const k = NORMAL_SEQUENCE.indexOf(events[i].from);
      if (k >= 0) return k;
    }
    return 0;
  })();
  return (
    <Panel title="Charging sequence" tag="SIMULATED">
      <p className={ui.phaseNow} data-kind={info.kind}>
        <strong>{info.step ? `${info.step}. ${info.label}` : info.label}</strong>
        <span>{info.text}</span>
        {info.recovery && <em>{`Recovery: ${info.recovery}`}</em>}
      </p>
      <ol className={ui.sequence} aria-label="Normal charging sequence">
        {NORMAL_SEQUENCE.map((id, i) => (
          <li key={id} data-state={i < lastNormal ? "done" : i === lastNormal ? (current >= 0 ? "now" : "held") : "next"} title={PHASES[id].label}>
            <span className={ui.srOnly}>{`${i + 1}. ${PHASES[id].label}`}</span>
          </li>
        ))}
        <li data-state={phase === "available" && events.length > 0 ? "now" : "next"} title="Station available (19)">
          <span className={ui.srOnly}>19. Station available</span>
        </li>
      </ol>
      <ul className={ui.events} aria-label="Recent transitions">
        {[...events].reverse().map((e) => (
          <li key={`${e.t}-${e.to}`} data-safety={e.safety || undefined}>
            <span>{`t = ${fmt(e.t, 1)} s`}</span> {PHASES[e.to].label}
            <small>{e.reason}</small>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function StationResults() {
  const mode = useTwin((s) => s.mode);
  const tariff = useTwin((s) => s.station.tariff);
  const s = useSampled(readStation, 6);
  const lossRows: [string, number][] = [
    ["Transformer", s.losses.transformer],
    ["AC–DC + PFC", s.losses.pfc],
    ["Inverter", s.losses.inverter],
    ["Transmitter coil + C1 + core", s.losses.txCopper + s.losses.txCapacitor + s.losses.txCore],
    ["Receiver coil + C2 + core", s.losses.rxCopper + s.losses.rxCapacitor + s.losses.rxCore],
    ["Rectifier", s.losses.rectifier],
    ["DC–DC", s.losses.dcdc],
  ];
  const maxLoss = Math.max(1, ...lossRows.map((r) => r[1]));
  return (
    <>
      <Panel title="Power and efficiency" tag="calculated">
        <dl className={ui.readouts}>
          <Readout label="Grid input" value={s.pGrid / 1000} unit="kW" emphasis />
          <Readout label="Received (rectifier in)" value={s.pRx / 1000} unit="kW" />
          <Readout label="Battery charging" value={s.pBat / 1000} unit="kW" emphasis />
          <Readout label="Grid-to-battery efficiency" value={s.pGrid > 1 ? s.eff * 100 : null} unit="%" digits={1} />
          <Readout label="Coil-to-coil efficiency" value={s.pGrid > 1 ? s.link * 100 : null} unit="%" digits={2} />
          <Readout label="Total losses" value={s.totalLoss} unit="W" digits={0} />
          <Readout label="Limited by" value={s.limitedBy} />
        </dl>
        {s.pGrid > 1 && (
          <ul className={ui.bars} aria-label="Loss breakdown">
            {lossRows.map(([name, w]) => (
              <li key={name}>
                <span>{name}</span>
                <i style={{ width: `${(w / maxLoss) * 100}%` }} aria-hidden="true" />
                <b>{`${fmt(w, 0)} W`}</b>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Panel title="Magnetic coupling and resonance" tag="calculated">
        <dl className={ui.readouts}>
          <Readout label="Coupling coefficient k" value={s.k} digits={3} emphasis note={`air core ${fmt(s.airK, 3)}`} />
          <Readout label="Mutual inductance M" value={s.M * 1e6} unit="µH" digits={2} />
          <AtDepth mode={mode} min="learn">
            <Readout label="L1 / L2" value={`${fmt(s.L1 * 1e6, 1)} / ${fmt(s.L2 * 1e6, 1)}`} unit="µH" />
            <Readout label="Operating / design frequency" value={`${fmt(s.f / 1000, 2)} / ${fmt(s.f0 / 1000, 1)}`} unit="kHz" />
          </AtDepth>
          <AtDepth mode={mode} min="engineer">
            <Readout label="Primary / secondary current" value={`${fmt(s.i1, 1)} / ${fmt(s.i2, 1)}`} unit="A RMS" />
            <Readout label="C1 voltage stress" value={s.vc1} unit="V RMS" digits={0} />
            <Readout label="Input phase" value={s.phaseIn} unit="°" digits={1} note={s.zvs === null ? undefined : s.zvs ? "inductive: ZVS" : "capacitive: no ZVS"} />
            <Readout label="Inverter conduction angle α" value={s.pGrid > 1 ? s.alpha : null} unit="°" digits={0} />
            <Readout label="Load R_L / rectifier DC" value={s.pGrid > 1 ? `${fmt(s.rl, 2)} Ω / ${fmt(s.vdc2, 0)}` : null} unit="V" />
          </AtDepth>
          <AtDepth mode={mode} min="learn">
            <Readout label="Flux density, gap centre" value={s.field * 1e6} unit="µT" digits={0} />
            <Readout label="Flux density, 0.2 m past pad edge" value={s.edge * 1e6} unit="µT" digits={1} note="model value, not an exposure assessment" />
          </AtDepth>
        </dl>
      </Panel>
      <Panel title="Battery and session" tag="calculated">
        <div className={ui.socBar} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(s.soc * 100)} aria-label="State of charge">
          <i style={{ width: `${s.soc * 100}%` }} />
          <span>{`SOC ${fmt(s.soc * 100, 1)} %`}</span>
        </div>
        <dl className={ui.readouts}>
          <Readout label="Pack voltage / current" value={`${fmt(s.vBat, 0)} V / ${fmt(s.iBat, 1)}`} unit="A" />
          <AtDepth mode={mode} min="learn">
            <Readout label="BMS acceptance limit" value={s.acceptance} />
            <Readout label="Time to target (at present power)" value={Number.isFinite(s.estimate) ? s.estimate / 60 : null} unit="min" digits={0} note="estimate; run to completion in the Simulation Lab" />
          </AtDepth>
          <Readout label="Energy delivered (this run)" value={s.energy / 3.6e6} unit="kWh" digits={3} />
          <Readout label="Grid energy (this run)" value={s.grid / 3.6e6} unit="kWh" digits={3} />
          <Readout label="Charging cost" value={s.cost} unit={`₹ at ${fmt(tariff, 1)}/kWh`} digits={2} />
          <AtDepth mode={mode} min="engineer">
            <Readout label="Temperatures: pad / receiver / inverter / battery" value={`${fmt(s.temps.txCoil, 1)} / ${fmt(s.temps.rxCoil, 1)} / ${fmt(s.temps.inverter, 1)} / ${fmt(s.tBat, 1)}`} unit="°C" />
          </AtDepth>
          <AtDepth mode={mode} min="research">
            <Readout label="Energy ledger residual" value={s.residual} unit="J" digits={6} note="grid − (battery + every loss)" />
            <Readout label="Simulation time" value={s.t} unit="s" digits={1} />
          </AtDepth>
        </dl>
        {s.warnings.map((w) => (
          <p key={w} className={ui.warning}>
            {w}
          </p>
        ))}
      </Panel>
      <AtDepth mode={mode} min="engineer">
        <Panel title="Telemetry" tag="SIMULATED">
          <p className={ui.small}>Sensor models: noise, gain error, ADC quantisation and calibration. No hardware is connected, so nothing is LIVE.</p>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">Signal</th>
                <th scope="col">Value</th>
                <th scope="col">Raw</th>
                <th scope="col">Mode</th>
              </tr>
            </thead>
            <tbody>
              {s.readings.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{r.label}</th>
                  <td>{`${fmt(r.value, 2)} ${r.unit}`}</td>
                  <td className={ui.mono}>{r.raw}</td>
                  <td>
                    <Tag kind={r.mode} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </AtDepth>
    </>
  );
}
