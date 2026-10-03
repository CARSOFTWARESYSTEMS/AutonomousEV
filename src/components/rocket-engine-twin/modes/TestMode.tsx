// TEST: one coherent run of the engine, from system check to review. The
// engine stays at the centre; the interface is a title, a few readings and a
// timeline with a single indicator.
import { Play, Square } from "lucide-react";
import { FIRING_PHASES, TEST_PHASES } from "../data/engineReference";
import { SCALE_NOTES } from "../data/twinContent";
import { frame } from "../scene/frameState";
import { SYSTEM_CHECK_ITEMS, THROTTLE_LEVELS } from "../simulation/engineSim";
import { useSampled } from "../state/clocks";
import { useRocketTwinStore } from "../state/twinStore";
import { CredibilityCard } from "../ui/Credibility";
import { Action, Panel, Rows } from "../ui/panels";
import ui from "../twin3d.module.css";

const readEngine = () => ({ thrust: Math.round(frame.engine.thrust * 100), chamber: Math.round(frame.engine.chamber * 100), rotor: Math.round(frame.engine.rotor * 100), thermal: Math.round(frame.engine.thermal * 100) });

export function TestRight() {
  const test = useRocketTwinStore((s) => s.test);
  const audience = useRocketTwinStore((s) => s.audience);
  const credibility = useRocketTwinStore((s) => s.credibility);
  const toggleCredibility = useRocketTwinStore((s) => s.toggleCredibility);
  const engine = useSampled(readEngine, 6);
  const phase = TEST_PHASES[test.phase];
  const engineer = audience === "engineer";

  if (test.status === "completed") {
    return (
      <Panel title="POST-RUN REVIEW" tag="SIMULATED">
        <Rows
          rows={[
            { label: "PHASES", value: `${TEST_PHASES.length} OF ${TEST_PHASES.length}` },
            { label: "PEAK THRUST", value: "100% OF REFERENCE" },
            { label: "HEALTH", value: "NOMINAL", state: "nominal" },
            { label: "EVIDENCE", value: "CHAMBER STATE WITHIN REFERENCE ENVELOPE · PASS", state: "nominal" },
          ]}
        />
        <div className={ui.actions}>
          <Action pressed={credibility} onClick={toggleCredibility}>
            MODEL CREDIBILITY
          </Action>
        </div>
        {credibility && <CredibilityCard id="transient" />}
      </Panel>
    );
  }

  if (test.status === "running" && phase.id === "system_check") {
    return (
      <Panel title="SYSTEM CHECK" tag="SIMULATED">
        <Rows rows={SYSTEM_CHECK_ITEMS.map((item) => ({ ...item, state: "nominal" }))} />
      </Panel>
    );
  }

  const value = (percent: number) => (engineer ? `${percent}% · NOMINAL` : "NOMINAL");
  return (
    <Panel title="TELEMETRY" tag="SIMULATED">
      <Rows
        rows={[
          { label: "THRUST", value: engineer ? `${engine.thrust}% OF REFERENCE` : "SIMULATED" },
          { label: "CHAMBER", value: value(engine.chamber), state: "nominal" },
          { label: "TURBOMACHINERY", value: value(engine.rotor), state: "nominal" },
          { label: "COOLING", value: value(engine.thermal), state: "nominal" },
          { label: "CONTROL", value: "NOMINAL", state: "nominal" },
          { label: "HEALTH", value: "NOMINAL", state: "nominal" },
        ]}
      />
      {engineer && <p className={ui.note}>NORMALISED TO THE REFERENCE POINT · {SCALE_NOTES.rotation}</p>}
    </Panel>
  );
}

export function TestDock() {
  const test = useRocketTwinStore((s) => s.test);
  const throttle = useRocketTwinStore((s) => s.throttle);
  const store = useRocketTwinStore.getState();
  const running = test.status === "running";
  const phase = TEST_PHASES[test.phase];
  const throttling = running && FIRING_PHASES.includes(phase.id) && phase.id !== "start";
  const status = running ? phase.text : test.status === "completed" ? "Test complete. Every phase ran." : test.status === "aborted" ? `Test stopped during ${phase.name.toLowerCase()}.` : "Ready to run.";

  return (
    <div className={ui.controls} data-stack="true">
      <p className={ui.status} role="status">
        {status}
      </p>
      <ol className={ui.timeline} aria-label="Test phases">
        {TEST_PHASES.map((p, i) => {
          const state = test.status === "idle" ? "pending" : i < test.phase || test.status === "completed" ? "done" : i === test.phase ? (running ? "active" : "stopped") : "pending";
          return (
            <li key={p.id} data-state={state} aria-current={state === "active" ? "step" : undefined}>
              {p.name.toUpperCase()}
            </li>
          );
        })}
      </ol>
      <div className={ui.controls}>
        {running ? (
          <Action onClick={store.stopTest}>
            <Square size={11} aria-hidden="true" /> STOP TEST
          </Action>
        ) : (
          <Action primary label="Run simulated engine test" onClick={store.startTest}>
            <Play size={11} aria-hidden="true" /> RUN SIMULATED ENGINE TEST
          </Action>
        )}
        <div className={ui.group} role="group" aria-label="Throttle, percent of reference thrust">
          <span className={ui.groupLabel}>THROTTLE</span>
          {THROTTLE_LEVELS.map((level) => (
            <Action key={level} pressed={throttle === level} disabled={!throttling} label={`Throttle ${level} percent`} onClick={() => store.setThrottle(level)}>
              {level}%
            </Action>
          ))}
        </div>
        {test.hold && (
          <Action primary onClick={store.continueTest}>
            CONTINUE TO SHUTDOWN
          </Action>
        )}
      </div>
    </div>
  );
}
