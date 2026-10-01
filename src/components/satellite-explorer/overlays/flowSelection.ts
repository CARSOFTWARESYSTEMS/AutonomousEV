// Decides which power, data and RF flows are animated for the current view.
// Pure: given interaction state and the simulation sample it fills a record of
// signed activations (sign = direction along the route, magnitude = strength).
import type { ComponentId, ExplorerMode, MissionStage, SignalView, SubsystemId } from "../types";
import type { CommandPhase } from "../simulation/mission";
import type { PayloadPhase } from "../simulation/payload";
import { FLOW_IDS, type FlowId } from "../spacecraft/flowRoutes";

export interface FlowContext {
  mode: ExplorerMode;
  subsystem: SubsystemId;
  signalView: SignalView;
  missionStage: MissionStage;
  buildStep: number;
  /** Seconds since the current build step began. */
  buildStepAge: number;
  xray: boolean;
  showMagnetorquer: boolean;
  generationW: number;
  batteryW: number;
  bootProgress: number;
  payloadPhase: PayloadPhase;
  commandPhase: CommandPhase;
  linkVisible: boolean;
  telemetry: number;
  downlink: number;
}

export interface ExternalFlows {
  /** Sun-to-array rays. */
  sunRays: number;
  uplink: number;
  telemetry: number;
  payloadDownlink: number;
}

export type FlowActivations = Record<FlowId, number>;

/** Seconds a build step waits, while its parts are installed, before its flow starts. */
export const BUILD_FLOW_DELAY_S = 2.4;

const LOADS: FlowId[] = ["load-obc", "load-adcs", "load-payload", "load-comms", "load-heaters"];
const SENSORS: FlowId[] = ["sense-startracker", "sense-sun", "sense-mag", "sense-gnss"];

export function selectFlows(out: FlowActivations, ctx: FlowContext): ExternalFlows {
  for (const id of FLOW_IDS) out[id] = 0;
  const external: ExternalFlows = { sunRays: 0, uplink: 0, telemetry: 0, payloadDownlink: 0 };
  const set = (ids: FlowId[], value: number) => ids.forEach((id) => (out[id] = value));

  const power = (withLoads: boolean) => {
    if (ctx.generationW > 0.3) {
      const strength = Math.min(1, Math.max(0.4, ctx.generationW / 24));
      set(["array-left", "array-right"], strength);
      external.sunRays = strength;
    }
    if (ctx.batteryW > 0.15) out.battery = 0.85;
    else if (ctx.batteryW < -0.15) out.battery = -0.85;
    if (withLoads) set(LOADS, 0.6);
  };
  const sensing = (strength: number) => set(SENSORS, strength);
  const payload = () => {
    if (ctx.payloadPhase === "TARGET_ACQUIRED") out["cmd-payload"] = 0.8;
    if (ctx.payloadPhase === "CAPTURING" || ctx.payloadPhase === "PROCESSING") out["payload-raw"] = 0.9;
    if (ctx.payloadPhase === "PROCESSING") out["payload-store"] = 0.9;
  };
  const command = () => {
    if (ctx.commandPhase === "UPLINK") external.uplink = 1;
    if (ctx.commandPhase === "ROUTING") {
      // Antenna → transceiver → OBC: both routes run against their defined direction.
      out["rf-sband-nadir"] = -0.9;
      out["obc-sband"] = -0.9;
    }
    if (ctx.commandPhase === "EXECUTING") out["cmd-wheels"] = 0.9;
  };
  const telemetry = (strength: number) => {
    out.housekeeping = strength;
    out["sense-startracker"] = strength * 0.8;
    out["obc-sband"] = strength;
    out["rf-sband-nadir"] = strength;
    if (ctx.linkVisible) external.telemetry = strength;
  };
  const payloadDownlink = (strength: number) => {
    out["store-xband"] = strength;
    out["rf-xband"] = strength;
    if (ctx.linkVisible) external.payloadDownlink = strength;
  };

  switch (ctx.mode) {
    case "build": {
      if (ctx.buildStepAge < BUILD_FLOW_DELAY_S) break;
      if (ctx.buildStep === 2) power(false);
      else if (ctx.buildStep === 3) {
        out.housekeeping = 0.7;
        out["load-obc"] = 0.6;
      } else if (ctx.buildStep === 4) {
        sensing(0.75);
        out["cmd-wheels"] = 0.85;
        out["cmd-torquers"] = 0.5;
      } else if (ctx.buildStep === 5) {
        out["rf-sband-nadir"] = 0.7;
        out["rf-sband-zenith"] = -0.7;
        out["rf-xband"] = 0.7;
        out["obc-sband"] = 0.5;
      } else if (ctx.buildStep === 6) {
        out["payload-raw"] = 0.85;
        out["payload-store"] = 0.85;
      } else if (ctx.buildStep === 8) {
        power(true);
        out.housekeeping = 0.5;
      }
      break;
    }
    case "systems": {
      if (ctx.subsystem === "power") power(ctx.xray);
      else if (ctx.subsystem === "adcs") {
        sensing(0.75);
        out["cmd-wheels"] = 0.9;
        out["cmd-torquers"] = ctx.showMagnetorquer ? 0.9 : 0.3;
      } else if (ctx.subsystem === "payload") payload();
      else if (ctx.subsystem === "communications") {
        out["rf-sband-nadir"] = 0.6;
        out["rf-sband-zenith"] = 0.35;
        out["rf-xband"] = 0.6;
        if (ctx.linkVisible) {
          external.telemetry = 0.7;
          external.payloadDownlink = 0.7;
        }
      } else if (ctx.subsystem === "avionics") {
        sensing(0.7);
        set(["housekeeping", "cmd-wheels", "cmd-payload", "obc-sband"], 0.6);
        out["cmd-torquers"] = 0.4;
        out["payload-store"] = 0.4;
        out["store-xband"] = 0.4;
      }
      break;
    }
    case "signals": {
      if (ctx.signalView === "command") {
        if (ctx.commandPhase === "NONE" || ctx.commandPhase === "VERIFIED") {
          // Idle: keep the route faintly drawn so the path is still legible.
          out["rf-sband-nadir"] = -0.3;
          out["obc-sband"] = -0.3;
          out["cmd-wheels"] = 0.3;
        } else command();
      } else if (ctx.signalView === "telemetry") telemetry(0.85);
      else {
        out["payload-raw"] = 0.4;
        out["payload-store"] = 0.4;
        payloadDownlink(0.9);
      }
      break;
    }
    case "mission": {
      switch (ctx.missionStage) {
        case "BOOT":
          if (ctx.bootProgress > 0) {
            out.battery = -0.85;
            out["load-obc"] = 0.8;
          }
          break;
        case "POWER":
          power(false);
          out["load-obc"] = 0.6;
          break;
        case "ATTITUDE":
          sensing(0.75);
          out["cmd-wheels"] = 0.9;
          break;
        case "CAPTURE":
        case "STORE":
          payload();
          break;
        case "UPLINK":
          command();
          break;
        case "TELEMETRY":
          telemetry(Math.max(0.3, ctx.telemetry));
          break;
        case "PAYLOAD_DOWNLINK":
          if (ctx.downlink > 0 && ctx.downlink < 1) payloadDownlink(0.95);
          break;
        default:
          break;
      }
      break;
    }
    default:
      break;
  }
  return external;
}

/** Components whose load label is shown when Power is viewed in X-ray. */
export const POWER_LOAD_LABELS: readonly { component: ComponentId; flow: FlowId; load: "obc" | "adcs" | "payload" | "comms" | "heaters" }[] = [
  { component: "obc", flow: "load-obc", load: "obc" },
  { component: "reaction-wheel-y", flow: "load-adcs", load: "adcs" },
  { component: "optical-payload", flow: "load-payload", load: "payload" },
  { component: "sband-radio", flow: "load-comms", load: "comms" },
  { component: "heaters", flow: "load-heaters", load: "heaters" },
];
