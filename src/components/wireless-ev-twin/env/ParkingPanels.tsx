"use client";
// Environment 01 — Smart Parking & Wireless EV Charging: the panels that live
// inside the laboratory's existing inspector (Inputs, Data, Driver, Operator,
// Research, Science in Learn mode, and the bay and vehicle inspectors), the
// hand-over to the Station, the legends and the scene labels. Every value is
// read from the facility simulation; every action is a command the facility
// validates (operator actions go through the same role, expiry and interlock
// checks a device controller applies).
import { useCallback, useMemo, useState } from "react";
import { BatteryCharging, CarFront, Download, MonitorCog, Play, Send, Upload, Zap } from "lucide-react";
import { POLICY_INFO, type AllocationPolicy } from "@/lib/wireless-charging/smart-parking/allocation";
import { OPERATING_MODES, type RecordedSession } from "@/lib/wireless-charging/smart-parking/adapters";
import { LOCALES, money, TARIFFS } from "@/lib/wireless-charging/smart-parking/billing";
import { chargerView } from "@/lib/wireless-charging/smart-parking/charging";
import { capacityStudy, chargingDemandSweep, comparePolicies, energyStudy, environmentalStudy, evaluateFusion, iotReliability, pricingStudy, recognitionStudy, replayRecording, scalabilityStudy } from "@/lib/wireless-charging/smart-parking/experiments";
import { arrive, book, operatorCommand, queueLength, requestDeparture, sessionOf, vehicleById, type Session } from "@/lib/wireless-charging/smart-parking/facility";
import { evaluateForecasts, syntheticHistory, ANOMALY_INFO } from "@/lib/wireless-charging/smart-parking/forecast";
import { PIPELINE } from "@/lib/wireless-charging/smart-parking/identification";
import { DEFAULT_LAYOUT, POC_LAYOUT } from "@/lib/wireless-charging/smart-parking/layout";
import { isTerminal, STATES } from "@/lib/wireless-charging/smart-parking/lifecycle";
import { DETECTOR_RATES, type FusionStrategy } from "@/lib/wireless-charging/smart-parking/occupancy";
import { PHYSICAL_PROGRAMME, SOFTWARE_PHASES } from "@/lib/wireless-charging/smart-parking/programme";
import { type ExperimentResult, METRIC_INFO, type MetricKey, RESEARCH_POLICIES, runExperiment, type ScenarioId, SCENARIOS } from "@/lib/wireless-charging/smart-parking/research";
import { REQUIREMENTS, type RequirementClass } from "@/lib/wireless-charging/smart-parking/requirements";
import type { CommandAction } from "@/lib/wireless-charging/smart-parking/telemetry";
import type { BayStatus, Region, VehicleProfile } from "@/lib/wireless-charging/smart-parking/types";
import { PLATE_FORMATS } from "@/lib/wireless-charging/smart-parking/vehicles";
import { erlangB } from "@/lib/wireless-charging/smart-parking/queueing";
import { beginHandover, endHandover, facility, facilityIfBuilt, resetEnvironment, useSampled } from "../state/runtime";
import { useTwin } from "../state/store";
import { enterStage, leaveTour } from "../story/guide";
import { countBays, focusSession, kw, prob, runningBills, siteClock } from "../lab/parkingMetrics";
import { labelRef } from "../three/labels";
import Chart from "../ui/Chart";
import { AtDepth, download, fmt, Group, Panel, Readout, Select, Slider, Tag, Toggle } from "../ui/controls";
import ui from "../twin.module.css";
import lab from "../lab/lab.module.css";
import sp from "./parking.module.css";

// ── Shared ────────────────────────────────────────────────────────────────

const GLYPH: Record<BayStatus, { g: string; color: string; word: string }> = {
  available: { g: "○", color: "#3fb950", word: "Free" },
  reserved: { g: "R", color: "#d9a441", word: "Reserved" },
  occupied: { g: "■", color: "#e5534b", word: "Occupied" },
  charging: { g: "⚡", color: "#39c5cf", word: "Charging" },
  "charging-complete": { g: "⚡", color: "#8ddb8c", word: "Charged" },
  blocked: { g: "✕", color: "#8b949e", word: "Blocked" },
  maintenance: { g: "⚙", color: "#8b949e", word: "Service" },
  unknown: { g: "?", color: "#f0b72f", word: "Uncertain" },
};

const sim = () => facilityIfBuilt();

function tone(state: string): "ok" | "warn" | "bad" | "muted" {
  const info = STATES[state as keyof typeof STATES];
  if (!info) return "muted";
  if (info.kind === "exception") return state === "rejected" || state === "abandoned" ? "muted" : "warn";
  return "ok";
}

/** The bay grid: the north row, the aisle, the south row — as in the facility. */
export function BayGrid({ compact = false }: { compact?: boolean }) {
  const selected = useTwin((s) => s.selected);
  const read = useCallback(() => {
    const s = sim();
    if (!s) return null;
    return { perSide: s.layout.perSide, bays: s.bays.map((b) => ({ id: b.bay.id, row: b.bay.row, slot: b.bay.slot, type: b.bay.type, status: b.status, p: b.fusion.p })) };
  }, []);
  const d = useSampled(read, 3);
  if (!d) return <p className={sp.note}>The facility starts when Smart Parking is opened.</p>;
  const row = (r: "N" | "S") => d.bays.filter((b) => b.row === r).sort((a, b) => a.slot - b.slot);
  const chip = (b: (typeof d.bays)[number]) => {
    const look = GLYPH[b.status];
    return (
      <button key={b.id} type="button" className={sp.bay} aria-pressed={selected === `sp-bay:${b.id}`} onClick={() => useTwin.getState().select(`sp-bay:${b.id}`)} title={`Bay ${b.id} · ${b.type} · ${look.word} · posterior ${prob(b.p)}`}>
        <span className={sp.glyph} style={{ color: look.color }} aria-hidden="true">
          {look.g}
        </span>
        <b>{b.id}</b>
        {!compact && <small>{b.type === "wireless" ? "⚡ bay" : b.type === "accessible" ? "♿ bay" : look.word}</small>}
        <span className={lab.srOnly ?? ""}>{look.word}</span>
      </button>
    );
  };
  return (
    <div className={sp.bays} style={{ "--cols": d.perSide } as React.CSSProperties} role="group" aria-label="Bays (north row, aisle, south row)">
      {row("N").map(chip)}
      <span className={sp.aisle} aria-hidden="true" />
      {row("S").map(chip)}
    </div>
  );
}

export function BayLegend() {
  return (
    <ul className={sp.legend} aria-label="Bay states">
      {(["available", "reserved", "occupied", "charging", "charging-complete", "unknown", "maintenance"] as BayStatus[]).map((k) => (
        <li key={k}>
          <span style={{ color: GLYPH[k].color }} aria-hidden="true">
            {GLYPH[k].g}
          </span>
          {GLYPH[k].word}
        </li>
      ))}
    </ul>
  );
}

// ── Hand-over to the Station (environment 02) ─────────────────────────────

/** Opens a bay's live charging session in the Station environment. */
export function exploreCharging(bayId: string): boolean {
  const g = useTwin.getState().guide;
  leaveTour();
  if (!beginHandover(bayId, g.playlist === "parking" ? g.index : 0)) return false;
  useTwin.setState((s) => ({ environment: "station", view: "cinematic", selected: null, isolate: false, panel: "none", camera: { ...s.camera, mode: "guided", nonce: s.camera.nonce + 1 }, guide: { ...s.guide, active: false, auto: false } }));
  useTwin.getState().bump();
  return true;
}

export function returnToParking() {
  const h = useTwin.getState().handover;
  endHandover();
  enterStage("parking", h?.returnIndex ?? 0, { auto: false });
}

/** "Explore Wireless Charging" for a bay whose vehicle is charging. */
export function ExploreChargingButton({ bayId }: { bayId?: string | null }) {
  const read = useCallback(() => {
    const s = sim();
    const id = bayId ?? focusSession(s)?.bayId ?? null;
    const ch = s && id ? s.chargers.get(id) : undefined;
    return ch && ch.session ? { id, phase: chargerView(ch).label } : null;
  }, [bayId]);
  const d = useSampled(read, 3);
  if (!d) return null;
  return (
    <button type="button" className={sp.cta} onClick={() => exploreCharging(d.id!)}>
      <Zap size={15} aria-hidden="true" /> Explore Wireless Charging
    </button>
  );
}

/** Driver and operator sheets, opened from the stage card (Smart Parking). */
export function ParkingRoles() {
  const panel = useTwin((s) => s.panel);
  return (
    <div className={sp.row} style={{ marginTop: 12 }}>
      <button type="button" className={sp.ghost} aria-pressed={panel === "driver"} onClick={() => useTwin.setState({ panel: panel === "driver" ? "none" : "driver" })}>
        <CarFront size={13} aria-hidden="true" /> Driver
      </button>
      <button type="button" className={sp.ghost} aria-pressed={panel === "operator"} onClick={() => useTwin.setState({ panel: panel === "operator" ? "none" : "operator" })}>
        <MonitorCog size={13} aria-hidden="true" /> Operator
      </button>
    </div>
  );
}

/** Shown at the station while it displays a parking bay's session. */
export function HandoverBanner() {
  const h = useTwin((s) => s.handover);
  if (!h) return null;
  return (
    <div className={sp.handover} role="note">
      <p>{`Bay ${h.bayId} · ${h.vehicleId} · parking session ${h.sessionId} → charging session ${h.chargingId}. This is that bay's own Station simulation; the parking facility keeps running.`}</p>
      <button type="button" className={sp.cta} onClick={returnToParking}>
        Return to Smart Parking
      </button>
    </div>
  );
}

// ── Inputs and faults (Engineer and Research) ─────────────────────────────

export function ParkingInputs() {
  const mode = useTwin((s) => s.mode);
  const f = useTwin((s) => s.facility);
  const set = useTwin((s) => s.setFacility);
  const restart = () => {
    resetEnvironment("parking");
    enterStage("parking", 0, { auto: false });
  };
  const preset = f.layout.bays === POC_LAYOUT.bays && f.layout.wireless === POC_LAYOUT.wireless ? "poc" : f.layout.bays === DEFAULT_LAYOUT.bays && f.layout.wireless === DEFAULT_LAYOUT.wireless ? "demo" : "custom";
  return (
    <>
      <Panel title="Facility" tag="input" actions={<button type="button" className={sp.ghost} onClick={restart}>Restart with these</button>}>
        <p className={sp.note}>Layout, region and scenario apply on restart; every other input applies at once.</p>
        <Group title="Layout">
          <Select
            label="Configuration"
            value={preset}
            options={[
              { id: "demo", label: "Demonstration · 12 bays (8 + 4 wireless)" },
              { id: "poc", label: "Physical POC · 6 bays (4 + 2 wireless)" },
              { id: "custom", label: "Custom" },
            ]}
            onChange={(v) => v !== "custom" && set({ layout: v === "poc" ? POC_LAYOUT : DEFAULT_LAYOUT })}
          />
          <Slider label="Bays" value={f.layout.bays} min={6} max={48} step={2} onChange={(v) => set({ layout: { ...f.layout, bays: v, wireless: Math.min(f.layout.wireless, v) } })} />
          <Slider label="Wireless charging bays" value={f.layout.wireless} min={0} max={Math.min(16, f.layout.bays)} step={1} onChange={(v) => set({ layout: { ...f.layout, wireless: v } })} />
          <Select label="Region" value={f.region} options={[{ id: "IN", label: "India (INR, Asia/Kolkata) · POC" }, { id: "US", label: "USA (USD, America/Los_Angeles)" }, { id: "CN", label: "China (CNY, Asia/Shanghai)" }]} onChange={(v) => set({ region: v as Region, siteId: v === "IN" ? "EVE-IN-POC-01" : v === "US" ? "EVE-US-01" : "EVE-CN-01" })} />
          <Select label="Starting state" value={f.scenario} options={[{ id: "tour", label: "Half full, one EV charging" }, { id: "empty", label: "Empty" }, { id: "busy", label: "Busy (conventional bays full)" }]} onChange={(v) => set({ scenario: v as typeof f.scenario })} />
        </Group>
      </Panel>
      <Panel title="Demand" tag="input">
        <Slider label="Background arrivals" value={f.arrivalsPerHour} min={0} max={40} step={1} unit="/h" onChange={(v) => set({ arrivalsPerHour: v })} />
        <Select label="Arrival profile" value={f.profile} options={[{ id: "constant", label: "Constant (Poisson baseline)" }, { id: "commuter", label: "Commuter day" }, { id: "retail", label: "Retail day" }]} onChange={(v) => set({ profile: v as typeof f.profile })} />
        <AtDepth mode={mode} min="engineer">
          <Slider label="Electric vehicles" value={f.mix.evShare} min={0} max={1} step={0.05} scale={100} unit="%" onChange={(v) => set({ mix: { ...f.mix, evShare: v } })} />
          <Slider label="EVs with a wireless receiver" value={f.mix.wirelessShare} min={0} max={1} step={0.05} scale={100} unit="%" onChange={(v) => set({ mix: { ...f.mix, wirelessShare: v } })} />
          <Slider label="Reservations" value={f.mix.reservationShare} min={0} max={1} step={0.05} scale={100} unit="%" onChange={(v) => set({ mix: { ...f.mix, reservationShare: v } })} />
          <Slider label="Mean stay" value={f.mix.meanStay} min={900} max={8 * 3600} step={900} scale={1 / 3600} digits={2} unit="h" onChange={(v) => set({ mix: { ...f.mix, meanStay: v } })} />
          <Slider label="Entry queue capacity" value={f.queueCapacity} min={0} max={8} step={1} onChange={(v) => set({ queueCapacity: v })} />
        </AtDepth>
      </Panel>
      <Panel title="Allocation" tag="input">
        <Select label="Policy" value={f.policy} options={(Object.keys(POLICY_INFO) as AllocationPolicy[]).map((id) => ({ id, label: POLICY_INFO[id].name }))} onChange={(v) => set({ policy: v as AllocationPolicy })} />
        <p className={sp.note}>{POLICY_INFO[f.policy].text}</p>
        <AtDepth mode={mode} min="engineer">
          {f.policy === "multi-objective" && (
            <Group title="Weights (normalised terms)">
              {(["travel", "walk", "chargingDelay", "congestion", "energy"] as const).map((k) => (
                <Slider key={k} label={{ travel: "Driving distance", walk: "Walking distance", chargingDelay: "Charging delay", congestion: "Congestion", energy: "Energy price" }[k]} value={f.weights[k]} min={0} max={1} step={0.05} digits={2} onChange={(v) => set({ weights: { ...f.weights, [k]: v } })} />
              ))}
            </Group>
          )}
          <Toggle label="Overflow: non-charging vehicles may use free wireless bays" checked={f.overflowToWireless} onChange={(v) => set({ overflowToWireless: v })} />
        </AtDepth>
      </Panel>
      <AtDepth mode={mode} min="engineer">
        <Panel title="Sensing, recognition and AI placement" tag="input">
          <Select label="Fusion" value={f.fusion.strategy} options={[{ id: "bayes", label: "Bayesian (three sensors)" }, { id: "majority", label: "Majority vote" }, { id: "priority", label: "Priority (camera first)" }, { id: "ultrasonic-only", label: "Ultrasonic only (baseline)" }]} onChange={(v) => set({ fusion: { ...f.fusion, strategy: v as FusionStrategy } })} />
          <Toggle label="Any disagreement makes the bay uncertain" checked={f.fusion.strict} onChange={(v) => set({ fusion: { ...f.fusion, strict: v } })} />
          <Slider label="Plate accept threshold" value={f.recognition.acceptThreshold} min={0.6} max={0.99} step={0.01} digits={2} onChange={(v) => set({ recognition: { ...f.recognition, acceptThreshold: v } })} />
          <Select label="AI deployment" value={f.aiDeployment} options={[{ id: "edge", label: "Edge (recognition on the gateway)" }, { id: "hybrid", label: "Hybrid (edge recognition, cloud analytics)" }, { id: "cloud", label: "Cloud (recognition round trip)" }]} onChange={(v) => set({ aiDeployment: v as typeof f.aiDeployment })} />
          <p className={sp.note}>Safety-critical control stays local in every placement: barrier interlocks, the alarm controller and the Station’s protection never wait for the network.</p>
          <Toggle label="Visitors may enter with a ticket" checked={f.visitorEntry} onChange={(v) => set({ visitorEntry: v })} />
        </Panel>
        <Panel title="Communication (facility LAN)" tag="input">
          <Slider label="Latency" value={f.lan.latency} min={0.002} max={0.5} step={0.002} scale={1000} digits={0} unit="ms" onChange={(v) => set({ lan: { ...f.lan, latency: v, jitter: v / 2 } })} />
          <Slider label="Message loss" value={f.lan.loss} min={0} max={0.3} step={0.005} scale={100} digits={1} unit="%" onChange={(v) => set({ lan: { ...f.lan, loss: v } })} />
          <Slider label="Duplication" value={f.lan.duplicate} min={0} max={0.3} step={0.005} scale={100} digits={1} unit="%" onChange={(v) => set({ lan: { ...f.lan, duplicate: v } })} />
        </Panel>
        <Panel title="Weather and energy" tag="input">
          <Slider label="Mean ambient" value={f.env.ambientMean} min={10} max={42} step={0.5} unit="°C" onChange={(v) => set({ env: { ...f.env, ambientMean: v } })} />
          <Slider label="Cloud" value={f.env.cloud} min={0} max={1} step={0.05} scale={100} unit="%" onChange={(v) => set({ env: { ...f.env, cloud: v } })} />
          <Toggle label="Rain" checked={f.env.rain} onChange={(v) => set({ env: { ...f.env, rain: v } })} />
          <Slider label="PV area" value={f.energy.pvArea} min={0} max={400} step={10} unit="m²" onChange={(v) => set({ energy: { ...f.energy, pvArea: v } })} />
          <Slider label="Storage" value={f.energy.bessKWh} min={0} max={100} step={5} unit="kWh" onChange={(v) => set({ energy: { ...f.energy, bessKWh: v } })} />
          <Slider label="Grid import limit" value={f.energy.gridLimit} min={5000} max={80000} step={1000} scale={0.001} digits={0} unit="kW" onChange={(v) => set({ energy: { ...f.energy, gridLimit: v } })} />
          <Select label="Charging power sharing" value={f.energy.chargingPolicy} options={[{ id: "least-laxity", label: "Earliest departure first" }, { id: "equal", label: "Equal share" }]} onChange={(v) => set({ energy: { ...f.energy, chargingPolicy: v as typeof f.energy.chargingPolicy } })} />
          <Toggle label="Storage may support charging" checked={f.energy.storageForCharging} onChange={(v) => set({ energy: { ...f.energy, storageForCharging: v } })} />
        </Panel>
        <Panel title="Operating mode">
          <ul className={sp.checks}>
            {OPERATING_MODES.map((m) => (
              <li key={m.id} data-ok={m.id === f.operatingMode ? "true" : m.available ? "wait" : "false"}>
                <span>
                  <strong>{m.name}</strong> — {m.text} {m.available ? `Data: ${m.dataMode}.` : "Blocked: no device is connected; nothing is LIVE."}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </AtDepth>
    </>
  );
}

const SEND: { label: string; over: Partial<VehicleProfile> }[] = [
  { label: "Compatible EV (charges)", over: { powertrain: "electric", wirelessCompatible: true, wantsCharging: true, member: true, plateObstructed: false, denied: false } },
  { label: "EV without a receiver", over: { powertrain: "electric", wirelessCompatible: false, wantsCharging: true, member: true, plateObstructed: false, denied: false } },
  { label: "Conventional car", over: { powertrain: "conventional", member: true, plateObstructed: false, denied: false } },
  { label: "Obstructed plate (QR)", over: { powertrain: "conventional", member: false, rfid: null, qr: "QR-OBSTRUCTED-1", plateObstructed: true, denied: false } },
  { label: "Unknown visitor", over: { powertrain: "conventional", member: false, rfid: null, qr: null, plateObstructed: true, denied: false } },
  { label: "Denied vehicle", over: { powertrain: "conventional", member: true, denied: true } },
  { label: "Ignores guidance", over: { powertrain: "conventional", member: true, ignoresGuidance: true, plateObstructed: false, denied: false } },
  { label: "Tailgater (pair)", over: {} },
];

export function ParkingFaults() {
  const f = useTwin((s) => s.facilityFaults);
  const set = useTwin((s) => s.setFacilityFaults);
  const [bay, setBay] = useState("N03");
  const [kind, setKind] = useState<"ultrasonic" | "infrared" | "camera">("infrared");
  const [faultMode, setFaultMode] = useState<"stuck-occupied" | "stuck-vacant" | "disconnected" | "noisy">("stuck-occupied");
  const bays = sim()?.layout.bays.map((b) => ({ id: b.id, label: b.id })) ?? [];
  const chargerBays = sim()?.layout.bays.filter((b) => b.type === "wireless").map((b) => ({ id: b.id, label: b.id })) ?? [];
  const send = (over: Partial<VehicleProfile>, label: string) => {
    const s = facility();
    if (label.startsWith("Tailgater")) {
      arrive(s, { powertrain: "conventional", member: true, plateObstructed: false, denied: false });
      arrive(s, { powertrain: "conventional", member: false, tailgates: true }, s.t + 2.2);
      return;
    }
    if (over.qr) s.access.tokens.add(over.qr);
    arrive(s, over);
  };
  return (
    <>
      <Panel title="Send a vehicle" tag="input">
        <div className={sp.row}>
          {SEND.map((x) => (
            <button key={x.label} type="button" className={sp.ghost} onClick={() => send(x.over, x.label)}>
              <Send size={13} aria-hidden="true" /> {x.label}
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Fault injection" tag="input">
        <Group title="Devices and services">
          <Toggle danger label="Recognition camera failure" checked={f.cameraFault} onChange={(v) => set({ cameraFault: v })} />
          <Toggle danger label="Edge gateway unavailable" checked={f.gatewayDown} onChange={(v) => set({ gatewayDown: v })} />
          <Toggle danger label="Cloud unreachable (store and forward)" checked={f.cloudDown} onChange={(v) => set({ cloudDown: v })} />
          <Toggle danger label="Payment service unavailable" checked={f.paymentDown} onChange={(v) => set({ paymentDown: v })} />
          <Toggle danger label="Environmental sensor failure (north)" checked={f.envSensorFailure} onChange={(v) => set({ envSensorFailure: v })} />
        </Group>
        <Group title="Bay sensor">
          <Select label="Bay" value={bay} options={bays} onChange={setBay} />
          <Select label="Sensor" value={kind} options={[{ id: "ultrasonic", label: "Ultrasonic" }, { id: "infrared", label: "Infrared" }, { id: "camera", label: "Camera" }]} onChange={(v) => setKind(v as typeof kind)} />
          <Select label="Failure" value={faultMode} options={[{ id: "stuck-occupied", label: "Stuck occupied" }, { id: "stuck-vacant", label: "Stuck vacant" }, { id: "disconnected", label: "Disconnected" }, { id: "noisy", label: "Noisy" }]} onChange={(v) => setFaultMode(v as typeof faultMode)} />
          <div className={sp.row}>
            <button type="button" className={sp.ghost} onClick={() => set({ sensor: { bayId: bay, kind, mode: faultMode } })}>
              Inject
            </button>
            <button type="button" className={sp.ghost} disabled={!f.sensor} onClick={() => set({ sensor: null })}>
              Clear{f.sensor ? ` (${f.sensor.bayId} ${f.sensor.kind})` : ""}
            </button>
          </div>
        </Group>
        <Group title="Safety (simulated sources only)">
          <Toggle danger label="Smoke source" checked={f.smoke} onChange={(v) => set({ smoke: v })} />
          <Toggle danger label="Gas release" checked={f.gas} onChange={(v) => set({ gas: v })} />
          <Toggle danger label="Fan failure" checked={f.fanFailure} onChange={(v) => set({ fanFailure: v })} />
          <Toggle danger label="Grid outage" checked={f.gridOutage} onChange={(v) => set({ gridOutage: v })} />
          <Select label="Barrier obstruction" value={f.obstruction} options={[{ id: "none", label: "None" }, { id: "entry", label: "Under the entry barrier" }, { id: "exit", label: "Under the exit barrier" }]} onChange={(v) => set({ obstruction: v as typeof f.obstruction })} />
          {chargerBays.length > 0 && (
            <Select
              label="Charger fault"
              value={f.charger ? `${f.charger.bayId}|${f.charger.fault}` : "none"}
              options={[{ id: "none", label: "None" }, ...chargerBays.flatMap((b) => [{ id: `${b.id}|foreignObject`, label: `${b.id}: metal object on the pad` }, { id: `${b.id}|livingObject`, label: `${b.id}: living object near the pad` }, { id: `${b.id}|controllerFailure`, label: `${b.id}: controller failure` }])]}
              onChange={(v) => set({ charger: v === "none" ? null : { bayId: v.split("|")[0], fault: v.split("|")[1] as "foreignObject" } })}
            />
          )}
        </Group>
        <p className={sp.note}>After a smoke or gas alarm clears, an operator acknowledges it (Operator tab); the chargers then recover through the Station’s own reset.</p>
      </Panel>
    </>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────

function readResults() {
  const s = sim();
  if (!s) return null;
  const c = countBays(s);
  const e = s.lastEnergy;
  return {
    t: s.t,
    clock: siteClock(s),
    c,
    queue: queueLength(s),
    stats: { ...s.stats, stays: s.stats.stays.length },
    energy: e ? { pv: e.pvUsed, grid: e.grid, bess: e.bessDischarge - e.bessCharge, charging: e.served.charging, essential: e.served.essential, comfort: e.served.comfort, unmet: e.unmet.essential + e.unmet.comfort + e.unmet.charging } : null,
    env: { T: s.env.temperature, amb: s.env.ambient, rh: s.env.humidity, co: s.env.co, smoke: s.env.smoke, gas: s.env.gas, fan: s.env.fanDuty, light: s.env.lighting, alarm: s.env.alarm, G: s.env.irradiance },
    ledger: { parking: s.ledger.parking, charging: s.ledger.charging, region: s.inputs.region },
    samples: s.samples.slice(-120).map((x) => ({ h: x.hour, occ: x.occupied, chg: x.chargingPower / 1000, pv: x.pv / 1000, grid: x.grid / 1000, T: x.temperature })),
    devices: [...s.devices.values()].reduce((a, d) => ((a[!d.online ? "offline" : s.t - d.lastSeen > 3 * d.period + 5 && s.t > 30 ? "stale" : "online"] += 1), a), { online: 0, stale: 0, offline: 0 }),
  };
}

export function ParkingResults() {
  const d = useSampled(readResults, 2);
  if (!d) return <p className={sp.note}>Open Smart Parking to start the facility.</p>;
  const m = (x: number) => money(d.ledger.region, x);
  return (
    <>
      <Panel title="Bays" tag="SIMULATED">
        <BayGrid />
        <BayLegend />
        <dl className={ui.readouts}>
          <Readout label="Free" value={d.c.available} digits={0} />
          <Readout label="Occupied" value={d.c.occupied} digits={0} />
          <Readout label="Charging" value={d.c.charging} digits={0} />
          <Readout label="Reserved" value={d.c.reserved} digits={0} />
          <Readout label="Waiting" value={d.queue} digits={0} />
          <Readout label="Site time" value={d.clock} />
        </dl>
      </Panel>
      <Panel title="Flow of vehicles" tag="SIMULATED">
        <dl className={ui.readouts}>
          <Readout label="Arrived" value={d.stats.arrived} digits={0} />
          <Readout label="Entered" value={d.stats.entered} digits={0} />
          <Readout label="Left" value={d.stats.exited} digits={0} />
          <Readout label="Drove past (full)" value={d.stats.balked} digits={0} />
          <Readout label="Turned away" value={d.stats.rejected} digits={0} />
          <Readout label="Abandoned the queue" value={d.stats.abandoned} digits={0} />
          <Readout label="Mean queue wait" value={d.stats.waitCount ? d.stats.waitSum / d.stats.waitCount / 60 : 0} unit="min" digits={1} />
          <Readout label="Mean gate-to-bay time" value={d.stats.searchCount ? d.stats.searchSum / d.stats.searchCount : 0} unit="s" digits={0} />
          <Readout label="Tailgating events" value={d.stats.tailgating} digits={0} />
        </dl>
      </Panel>
      {d.energy && (
        <Panel title="Energy" tag="calculated">
          <dl className={ui.readouts}>
            <Readout label="Solar used" value={d.energy.pv / 1000} unit="kW" digits={1} />
            <Readout label="Grid import" value={d.energy.grid / 1000} unit="kW" digits={1} />
            <Readout label="Storage (+ discharging)" value={d.energy.bess / 1000} unit="kW" digits={1} />
            <Readout label="Chargers" value={d.energy.charging / 1000} unit="kW" digits={1} />
            <Readout label="Essential loads" value={d.energy.essential / 1000} unit="kW" digits={2} />
            <Readout label="Lighting and fans" value={d.energy.comfort / 1000} unit="kW" digits={2} />
            <Readout label="Unmet demand" value={d.energy.unmet / 1000} unit="kW" digits={2} note="never drawn as delivered" />
          </dl>
        </Panel>
      )}
      <Panel title="Shelter environment" tag="SIMULATED">
        <dl className={ui.readouts}>
          <Readout label="Shelter air" value={d.env.T} unit="°C" digits={1} />
          <Readout label="Ambient" value={d.env.amb} unit="°C" digits={1} />
          <Readout label="Humidity" value={d.env.rh * 100} unit="%" digits={0} />
          <Readout label="CO" value={d.env.co} unit="ppm" digits={1} />
          <Readout label="Smoke (simulated)" value={d.env.smoke} unit="%/m" digits={2} />
          <Readout label="Gas (simulated)" value={d.env.gas} unit="%LEL" digits={2} />
          <Readout label="Fans" value={d.env.fan * 100} unit="%" digits={0} />
          <Readout label="Lighting" value={d.env.light * 100} unit="%" digits={0} />
          <Readout label="Irradiance" value={d.env.G} unit="W/m²" digits={0} />
          <Readout label="Alarm" value={d.env.alarm === "none" ? "normal" : d.env.alarm} />
        </dl>
      </Panel>
      {d.samples.length > 2 && (
        <Panel title="History" tag="SIMULATED">
          <Chart x={d.samples.map((x) => x.h)} xLabel="Site hour" yLabel="bays, kW" height={150} series={[{ name: "Occupied bays", color: "#e5534b", values: d.samples.map((x) => x.occ) }, { name: "Charging, kW", color: "#39c5cf", values: d.samples.map((x) => x.chg) }, { name: "Solar, kW", color: "#f5b041", values: d.samples.map((x) => x.pv), dashed: true }]} caption="Sampled every 30 s of simulation time." />
        </Panel>
      )}
      <Panel title="Ledgers (simulated payments)" tag="calculated">
        <dl className={ui.readouts}>
          <Readout label="Parking collected" value={m(d.ledger.parking)} />
          <Readout label="Charging collected" value={m(d.ledger.charging)} />
          <Readout label="Devices online" value={d.devices.online} digits={0} />
          <Readout label="Stale / offline" value={`${d.devices.stale} / ${d.devices.offline}`} />
        </dl>
      </Panel>
    </>
  );
}

// ── Bay and vehicle inspectors ────────────────────────────────────────────

function readBay(id: string) {
  const s = sim();
  const b = s?.bays.find((x) => x.bay.id === id);
  if (!s || !b) return null;
  const session = b.session ? s.sessions.get(b.session) : null;
  const v = session ? vehicleById(s, session.vehicleId) : null;
  const ch = s.chargers.get(id);
  return {
    bay: { id, type: b.bay.type, row: b.bay.row, width: b.bay.width, depth: b.bay.depth, drive: b.bay.drive, walk: b.bay.walk },
    status: b.status,
    version: b.version,
    fusion: b.fusion,
    votes: [...b.votes.values()].map((x) => ({ kind: x.kind, state: x.state, age: s.t - x.at, mode: x.mode })),
    raw: b.lastRaw,
    history: b.history.slice(-8).map((h) => ({ t: siteClock(s, h.t, true), status: h.status })),
    session: session ? { id: session.id, state: session.lc.state, vehicle: session.vehicleId, parkedAt: session.parkedAt, eligibility: session.eligibility } : null,
    vehicle: v ? { plate: v.profile.plate, cls: v.profile.cls, ev: v.profile.powertrain === "electric", wireless: v.profile.wirelessCompatible } : null,
    charger: ch ? { ...chargerView(ch), session: ch.session?.id ?? null, inService: ch.inService } : null,
    t: s.t,
  };
}

export function BayInspector({ id }: { id: string }) {
  const read = useCallback(() => readBay(id), [id]);
  const d = useSampled(read, 3);
  if (!d) return <p className={sp.note}>This bay is not in the current layout.</p>;
  const look = GLYPH[d.status];
  return (
    <div className={lab.inspectorBody}>
      <p className={lab.eyebrow}>{`Smart parking · bay · ${d.bay.type}`}</p>
      <h3 className={lab.inspectorTitle}>
        <span style={{ color: look.color }} aria-hidden="true">{`${look.g} `}</span>
        {`Bay ${d.bay.id} · ${look.word}`}
      </h3>
      <section className={sp.block}>
        <dl className={sp.kv}>
          <div>
            <dt>Size (representative)</dt>
            <dd>{`${fmt(d.bay.width, 2)} × ${fmt(d.bay.depth, 2)} m`}</dd>
          </div>
          <div>
            <dt>From the entry / to the exit on foot</dt>
            <dd>{`${fmt(d.bay.drive, 0)} m / ${fmt(d.bay.walk, 0)} m`}</dd>
          </div>
          <div>
            <dt>Fused occupancy</dt>
            <dd>
              {`p = ${prob(d.fusion.p)} · ${d.fusion.decision}`}
              {d.fusion.disagreement && <small>Sensors disagree: not offered</small>}
            </dd>
          </div>
          <div>
            <dt>Version (atomic reservation)</dt>
            <dd>{d.version}</dd>
          </div>
        </dl>
      </section>
      <section className={sp.block}>
        <p className={sp.head}>Sensors (as the gateway last received them)</p>
        <ul className={sp.checks}>
          {(["ultrasonic", "infrared", "camera"] as const).map((k) => {
            const v = d.votes.find((x) => x.kind === k);
            const raw = k === "ultrasonic" ? `${fmt(d.raw.ultrasonic, 2)} m echo` : k === "infrared" ? `reflectance ${fmt(d.raw.infrared, 2)}` : `score ${fmt(d.raw.camera, 2)}`;
            return (
              <li key={k} data-ok={v?.state === null || !v ? "wait" : v.age > 12 ? "false" : "true"}>
                <span>
                  <strong>{DETECTOR_RATES[k].label}</strong>
                  {` — ${v?.state === undefined || v?.state === null ? "no state" : v.state ? "occupied" : "vacant"} · ${raw} · ${v ? `${fmt(v.age, 1)} s ago · ${v.age > 12 ? "STALE" : v.mode}` : "—"}`}
                </span>
              </li>
            );
          })}
        </ul>
        <p className={sp.note}>{`Declared rates after debounce: ultrasonic ${DETECTOR_RATES.ultrasonic.pd * 100} % / ${DETECTOR_RATES.ultrasonic.pfa * 100} %, infrared ${DETECTOR_RATES.infrared.pd * 100} % / ${DETECTOR_RATES.infrared.pfa * 100} %, camera ${DETECTOR_RATES.camera.pd * 100} % / ${DETECTOR_RATES.camera.pfa * 100} % (detection / false alarm), to be measured on the POC.`}</p>
      </section>
      {d.session && (
        <section className={sp.block}>
          <p className={sp.head}>Vehicle session</p>
          <dl className={sp.kv}>
            <div>
              <dt>Session</dt>
              <dd>
                {d.session.id}
                <small>{STATES[d.session.state].label}</small>
              </dd>
            </div>
            <div>
              <dt>Vehicle</dt>
              <dd>
                {d.session.vehicle}
                <small>{d.vehicle ? `${d.vehicle.plate} (synthetic) · ${d.vehicle.cls}${d.vehicle.ev ? ` · EV${d.vehicle.wireless ? ", wireless receiver" : ", no receiver"}` : ""}` : ""}</small>
              </dd>
            </div>
          </dl>
          <button type="button" className={sp.ghost} onClick={() => useTwin.getState().select(`sp-veh:${d.session!.vehicle}`)}>
            Inspect the vehicle
          </button>
        </section>
      )}
      {d.charger && (
        <section className={sp.block}>
          <p className={sp.head}>Wireless charger (this bay’s own Station simulation)</p>
          <dl className={sp.kv}>
            <div>
              <dt>Station state</dt>
              <dd>{d.charger.label}</dd>
            </div>
            <div>
              <dt>Power to battery</dt>
              <dd>{`${fmt(d.charger.pBattery / 1000, 2)} kW`}<small>{`grid input ${fmt(d.charger.pGrid / 1000, 2)} kW · k = ${fmt(d.charger.k, 3)}`}</small></dd>
            </div>
            <div>
              <dt>Battery SOC</dt>
              <dd>{`${fmt(d.charger.soc * 100, 1)} %`}</dd>
            </div>
            <div>
              <dt>Charging session</dt>
              <dd>{d.charger.session ?? "none"}</dd>
            </div>
          </dl>
          <ExploreChargingButton bayId={d.bay.id} />
        </section>
      )}
      {d.session?.eligibility && <EligibilityList e={d.session.eligibility} />}
      <section className={sp.block}>
        <p className={sp.head}>Occupancy history</p>
        <ul className={sp.list}>
          {[...d.history].reverse().map((h, i) => (
            <li key={i}>
              <span>{GLYPH[h.status as BayStatus]?.word ?? h.status}</span>
              <span className={sp.mono}>{h.t}</span>
            </li>
          ))}
        </ul>
      </section>
      <p className={lab.small}>
        <Tag kind="SIMULATED" /> Models SP-MATH-003 (fusion), SP-MATH-004 (allocation){d.charger ? ", SP-INT-001 and WPT-SIM-001 (charging)" : ""}.
      </p>
    </div>
  );
}

function EligibilityList({ e }: { e: NonNullable<Session["eligibility"]> }) {
  return (
    <section className={sp.block}>
      <p className={sp.head}>{`Charging eligibility · ${e.eligible ? "eligible" : "not eligible"}`}</p>
      <ul className={sp.checks}>
        {e.checks.map((c) => (
          <li key={c.id} data-ok={c.passed ? "true" : "false"}>
            <span>
              <strong>{c.label}</strong> — {c.detail}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function readVehicle(id: string) {
  const s = sim();
  const v = s ? vehicleById(s, id) : null;
  if (!s || !v) return null;
  const session = sessionOf(s, id);
  const ch = session?.bayId ? s.chargers.get(session.bayId) : undefined;
  const live = ch && ch.session?.vehicleId === id ? chargerView(ch) : null;
  const bills = session ? runningBills(s, session) : null;
  return {
    p: v.profile,
    soc: live ? live.soc : v.profile.soc,
    socSource: live ? "Station (attached)" : "parking record",
    session: session ? { id: session.id, state: session.lc.state, bay: session.bayId, history: session.lc.history.slice(-10).map((h) => ({ t: siteClock(s, h.t, true), to: h.to, reason: h.reason })), recognition: session.recognition, access: session.access, credential: session.credential, departAt: siteClock(s, session.departAt), allocation: session.allocation, chargingId: session.chargingId, eligibility: session.eligibility } : null,
    bills: bills ? { parking: money(s.inputs.region, bills.parking.total), charging: bills.charging ? money(s.inputs.region, bills.charging.total) : null, final: bills.final } : null,
    charging: live,
    region: s.inputs.region,
  };
}

export function VehicleInspector({ id }: { id: string }) {
  const read = useCallback(() => readVehicle(id), [id]);
  const d = useSampled(read, 3);
  const [tab, setTab] = useState<"session" | "identity" | "allocation">("session");
  if (!d) return <p className={sp.note}>This vehicle has left the facility.</p>;
  const p = d.p;
  return (
    <div className={lab.inspectorBody}>
      <p className={lab.eyebrow}>{`Smart parking · vehicle · ${p.powertrain === "electric" ? (p.wirelessCompatible ? "EV with a wireless receiver" : "EV without a receiver") : "conventional"}`}</p>
      <h3 className={lab.inspectorTitle}>{`${p.id} · ${p.cls}`}</h3>
      <div className={lab.levels} role="tablist" aria-label="Detail">
        {(["session", "identity", "allocation"] as const).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t === "session" ? "Session" : t === "identity" ? "Identity" : "Allocation"}
          </button>
        ))}
      </div>
      {tab === "session" && (
        <div role="tabpanel" aria-label="Session">
          <dl className={sp.kv}>
            <div>
              <dt>State</dt>
              <dd>{d.session ? STATES[d.session.state].label : "approaching"}</dd>
            </div>
            <div>
              <dt>Bay</dt>
              <dd>{d.session?.bay ?? "pending"}</dd>
            </div>
            <div>
              <dt>Dimensions (class)</dt>
              <dd>{`${fmt(p.length, 2)} × ${fmt(p.width, 2)} × ${fmt(p.height, 2)} m`}</dd>
            </div>
            <div>
              <dt>Planned departure</dt>
              <dd>{d.session?.departAt ?? "—"}</dd>
            </div>
            {p.powertrain === "electric" && (
              <>
                <div>
                  <dt>Battery</dt>
                  <dd>
                    {`${fmt(d.soc * 100, 1)} % of ${fmt(p.capacityKWh, 0)} kWh`}
                    <small>{`target ${fmt(p.targetSoc * 100, 0)} % · from the ${d.socSource}`}</small>
                  </dd>
                </div>
                <div>
                  <dt>Charging</dt>
                  <dd>{d.charging ? `${d.charging.label} · ${fmt(d.charging.pBattery / 1000, 2)} kW` : p.wirelessCompatible && p.wantsCharging ? "not attached" : "not requested or not possible"}</dd>
                </div>
              </>
            )}
            {d.bills && (
              <div>
                <dt>{d.bills.final ? "Billed" : "Charges so far"}</dt>
                <dd>
                  {`Parking ${d.bills.parking}`}
                  {d.bills.charging && <small>{`Charging ${d.bills.charging} (separate ledger)`}</small>}
                </dd>
              </div>
            )}
          </dl>
          {d.charging && d.session?.bay && (
            <div className={sp.row}>
              <ExploreChargingButton bayId={d.session.bay} />
            </div>
          )}
          {d.session && !isTerminal(d.session.state) && !["departure-requested", "charging-stopping", "billing", "exit-authorized", "exiting"].includes(d.session.state) && STATES[d.session.state].step >= 16 && (
            <div className={sp.row}>
              <button type="button" className={sp.ghost} onClick={() => requestDeparture(facility(), d.session!.id, "driver")}>
                Request departure
              </button>
            </div>
          )}
          <p className={sp.head} style={{ marginTop: 14 }}>
            Lifecycle
          </p>
          <ul className={sp.list}>
            {[...(d.session?.history ?? [])].reverse().map((h, i) => (
              <li key={i}>
                <span>{STATES[h.to].label}</span>
                <span className={sp.mono}>{h.t}</span>
                <small>{h.reason}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === "identity" && (
        <div role="tabpanel" aria-label="Identity">
          <dl className={sp.kv}>
            <div>
              <dt>Plate (synthetic)</dt>
              <dd>
                {p.plate}
                <small>{PLATE_FORMATS[d.region].name}</small>
              </dd>
            </div>
            <div>
              <dt>Credentials</dt>
              <dd>{[p.rfid ? "RFID tag" : null, p.qr ? "QR code" : null, p.member ? "member" : "visitor"].filter(Boolean).join(" · ")}</dd>
            </div>
            <div>
              <dt>Recognition</dt>
              <dd>
                {d.session?.recognition ? `${d.session.recognition.outcome} · confidence ${fmt(d.session.recognition.confidence, 2)}` : "pending"}
                <small>{d.session?.recognition ? `read "${d.session.recognition.read ?? "—"}" · ${d.session.recognition.factors.join(", ") || "good conditions"} · SIMULATED` : ""}</small>
              </dd>
            </div>
            <div>
              <dt>Authorisation</dt>
              <dd>
                {d.session?.access ? (d.session.access.authorised ? `authorised (${d.session.access.role})` : "not authorised") : "pending"}
                <small>{d.session?.access?.reason ?? ""}</small>
              </dd>
            </div>
          </dl>
          <p className={sp.head} style={{ marginTop: 14 }}>
            Recognition pipeline (edge, declared latencies)
          </p>
          <ul className={sp.checks}>
            {PIPELINE.map((st) => (
              <li key={st.id} data-ok={d.session?.recognition ? (d.session.recognition.outcome === "camera-fault" && st.id !== "capture" ? "false" : "true") : "wait"}>
                <span>
                  <strong>{st.label}</strong> — {`${fmt(st.latency * 1000, 0)} ms`}
                </span>
              </li>
            ))}
          </ul>
          <p className={sp.note}>No image is processed in this web application; the outcome comes from a declared error model. An uncertain read is never authorised on its own.</p>
        </div>
      )}
      {tab === "allocation" && (
        <div role="tabpanel" aria-label="Allocation">
          {d.session?.allocation ? (
            <>
              <p className={sp.text}>{`${POLICY_INFO[d.session.allocation.policy].name}: ${d.session.allocation.bayId ?? "no bay"} — ${d.session.allocation.reason}.`}</p>
              <div className={sp.scroll}>
                <table className={sp.table}>
                  <thead>
                    <tr>
                      <th scope="col">Bay</th>
                      <th scope="col">Eligible</th>
                      <th scope="col">Cost J</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.session.allocation.candidates.map((c) => (
                      <tr key={c.bayId}>
                        <th scope="row">{c.bayId}</th>
                        <td title={c.reason}>{c.eligible ? "yes" : c.reason}</td>
                        <td>{c.cost !== undefined ? fmt(c.cost, 3) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={sp.note}>Hard constraints rule bays out before any cost is computed; ties break on the bay number.</p>
            </>
          ) : (
            <p className={sp.note}>Not allocated yet.</p>
          )}
          {d.session?.eligibility && <EligibilityList e={d.session.eligibility} />}
        </div>
      )}
    </div>
  );
}

// ── Driver workflow ───────────────────────────────────────────────────────

let driverVehicle: string | null = null;
let driverToken: string | null = null;

export function DriverPanel() {
  const [, force] = useState(0);
  const [kind, setKind] = useState<"conventional" | "wireless" | "accessible">("wireless");
  const [startIn, setStartIn] = useState("0");
  const [hours, setHours] = useState("2");
  const [message, setMessage] = useState<string | null>(null);
  const read = useCallback(() => {
    const s = sim();
    if (!s) return null;
    const c = countBays(s);
    const session = driverVehicle ? sessionOf(s, driverVehicle) : null;
    const v = driverVehicle ? vehicleById(s, driverVehicle) : null;
    const ch = session?.bayId ? s.chargers.get(session.bayId) : undefined;
    const live = ch && ch.session?.vehicleId === driverVehicle ? chargerView(ch) : null;
    return { c, region: s.inputs.region, tariff: TARIFFS[s.inputs.region], session: session ? { id: session.id, state: session.lc.state, bay: session.bayId, parkedAt: session.parkedAt, entryAt: session.entryAt, bills: runningBills(s, session), payment: session.payment, billedAt: session.billedAt } : null, vehicleGone: !!driverVehicle && (!v || v.gone), live, t: s.t, clock: siteClock(s), tz: LOCALES[s.inputs.region].timeZone, s };
  }, []);
  const d = useSampled(read, 2);
  if (!d) return <p className={sp.note}>Open Smart Parking to start the facility.</p>;
  const m = (x: number) => money(d.region, x);
  const t = d.tariff;
  const reserve = () => {
    const s = facility();
    const id = `V-D${String(Math.floor(s.t)).padStart(5, "0")}`;
    const start = s.t + Number(startIn) * 60;
    const r = book(s, { vehicleId: id, type: kind, start, end: start + Number(hours) * 3600 });
    if (r.ok && r.reservation) {
      driverToken = r.reservation.token;
      setMessage(`Reservation ${r.reservation.id} for a ${kind} bay, ${siteClock(s, start)}–${siteClock(s, start + Number(hours) * 3600)}. Your QR code: ${r.reservation.token} (synthetic).`);
    } else setMessage(`Not booked: ${r.reason}.`);
  };
  const driveIn = () => {
    const s = facility();
    const ev = kind === "wireless";
    driverVehicle = arrive(s, { powertrain: ev ? "electric" : "conventional", wirelessCompatible: ev, wantsCharging: ev, cls: "sedan", soc: 0.3, targetSoc: 0.8, member: false, rfid: null, qr: driverToken, accessiblePermit: kind === "accessible", plateObstructed: false, denied: false, stay: Number(hours) * 3600, paint: "#7d1a22" });
    if (driverToken) {
      const res = s.reservations.items.find((r) => r.token === driverToken);
      if (res) res.vehicleId = driverVehicle;
    }
    s.focus = driverVehicle;
    setMessage(`Your vehicle ${driverVehicle} is on its way to the entry${driverToken ? " with your reservation" : ""}.`);
    force((x) => x + 1);
  };
  const leave = () => {
    if (d.session) requestDeparture(facility(), d.session.id, "driver");
  };
  const ses = d.session;
  return (
    <div className={lab.inspectorBody} data-panels>
      <section className={sp.block}>
        <p className={sp.head}>Discover</p>
        <h3 className={sp.title}>{`${d.c.available} bays free · ${d.c.wirelessFree} with wireless charging`}</h3>
        <p className={sp.note}>{`Parking: free for ${t.graceMin} min, then ${m(t.firstBlock)} for the first ${t.firstBlockMin} min and ${m(t.block)} per ${t.blockMin} min (cap ${m(t.dailyCap)} a day). Charging: ${m(t.energyPerKWh)} per kWh at the charger's input. Illustrative tariff, ${t.taxPct} % placeholder tax; ${d.clock} site time.`}</p>
      </section>
      <section className={sp.block}>
        <p className={sp.head}>Reserve and arrive</p>
        <Select label="I need" value={kind} options={[{ id: "wireless", label: "Parking with wireless charging" }, { id: "conventional", label: "Parking only" }, { id: "accessible", label: "Accessible bay (permit)" }]} onChange={(v) => setKind(v as typeof kind)} />
        <Select label="From" value={startIn} options={[{ id: "0", label: "Now" }, { id: "15", label: "In 15 minutes" }, { id: "30", label: "In 30 minutes" }, { id: "60", label: "In an hour" }]} onChange={setStartIn} />
        <Select label="For" value={hours} options={[{ id: "1", label: "1 hour" }, { id: "2", label: "2 hours" }, { id: "3", label: "3 hours" }, { id: "4", label: "4 hours" }]} onChange={setHours} />
        <div className={sp.row}>
          <button type="button" className={sp.ghost} onClick={reserve}>
            Reserve
          </button>
          <button type="button" className={sp.cta} onClick={driveIn} disabled={!!ses && !isTerminal(ses.state)}>
            Drive in now
          </button>
        </div>
        {message && <p className={sp.text} role="status">{message}</p>}
      </section>
      {ses && (
        <section className={sp.block}>
          <p className={sp.head}>My session</p>
          <dl className={sp.kv}>
            <div>
              <dt>State</dt>
              <dd>{STATES[ses.state].label}</dd>
            </div>
            <div>
              <dt>Guidance</dt>
              <dd>{ses.bay ? `Go to bay ${ses.bay}` : "Waiting for a bay"}</dd>
            </div>
            <div>
              <dt>Parked for</dt>
              <dd>{ses.entryAt !== null ? `${fmt((d.t - ses.entryAt) / 60, 0)} min` : "—"}</dd>
            </div>
            {d.live && (
              <div>
                <dt>Charging</dt>
                <dd>
                  {`${fmt(d.live.soc * 100, 1)} % · ${fmt(d.live.pBattery / 1000, 1)} kW`}
                  <small>{d.live.label}</small>
                </dd>
              </div>
            )}
            <div>
              <dt>{ses.bills.final ? "Parking (billed)" : "Parking so far"}</dt>
              <dd>{m(ses.bills.parking.total)}</dd>
            </div>
            {ses.bills.charging && (
              <div>
                <dt>{ses.bills.final ? "Charging (billed)" : "Charging so far"}</dt>
                <dd>
                  {m(ses.bills.charging.total)}
                  <small>{`${fmt(ses.bills.charging.meteredWh / 1000, 2)} kWh metered`}</small>
                </dd>
              </div>
            )}
          </dl>
          {d.live && ses.bay && <ExploreChargingButton bayId={ses.bay} />}
          {STATES[ses.state].step >= 16 && STATES[ses.state].step < 20 && (
            <div className={sp.row}>
              <button type="button" className={sp.cta} onClick={leave}>
                Leave and pay (simulated)
              </button>
            </div>
          )}
          <p className={sp.note}>Payment is simulated: no card, account or UPI detail is ever asked for or collected.</p>
        </section>
      )}
      {ses?.payment && (
        <section className={sp.block}>
          <p className={sp.head}>Receipt</p>
          <div className={sp.receipt}>
            <div>
              <span>Parking</span>
              <strong>{m(ses.bills.parking.total)}</strong>
            </div>
            <div className={sp.note}>
              <span>{ses.bills.parking.lines.join(" · ")}</span>
            </div>
            {ses.bills.charging && (
              <>
                <div>
                  <span>Charging</span>
                  <strong>{m(ses.bills.charging.total)}</strong>
                </div>
                <div className={sp.note}>
                  <span>{`${fmt(ses.bills.charging.gridWh / 1000, 3)} kWh from the grid side (billed) · ${fmt(ses.bills.charging.vehicleWh / 1000, 3)} kWh into the battery`}</span>
                </div>
              </>
            )}
            <hr />
            <div>
              <span>Total</span>
              <strong>{m(ses.payment.amount)}</strong>
            </div>
            <div className={sp.note}>
              <span>{`${ses.payment.id} · ${ses.payment.provider} · ${ses.payment.status} · times in ${d.tz}`}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Operator workflow ─────────────────────────────────────────────────────

function readOperator() {
  const s = sim();
  if (!s) return null;
  const sessions = [...s.sessions.values()].filter((x) => !isTerminal(x.lc.state)).slice(-30).reverse();
  return {
    c: countBays(s),
    clock: siteClock(s),
    mode: s.inputs.operatingMode,
    sessions: sessions.map((x) => ({ id: x.id, vehicle: x.vehicleId, state: x.lc.state, bay: x.bayId, pending: x.needsOperator })),
    devices: [...s.devices.values()].map((d) => ({ id: d.id, label: d.label, online: d.online, stale: s.t > 30 && s.t - d.lastSeen > 3 * d.period + 5 })).filter((d) => !d.online || d.stale),
    deviceCount: s.devices.size,
    chargers: [...s.chargers.values()].map((c) => ({ bay: c.bayId, ...chargerView(c), session: c.session?.id ?? null })),
    anomalies: s.anomalies.map((a) => ({ id: a.id, kind: a.kind, text: a.text, method: a.method })),
    audit: s.audit.slice(-12).reverse().map((a) => ({ ...a, t: siteClock(s, a.t, true) })),
    env: { alarm: s.env.alarm, ack: s.env.acknowledged, T: s.env.temperature, fan: s.env.fanDuty },
    gates: { entry: s.gates.entry.barrier.angle, exit: s.gates.exit.barrier.angle, egress: s.gates.exit.barrier.egress },
    reservations: s.reservations.items.filter((r) => r.status === "booked" || r.status === "arrived").slice(-6).map((r) => ({ id: r.id, type: r.type, status: r.status, from: siteClock(s, r.start), to: siteClock(s, r.end) })),
    gateway: s.gatewayUp,
    buffered: s.cloudBuffer,
    ingest: s.ingest.counts,
    bays: s.layout.bays.map((b) => b.id),
  };
}

export function OperatorPanel() {
  const role = useTwin((s) => s.parkingRole);
  const d = useSampled(readOperator, 2);
  const [result, setResult] = useState<string | null>(null);
  const [bay, setBay] = useState("N02");
  if (!d) return <p className={sp.note}>Open Smart Parking to start the facility.</p>;
  const cmd = (action: CommandAction, target: string) => {
    const r = operatorCommand(facility(), action, target, role);
    setResult(`${action} → ${r.ok ? "accepted" : "rejected"}: ${r.reason}`);
  };
  return (
    <div className={lab.inspectorBody} data-panels>
      <section className={sp.block}>
        <p className={sp.head}>{`Facility · ${d.clock} · ${d.mode === "simulation" ? "simulation, every value SIMULATED" : d.mode}`}</p>
        <h3 className={sp.title}>{`${d.c.available} free · ${d.c.occupied + d.c.charging} occupied · ${d.c.charging} charging`}</h3>
        <BayGrid compact />
        <dl className={sp.kv}>
          <div>
            <dt>Gateway</dt>
            <dd>{d.gateway ? "up" : "DOWN — exits on local control"}<small>{`${d.buffered} messages buffered for the cloud`}</small></dd>
          </div>
          <div>
            <dt>Barriers</dt>
            <dd>{`entry ${fmt(d.gates.entry, 0)}° · exit ${fmt(d.gates.exit, 0)}°`}<small>{d.gates.egress ? "exit held open for safe egress" : "normal"}</small></dd>
          </div>
          <div>
            <dt>Environment</dt>
            <dd>{d.env.alarm === "none" ? `normal · ${fmt(d.env.T, 1)} °C` : `${d.env.alarm.toUpperCase()} ALARM`}<small>{`fans ${fmt(d.env.fan * 100, 0)} %${d.env.alarm !== "none" ? (d.env.ack ? " · acknowledged" : " · not acknowledged") : ""}`}</small></dd>
          </div>
          <div>
            <dt>Devices</dt>
            <dd>{`${d.deviceCount - d.devices.length} of ${d.deviceCount} reporting`}<small>{`${d.ingest.duplicate} duplicates dropped · ${d.ingest.stale} stale · ${d.ingest.invalid + d.ingest.badTag} invalid`}</small></dd>
          </div>
        </dl>
      </section>
      <section className={sp.block}>
        <p className={sp.head}>Authorised overrides</p>
        <Select label="Acting as" value={role} options={[{ id: "viewer", label: "Viewer (read-only)" }, { id: "operator", label: "Operator" }, { id: "supervisor", label: "Supervisor" }]} onChange={(v) => useTwin.setState({ parkingRole: v as typeof role })} />
        <div className={sp.row}>
          <button type="button" className={sp.ghost} onClick={() => cmd("barrier.open", "entry")}>Open entry</button>
          <button type="button" className={sp.ghost} onClick={() => cmd("barrier.close", "entry")}>Close entry</button>
          <button type="button" className={sp.ghost} onClick={() => cmd("barrier.open", "exit")}>Open exit</button>
          <button type="button" className={sp.ghost} onClick={() => cmd("alarm.acknowledge", "shelter")}>Acknowledge alarm</button>
        </div>
        <Select label="Bay" value={bay} options={d.bays.map((b) => ({ id: b, label: b }))} onChange={setBay} />
        <div className={sp.row}>
          <button type="button" className={sp.ghost} onClick={() => cmd("bay.block", bay)}>Set to maintenance</button>
          <button type="button" className={sp.ghost} onClick={() => cmd("bay.unblock", bay)}>Return to service</button>
          <button type="button" className={sp.ghost} onClick={() => cmd("charging.stop", bay)}>Stop charging safely</button>
          <button type="button" className={sp.ghost} onClick={() => cmd("bay.release", bay)}>Release (supervisor)</button>
        </div>
        {result && <p className={sp.text} role="status">{result}</p>}
        <p className={sp.note}>Every command carries a role and an expiry and is checked by the device controller; none bypasses a barrier interlock or the Station’s protection.</p>
      </section>
      <section className={sp.block}>
        <p className={sp.head}>{`Active sessions (${d.sessions.length})`}</p>
        <ul className={sp.list}>
          {d.sessions.map((x) => (
            <li key={x.id}>
              <button type="button" className={sp.mono} style={{ background: "none", border: 0, padding: 0, textAlign: "left", color: "inherit" }} onClick={() => useTwin.getState().select(`sp-veh:${x.vehicle}`)}>
                {`${x.id} · ${x.vehicle}${x.bay ? ` · ${x.bay}` : ""}`}
              </button>
              <span className={sp.status} data-tone={tone(x.state)}>{STATES[x.state].label}</span>
              {x.pending && (
                <small>
                  {`Decision needed (${x.pending}): `}
                  <button type="button" className={sp.ghost} onClick={() => cmd("session.approve", x.id)}>Approve</button>{" "}
                  <button type="button" className={sp.ghost} onClick={() => cmd("session.refuse", x.id)}>Refuse</button>
                </small>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className={sp.block}>
        <p className={sp.head}>Chargers</p>
        <ul className={sp.list}>
          {d.chargers.map((c) => (
            <li key={c.bay}>
              <span>{`${c.bay} · ${c.label}`}</span>
              <span className={sp.mono}>{c.session ? `${fmt(c.pBattery / 1000, 1)} kW · ${fmt(c.soc * 100, 0)} %` : "idle"}</span>
            </li>
          ))}
        </ul>
      </section>
      {d.reservations.length > 0 && (
        <section className={sp.block}>
          <p className={sp.head}>Reservations</p>
          <ul className={sp.list}>
            {d.reservations.map((r) => (
              <li key={r.id}>
                <span>{`${r.id} · ${r.type}`}</span>
                <span className={sp.mono}>{`${r.from}–${r.to} · ${r.status}`}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className={sp.block}>
        <p className={sp.head}>{`Device health · anomalies (${d.devices.length + d.anomalies.length})`}</p>
        <ul className={sp.list}>
          {d.devices.map((x) => (
            <li key={x.id}>
              <span>{x.label}</span>
              <span className={sp.status} data-tone="bad">{x.online ? "STALE" : "OFFLINE"}</span>
            </li>
          ))}
          {d.anomalies.map((a) => (
            <li key={a.id}>
              <span>{a.text}</span>
              <span className={sp.status} data-tone="warn">{a.method === "rule" ? "rule" : "robust stat."}</span>
              <small>{ANOMALY_INFO[a.kind as keyof typeof ANOMALY_INFO]}</small>
            </li>
          ))}
          {!d.devices.length && !d.anomalies.length && (
            <li>
              <span>No device problem and no anomaly.</span>
            </li>
          )}
        </ul>
      </section>
      <section className={sp.block}>
        <p className={sp.head}>Audit history</p>
        <ul className={sp.list}>
          {d.audit.map((a, i) => (
            <li key={i}>
              <span>{`${a.action} · ${a.target}`}</span>
              <span className={sp.status} data-tone={a.result === "accepted" ? "ok" : "bad"}>{a.result}</span>
              <small>{`${a.t} · ${a.actor} (${a.role}) · ${a.reason}`}</small>
            </li>
          ))}
          {!d.audit.length && (
            <li>
              <span>No command yet.</span>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

// ── Research ──────────────────────────────────────────────────────────────

type StudyId = "policies" | "capacity" | "fusion" | "recognition" | "iot" | "charging" | "energy" | "environment" | "pricing" | "forecast" | "scalability";

const STUDIES: { id: StudyId; title: string; method: string }[] = [
  { id: "policies", title: "Allocation policies against manual parking — one illustrative day", method: "One seeded event-level day (same allocation engine and vehicles), 10 h commuter day, 7 arrivals/h, wireless bays protected for the allocation-engine policies. A single run illustrates the mechanics only; for comparisons use the replicated comparison above, which gives every policy the same bays." },
  { id: "capacity", title: "Capacity and congestion: simulation against M/M/c/K", method: "400 h discrete-event runs per arrival rate, exponential and lognormal stays (CV 0.8), 12 bays, 4 waiting places, 2 h mean stay." },
  { id: "fusion", title: "Sensor fusion evaluation", method: "3 h Monte Carlo through the three sensor models, node debounce and each fusion strategy, with one faulty infrared sensor. Uncertain decisions are reported, never counted as right." },
  { id: "recognition", title: "Recognition thresholds (simulated recognition)", method: "4 000 synthetic arrivals per condition through the declared error model; share accepted automatically, wrongly accepted, and sent to RFID/QR/operator fallback." },
  { id: "iot", title: "IoT reliability", method: "600 s of 2 Hz occupancy messages through the broker at four link qualities; the gateway's ingestion counts what it accepts, drops and marks stale." },
  { id: "charging", title: "Wireless charging demand", method: "Event-level runs with 10–80 % of arrivals being compatible EVs that ask to charge; served share, wireless-bay utilisation and energy (11 kW surrogate, check SP-A09)." },
  { id: "energy", title: "Grid only, solar-assisted, storage-assisted", method: "One day at 1 min steps through the facility dispatch with a declared commuter charging profile (120 kWh/day)." },
  { id: "environment", title: "Environmental safety responses", method: "15 min of the shelter model with simulated smoke, simulated gas, and smoke with failed fans." },
  { id: "pricing", title: "Tariff variants (no behavioural prediction)", method: "Bills for 2 000 lognormal stays under each tariff; drivers' responses to price are not modelled." },
  { id: "forecast", title: "Demand forecast baselines", method: "28-day synthetic history of this facility; each baseline scored on the last 7 days with a rolling origin." },
  { id: "scalability", title: "Scalability (measured on this device)", method: "Allocation time, a day of event simulation and gateway ingestion for 12 to 1 000 bays. Timings depend on this computer." },
];

function runStudy(id: StudyId): { head: string[]; rows: (string | number)[][]; note?: string } {
  const pct = (x: number) => `${fmt(x * 100, 1)} %`;
  switch (id) {
    case "policies": {
      const r = comparePolicies();
      return { head: ["Policy", "Parked", "Util.", "Wait", "Gate→bay", "Walk", "Charging served", "Energy"], rows: r.map((x) => [x.policy === "manual" ? "Manual (baseline)" : POLICY_INFO[x.policy].name, x.parked, pct(x.utilisation), `${fmt(x.meanWait / 60, 1)} min`, `${fmt(x.meanSearch, 0)} s`, `${fmt(x.meanWalk, 0)} m`, `${x.chargingServed}/${x.chargingAsked}`, `${fmt(x.energyKWh, 0)} kWh`]), note: "Gate-to-bay time includes cruising in the manual baseline (declared search model). Differences are model outcomes, not field results." };
    }
    case "capacity": {
      const r = capacityStudy();
      return { head: ["Arrivals/h", "Offered (E)", "P_block M/M/c/K", "DES exp.", "DES lognormal", "Mean wait (DES exp.)"], rows: r.map((x) => [x.perHour, fmt(x.offered, 1), pct(x.analytic.blocking), pct(x.desExponential.blocking), pct(x.desLognormal.blocking), `${fmt(x.desExponential.meanWait / 60, 1)} min`]), note: "M/M/c/K assumes exponential stays; the lognormal column shows how far the analytical figure holds." };
    }
    case "fusion": {
      const r = evaluateFusion({ kind: "infrared", mode: "stuck-occupied" });
      return { head: ["Strategy", "Accuracy (decided)", "Uncertain", "False occupied", "False vacant"], rows: r.map((x) => [x.strategy, pct(x.accuracy), pct(x.uncertain), pct(x.falseOccupied), pct(x.falseVacant)]), note: "With a stuck sensor the conservative Bayesian rule reports uncertainty instead of guessing; the single-sensor baseline cannot notice the fault." };
    }
    case "recognition": {
      const r = recognitionStudy();
      return { head: ["Condition", "Threshold", "Auto-accepted", "Wrongly accepted", "Fallback"], rows: r.flatMap((c) => c.rows.map((x, i) => [i === 0 ? c.condition : "", x.threshold, pct(x.autoAccepted), pct(x.falseAccept), pct(x.fallback)])), note: "SIMULATED recognition: accuracies are assumptions until a labelled POC dataset is evaluated." };
    }
    case "iot": {
      const r = iotReliability();
      return { head: ["Loss", "Latency", "Accepted", "Duplicates dropped", "Out of order", "Stale", "p95 latency"], rows: r.map((x) => [pct(x.loss), `${fmt(x.latency * 1000, 0)} ms`, pct(x.deliveredShare), x.duplicatesSuppressed, x.outOfOrder, x.stale, `${fmt(x.p95Latency * 1000, 0)} ms`]) };
    }
    case "charging": {
      const r = chargingDemandSweep();
      return { head: ["Compatible EVs", "Asked", "Served", "Wireless-bay use", "Energy"], rows: r.map((x) => [pct(x.compatibleShare), x.chargingAsked, x.chargingServed, pct(x.wirelessUtilisation), `${fmt(x.energyKWh, 0)} kWh`]) };
    }
    case "energy": {
      const r = energyStudy();
      return { head: ["Mode", "Grid", "Solar used", "Curtailed", "Peak import", "Grid cost", "Balance"], rows: r.map((x) => [x.mode, `${fmt(x.gridKWh, 0)} kWh`, `${fmt(x.pvKWh, 0)} kWh`, `${fmt(x.curtailedKWh, 1)} kWh`, `${fmt(x.peakKW, 1)} kW`, money("IN", x.cost), x.maxResidual.toExponential(0)]) };
    }
    case "environment": {
      const r = environmentalStudy();
      return { head: ["Scenario", "Alarm after", "Peak", "Fans at alarm", "After 15 min"], rows: r.map((x) => [x.scenario, x.alarmAfter === null ? "—" : `${x.alarmAfter} s`, `${fmt(x.peak, 1)} ${x.unit}`, x.fanAtAlarm ? "100 %" : "failed", `${fmt(x.residual, 2)} ${x.unit}`]), note: "Simulated sources only; no smoke or gas is produced in any physical test." };
    }
    case "pricing": {
      const r = pricingStudy(sim()?.inputs.region ?? "IN");
      const region = sim()?.inputs.region ?? "IN";
      return { head: ["Tariff", "Mean parking bill", "Per bay-hour", "Capped", "30 kWh charge"], rows: r.map((x) => [x.tariff, money(region, x.meanBill), money(region, x.perBayHour), pct(x.capped), money(region, x.charging30kWh)]), note: "Same stays under every tariff: this compares bills, not customer behaviour." };
    }
    case "forecast": {
      const n = sim()?.bays.length ?? 12;
      const h = syntheticHistory(n, 28, sim()?.inputs.seed ?? 1);
      const occ = evaluateForecasts(h, n, 7, "occupancy");
      const chg = evaluateForecasts(h, n, 7, "charging");
      return { head: ["Baseline", "Occupancy MAE", "Occupancy RMSE", "MAE / bays", "Charging-start MAE"], rows: occ.map((x, i) => [x.method, fmt(x.mae, 2), fmt(x.rmse, 2), `${fmt(x.maePct, 1)} %`, fmt(chg[i].mae, 2)]), note: "Synthetic history; no machine-learning forecaster is claimed until real data exists." };
    }
    case "scalability": {
      const r = scalabilityStudy();
      return { head: ["Bays", "Allocation", "DES day", "Vehicles", "Messages", "Ingest rate"], rows: r.map((x) => [x.bays, `${fmt(x.allocationMs, 3)} ms`, `${fmt(x.desDayMs, 0)} ms`, x.desVehicles, x.messages, `${fmt(x.messagesPerSecond / 1000, 0)} k/s`]), note: "Measured in this browser, single thread. Not a claim of support for thousands of bays: the backend is not load-tested." };
    }
  }
}

/** Replicated, paired comparison of the research policies under one scenario (SP-RES-002), with 95 % confidence intervals and a JSON export. */
function ReplicatedComparison({ onResult }: { onResult: (r: ExperimentResult) => void }) {
  const [scenario, setScenario] = useState<ScenarioId>("normal");
  const [n, setN] = useState(30);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const run = () => {
    setBusy(true);
    window.setTimeout(() => {
      const r = runExperiment(scenario, n);
      setResult(r);
      onResult(r);
      setBusy(false);
    }, 30);
  };
  const rows: MetricKey[] = ["throughputPerHour", "meanSearchS", "meanWaitS", "requestFulfilment", "energyDeliveredKWh", "peakGridKW", "solarUtilisation", "fairness", "revenueChargingINR"];
  const pct = (k: MetricKey) => METRIC_INFO.find((m) => m.key === k)!.unit === "fraction";
  const cell = (k: MetricKey, x: { mean: number; ciLow: number; ciHigh: number }) => {
    if (!Number.isFinite(x.mean)) return "—";
    const f = (v: number) => (pct(k) ? `${(v * 100).toFixed(0)}` : k === "revenueChargingINR" ? v.toFixed(0) : k === "throughputPerHour" || k === "fairness" ? v.toFixed(2) : v.toFixed(1));
    return `${f(x.mean)} [${f(x.ciLow)}, ${f(x.ciHigh)}]`;
  };
  return (
    <div className={sp.block}>
      <h4 className={sp.title} style={{ fontSize: 14 }}>Replicated policy comparison</h4>
      <p className={sp.note}>Six policies on identical bays, chargers, PV and grid limit, with the same arrivals and vehicles for each (paired seeds). Means with 95 % confidence intervals (Student t). Simulated on synthetic demand: no real-world claim. Method and the full 50-seed results: SMART_PARKING_EXPERIMENT_RESULTS.md.</p>
      <div className={sp.row}>
        <Select label="Scenario" value={scenario} options={SCENARIOS.map((x) => ({ id: x.id, label: x.name }))} onChange={(v) => setScenario(v as ScenarioId)} />
        <Select label="Replications" value={String(n)} options={[10, 30, 50].map((x) => ({ id: String(x), label: `${x} seeds` }))} onChange={(v) => setN(Number(v))} />
      </div>
      <p className={sp.note}>{SCENARIOS.find((x) => x.id === scenario)!.text}</p>
      <div className={sp.row}>
        <button type="button" className={lab.researchBtn} onClick={run} disabled={busy}>
          <Play size={14} aria-hidden="true" /> {busy ? "Running…" : result ? "Run again" : "Run"}
        </button>
        {result && (
          <button type="button" className={lab.researchBtn} onClick={() => download(`smart-parking-${result.scenario.id}-${result.seeds.length}-seeds.json`, JSON.stringify(result, null, 1), "application/json")}>
            <Download size={14} aria-hidden="true" /> Download results
          </button>
        )}
      </div>
      {result && (
        <div className={sp.scroll}>
          <table className={sp.table}>
            <thead>
              <tr>
                <th scope="col">{`${result.scenario.name} · ${result.seeds.length} seeds`}</th>
                {result.policies.map((p) => (
                  <th key={p.policy} scope="col">{RESEARCH_POLICIES.find((x) => x.id === p.policy)!.name.replace(" (baseline)", "")}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((k) => {
                const m = METRIC_INFO.find((x) => x.key === k)!;
                return (
                  <tr key={k}>
                    <th scope="row">{`${m.name} (${pct(k) ? "%" : m.unit})`}</th>
                    {result.policies.map((p) => (
                      <td key={p.policy}>{cell(k, p.metrics[k])}</td>
                    ))}
                  </tr>
                );
              })}
              {result.policies[0].recovery && (
                <tr>
                  <th scope="row">Extra queued vehicle-minutes from the fault</th>
                  {result.policies.map((p) => (
                    <td key={p.policy}>{cell("meanWaitS", p.recovery!.extraQueueVehMin)}</td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ParkingResearch() {
  const [results, setResults] = useState<Partial<Record<StudyId, ReturnType<typeof runStudy>>>>({});
  const [busy, setBusy] = useState<StudyId | null>(null);
  const [cls, setCls] = useState<RequirementClass | "all">("Original functional requirement");
  const [replay, setReplay] = useState<ReturnType<typeof replayRecording> | null>(null);
  const [recording, setRecording] = useState(false);
  const [replicated, setReplicated] = useState<Partial<Record<ScenarioId, ExperimentResult>>>({});
  const run = (id: StudyId) => {
    setBusy(id);
    window.setTimeout(() => {
      setResults((r) => ({ ...r, [id]: runStudy(id) }));
      setBusy(null);
    }, 30);
  };
  const exportAll = () => download(`smart-parking-studies-${Date.now()}.json`, JSON.stringify({ format: "evengineer.parking.studies/1", dataMode: "SIMULATED", seedNote: "All studies are seeded and reproducible.", results, replicated }, null, 2), "application/json");
  const toggleRecording = () => {
    const s = facility();
    if (s.recording) {
      download(`smart-parking-recording-${Date.now()}.json`, JSON.stringify(s.recording), "application/json");
      s.recording = null;
      setRecording(false);
    } else {
      s.recording = { format: "evengineer.parking.recording/1", siteId: s.inputs.siteId, startedAt: s.inputs.epochMs + s.t * 1000, messages: [] };
      setRecording(true);
    }
  };
  const importRecording = (file: File) => {
    void file.text().then((text) => {
      try {
        const rec = JSON.parse(text) as RecordedSession;
        if (rec.format !== "evengineer.parking.recording/1") throw new Error("format");
        setReplay(replayRecording(rec));
      } catch {
        setReplay(null);
      }
    });
  };
  const reqs = REQUIREMENTS.filter((r) => cls === "all" || r.cls === cls);
  return (
    <>
      <section className={lab.researchBlock}>
        <p className={lab.legendEyebrow}>Smart Parking studies · reproducible, seeded</p>
        <ReplicatedComparison onResult={(r) => setReplicated((x) => ({ ...x, [r.scenario.id]: r }))} />
        {STUDIES.map((s) => (
          <div key={s.id} className={sp.block}>
            <h4 className={sp.title} style={{ fontSize: 14 }}>{s.title}</h4>
            <p className={sp.note}>{s.method}</p>
            <button type="button" className={lab.researchBtn} onClick={() => run(s.id)} disabled={busy !== null}>
              <Play size={14} aria-hidden="true" /> {busy === s.id ? "Running…" : results[s.id] ? "Run again" : "Run"}
            </button>
            {results[s.id] && (
              <div className={sp.scroll}>
                <table className={sp.table}>
                  <thead>
                    <tr>
                      {results[s.id]!.head.map((h) => (
                        <th key={h} scope="col">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results[s.id]!.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results[s.id]!.note && <p className={sp.note}>{results[s.id]!.note}</p>}
              </div>
            )}
          </div>
        ))}
        <button type="button" className={sp.ghost} onClick={exportAll} disabled={!Object.keys(results).length}>
          <Download size={13} aria-hidden="true" /> Export results (JSON)
        </button>
      </section>
      <section className={lab.researchBlock}>
        <p className={lab.legendEyebrow}>Recorded mode</p>
        <p className={sp.note}>Record the telemetry the gateway receives, then replay a recording through the same ingestion and fusion. Replayed values are RECORDED and never drive an actuator. Hardware modes stay blocked until a device is connected.</p>
        <div className={sp.row}>
          <button type="button" className={sp.ghost} onClick={toggleRecording}>
            {recording ? <Download size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />} {recording ? "Stop and download the recording" : "Start recording"}
          </button>
          <label className={sp.ghost}>
            <Upload size={13} aria-hidden="true" /> Replay a recording
            <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && importRecording(e.target.files[0])} />
          </label>
        </div>
        {replay && (
          <div className={sp.scroll}>
            <p className={sp.note}>{`${replay.messages} messages · ${replay.accepted} accepted · ${replay.rejected} rejected (duplicate or out of order)`}</p>
            <table className={sp.table}>
              <thead>
                <tr>
                  <th scope="col">Bay</th>
                  <th scope="col">Decision</th>
                  <th scope="col">p</th>
                  <th scope="col">Changes</th>
                  <th scope="col">Mode</th>
                </tr>
              </thead>
              <tbody>
                {replay.bays.map((b) => (
                  <tr key={b.bayId}>
                    <th scope="row">{b.bayId}</th>
                    <td>{b.decision}</td>
                    <td>{fmt(b.p, 3)}</td>
                    <td>{b.changes}</td>
                    <td>{b.mode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className={lab.researchBlock}>
        <p className={lab.legendEyebrow}>Three timelines (kept separate)</p>
        <details>
          <summary className={sp.text}>Software development · Phases 4A–4I</summary>
          <ul className={sp.checks}>
            {SOFTWARE_PHASES.map((m) => (
              <li key={m.id} data-ok={m.status === "Tested" || m.status === "Implemented" ? "true" : "wait"}>
                <span>
                  <strong>{`${m.period} · ${m.title}`}</strong> — {`${m.status}. Verified by: ${m.verification}. Evidence: ${m.evidence}.`}
                </span>
              </li>
            ))}
          </ul>
        </details>
        <details>
          <summary className={sp.text}>24-month physical research programme</summary>
          <ul className={sp.checks}>
            {PHYSICAL_PROGRAMME.map((m) => (
              <li key={m.id} data-ok="wait">
                <span>
                  <strong>{`${m.period} · ${m.title}`}</strong> — {`${m.deliverables.join("; ")}. Verified by: ${m.verification}. ${m.status}.`}
                </span>
              </li>
            ))}
          </ul>
        </details>
        <p className={sp.note}>The eight-month practical workshop is unchanged (Practical Workshop section). None of the three replaces another.</p>
      </section>
      <section className={lab.researchBlock}>
        <p className={lab.legendEyebrow}>{`Requirements traceability · ${REQUIREMENTS.length} requirements`}</p>
        <Select label="Class" value={cls} options={[{ id: "all", label: "All" }, ...(["Original functional requirement", "EV.ENGINEER™ engineering enhancement", "International scalability extension", "Physical POC requirement", "Future commercial deployment requirement"] as RequirementClass[]).map((c) => ({ id: c, label: c }))]} onChange={(v) => setCls(v as typeof cls)} />
        <div className={sp.scroll}>
          <table className={sp.table}>
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Requirement</th>
                <th scope="col">Status</th>
                <th scope="col">Tests</th>
                <th scope="col">Physical</th>
              </tr>
            </thead>
            <tbody>
              {reqs.map((r) => (
                <tr key={r.id}>
                  <th scope="row">{r.id}</th>
                  <td style={{ textAlign: "left" }} title={`${r.subsystem} · ${r.models.join(", ") || "no model"} · ${r.evidence}`}>{r.text}</td>
                  <td>{r.status}</td>
                  <td>{r.tests.join(" ") || "—"}</td>
                  <td>{r.physical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={sp.note}>Nothing physical has been built: every physical status is “Not started” or “Planned”, and nothing is experimentally validated.</p>
      </section>
    </>
  );
}

// ── Learn mode ────────────────────────────────────────────────────────────

const TOPICS = ["Sensors", "Recognition", "Allocation", "Queueing", "IoT", "Energy", "Wireless charging"] as const;

export function ParkingLearn() {
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>("Sensors");
  const [lam, setLam] = useState(6);
  const [stay, setStay] = useState(2);
  const read = useCallback(() => {
    const s = sim();
    if (!s) return null;
    const f = focusSession(s);
    const b = f?.bayId ? s.bays.find((x) => x.bay.id === f.bayId) : s.bays.find((x) => x.status !== "available");
    return { p: b?.fusion.p ?? 0.5, bay: b?.bay.id ?? "—", conf: f?.recognition?.confidence ?? null, policy: POLICY_INFO[s.inputs.policy].name, msgs: s.ingest.counts.accepted, dup: s.ingest.counts.duplicate, pv: s.lastEnergy?.pvUsed ?? 0, grid: s.lastEnergy?.grid ?? 0, chg: s.lastEnergy?.served.charging ?? 0, bays: s.bays.length, region: s.inputs.region };
  }, []);
  const d = useSampled(read, 2);
  const blocking = useMemo(() => erlangB(d?.bays ?? 12, lam * stay), [d?.bays, lam, stay]);
  return (
    <div>
      <p className={lab.eyebrow}>Learn · Smart Parking</p>
      <div className={lab.levels} role="tablist" aria-label="Topic">
        {TOPICS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={topic === t} onClick={() => setTopic(t)}>
            {t}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={topic} className={sp.block} style={{ marginTop: 12 }}>
        {topic === "Sensors" && (
          <>
            <p className={sp.text}>Three different detectors look at each bay: an ultrasonic ranger times the echo from the car’s roof (d = c·t/2), an infrared sensor measures reflected light, and a camera classifies the bay. Each is wrong sometimes, in its own way. Adding their log-likelihood ratios gives a probability; when they disagree the bay is shown as uncertain.</p>
            <p className={sp.note}>{d ? `Now: bay ${d.bay} at p = ${fmt(d.p, 3)}.` : ""}</p>
          </>
        )}
        {topic === "Recognition" && (
          <>
            <p className={sp.text}>A camera frame goes through detection, plate localisation, character recognition, a regional format check and a confidence estimate on the edge computer. A wrong read can look confident, so the threshold is high and anything below it needs a tag, a code or a person.</p>
            <p className={sp.note}>{d?.conf !== null && d?.conf !== undefined ? `Last read: confidence ${fmt(d.conf, 2)} (simulated).` : "Simulated recognition: no image is processed here."}</p>
          </>
        )}
        {topic === "Allocation" && <p className={sp.text}>{`Rules first, preferences second. A bay that does not fit, is reserved for someone else, needs a permit or has a charger the vehicle cannot use is never a candidate. Among the rest the policy chooses; now: ${d?.policy ?? "—"}.`}</p>}
        {topic === "Queueing" && (
          <>
            <p className={sp.text}>{`With ${d?.bays ?? 12} bays, ${lam} arrivals an hour and ${stay} h stays, the offered load is ${fmt(lam * stay, 1)} Erlang: Erlang B says ${fmt(blocking * 100, 1)} % of drivers would find it full.`}</p>
            <Slider label="Arrivals" value={lam} min={1} max={20} step={0.5} unit="/h" onChange={setLam} />
            <Slider label="Mean stay" value={stay} min={0.5} max={6} step={0.25} unit="h" onChange={setStay} />
          </>
        )}
        {topic === "IoT" && <p className={sp.text}>{`Each node publishes on its own MQTT topic with an identity, a sequence number and a timestamp. The gateway keeps the first copy of each event, ignores anything older than what it already has, and marks old data STALE. So far: ${d?.msgs ?? 0} messages accepted, ${d?.dup ?? 0} duplicates dropped.`}</p>}
        {topic === "Energy" && <p className={sp.text}>{`Safety and electronics first, then lighting and fans, then charging. Solar comes first, then storage above its reserve, then the grid up to its limit. Now: solar ${fmt((d?.pv ?? 0) / 1000, 1)} kW, grid ${fmt((d?.grid ?? 0) / 1000, 1)} kW, chargers ${fmt((d?.chg ?? 0) / 1000, 1)} kW.`}</p>}
        {topic === "Wireless charging" && (
          <>
            <p className={sp.text}>Not every EV can charge wirelessly, and parking alone is not enough: the receiver must be over the pad within tolerance. The parking session then hands the vehicle to the bay’s own charging station, which runs its own checks — the same physics as Environment 02.</p>
            <ExploreChargingButton />
          </>
        )}
      </div>
      <div className={lab.actions}>
        <button type="button" onClick={() => useTwin.setState({ section: "physics", lesson: "smart-parking", selected: null, panel: "none" })}>
          Open the Physics & Mathematics lesson
        </button>
      </div>
    </div>
  );
}

// ── Legends and scene labels ──────────────────────────────────────────────

export function ParkingLegend() {
  const view = useTwin((s) => s.view);
  const read = useCallback(() => {
    const s = sim();
    const e = s?.lastEnergy;
    return s ? { e: e ? { pv: e.pvUsed, grid: e.grid, bess: e.bessDischarge - e.bessCharge, chg: e.served.charging, loads: e.served.essential + e.served.comfort } : null, T: s.env.temperature, co: s.env.co, smoke: s.env.smoke, alarm: s.env.alarm, recent: s.recent.slice(-6).reverse().map((r) => ({ n: r.n, device: r.device, topic: r.topic.split("/").slice(-2).join("/"), verdict: r.verdict, mode: r.mode })) } : null;
  }, []);
  const d = useSampled(read, 3);
  if (!d) return null;
  if (view === "occupancy" || view === "top")
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Bay state · fused from three sensors</p>
        <BayLegend />
        <p className={ui.small}>Labels show the posterior p. Uncertain bays are not offered.</p>
      </div>
    );
  if (view === "energy" && d.e)
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Energy flows · dispatch model</p>
        <ul className={ui.flowKey}>
          <li><i style={{ background: "#f5b041" }} />{`Solar ${kw(d.e.pv)} kW`}</li>
          <li><i style={{ background: "#c9d4e0" }} />{`Grid ${kw(d.e.grid)} kW`}</li>
          <li><i style={{ background: "#39c5cf" }} />{Math.abs(d.e.bess) < 50 ? "Storage idle" : `Storage ${d.e.bess > 0 ? "out" : "in"} ${kw(Math.abs(d.e.bess))} kW`}</li>
          <li><i style={{ background: "#5ad1ff" }} />{`Chargers ${kw(d.e.chg)} kW`}</li>
          <li><i style={{ background: "#e9ecef" }} />{`Other loads ${kw(d.e.loads, 2)} kW`}</li>
        </ul>
      </div>
    );
  if (view === "environment")
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Shelter air · one lumped node · local safety controller</p>
        <p className={ui.small}>{`${d.T.toFixed(1)} °C · CO ${d.co.toFixed(1)} ppm · smoke ${d.smoke.toFixed(1)} %/m (simulated)${d.alarm !== "none" ? ` · ${d.alarm.toUpperCase()} ALARM` : ""}`}</p>
      </div>
    );
  if (view === "iot")
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Messages at the gateway · pulses slowed to be visible</p>
        <ul className={sp.list} style={{ maxHeight: 170 }}>
          {d.recent.map((r) => (
            <li key={r.n}>
              <span className={sp.mono}>{`${r.device} → ${r.topic}`}</span>
              <span className={sp.status} data-tone={r.verdict === "accepted" ? "ok" : "warn"}>{`${r.verdict} · ${r.mode}`}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  if (view === "shelter")
    return (
      <div className={`${ui.legend} ${lab.legend}`}>
        <p className={ui.legendTitle}>Shelter engineering · representative dimensions</p>
        <p className={ui.small}>Roof opened to show the structure, the cable tray and the sensor mounts. No structural certification or weather resistance is claimed.</p>
      </div>
    );
  return null;
}

/** DOM labels anchored by the scene (Smart Parking views). */
export function ParkingSceneLabels() {
  const view = useTwin((s) => s.view);
  const read = useCallback(() => {
    const s = sim();
    if (!s) return null;
    const e = s.lastEnergy;
    return {
      bays: s.bays.map((b) => ({ id: b.bay.id, p: b.fusion.p, status: b.status })),
      layout: { w: s.layout.inputs.bayWidth, d: s.layout.inputs.bayDepth, aisle: s.layout.inputs.aisleWidth },
      e: e ? { pv: e.pvUsed, grid: e.grid, bess: e.bessDischarge - e.bessCharge, chargers: e.served.charging, loads: e.served.essential + e.served.comfort } : null,
      env: { T: s.env.temperature, co: s.env.co, smoke: s.env.smoke, fan: s.env.fanDuty },
      chargers: [...s.chargers.values()].map((c) => ({ id: c.bayId, on: !!c.session, label: chargerView(c).label, kw: chargerView(c).pBattery / 1000 })),
      plate: (() => {
        const f = focusSession(s);
        if (!f?.recognition || !["identifying", "id-uncertain", "unknown-vehicle", "camera-fault", "identified", "authorizing", "authorized", "allocating", "reserved", "entry-permitted", "barrier-opening"].includes(f.lc.state)) return null;
        return { read: f.recognition.read, confidence: f.recognition.confidence, trusted: f.recognition.outcome === "recognised" };
      })(),
    };
  }, []);
  const d = useSampled(read, 3);
  // On a phone the stage card covers much of the scene: the legend carries these values instead of labels.
  if (!d || (typeof window !== "undefined" && window.innerWidth < 720)) return null;
  if (view === "occupancy" || view === "top")
    return (
      <>
        {d.bays.map((b) => (
          <span key={b.id} ref={labelRef(`occ-${b.id}`)} className={ui.sceneLabel} style={{ display: "grid", justifyItems: "center", gap: 1, padding: "3px 6px", lineHeight: 1.15 }}>
            <span>{`${GLYPH[b.status].g} ${b.id}`}</span>
            <small style={{ fontSize: 10, opacity: 0.8 }}>{prob(b.p)}</small>
          </span>
        ))}
      </>
    );
  if (view === "shelter")
    return (
      <>
        <span ref={labelRef("dim-bay")} className={ui.sceneLabel}>{`Bay ${fmt(d.layout.w, 2)} × ${fmt(d.layout.d, 2)} m`}</span>
        <span ref={labelRef("dim-aisle")} className={ui.sceneLabel}>{`One-way aisle ${fmt(d.layout.aisle, 1)} m`}</span>
        <span ref={labelRef("dim-sensor")} className={ui.sceneLabel}>Ultrasonic sensor · 2.9 m</span>
        <span ref={labelRef("dim-front")} className={ui.sceneLabel}>Front edge 3.6 m clear</span>
        <span ref={labelRef("dim-roof")} className={ui.sceneLabel}>Roof falls 5° to the rear</span>
        <span ref={labelRef("dim-gutter")} className={ui.sceneLabel}>Box gutter · downpipes in the columns</span>
        <span ref={labelRef("dim-tray")} className={ui.sceneLabel}>Cable tray to the equipment yard</span>
      </>
    );
  if (view === "energy" && d.e)
    return (
      <>
        <span ref={labelRef("flow-pv")} className={ui.sceneLabel}>{`Solar · ${kw(d.e.pv)} kW`}</span>
        <span ref={labelRef("flow-grid")} className={ui.sceneLabel}>{`Grid · ${kw(d.e.grid)} kW`}</span>
        <span ref={labelRef("flow-bess")} className={ui.sceneLabel}>{Math.abs(d.e.bess) < 50 ? "Storage · idle" : `Storage · ${kw(Math.abs(d.e.bess))} kW ${d.e.bess > 0 ? "out" : "in"}`}</span>
        <span ref={labelRef("flow-chargers")} className={ui.sceneLabel}>{`Wireless chargers · ${kw(d.e.chargers)} kW`}</span>
        <span ref={labelRef("flow-loads")} className={ui.sceneLabel}>{`Lighting, fans, electronics · ${kw(d.e.loads, 2)} kW`}</span>
      </>
    );
  if (view === "environment")
    return (
      <>
        <span ref={labelRef("env-north")} className={ui.sceneLabel}>{`Air ${d.env.T.toFixed(1)} °C · CO ${d.env.co.toFixed(0)} ppm`}</span>
        <span ref={labelRef("env-south")} className={ui.sceneLabel}>{`Smoke ${d.env.smoke.toFixed(1)} %/m (simulated)`}</span>
        <span ref={labelRef("env-fan")} className={ui.sceneLabel}>{`Fans ${fmt(d.env.fan * 100, 0)} %`}</span>
      </>
    );
  if (view === "iot")
    return (
      <>
        {[["EDGE-01", "Edge gateway · local MQTT broker"], ["ANPR-IN", "Recognition camera"], ["CAM-N", "Row camera (north)"], ["ENV-N", "Environmental node"], ["US-N03", "Ultrasonic node · bay N03"]].map(([id, name]) => (
          <span key={id} ref={labelRef(`iot-${id}`)} className={ui.sceneLabel}>
            {name}
          </span>
        ))}
      </>
    );
  if (view === "cinematic" && d.plate)
    return (
      <span ref={labelRef("plate-read")} className={ui.sceneLabel}>
        {`OCR read “${d.plate.read ?? "—"}” · confidence ${d.plate.confidence.toFixed(2)} · ${d.plate.trusted ? "accepted" : "not trusted on its own"} (simulated)`}
      </span>
    );
  if (view === "xray")
    return (
      <>
        {d.chargers.filter((c) => c.on).map((c) => (
          <span key={c.id} ref={labelRef(`wpt-${c.id}`)} className={ui.sceneLabel}>
            {`${c.id} · ${c.label} · ${fmt(c.kw, 1)} kW`}
          </span>
        ))}
      </>
    );
  return null;
}

export { BatteryCharging };
