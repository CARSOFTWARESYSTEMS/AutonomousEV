// CONTROL: the controller, what it commands and what it reads.
import { SENSORS } from "../data/engineReference";
import { SENSOR_FILTERS } from "../data/twinContent";
import { useRocketTwinStore } from "../state/twinStore";
import { Action } from "../ui/panels";
import ui from "../twin3d.module.css";

export function SensorFilters() {
  const filter = useRocketTwinStore((s) => s.sensorFilter);
  const setSensorFilter = useRocketTwinStore((s) => s.setSensorFilter);
  return (
    <div className={ui.group} role="group" aria-label="Sensor type">
      <span className={ui.groupLabel}>SENSORS</span>
      {SENSOR_FILTERS.map((f) => (
        <Action key={f.id} pressed={filter === f.id} label={`Show ${f.label.toLowerCase()} sensors`} onClick={() => setSensorFilter(f.id)}>
          {f.label}
        </Action>
      ))}
    </div>
  );
}

export function ControlLeft() {
  const filter = useRocketTwinStore((s) => s.sensorFilter);
  const selected = useRocketTwinStore((s) => s.sensor);
  const selectSensor = useRocketTwinStore((s) => s.selectSensor);
  return (
    <nav className={ui.list} aria-label="Sensors the engine controller reads">
      {SENSORS.filter((s) => filter === null || s.type === filter).map((s) => (
        <button key={s.id} type="button" className={ui.listItem} aria-pressed={selected === s.id} onClick={() => selectSensor(s.id)}>
          {s.name.toUpperCase()}
        </button>
      ))}
    </nav>
  );
}

export function ControlDock() {
  return (
    <div className={ui.controls}>
      <SensorFilters />
    </div>
  );
}
