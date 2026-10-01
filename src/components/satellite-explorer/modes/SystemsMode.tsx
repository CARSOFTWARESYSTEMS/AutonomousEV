import Link from "next/link";
import { ArrowRight, Camera, Magnet, RotateCw, ScanSearch } from "lucide-react";
import type { SubsystemId } from "../types";
import { PRODUCT, SATELLITE_REFERENCE, SUBSYSTEMS } from "../data/satelliteReference";
import { COMMS_REFERENCE } from "../simulation/communications";
import { swathKm } from "../simulation/payload";
import { type PowerScenario, useExplorerStore } from "../state/explorerStore";
import { Chain } from "../ui/StatusCaption";
import SystemSelector from "../ui/SystemSelector";
import { POWER_STATE_LABEL, attitudeLabel, formatPercent, formatRpm, formatWatts, linkLabel } from "../ui/liveValues";
import { PAYLOAD_PHASE_LABEL } from "../simulation/payload";
import ui from "../explorer.module.css";

function Row({ label, value, simulated = false }: { label: string; value: string; simulated?: boolean }) {
  return (
    <div className={ui.valueRow}>
      <dt>{label}</dt>
      <dd>
        {value}
        {simulated && (
          <span className={ui.simulated} title="Simulated value">
            SIM
          </span>
        )}
      </dd>
    </div>
  );
}

const SCENARIOS: { id: PowerScenario; label: string }[] = [
  { id: "auto", label: "ORBIT" },
  { id: "sunlight", label: "SUNLIGHT" },
  { id: "eclipse", label: "ECLIPSE" },
];

function PowerPanel() {
  const t = useExplorerStore((s) => s.telemetry);
  const scenario = useExplorerStore((s) => s.powerScenario);
  const xray = useExplorerStore((s) => s.xrayEnabled);
  const setScenario = useExplorerStore((s) => s.setPowerScenario);
  const toggleXray = useExplorerStore((s) => s.toggleXray);
  return (
    <>
      <p className={ui.stateLine} data-state={t.sunlit ? "sunlight" : "eclipse"}>
        {t.sunlit ? "SUNLIGHT" : "ECLIPSE"}
        <span>{t.sunlit ? "Arrays generating" : "Battery supplies the loads"}</span>
      </p>
      <dl className={ui.values}>
        <Row label="Generated" value={formatWatts(t.generationW)} simulated />
        <Row label="Load" value={formatWatts(t.loadW)} simulated />
        <Row label="Battery" value={formatPercent(t.batterySoc)} simulated />
        <Row label="State" value={POWER_STATE_LABEL[t.batteryState]} simulated />
      </dl>
      <div className={ui.segmented} role="group" aria-label="Power scenario">
        {SCENARIOS.map((s) => (
          <button key={s.id} type="button" className={ui.segment} aria-pressed={scenario === s.id} onClick={() => setScenario(s.id)}>
            {s.label}
          </button>
        ))}
      </div>
      <div className={ui.panelActions}>
        <button type="button" className={ui.action} aria-pressed={xray} onClick={toggleXray}>
          <ScanSearch size={14} aria-hidden="true" /> POWER BUS
        </button>
      </div>
      {xray && <p className={ui.panelHint}>Power reaches five loads. Select a load label to see what it draws.</p>}
      <Link href={PRODUCT.cubeTwinRoute} className={ui.crossLink} data-track-event="cubesat_crosslink" data-track-source="explorer_power">
        RUN ENERGY SIMULATION IN CUBETWIN <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </>
  );
}

const SLEW_AXES = ["X", "Y", "Z"] as const;

function AdcsPanel() {
  const t = useExplorerStore((s) => s.telemetry);
  const magnetorquer = useExplorerStore((s) => s.showMagnetorquer);
  const startSlew = useExplorerStore((s) => s.startSlewDemo);
  const setMagnetorquer = useExplorerStore((s) => s.setShowMagnetorquer);
  return (
    <>
      <dl className={ui.values}>
        <Row label="Attitude" value={attitudeLabel(t.attitudeMode)} simulated />
        <Row label="Wheel X" value={formatRpm(t.wheelRpm[0])} simulated />
        <Row label="Wheel Y" value={formatRpm(t.wheelRpm[1])} simulated />
        <Row label="Wheel Z" value={formatRpm(t.wheelRpm[2])} simulated />
      </dl>
      <p className={ui.panelLabel}>TURN THE SPACECRAFT</p>
      <div className={ui.panelActions}>
        {SLEW_AXES.map((axis) => (
          <button key={axis} type="button" className={ui.action} onClick={() => startSlew(axis)} aria-label={`Slew about body ${axis}`}>
            <RotateCw size={14} aria-hidden="true" /> SLEW {axis}
          </button>
        ))}
      </div>
      <p className={ui.panelHint}>The wheel spins one way; the spacecraft turns the other. Wheel response is amplified for clarity.</p>
      <div className={ui.panelActions}>
        <button type="button" className={ui.action} aria-pressed={magnetorquer} onClick={() => setMagnetorquer(!magnetorquer)}>
          <Magnet size={14} aria-hidden="true" /> MAGNETORQUER
        </button>
      </div>
      {magnetorquer && <p className={ui.panelHint}>A commanded dipole m in Earth&apos;s field B produces torque τ = m × B, used to unload the wheels.</p>}
    </>
  );
}

function PayloadPanel() {
  const t = useExplorerStore((s) => s.telemetry);
  const capture = useExplorerStore((s) => s.startCaptureDemo);
  const busy = t.payloadPhase !== "IDLE" && t.payloadPhase !== "STORED";
  return (
    <>
      <dl className={ui.values}>
        <Row label="State" value={PAYLOAD_PHASE_LABEL[t.payloadPhase]} simulated />
        <Row label="Swath" value={`≈ ${Math.round(swathKm())} km`} />
        <Row label="Stored" value={`${Math.round(t.storageMb)} MB`} simulated />
      </dl>
      <div className={ui.panelActions}>
        <button type="button" className={ui.action} onClick={capture} disabled={busy}>
          <Camera size={14} aria-hidden="true" /> CAPTURE
        </button>
      </div>
      <p className={ui.panelHint}>The cone is the payload&apos;s field of view; the ring is the ground it images.</p>
    </>
  );
}

function CommsPanel() {
  const t = useExplorerStore((s) => s.telemetry);
  const setMode = useExplorerStore((s) => s.setMode);
  const { sband, xband } = COMMS_REFERENCE;
  return (
    <>
      <ul className={ui.links}>
        <li>
          <span className={`${ui.linkGlyph} ${ui.linkGlyphSparse}`} aria-hidden="true" />
          <div>
            <p className={ui.linkTitle}>
              {sband.role} · {sband.name}
            </p>
            <p className={ui.linkBody}>Telemetry · Tracking · Command</p>
          </div>
        </li>
        <li>
          <span className={`${ui.linkGlyph} ${ui.linkGlyphDense}`} aria-hidden="true" />
          <div>
            <p className={ui.linkTitle}>PAYLOAD DATA · {xband.name}</p>
            <p className={ui.linkBody}>Imagery / mission data</p>
          </div>
        </li>
      </ul>
      <dl className={ui.values}>
        <Row label="Link" value={linkLabel(t.link)} simulated />
        <Row label="Elevation" value={`${Math.round(t.elevationDeg)}°`} simulated />
      </dl>
      <div className={ui.panelActions}>
        <button type="button" className={ui.action} data-track-event="signal_view_open" data-track-source="systems_comms" onClick={() => setMode("signals")}>
          FOLLOW THE SIGNALS <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

function ThermalPanel() {
  const sunlit = useExplorerStore((s) => s.telemetry.sunlit);
  return (
    <>
      <ul className={ui.legend} aria-label="Thermal legend">
        <li>
          <span className={ui.swatch} data-thermal="cool" aria-hidden="true" /> COOL
        </li>
        <li>
          <span className={ui.swatch} data-thermal="nominal" aria-hidden="true" /> NOMINAL
        </li>
        <li>
          <span className={ui.swatch} data-thermal="warm" aria-hidden="true" /> WARM
        </li>
      </ul>
      <dl className={ui.values}>
        <Row label="Light" value={sunlit ? "Sunlight" : "Eclipse"} simulated />
      </dl>
      <p className={ui.panelHint}>Illustrative overlay of warm and cool zones — not a thermal simulation, and no temperatures are implied.</p>
    </>
  );
}

function AvionicsPanel() {
  const t = useExplorerStore((s) => s.telemetry);
  const xray = useExplorerStore((s) => s.xrayEnabled);
  const toggleXray = useExplorerStore((s) => s.toggleXray);
  return (
    <>
      <dl className={ui.values}>
        <Row label="Mode" value={t.spacecraftMode} simulated />
        <Row label="Bus" value="REFERENCE DATA BUS" />
        <Row label="Stored" value={`${Math.round(t.storageMb)} MB`} simulated />
      </dl>
      <div className={ui.panelActions}>
        <button type="button" className={ui.action} aria-pressed={xray} onClick={toggleXray}>
          <ScanSearch size={14} aria-hidden="true" /> X-RAY
        </button>
      </div>
      <p className={ui.panelHint}>Pulses show data moving between units and the flight computer. No specific bus standard is implied.</p>
    </>
  );
}

function StructurePanel() {
  const [w, l, d] = SATELLITE_REFERENCE.envelopeMm;
  return (
    <>
      <dl className={ui.values}>
        <Row label="Form factor" value={SATELLITE_REFERENCE.formFactor} />
        <Row label="Envelope" value={`${Math.round(w)} × ${l} × ${d} mm`} />
        <Row label="Rails" value="4, full length" />
      </dl>
      <p className={ui.panelHint}>Launch loads enter through the rails and are carried by the frame and decks to every unit.</p>
    </>
  );
}

const PANELS: Record<SubsystemId, () => React.JSX.Element> = {
  power: PowerPanel,
  adcs: AdcsPanel,
  payload: PayloadPanel,
  communications: CommsPanel,
  thermal: ThermalPanel,
  avionics: AvionicsPanel,
  structure: StructurePanel,
};

/** Right-hand panel for the selected system: what it does, its chain, live values and controls. */
export function SystemPanel() {
  const subsystem = useExplorerStore((s) => s.subsystem);
  const system = SUBSYSTEMS[subsystem];
  const Body = PANELS[subsystem];
  return (
    <aside id="system-panel" role="tabpanel" aria-labelledby={`system-tab-${subsystem}`} className={ui.panel} data-testid="system-panel" style={{ "--accent": system.accent } as React.CSSProperties}>
      <p className={ui.panelEyebrow}>
        <span className={ui.accentDot} aria-hidden="true" />
        {SATELLITE_REFERENCE.provenance.visualization}
      </p>
      <h2 className={ui.panelTitle}>{system.name.toUpperCase()}</h2>
      <p className={ui.panelText}>{system.purpose}</p>
      <Chain nodes={system.flow} />
      <Body />
    </aside>
  );
}

/** Systems controls: the sub-tabs. */
export default function SystemsMode() {
  return (
    <div className={ui.controlStrip} data-testid="systems-controls">
      <SystemSelector />
    </div>
  );
}
