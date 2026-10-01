import type { LinkState } from "../types";
import { DEMO_COMMAND, MISSION_COMMAND } from "../data/missionSequence";
import { LINK_STATE_DESCRIPTION, LINK_STATE_LABEL } from "../simulation/communications";
import { GROUND_STATION, OBSERVATION_TARGET } from "../simulation/orbit";
import { PAYLOAD_REFERENCE, downlinkedMb } from "../simulation/payload";
import type { CommandPhase } from "../simulation/mission";
import { useExplorerStore } from "../state/explorerStore";
import { attitudeLabel, formatPercent } from "./liveValues";
import ui from "../explorer.module.css";

const COMMAND_STEPS: { phase: CommandPhase; label: string }[] = [
  { phase: "UPLINK", label: "UPLINK" },
  { phase: "ROUTING", label: "RECEIVED" },
  { phase: "EXECUTING", label: "EXECUTING" },
  { phase: "VERIFIED", label: "VERIFIED" },
];
const PHASE_ORDER: CommandPhase[] = ["NONE", "UPLINK", "ROUTING", "EXECUTING", "VERIFIED"];

// The thumbnail is a crop of the day map around the observation target.
const MAP_WIDTH = 2048;
const MAP_HEIGHT = 1024;
const ZOOM = 2.6;
const THUMB = { width: 208, height: 78 };
const crop = {
  size: `${MAP_WIDTH * ZOOM}px ${MAP_HEIGHT * ZOOM}px`,
  position: `${-(((OBSERVATION_TARGET.lonDeg + 180) / 360) * MAP_WIDTH * ZOOM - THUMB.width / 2)}px ${-(((90 - OBSERVATION_TARGET.latDeg) / 180) * MAP_HEIGHT * ZOOM - THUMB.height / 2)}px`,
};

function LinkStatus({ link }: { link: LinkState }) {
  return (
    <div className={ui.linkStatus} data-link={link}>
      <span className={ui.linkLamp} aria-hidden="true" />
      <span className={ui.linkName}>{LINK_STATE_LABEL[link]}</span>
      <span className={ui.linkDescription}>{LINK_STATE_DESCRIPTION[link]}</span>
    </div>
  );
}

/**
 * Mission-control view of the ground segment: link state, the command in
 * flight, returned telemetry and the payload downlink. Small on purpose.
 */
export default function MissionConsole() {
  const mode = useExplorerStore((s) => s.mode);
  const stage = useExplorerStore((s) => s.missionStage);
  const signalView = useExplorerStore((s) => s.signalView);
  const t = useExplorerStore((s) => s.telemetry);

  const mission = mode === "mission";
  const groundStages = ["GROUND_PASS", "UPLINK", "TELEMETRY", "PAYLOAD_DOWNLINK", "COMPLETE"];
  if (mode !== "signals" && !(mission && groundStages.includes(stage))) return null;

  const commandIndex = PHASE_ORDER.indexOf(t.commandPhase);
  const showDownlink = mission ? stage === "PAYLOAD_DOWNLINK" || t.downlinkProgress > 0 : false;
  // Once the downlink starts, the verified command gives way to it so the console stays short.
  const showCommand = mission ? (stage === "UPLINK" || commandIndex > 0) && !showDownlink : signalView === "command";
  const telemetryIn = mission ? t.telemetryProgress >= 1 : signalView === "telemetry" && t.link !== "NO_LINK";
  const received = t.downlinkProgress >= 1;

  return (
    <aside className={ui.console} aria-label="Mission control">
      <p className={ui.consoleTitle}>MISSION CONTROL</p>
      <p className={ui.consoleSite}>{GROUND_STATION.label}</p>
      <LinkStatus link={t.link} />

      {showCommand && (
        <div className={ui.consoleBlock}>
          <p className={ui.consoleLabel}>COMMAND</p>
          <p className={ui.commandText}>{mission ? MISSION_COMMAND : DEMO_COMMAND}</p>
          <ol className={ui.commandSteps} aria-label="Command progress">
            {COMMAND_STEPS.map((step, i) => {
              const state = commandIndex > i + 1 || t.commandPhase === "VERIFIED" ? "done" : commandIndex === i + 1 ? "current" : "todo";
              return (
                <li key={step.phase} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                  {step.label}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {telemetryIn && (
        <div className={ui.consoleBlock}>
          <p className={ui.consoleHeadline}>SPACECRAFT NOMINAL</p>
          <dl className={ui.consoleValues}>
            <div>
              <dt>POWER</dt>
              <dd>{formatPercent(t.batterySoc)}</dd>
            </div>
            <div>
              <dt>MODE</dt>
              <dd>{t.spacecraftMode}</dd>
            </div>
            <div>
              <dt>ATTITUDE</dt>
              <dd>{t.attitudeLocked ? "LOCKED" : attitudeLabel(t.attitudeMode).toUpperCase()}</dd>
            </div>
            <div>
              <dt>THERMAL</dt>
              <dd>NOMINAL</dd>
            </div>
            <div>
              <dt>COMMS</dt>
              <dd>{t.link === "NO_LINK" || t.link === "LOS" ? "NO LINK" : "CONNECTED"}</dd>
            </div>
          </dl>
          <p className={ui.consoleNote}>SIMULATED TELEMETRY</p>
        </div>
      )}

      {showDownlink && (
        <div className={ui.consoleBlock}>
          <div className={ui.downlinkHead}>
            <p className={ui.consoleLabel}>DOWNLINK · X-BAND</p>
            <p className={ui.downlinkPercent}>{formatPercent(t.downlinkProgress * 100)}</p>
          </div>
          <div className={ui.progress} role="progressbar" aria-label="Payload downlink" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(t.downlinkProgress * 100)}>
            <span style={{ width: `${t.downlinkProgress * 100}%` }} />
          </div>
          <p className={ui.consoleNote}>
            {downlinkedMb(t.downlinkProgress)} / {PAYLOAD_REFERENCE.captureSizeMb} MB
          </p>
          <div
            className={ui.thumbnail}
            role="img"
            aria-label={received ? "Reconstructed image of the observation target" : "Image reconstructing as data arrives"}
            style={{ width: THUMB.width, height: THUMB.height }}
          >
            <span
              className={ui.thumbnailImage}
              style={{
                backgroundImage: "url(/space/satellite-explorer/earth-day-2k.jpg)",
                backgroundSize: crop.size,
                backgroundPosition: crop.position,
                clipPath: `inset(0 0 ${(1 - t.downlinkProgress) * 100}% 0)`,
              }}
            />
          </div>
          <p className={ui.consoleHeadline}>{received ? "PAYLOAD DATA RECEIVED" : "RECEIVING…"}</p>
          <p className={ui.consoleNote}>ILLUSTRATIVE IMAGE · NASA VISIBLE EARTH</p>
        </div>
      )}
    </aside>
  );
}
