// HEALTH: the main product mode. The aircraft as a living health
// architecture — vehicle state, the seven systems, and a drill-down from
// system to assembly to component to sensor. Two further views: the sensor
// network by category, and the six layers of HUMS.
import { ArrowLeft } from "lucide-react";
import type { ComponentId, HealthView, MonitoredSystemId } from "../types";
import { COMPONENTS, componentsOf } from "../data/componentDefinitions";
import { HEALTH_HIERARCHY, HUMS_LAYERS } from "../data/healthDefinitions";
import { SENSOR_CATEGORIES, sensorsOfCategory } from "../data/sensorDefinitions";
import { HEALTH_TABLE_LABEL, MONITORED_SYSTEMS, PROVENANCE, SYSTEMS } from "../data/uflightReferenceAircraft";
import { componentHealth, humsLabel } from "../simulation/hums";
import { useUFlightStore } from "../state/uflightStore";
import { Chain, StateBadge, VehicleBadge } from "../ui/common";
import ui from "../uflight.module.css";

const VIEWS: readonly { id: HealthView; label: string }[] = [
  { id: "overview", label: "OVERVIEW" },
  { id: "sensors", label: "SENSORS" },
  { id: "hums", label: "HUMS" },
];

/** Vehicle state and the seven monitored systems. Selecting a system drills into it. */
export function HealthSummary() {
  const twin = useUFlightStore((s) => s.digitalTwinState);
  const selectedSystem = useUFlightStore((s) => s.selectedSystem);
  const healthView = useUFlightStore((s) => s.healthView);
  const selectSystem = useUFlightStore((s) => s.selectSystem);
  const setHealthView = useUFlightStore((s) => s.setHealthView);
  const alert = twin.hums !== "MONITORING" && twin.hums !== "BACKGROUND_MONITORING";

  return (
    <section className={ui.panel} aria-labelledby="health-title" data-testid="health-summary">
      <p className={ui.panelEyebrow}>VEHICLE HEALTH</p>
      <h2 id="health-title" className={ui.panelTitle}>
        WHAT IS THE AIRCRAFT TELLING US?
      </h2>
      <div className={ui.vehicleStatus} role="status" aria-label="Aircraft status">
        <span className={ui.label}>AIRCRAFT STATUS</span>
        <VehicleBadge state={twin.vehicle} />
      </div>

      <div className={ui.table} role="group" aria-label="System health">
        {MONITORED_SYSTEMS.map((id) => (
          <button
            key={id}
            type="button"
            className={ui.row}
            aria-pressed={healthView === "overview" && selectedSystem === id}
            onClick={() => {
              if (healthView !== "overview") setHealthView("overview");
              selectSystem(selectedSystem === id && healthView === "overview" ? null : id);
            }}
          >
            <span className={ui.rowLabel}>{HEALTH_TABLE_LABEL[id]}</span>
            <StateBadge state={twin.systems[id].state} quiet={twin.systems[id].state === "NOMINAL"} />
          </button>
        ))}
      </div>

      <p className={ui.hums} data-alert={alert} role="status">
        <span className={ui.humsPulse} aria-hidden="true" />
        HUMS · {humsLabel(twin.hums)}
      </p>

      <div className={ui.panelSection}>
        <div className={ui.segmented} role="group" aria-label="Health view">
          {VIEWS.map(({ id, label }) => (
            <button key={id} type="button" className={ui.segment} aria-pressed={healthView === id} onClick={() => setHealthView(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className={ui.panelNote}>{PROVENANCE.data}</p>
    </section>
  );
}

function Introduction() {
  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="health-intro-title">
      <p className={ui.panelEyebrow}>HEALTH HIERARCHY</p>
      <h2 id="health-intro-title" className={ui.panelTitle}>
        FROM AIRCRAFT TO SENSOR
      </h2>
      <p className={ui.panelText}>Health is reasoned upward from sensors and read downward from the aircraft. Select a system on the left, or an assembly on the aircraft, to follow a state to its source.</p>
      <div className={ui.panelSection}>
        <Chain nodes={HEALTH_HIERARCHY} label="Health hierarchy" />
      </div>
      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>States</p>
        <ul className={ui.evidence}>
          {(["NOMINAL", "DEGRADED", "LIMITED", "MAINTENANCE_REQUIRED", "UNAVAILABLE"] as const).map((state) => (
            <li key={state}>
              <StateBadge state={state} />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/** Assemblies shown in a system's drill-down: its top-level components that carry a health state. */
const assembliesOf = (system: MonitoredSystemId): ComponentId[] => componentsOf(system).filter((id) => !COMPONENTS[id].parent && COMPONENTS[id].healthSource === id);

function SystemHealth({ system }: { system: MonitoredSystemId }) {
  const twin = useUFlightStore((s) => s.digitalTwinState);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  const selectComponent = useUFlightStore((s) => s.selectComponent);
  const selectSystem = useUFlightStore((s) => s.selectSystem);
  const viewTwin = useUFlightStore((s) => s.viewTwin);
  const health = twin.systems[system];
  const assemblies = assembliesOf(system);

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="system-health-title" data-testid="system-health">
      <ol className={ui.breadcrumb} aria-label="Health hierarchy">
        <li>AIRCRAFT</li>
        <li>{HEALTH_TABLE_LABEL[system]}</li>
      </ol>
      <h2 id="system-health-title" className={ui.panelTitle}>
        {HEALTH_TABLE_LABEL[system]}
      </h2>
      <p className={ui.panelSubtitle}>
        <StateBadge state={health.state} />
      </p>
      <p className={ui.panelText}>{health.summary}.</p>

      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Assemblies</p>
        <div className={ui.table}>
          {assemblies.map((id) => {
            const state = componentHealth(twin, id).state;
            return (
              <button key={id} type="button" className={ui.row} onClick={() => selectComponent(id)}>
                <span className={ui.rowLabel}>{COMPONENTS[id].name.toUpperCase()}</span>
                <StateBadge state={state} quiet={state === "NOMINAL"} />
              </button>
            );
          })}
        </div>
      </div>

      {engineer && (
        <div className={ui.panelSection}>
          <p className={ui.panelHeading}>Monitored</p>
          <ul className={ui.list}>
            {SYSTEMS[system].monitored.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={ui.panelActions}>
        <button type="button" className={ui.action} data-track-event="uflight_3d_twin_mode" data-track-source="health_system" onClick={() => viewTwin(system)}>
          VIEW TWIN
        </button>
        <button type="button" className={`${ui.action} ${ui.actionQuiet}`} onClick={() => selectSystem(null)}>
          <ArrowLeft size={14} aria-hidden="true" /> BACK
        </button>
      </div>
    </aside>
  );
}

function SensorList() {
  const category = useUFlightStore((s) => s.sensorCategory);
  const setSensorCategory = useUFlightStore((s) => s.setSensorCategory);
  const selectSensor = useUFlightStore((s) => s.selectSensor);
  const setHoveredSensor = useUFlightStore((s) => s.setHoveredSensor);
  const sensors = sensorsOfCategory(category);
  const info = SENSOR_CATEGORIES.find((c) => c.id === category)!;

  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="sensors-title" data-testid="sensor-list">
      <p className={ui.panelEyebrow}>SENSORS</p>
      <h2 id="sensors-title" className={ui.panelTitle}>
        {info.label}
      </h2>
      <p className={ui.panelText}>
        {info.description}. {sensors.length} sensors. Only this category is shown on the aircraft.
      </p>
      <div className={ui.tabs} role="group" aria-label="Sensor category" style={{ justifyContent: "flex-start", marginTop: 12 }}>
        {SENSOR_CATEGORIES.map((c) => (
          <button key={c.id} type="button" className={ui.tab} aria-pressed={category === c.id} onClick={() => setSensorCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className={ui.panelSection}>
        <p className={ui.panelHeading}>Select a sensor to trace its signal</p>
        <div className={ui.table}>
          {sensors.map((sensor) => (
            <button key={sensor.id} type="button" className={ui.row} onClick={() => selectSensor(sensor.id)} onPointerEnter={() => setHoveredSensor(sensor.id)} onPointerLeave={() => setHoveredSensor(null)}>
              <span className={`${ui.rowLabel} ${ui.mono}`}>{sensor.id}</span>
              <span className={ui.rowNote}>{COMPONENTS[sensor.component].name}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function HumsArchitecture() {
  const humsLayer = useUFlightStore((s) => s.humsLayer);
  const setHumsLayer = useUFlightStore((s) => s.setHumsLayer);
  const engineer = useUFlightStore((s) => s.audienceMode === "engineer");
  return (
    <aside className={`${ui.panel} ${ui.panelGrow}`} aria-labelledby="hums-title" data-testid="hums-architecture">
      <p className={ui.panelEyebrow}>HUMS ARCHITECTURE</p>
      <h2 id="hums-title" className={ui.panelTitle}>
        SIX LAYERS, SENSOR TO DECISION
      </h2>
      <p className={ui.panelText}>Each layer turns the one below it into something more useful. Select a layer to see where it lives in the aircraft.</p>
      <div className={ui.panelSection}>
        <div className={ui.steps} role="group" aria-label="HUMS layers">
          {HUMS_LAYERS.map((layer) => (
            <button key={layer.layer} type="button" className={ui.layer} aria-pressed={humsLayer === layer.layer} onClick={() => setHumsLayer(humsLayer === layer.layer ? null : layer.layer)}>
              <span className={ui.stepNumber}>L{layer.layer}</span>
              <span className={ui.stepLabel}>{layer.name}</span>
              <span className={ui.layerItems}>{engineer || humsLayer === layer.layer ? layer.items.join(" · ") : layer.summary}</span>
            </button>
          ))}
        </div>
      </div>
      <p className={ui.panelNote}>{PROVENANCE.conceptual}</p>
    </aside>
  );
}

/** Right-hand panel of HEALTH when no component or sensor is selected. */
export function HealthDetail() {
  const healthView = useUFlightStore((s) => s.healthView);
  const selectedSystem = useUFlightStore((s) => s.selectedSystem);
  if (healthView === "sensors") return <SensorList />;
  if (healthView === "hums") return <HumsArchitecture />;
  const monitored = MONITORED_SYSTEMS.find((id) => id === selectedSystem);
  return monitored ? <SystemHealth system={monitored} /> : <Introduction />;
}
