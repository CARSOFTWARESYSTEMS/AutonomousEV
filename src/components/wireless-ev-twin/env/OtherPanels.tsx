"use client";
// Dynamic road, autonomous parking and district infrastructure panels.
import { useCallback, useMemo, useState } from "react";
import { rankStations, reservationExchange } from "@/lib/wireless-charging/autonomous";
import { DEFAULT_CHAIN, maxFeasible } from "@/lib/wireless-charging/chain";
import { resonantCapacitance } from "@/lib/wireless-charging/circuits";
import { computeCoupler, DEFAULT_RX_PAD, DEFAULT_TX_PAD } from "@/lib/wireless-charging/coils";
import { regime } from "@/lib/wireless-charging/dynamic";
import { POLICIES, tariffBand } from "@/lib/wireless-charging/infrastructure";
import { resetEnvironment, runtime, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import Chart from "../ui/Chart";
import { AtDepth, Group, Panel, Readout, Select, Slider, Toggle, fmt } from "../ui/controls";
import ui from "../twin.module.css";

// ── Dynamic ────────────────────────────────────────────────────────────────

export function DynamicInputs() {
  const mode = useTwin((s) => s.mode);
  const r = useTwin((s) => s.road);
  const set = useTwin((s) => s.setRoad);
  return (
    <Panel title="Road and vehicle" tag="input">
      <Group title="Driving">
        <Slider label="Vehicle speed" value={r.speed} min={0} max={36} step={0.5} scale={3.6} digits={0} unit="km/h" onChange={(v) => set({ speed: v })} />
        <Select
          label="Scenario"
          value={r.profile}
          options={[
            { id: "constant", label: "Steady speed" },
            { id: "urban", label: "Urban driving" },
            { id: "stop-and-go", label: "Stop-and-go traffic" },
            { id: "accelerate", label: "Acceleration and deceleration" },
          ]}
          onChange={(v) => set({ profile: v })}
        />
        <Slider label="Road electrified" value={r.coverage} min={0.05} max={1} step={0.05} scale={100} unit="%" onChange={(v) => set({ coverage: v })} />
        <Slider label="Lateral misalignment" value={r.lateral} min={0} max={0.4} step={0.01} scale={1000} unit="mm" onChange={(v) => set({ lateral: v })} />
      </Group>
      <AtDepth mode={mode} min="learn">
        <Group title="Vehicle">
          <Slider label="Mass" value={r.mass} min={1200} max={3200} step={50} unit="kg" onChange={(v) => set({ mass: v })} />
          <Slider label="Road gradient" value={r.gradeDeg} min={-5} max={6} step={0.25} unit="°" onChange={(v) => set({ gradeDeg: v })} />
          <Slider label="Ground clearance → air gap" value={r.airGap} min={0.1} max={0.3} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ airGap: v })} />
          <AtDepth mode={mode} min="engineer">
            <Slider label="Drag coefficient" value={r.dragCoefficient} min={0.18} max={0.45} step={0.01} digits={2} onChange={(v) => set({ dragCoefficient: v })} />
            <Slider label="Rolling resistance" value={r.rollingResistance} min={0.005} max={0.02} step={0.0005} digits={4} onChange={(v) => set({ rollingResistance: v })} />
            <Slider label="Acceleration" value={r.acceleration} min={0.3} max={3} step={0.1} unit="m/s²" onChange={(v) => set({ acceleration: v })} />
            <Slider label="Drivetrain efficiency" value={r.drivetrainEfficiency} min={0.7} max={0.95} step={0.01} scale={100} unit="%" onChange={(v) => set({ drivetrainEfficiency: v })} />
            <Slider label="Battery capacity" value={r.capacityKWh} min={20} max={120} step={1} unit="kWh" onChange={(v) => set({ capacityKWh: v })} />
            <Slider label="Initial SOC" value={r.initialSoc} min={0.05} max={0.95} step={0.01} scale={100} unit="%" onChange={(v) => set({ initialSoc: v })} />
            <Slider label="Receiver rating" value={r.receiverRating} min={5000} max={60000} step={1000} scale={0.001} unit="kW" onChange={(v) => set({ receiverRating: v })} />
          </AtDepth>
        </Group>
      </AtDepth>
      <AtDepth mode={mode} min="engineer">
        <Group title="Road pads and control">
          <Slider label="Pad diameter" value={r.segmentDiameter} min={0.4} max={1.4} step={0.05} scale={1000} unit="mm" onChange={(v) => set({ segmentDiameter: v })} />
          <Slider label="Pad turns" value={r.segmentTurns} min={4} max={16} step={1} onChange={(v) => set({ segmentTurns: v })} />
          <Slider label="Spacing between pads" value={r.segmentSpacing} min={0} max={1.2} step={0.05} scale={1000} unit="mm" onChange={(v) => set({ segmentSpacing: v })} />
          <Slider label="Primary current (energised)" value={r.primaryCurrent} min={0} max={80} step={1} unit="A" onChange={(v) => set({ primaryCurrent: v })} />
          <Slider label="Operating frequency" value={r.frequency} min={79000} max={90000} step={100} scale={0.001} digits={1} unit="kHz" onChange={(v) => set({ frequency: v })} />
          <Select
            label="Handover strategy"
            value={r.handover}
            options={[
              { id: "reactive", label: "Reactive (estimated position)" },
              { id: "predictive", label: "Predictive (position + speed × latency)" },
              { id: "make-before-break", label: "Make-before-break (overlap)" },
            ]}
            onChange={(v) => set({ handover: v })}
          />
          <Slider label="Controller latency" value={r.controllerLatency} min={0} max={0.2} step={0.005} scale={1000} unit="ms" onChange={(v) => set({ controllerLatency: v })} />
          <Slider label="Position noise (1σ)" value={r.positionNoise} min={0} max={0.2} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ positionNoise: v })} />
        </Group>
        <Group title="Faults">
          <Toggle danger label="Vehicle not authorised" checked={!r.authorized} onChange={(v) => set({ authorized: !v })} />
          <Toggle danger label="Intermittent supply (2 s in 10 s)" checked={r.intermittentSupply} onChange={(v) => set({ intermittentSupply: v })} />
          <Toggle danger label="Segment controller failure (every 7th pad)" checked={r.failedSegment >= 0} onChange={(v) => set({ failedSegment: v ? 7 : -1 })} />
        </Group>
      </AtDepth>
      <div className={ui.buttonRow}>
        <button type="button" onClick={() => resetEnvironment("dynamic")}>Restart drive</button>
      </div>
    </Panel>
  );
}

function readRoad() {
  const s = runtime.road.state;
  const recent = s.samples.slice(-400);
  return {
    t: s.t,
    x: s.x,
    v: s.v,
    pRx: s.pReceived,
    pTrac: s.pTraction,
    pBat: s.pBattery,
    k: s.kDynamic,
    m: s.mTotal,
    soc: s.battery.soc,
    motional: s.motionalRatio,
    active: s.segments.filter((g) => g.level > 0.01).length,
    energy: { ...s.energy },
    counters: { ...s.counters },
    regime: regime(recent),
    samples: recent,
    lap: s.lap,
  };
}

export function DynamicResults() {
  const mode = useTwin((s) => s.mode);
  const s = useSampled(readRoad, 6);
  const dist = s.lap * 1000 + s.x;
  const km = Math.max(1e-3, dist / 1000);
  const samples = s.samples.filter((_, i) => i % 2 === 0);
  return (
    <>
      <Panel title="Energy balance" tag="calculated">
        <p className={ui.regime} data-regime={s.regime}>
          {s.regime === "charging" ? "Battery charging while driving" : s.regime === "energy-neutral" ? "Energy-neutral driving" : "Battery discharging despite wireless charging"}
        </p>
        <dl className={ui.readouts}>
          <Readout label="Received power" value={s.pRx / 1000} unit="kW" emphasis />
          <Readout label="Traction demand" value={s.pTrac / 1000} unit="kW" />
          <Readout label="Battery power" value={s.pBat / 1000} unit="kW" emphasis note="+ charging, − discharging" />
          <Readout label="SOC" value={s.soc * 100} unit="%" digits={3} />
          <Readout label="Dynamic coupling k" value={s.k} digits={3} />
          <Readout label="Energised pads" value={s.active} digits={0} />
          <AtDepth mode={mode} min="learn">
            <Readout label="Energy received per km" value={s.energy.received / 3600 / km} unit="Wh/km" digits={0} />
            <Readout label="Traction energy per km" value={s.energy.traction / 3600 / km} unit="Wh/km" digits={0} />
            <Readout label="Unmet power demand (energy)" value={s.energy.unmet / 3600} unit="Wh" digits={1} note="requested but not delivered — not a power flow" />
          </AtDepth>
          <AtDepth mode={mode} min="engineer">
            <Readout label="Grid energy" value={s.energy.grid / 3600} unit="Wh" digits={1} />
            <Readout label="Grid-to-received efficiency" value={s.energy.grid > 0 ? (s.energy.received / s.energy.grid) * 100 : null} unit="%" digits={1} />
            <Readout label="Idle energised loss" value={s.energy.idleEnergised / 3600} unit="Wh" digits={2} />
            <Readout label="Pad activations / blocked" value={`${s.counters.handovers} / ${s.counters.blocked}`} />
            <Readout label="Energised without vehicle cover" value={s.counters.exposure} unit="s" digits={3} note="the interlock keeps this at 0" />
          </AtDepth>
          <AtDepth mode={mode} min="research">
            <Readout label="Motional / transformer EMF" value={s.motional} digits={6} note="≪ 1: quasi-static model valid" />
            <Readout label="Cycle-averaged force on receiver" value="0 N" note="I2 ⟂ I1 at resonance (FHA)" />
            <Readout label="Distance / time" value={`${fmt(dist, 0)} m / ${fmt(s.t, 1)}`} unit="s" />
          </AtDepth>
        </dl>
      </Panel>
      {samples.length > 4 && (
        <Panel title="Power along the road" tag="calculated">
          <Chart
            x={samples.map((p) => p.t - samples[0].t)}
            series={[
              { name: "Received", color: "#5ee7ff", values: samples.map((p) => p.pReceived / 1000) },
              { name: "Traction", color: "#f5b041", values: samples.map((p) => p.pTraction / 1000), dashed: true },
              { name: "Battery", color: "#4ca930", values: samples.map((p) => p.pBattery / 1000) },
            ]}
            xLabel="Time (last 4 s), s"
            yLabel="Power, kW"
            caption="Received power ripples as the receiver crosses each pad; the battery gets what traction does not use."
          />
          <AtDepth mode={mode} min="learn">
            <Chart x={samples.map((p) => p.t - samples[0].t)} series={[{ name: "k", color: "#b388ff", values: samples.map((p) => p.k) }]} xLabel="Time, s" yLabel="Coupling k" height={140} caption="Position-dependent coupling of the moving receiver." />
          </AtDepth>
        </Panel>
      )}
    </>
  );
}

// ── Autonomous ─────────────────────────────────────────────────────────────

export function AutonomousInputs() {
  const p = useTwin((s) => s.parking);
  const set = useTwin((s) => s.setParking);
  const mode = useTwin((s) => s.mode);
  const run = () => resetEnvironment("autonomous");
  return (
    <Panel title="Sensors and guidance" tag="input">
      <p className={ui.small}>Simulation only: no vehicle is driven. Change a setting, then run the manoeuvre again.</p>
      <Slider label="UWB position noise (1σ)" value={p.uwbNoise} min={0} max={0.3} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ uwbNoise: v })} />
      <Slider label="Measurement delay" value={p.measurementDelay} min={0} max={0.4} step={0.01} scale={1000} unit="ms" onChange={(v) => set({ measurementDelay: v })} />
      <Toggle label="Latency compensation" checked={p.latencyCompensation} onChange={(v) => set({ latencyCompensation: v })} />
      <Toggle label="Pad-relative precision positioning (last 2.5 m)" checked={p.precisionPositioning} onChange={(v) => set({ precisionPositioning: v })} />
      <AtDepth mode={mode} min="engineer">
        <Slider label="Odometry noise" value={p.odometryNoise} min={0} max={0.05} step={0.001} scale={100} unit="%" digits={1} onChange={(v) => set({ odometryNoise: v })} />
        <Slider label="Gyro bias" value={p.gyroBias} min={-0.01} max={0.01} step={0.0005} scale={57.2958} unit="°/s" digits={2} onChange={(v) => set({ gyroBias: v })} />
        <Slider label="Injected lateral target error" value={p.targetBiasLateral} min={-0.2} max={0.2} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ targetBiasLateral: v })} />
        <Slider label="Injected longitudinal target error" value={p.targetBiasLongitudinal} min={-0.2} max={0.2} step={0.005} scale={1000} unit="mm" onChange={(v) => set({ targetBiasLongitudinal: v })} />
        <Slider label="Pure-pursuit look-ahead" value={p.lookahead} min={0.6} max={3} step={0.1} unit="m" onChange={(v) => set({ lookahead: v })} />
        <Slider label="Noise seed" value={p.seed} min={1} max={99} step={1} onChange={(v) => set({ seed: v })} />
      </AtDepth>
      <div className={ui.buttonRow}>
        <button type="button" onClick={run}>
          Run parking manoeuvre
        </button>
      </div>
    </Panel>
  );
}

function readParking() {
  const s = runtime.parking.state;
  return {
    t: s.t,
    phase: s.phase,
    v: s.truth.v,
    err: Math.hypot(s.truth.x - s.estimate.x, s.truth.y - s.estimate.y),
    sigma: Math.sqrt(Math.max(0, s.P[0] + s.P[4])),
    final: s.finalError ? { ...s.finalError } : null,
    k: s.finalK,
  };
}

export function AutonomousResults() {
  const s = useSampled(readParking, 6);
  const station = useTwin((st) => st.station);
  const [soc, setSoc] = useState(0.18);
  const [mission, setMission] = useState(22);
  const ranking = useMemo(() => rankStations({ soc, capacityKWh: 60, consumption: 0.16, missionEnergy: mission, reserve: 0.1, timeValue: 2, averageSpeedKmh: 28 }), [soc, mission]);
  const power = useMemo(() => {
    if (!s.final) return null;
    const c = computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: station.airGap, lateral: s.final.lateral, longitudinal: s.final.longitudinal });
    const nominal = computeCoupler({ tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, airGap: 0.15, lateral: 0, longitudinal: 0 });
    return maxFeasible(DEFAULT_CHAIN, { tx: DEFAULT_TX_PAD, rx: DEFAULT_RX_PAD, L1: c.L1, L2: c.L2, M: c.M, C1: resonantCapacitance(nominal.L1, 85000), C2: resonantCapacitance(nominal.L2, 85000), frequency: 85000, txTemperature: 30, rxTemperature: 30, inverterTemperature: 30, gridLimit: 22000 }, 11000);
  }, [s.final, station.airGap]);
  const within = s.final ? Math.abs(s.final.lateral) <= station.alignmentToleranceLateral && Math.abs(s.final.longitudinal) <= station.alignmentToleranceLongitudinal : null;
  const flow = useMemo(() => reservationExchange("EVSIM042", ranking[0]?.station.id ?? "S2", 48121), [ranking]);
  return (
    <>
      <Panel title="Precision parking" tag="calculated">
        <dl className={ui.readouts}>
          <Readout label="Phase" value={s.phase} />
          <Readout label="Speed" value={s.v * 3.6} unit="km/h" digits={1} />
          <Readout label="Estimate error (true − EKF)" value={s.err * 1000} unit="mm" digits={0} />
          <Readout label="EKF 1σ (position)" value={s.sigma * 1000} unit="mm" digits={0} />
          <Readout label="Final lateral / longitudinal offset" value={s.final ? `${fmt(s.final.lateral * 1000, 0)} / ${fmt(s.final.longitudinal * 1000, 0)}` : null} unit="mm" emphasis />
          <Readout label="Coupling at final position" value={s.k} digits={3} />
          <Readout label="Alignment verification" value={within === null ? null : within ? "within tolerance" : "outside tolerance: re-park"} />
          <Readout label="Feasible charging power there" value={power ? power.power / 1000 : null} unit="kW" digits={2} note={power && power.limitedBy !== "request" ? `limited by ${power.limitedBy}` : undefined} />
        </dl>
      </Panel>
      <Panel title="Station discovery and selection" tag="calculated">
        <Slider label="Vehicle SOC" value={soc} min={0.05} max={0.6} step={0.01} scale={100} unit="%" onChange={setSoc} />
        <Slider label="Energy the mission still needs" value={mission} min={2} max={50} step={1} unit="kWh" onChange={setMission} />
        <table className={ui.table}>
          <thead>
            <tr>
              <th scope="col">Station</th>
              <th scope="col">Charge</th>
              <th scope="col">Time</th>
              <th scope="col">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((r, i) => (
              <tr key={r.station.id} data-first={i === 0 || undefined}>
                <th scope="row">{r.station.name}</th>
                <td>{`${fmt(r.chargeKWh, 1)} kWh`}</td>
                <td>{`${fmt(r.minutes.total, 0)} min`}</td>
                <td>{r.feasible ? (i === 0 ? "Selected" : "Feasible") : r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ol className={ui.messages} aria-label="Simulated reservation exchange">
          {flow.map((m) => (
            <li key={m.type}>
              <span>{`${m.from} → ${m.to}`}</span> <strong>{m.type}</strong> <code>{m.body}</code>
            </li>
          ))}
        </ol>
        <p className={ui.small}>Tags use FNV-1a for teaching only: not cryptography.</p>
      </Panel>
    </>
  );
}

// ── Infrastructure ─────────────────────────────────────────────────────────

export function InfrastructureInputs() {
  const g = useTwin((s) => s.grid);
  const set = useTwin((s) => s.setGrid);
  const mode = useTwin((s) => s.mode);
  const hour = useTwin((s) => s.gridHour);
  return (
    <Panel title="District" tag="input">
      <Slider label="Time of day" value={hour} min={0} max={23.99} step={0.25} digits={2} unit="h" onChange={(v) => useTwin.setState({ gridHour: v, playing: false })} />
      <Select label="Charging policy" value={g.policy} options={POLICIES.map((p) => ({ id: p.id, label: p.name }))} onChange={(v) => set({ policy: v })} />
      <p className={ui.small}>{POLICIES.find((p) => p.id === g.policy)?.text}</p>
      <Slider label="Grid import limit" value={g.gridLimit} min={50} max={400} step={10} unit="kW" onChange={(v) => set({ gridLimit: v })} />
      <Slider label="Solar PV installed" value={g.pvCapacity} min={0} max={400} step={10} unit="kWp" onChange={(v) => set({ pvCapacity: v })} />
      <Slider label="Cloudiness" value={g.cloudiness} min={0} max={1} step={0.05} scale={100} unit="%" onChange={(v) => set({ cloudiness: v })} />
      <AtDepth mode={mode} min="learn">
        <Slider label="Storage energy" value={g.bessCapacity} min={0} max={800} step={20} unit="kWh" onChange={(v) => set({ bessCapacity: Math.max(1, v) })} />
        <Slider label="Storage power" value={g.bessPower} min={0} max={300} step={10} unit="kW" onChange={(v) => set({ bessPower: v })} />
        <Slider label="Vehicle arrivals per day" value={g.arrivalsPerDay} min={10} max={200} step={5} onChange={(v) => set({ arrivalsPerDay: v })} />
      </AtDepth>
      <AtDepth mode={mode} min="engineer">
        <Slider label="Wireless bays" value={g.bays} min={4} max={60} step={1} onChange={(v) => set({ bays: v })} />
        <Slider label="Bay power" value={g.bayPower} min={3.7} max={22} step={0.1} unit="kW" onChange={(v) => set({ bayPower: v })} />
        <Slider label="Fleet vehicles overnight" value={g.fleetVehicles} min={0} max={30} step={1} onChange={(v) => set({ fleetVehicles: v })} />
        <Slider label="Electrified road peak demand" value={g.roadPeak} min={0} max={200} step={5} unit="kW" onChange={(v) => set({ roadPeak: v })} />
        <Slider label="Peak tariff" value={g.tariff.peak} min={4} max={25} step={0.5} unit="₹/kWh" onChange={(v) => set({ tariff: { ...g.tariff, peak: v } })} />
        <Slider label="Off-peak tariff" value={g.tariff.offPeak} min={2} max={15} step={0.5} unit="₹/kWh" onChange={(v) => set({ tariff: { ...g.tariff, offPeak: v } })} />
        <Toggle danger label="Grid outage 17:00–19:00" checked={g.outage !== null} onChange={(v) => set({ outage: v ? { start: 17, hours: 2 } : null })} />
        <Slider label="Random seed" value={g.seed} min={1} max={99} step={1} onChange={(v) => set({ seed: v })} />
      </AtDepth>
    </Panel>
  );
}

export function InfrastructureResults() {
  const mode = useTwin((s) => s.mode);
  const hour = useTwin((s) => s.gridHour);
  const grid = useTwin((s) => s.grid);
  const read = useCallback(() => runtime.grid, []);
  const day = useSampled(read, 2);
  void grid;
  const steps = day.steps;
  const T = day.totals;
  const now = steps[Math.min(steps.length - 1, Math.floor((hour / 24) * steps.length))];
  const x = steps.map((s) => s.hour);
  return (
    <>
      <Panel title={`At ${String(Math.floor(hour)).padStart(2, "0")}:${String(Math.floor((hour % 1) * 60)).padStart(2, "0")} · ${tariffBand(hour)} tariff`} tag="calculated">
        <dl className={ui.readouts}>
          <Readout label="Grid import" value={now?.gridImport ?? 0} unit="kW" digits={0} emphasis />
          <Readout label="Solar used / available" value={now ? `${fmt(now.pvUsed, 0)} / ${fmt(now.pvAvailable, 0)}` : null} unit="kW" />
          <Readout label="Storage (− charging, + discharging)" value={now ? now.bessDischarge - now.bessCharge : 0} unit="kW" digits={0} note={now ? `SOC ${fmt(now.bessSoc * 100, 0)} %` : undefined} />
          <Readout label="Chargers: requested / served" value={now ? `${fmt(now.evRequested, 0)} / ${fmt(now.evServedInput, 0)}` : null} unit="kW" />
          <Readout label="Vehicles charging / waiting" value={now ? `${now.connected} / ${now.queued}` : null} />
          <Readout label="Road: requested / served" value={now ? `${fmt(now.roadRequested, 0)} / ${fmt(now.roadServed, 0)}` : null} unit="kW" />
        </dl>
      </Panel>
      <Panel title="The day" tag="calculated">
        <Chart
          x={x}
          cursor={hour}
          series={[
            { name: "Grid import", color: "#f5b041", values: steps.map((s) => s.gridImport) },
            { name: "Solar used", color: "#ffd166", values: steps.map((s) => s.pvUsed) },
            { name: "Chargers served", color: "#5ee7ff", values: steps.map((s) => s.evServedInput) },
            { name: "Chargers requested", color: "#5ee7ff", values: steps.map((s) => s.evRequested), dashed: true },
          ]}
          guides={[{ y: grid.gridLimit, label: "import limit" }]}
          xLabel="Hour"
          yLabel="Power, kW"
          caption="Requested (dashed) and served charger power, kept apart; unmet demand is the gap between them, not a flow."
        />
        <dl className={ui.readouts}>
          <Readout label="EV energy requested / delivered" value={`${fmt(T.evRequested, 0)} / ${fmt(T.evDelivered, 0)}`} unit="kWh" emphasis />
          <Readout label="Unserved EV energy" value={T.evUnserved} unit="kWh" digits={0} />
          <Readout label="Peak grid import" value={T.peakImport} unit="kW" digits={0} note={T.limitViolationHours > 0 ? `limit exceeded for ${fmt(T.limitViolationHours, 2)} h` : "within limit"} />
          <Readout label="Cost of imported energy" value={T.cost} unit="₹" digits={0} />
          <Readout label="Renewable share of supply" value={T.renewableShare * 100} unit="%" digits={1} />
          <AtDepth mode={mode} min="learn">
            <Readout label="Solar generated / curtailed" value={`${fmt(T.solar, 0)} / ${fmt(T.curtailed, 0)}`} unit="kWh" />
            <Readout label="Mean wait for a bay" value={T.meanWaitMinutes} unit="min" digits={1} />
            <Readout label="Bay utilisation" value={T.utilisation * 100} unit="%" digits={0} />
          </AtDepth>
          <AtDepth mode={mode} min="engineer">
            <Readout label="Charger and storage losses" value={T.losses} unit="kWh" digits={1} />
            <Readout label="Storage charged / discharged" value={`${fmt(T.bessCharged, 0)} / ${fmt(T.bessDischarged, 0)}`} unit="kWh" />
          </AtDepth>
          <AtDepth mode={mode} min="research">
            <Readout label="Largest step energy residual" value={T.maxResidual} unit="kW" digits={12} />
          </AtDepth>
        </dl>
      </Panel>
    </>
  );
}
