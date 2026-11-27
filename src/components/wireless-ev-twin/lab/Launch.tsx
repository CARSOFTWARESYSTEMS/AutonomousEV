"use client";
// Presentation links: applying a link's options when the page opens, the one
// "Begin with sound" control the browser requires before full screen and
// audio, and the Share popover that builds such a link.
import { useEffect, useState } from "react";
import { Check, Copy, Link2, Play, Volume2, X } from "lucide-react";
import { ENVIRONMENTS, type EnvironmentId } from "@/lib/wireless-charging/content";
import { enterFullscreen } from "../state/fullscreen";
import { launchLink, type LaunchOptions, parseLaunch } from "../state/launch";
import { useTwin } from "../state/store";
import { openEnvironment, startDemo } from "../story/guide";
import lab from "./lab.module.css";

/** Pending audio and full-screen requests from a link, released by the viewer's first action. */
let pending: LaunchOptions | null = null;

/** Applies a presentation link's options once, after the laboratory has mounted. */
export function useLaunchLink(enabled: boolean) {
  const [gate, setGate] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    const o = parseLaunch(window.location.search);
    if (!o) return;
    pending = o;
    if (o.quality) useTwin.setState({ quality: o.quality });
    useTwin.setState({ captions: o.captions });
    if (o.env && !o.demo) openEnvironment(o.env);
    // A full-window layer needs no permission; native full screen waits for the viewer's tap.
    if (o.fullscreen) useTwin.setState({ fullscreen: "overlay" });
    if (o.demo) startDemo();
    document.getElementById("research-laboratory")?.scrollIntoView({ block: "start" });
    const t = window.setTimeout(() => setGate(o.fullscreen || o.sound || o.narration), 0);
    return () => window.clearTimeout(t);
  }, [enabled]);
  return { gate, close: () => setGate(false) };
}

/** The single control that turns on what a browser allows only after a user action. */
export function LaunchGate({ onClose }: { onClose: () => void }) {
  const begin = () => {
    const o = pending;
    pending = null;
    if (o?.fullscreen) void enterFullscreen();
    useTwin.setState({ narration: Boolean(o?.narration), sound: Boolean(o?.sound) });
    onClose();
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        begin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  return (
    <div className={lab.gate} role="dialog" aria-modal="true" aria-labelledby="gate-title">
      <div className={lab.gateCard}>
        <p className={lab.legendEyebrow}>EV.ENGINEER™ · Presentation</p>
        <h2 id="gate-title">Next-Generation Wireless EV Charging Digital Twin</h2>
        <p>Park. Drive. Charge. Automatically. A guided tour of the twin, computed live by its models.</p>
        <div className={lab.gateActions}>
          <button type="button" className={lab.gatePrimary} onClick={begin} autoFocus>
            <Volume2 size={18} aria-hidden="true" /> Begin with sound
          </button>
          <button
            type="button"
            className={lab.gateSecondary}
            onClick={() => {
              pending = null;
              onClose();
            }}
          >
            <Play size={16} aria-hidden="true" /> Watch silently
          </button>
        </div>
        <p className={lab.gateNote}>Your browser starts full screen and sound only after you choose. Esc leaves full screen at any time.</p>
      </div>
    </div>
  );
}

/** Builds a presentation link with the chosen options and copies it. */
export function SharePopover() {
  const env = useTwin((s) => s.environment);
  const quality = useTwin((s) => s.quality);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const envMeta = ENVIRONMENTS.find((e) => e.id === env);
  const [o, setO] = useState<LaunchOptions>({ fullscreen: true, sound: true, narration: true, captions: true, demo: true, env: null, quality: null });
  const link = typeof window === "undefined" ? "" : launchLink(window.location.origin, window.location.pathname, { ...o, env: o.demo ? null : (o.env ?? env), quality });
  const toggle = (k: "fullscreen" | "sound" | "narration" | "captions" | "demo") => setO((x) => ({ ...x, [k]: !x[k] }));
  return (
    <div className={lab.shareWrap}>
      <button type="button" className={lab.toolBtn} aria-expanded={open} onClick={() => setOpen(!open)} title="Share a presentation link">
        <Link2 size={15} aria-hidden="true" /> <span className={lab.toolText}>Share</span>
      </button>
      {open && (
        <div className={lab.share} role="dialog" aria-label="Share a presentation link">
          <div className={lab.shareHead}>
            <p className={lab.legendEyebrow}>Presentation link</p>
            <button type="button" className={lab.iconBtn} aria-label="Close" onClick={() => setOpen(false)}>
              <X size={15} aria-hidden="true" />
            </button>
          </div>
          <div className={lab.toggles}>
            {(
              [
                ["demo", "Start the demonstration"],
                ["fullscreen", "Full screen"],
                ["narration", "Narration"],
                ["sound", "Ambient sound"],
                ["captions", "Captions"],
              ] as const
            ).map(([k, label]) => (
              <button key={k} type="button" aria-pressed={o[k]} onClick={() => toggle(k)}>
                {label}
              </button>
            ))}
          </div>
          {!o.demo && (
            <label className={lab.shareEnv}>
              <span>Opens at</span>
              <select value={o.env ?? env} onChange={(e) => setO((x) => ({ ...x, env: e.target.value as EnvironmentId }))}>
                {ENVIRONMENTS.map((e) => (
                  <option key={e.id} value={e.id}>{`${e.number} ${e.name}`}</option>
                ))}
              </select>
            </label>
          )}
          <output className={lab.shareLink}>{link}</output>
          <button
            type="button"
            className={lab.gatePrimary}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1800);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />} {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            className={lab.gateSecondary}
            onClick={async () => {
              // A link straight into the environment on screen (the demonstration off), with the options chosen above.
              const direct = launchLink(window.location.origin, window.location.pathname, { ...o, demo: false, env, quality });
              try {
                await navigator.clipboard.writeText(direct);
                setO((x) => ({ ...x, demo: false, env }));
                setCopiedEnv(true);
                window.setTimeout(() => setCopiedEnv(false), 1800);
              } catch {
                setCopiedEnv(false);
              }
            }}
          >
            {copiedEnv ? <Check size={16} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />} {copiedEnv ? "Copied" : `Copy a link that opens ${envMeta?.number ?? ""} ${envMeta?.short ?? ""}`}
          </button>
          <p className={lab.gateNote}>Viewers see one “Begin with sound” button: browsers start full screen and audio only after a tap or key press.</p>
        </div>
      )}
    </div>
  );
}
