// Shareable presentation links. A link such as
//   /internships/wireless-ev-charging-digital-twin?experience=present
// opens the laboratory as a full-window presentation running the technology
// demonstration with captions, and offers one "Begin with sound" control.
// Browsers allow native full screen, speech and audio only after the viewer's
// own tap or key press, so that one control switches them on; nothing is
// claimed to start without it. Individual options override the preset:
//   fs, sound, narration, captions, demo  (1 or 0)
//   env   parking | station | dynamic | autonomous | infrastructure
//   quality  auto | high | balanced | performance
// No three.js here.
import type { EnvironmentId } from "@/lib/wireless-charging/content";
import type { QualityChoice } from "./store";

export interface LaunchOptions {
  fullscreen: boolean;
  sound: boolean;
  narration: boolean;
  captions: boolean;
  demo: boolean;
  env: EnvironmentId | null;
  quality: QualityChoice | null;
}

const ENVS: EnvironmentId[] = ["parking", "station", "dynamic", "autonomous", "infrastructure"];
const QUALITIES: QualityChoice[] = ["auto", "high", "balanced", "performance"];

/** The options a URL asks for, or null when it asks for nothing. */
export function parseLaunch(search: string): LaunchOptions | null {
  const p = new URLSearchParams(search);
  const preset = p.get("experience") === "present";
  const keys = ["fs", "sound", "narration", "captions", "demo", "env", "quality"];
  if (!preset && !keys.some((k) => p.has(k))) return null;
  const flag = (k: string, d: boolean) => (p.has(k) ? p.get(k) !== "0" && p.get(k) !== "false" : d);
  const env = p.get("env") as EnvironmentId | null;
  const quality = p.get("quality") as QualityChoice | null;
  return {
    fullscreen: flag("fs", preset),
    sound: flag("sound", preset),
    narration: flag("narration", preset),
    captions: flag("captions", true),
    demo: flag("demo", preset),
    env: env && ENVS.includes(env) ? env : null,
    quality: quality && QUALITIES.includes(quality) ? quality : null,
  };
}

/** A link to this page with the given options (the presentation preset when everything is on). */
export function launchLink(origin: string, path: string, o: LaunchOptions): string {
  const p = new URLSearchParams();
  const all = o.fullscreen && o.sound && o.narration && o.captions && o.demo;
  if (all) p.set("experience", "present");
  else {
    p.set("fs", o.fullscreen ? "1" : "0");
    p.set("sound", o.sound ? "1" : "0");
    p.set("narration", o.narration ? "1" : "0");
    p.set("captions", o.captions ? "1" : "0");
    p.set("demo", o.demo ? "1" : "0");
  }
  if (o.env && !o.demo) p.set("env", o.env);
  if (o.quality && o.quality !== "auto") p.set("quality", o.quality);
  return `${origin}${path}?${p.toString()}#research-laboratory`;
}
