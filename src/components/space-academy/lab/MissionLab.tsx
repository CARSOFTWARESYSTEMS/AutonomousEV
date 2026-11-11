"use client";
// The Mission Lab: one distraction-free player for every Academy mission.
//
// Layout: a slim top bar (exit, mission, age level, about, settings), a 3D
// viewport that fills the screen, and one panel for the current mode:
// Explore (look around freely), Learn (guided steps) or Challenge (design
// and check). From 1024px the panel sits beside the viewport; on phones and
// tablets it is a bottom sheet with three heights, resized by dragging its
// handle or with the keyboard. No site navigation and nothing promotional:
// the only ways out are Exit and the links in "About this mission".
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, GraduationCap, Info, Settings2, Target, X } from "lucide-react";
import type { Level } from "@/app/space/academy/data/curriculum";
import { LEVELS, LEVEL_ORDER } from "@/app/space/academy/data/curriculum";
import type { MissionMeta } from "@/app/space/academy/data/missions";
import { getWebGLSupport } from "@/components/satellite-explorer/lib/capabilities";
import {
  saveLabMode,
  setLabSettings,
  setLevel,
  setViewPreference,
  usePersisted,
  useLabSettings,
  useViewPreference,
  type LabMode,
  type MotionSetting,
  type QualitySetting,
} from "../store";
import { academyEvent } from "../analytics";
import { stopSpeaking, useSpeechSupported } from "./speech";
import styles from "./lab.module.css";

export const LAB_MODES: { id: LabMode; label: string; hint: string; Icon: typeof Compass }[] = [
  { id: "explore", label: "Explore", hint: "Look around freely", Icon: Compass },
  { id: "learn", label: "Learn", hint: "Guided steps", Icon: GraduationCap },
  { id: "challenge", label: "Challenge", hint: "Design and check", Icon: Target },
];

const isMode = (v: string | null): v is LabMode => v === "explore" || v === "learn" || v === "challenge";

function subscribeHash(notify: () => void) {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
}

/**
 * The lab's mode: the URL's #explore / #learn / #challenge first (so modes
 * can be linked), then the mode this mission was last left in, then
 * `fallback`. Changing it updates both.
 */
export function useLabMode(slug: string, fallback: LabMode = "learn"): [LabMode, (mode: LabMode) => void] {
  const hash = useSyncExternalStore(
    subscribeHash,
    () => window.location.hash.slice(1),
    () => "",
  );
  const stored = usePersisted<LabMode | null>(`mode:${slug}`, null, (raw) => (isMode(raw) ? raw : null));
  const mode: LabMode = isMode(hash) ? hash : stored ?? fallback;
  const setMode = (next: LabMode) => {
    saveLabMode(slug, next);
    window.history.replaceState(window.history.state, "", `#${next}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };
  return [mode, setMode];
}

/** Auto picks Low on software rendering, little memory or few cores; otherwise High. */
function autoQuality(): "high" | "low" {
  const webgl = getWebGLSupport();
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  return webgl.software || memory <= 2 || cores <= 2 ? "low" : "high";
}

/** The rendering quality and motion the learner's settings resolve to on this device. */
export function useLabRendering(): { quality: "high" | "low"; reducedMotion: boolean } {
  const settings = useLabSettings();
  const auto = useSyncExternalStore(
    () => () => {},
    autoQuality,
    () => "high" as const,
  );
  const systemReduced = useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      mql.addEventListener("change", notify);
      return () => mql.removeEventListener("change", notify);
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const quality = settings.quality === "auto" ? auto : settings.quality;
  const reducedMotion = settings.motion === "system" ? systemReduced : settings.motion === "reduce";
  return { quality, reducedMotion };
}

type SheetSize = "peek" | "half" | "full";
const SHEET_ORDER: SheetSize[] = ["peek", "half", "full"];
const SHEET_LABEL: Record<SheetSize, string> = { peek: "Expand panel", half: "Expand panel to full height", full: "Collapse panel" };

function sheetHeights() {
  const vh = window.innerHeight;
  return { peek: 176, half: Math.round(vh * 0.5), full: vh - 56 - 112 };
}

interface Props {
  mission: MissionMeta;
  trackTitle?: string;
  level: Level;
  mode: LabMode;
  onModeChange: (mode: LabMode) => void;
  /** The model viewer, in its "lab" variant. */
  viewport: ReactNode;
  /** Anything the mission shows over the viewport, e.g. the selected part. */
  stageOverlay?: ReactNode;
  /** The current mode's panel. */
  panel: ReactNode;
  /** "About this mission": rendered on the server, so it is in the page's HTML. */
  info: ReactNode;
  progress: { done: number; total: number };
  onClearProgress: () => void;
}

export default function MissionLab({ mission, trackTitle, level, mode, onModeChange, viewport, stageOverlay, panel, info, progress, onClearProgress }: Props) {
  const [sheet, setSheet] = useState<SheetSize>("half");
  const sheetRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDialogElement>(null);
  const settingsRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ startY: number; startH: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const tabsId = useId();

  useEffect(() => {
    // For measuring time to the first meaningful interaction, in the field and in tests.
    performance.mark?.("space-academy:lab-interactive");
    if (rootRef.current) rootRef.current.dataset.ready = "true";
    academyEvent("lesson_start", { mission: mission.slug, level });
    // Once per visit to the mission.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.slug]);

  const chooseMode = (next: LabMode) => {
    if (next === mode) return;
    stopSpeaking();
    onModeChange(next);
    if (sheet === "peek") setSheet("half");
    academyEvent("lesson_mode_change", { mission: mission.slug, mode: next, level });
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = LAB_MODES.findIndex((m) => m.id === mode);
    const go = (j: number) => {
      const next = LAB_MODES[(j + LAB_MODES.length) % LAB_MODES.length].id;
      chooseMode(next);
      requestAnimationFrame(() => document.getElementById(`${tabsId}-${next}`)?.focus());
    };
    if (e.key === "ArrowRight") go(i + 1);
    else if (e.key === "ArrowLeft") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(LAB_MODES.length - 1);
    else return;
    e.preventDefault();
  };

  // ── Bottom sheet (below 1024px) ──
  const onHandleDown = (e: PointerEvent<HTMLButtonElement>) => {
    const el = sheetRef.current;
    if (!el) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startH: el.getBoundingClientRect().height, moved: false };
  };
  const onHandleMove = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    const el = sheetRef.current;
    if (!d || !el) return;
    const dy = d.startY - e.clientY;
    if (Math.abs(dy) > 6) d.moved = true;
    if (!d.moved) return;
    const h = sheetHeights();
    el.style.height = `${Math.min(h.full, Math.max(h.peek, d.startH + dy))}px`;
  };
  const onHandleUp = () => {
    const d = drag.current;
    const el = sheetRef.current;
    drag.current = null;
    if (!d || !el || !d.moved) return;
    const h = sheetHeights();
    const now = el.getBoundingClientRect().height;
    const nearest = SHEET_ORDER.reduce((best, s) => (Math.abs(h[s] - now) < Math.abs(h[best] - now) ? s : best), "half" as SheetSize);
    el.style.height = "";
    setSheet(nearest);
    suppressClick.current = true;
  };
  const onHandleClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setSheet((s) => (s === "full" ? "peek" : SHEET_ORDER[SHEET_ORDER.indexOf(s) + 1]));
  };
  const onHandleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const i = SHEET_ORDER.indexOf(sheet);
    if (e.key === "ArrowUp") setSheet(SHEET_ORDER[Math.min(2, i + 1)]);
    else if (e.key === "ArrowDown") setSheet(SHEET_ORDER[Math.max(0, i - 1)]);
    else return;
    e.preventDefault();
  };

  const openDialog = (ref: React.RefObject<HTMLDialogElement | null>) => {
    const d = ref.current;
    if (!d) return;
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
  };
  const closeDialog = (ref: React.RefObject<HTMLDialogElement | null>) => {
    const d = ref.current;
    if (!d) return;
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  };

  const activeTab = `${tabsId}-${mode}`;

  return (
    <div ref={rootRef} className={styles.lab}>
      <header className={styles.bar}>
        <Link href="/space/academy" className={styles.exit} aria-label="Exit the mission and return to Space Academy" data-track-event="lesson_exit_click" data-track-mission={mission.slug}>
          <ArrowLeft size={18} aria-hidden />
          <span className={styles.exitText}>Exit</span>
        </Link>
        <div className={styles.titleBlock}>
          <span className={styles.titleKicker}>
            Mission {mission.number}
            {trackTitle ? ` · ${trackTitle}` : ""}
          </span>
          <h1 className={styles.title}>{mission.title}</h1>
        </div>
        <div className={styles.progressChip} role="img" aria-label={`${progress.done} of ${progress.total} steps complete`}>
          <span className={styles.progressRing} style={{ ["--p" as string]: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} aria-hidden="true" />
          <span aria-hidden="true">
            {progress.done}/{progress.total}
          </span>
        </div>
        <div className={styles.levels} role="group" aria-label="Age level">
          {LEVEL_ORDER.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              className={styles.levelBtn}
              onClick={() => {
                if (level === l) return;
                stopSpeaking();
                setLevel(l);
                academyEvent("academy_level_change", { level: l, placement: `lab_${mission.slug}` });
              }}
            >
              <span className={styles.srOnly}>Ages </span>
              {LEVELS[l].ages}
            </button>
          ))}
        </div>
        <button type="button" className={styles.iconBtn} onClick={() => openDialog(infoRef)} aria-haspopup="dialog" aria-label="About this mission">
          <Info size={19} aria-hidden />
        </button>
        <button type="button" className={styles.iconBtn} onClick={() => openDialog(settingsRef)} aria-haspopup="dialog" aria-label="Settings: graphics, motion, narration">
          <Settings2 size={19} aria-hidden />
        </button>
      </header>

      <main id="main-content" className={styles.body}>
        <div className={styles.stage}>
          {viewport}
          <p className={styles.simBadge}>
            <span>Educational simulation</span>
            <span className={styles.simBadgeMore}> · simplified physics, illustrative values · not flight data</span>
          </p>
          {stageOverlay}
        </div>

        <section ref={sheetRef} className={styles.sheet} data-size={sheet} aria-label="Mission panel">
          <button
            type="button"
            className={styles.handle}
            aria-label={SHEET_LABEL[sheet]}
            aria-controls="lab-panel"
            onPointerDown={onHandleDown}
            onPointerMove={onHandleMove}
            onPointerUp={onHandleUp}
            onPointerCancel={onHandleUp}
            onClick={onHandleClick}
            onKeyDown={onHandleKey}
          >
            <span aria-hidden="true" />
          </button>
          <div className={styles.tabs} role="tablist" aria-label="Mission mode" onKeyDown={onTabKey}>
            {LAB_MODES.map((m) => (
              <button
                key={m.id}
                id={`${tabsId}-${m.id}`}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                aria-controls="lab-panel"
                tabIndex={mode === m.id ? 0 : -1}
                className={styles.tab}
                onClick={() => chooseMode(m.id)}
              >
                <m.Icon size={17} aria-hidden />
                <span className={styles.tabText}>
                  <span className={styles.tabLabel}>{m.label}</span>
                  <span className={styles.tabHint}>{m.hint}</span>
                </span>
              </button>
            ))}
          </div>
          <div id="lab-panel" role="tabpanel" aria-labelledby={activeTab} className={styles.panel}>
            {panel}
          </div>
        </section>
      </main>

      <dialog ref={infoRef} className={styles.dialog} aria-labelledby="lab-info-title" onClick={(e) => e.target === e.currentTarget && closeDialog(infoRef)}>
        <div className={styles.dialogInner}>
          <div className={styles.dialogHead}>
            <h2 id="lab-info-title">About this mission</h2>
            <button type="button" className={styles.iconBtn} onClick={() => closeDialog(infoRef)} aria-label="Close">
              <X size={19} aria-hidden />
            </button>
          </div>
          <div className={styles.dialogBody}>{info}</div>
        </div>
      </dialog>

      <dialog ref={settingsRef} className={styles.dialog} aria-labelledby="lab-settings-title" onClick={(e) => e.target === e.currentTarget && closeDialog(settingsRef)}>
        <div className={styles.dialogInner}>
          <div className={styles.dialogHead}>
            <h2 id="lab-settings-title">Settings</h2>
            <button type="button" className={styles.iconBtn} onClick={() => closeDialog(settingsRef)} aria-label="Close">
              <X size={19} aria-hidden />
            </button>
          </div>
          <div className={styles.dialogBody}>
            <LabSettingsForm mission={mission.slug} onClearProgress={onClearProgress} />
          </div>
        </div>
      </dialog>
    </div>
  );
}

function LabSettingsForm({ mission, onClearProgress }: { mission: string; onClearProgress: () => void }) {
  const settings = useLabSettings();
  const view = useViewPreference();
  const speech = useSpeechSupported();
  const { quality } = useLabRendering();
  const webgl = useSyncExternalStore(
    () => () => {},
    () => getWebGLSupport().supported,
    () => true,
  );
  const [cleared, setCleared] = useState(false);
  const change = (name: string, value: string | boolean) => academyEvent("lesson_setting_change", { mission, setting: name, value });

  const radio = <T extends string>(name: string, legend: string, value: T, options: { value: T; label: string; detail?: string; disabled?: boolean }[], onChange: (v: T) => void) => (
    <fieldset className={styles.setting}>
      <legend>{legend}</legend>
      {options.map((o) => (
        <label key={o.value} className={styles.settingOption} data-checked={value === o.value || undefined} data-disabled={o.disabled || undefined}>
          <input type="radio" name={`lab-${name}`} value={o.value} checked={value === o.value} disabled={o.disabled} onChange={() => onChange(o.value)} />
          <span>
            <span className={styles.settingLabel}>{o.label}</span>
            {o.detail && <span className={styles.settingDetail}>{o.detail}</span>}
          </span>
        </label>
      ))}
    </fieldset>
  );

  return (
    <div className={styles.settings}>
      {radio<"3d" | "2d">(
        "view",
        "View",
        view === "2d" || !webgl ? "2d" : "3d",
        [
          { value: "3d", label: "3D model", detail: webgl ? "Rotate, zoom and take it apart" : "Not available: this device cannot draw 3D graphics", disabled: !webgl },
          { value: "2d", label: "2D drawing", detail: "The same parts and numbers as a flat, labelled drawing" },
        ],
        (v) => {
          setViewPreference(v);
          change("view", v);
        },
      )}
      {radio<QualitySetting>(
        "quality",
        "Graphics quality",
        settings.quality,
        [
          { value: "auto", label: "Auto", detail: `Chosen for this device: ${quality === "high" ? "High" : "Low"}` },
          { value: "high", label: "High", detail: "Sharpest picture" },
          { value: "low", label: "Low", detail: "Faster and saves battery on older phones" },
        ],
        (v) => {
          setLabSettings({ quality: v });
          change("quality", v);
        },
      )}
      {radio<MotionSetting>(
        "motion",
        "Motion",
        settings.motion,
        [
          { value: "system", label: "Follow my device", detail: "Uses your device's reduce-motion setting" },
          { value: "reduce", label: "Reduce motion", detail: "No camera glides or animations; views change instantly" },
          { value: "full", label: "Full motion" },
        ],
        (v) => {
          setLabSettings({ motion: v });
          change("motion", v);
        },
      )}
      <fieldset className={styles.setting}>
        <legend>Narration</legend>
        <label className={styles.settingOption} data-checked={settings.narrate || undefined} data-disabled={!speech || undefined}>
          <input
            type="checkbox"
            checked={settings.narrate}
            disabled={!speech}
            onChange={(e) => {
              setLabSettings({ narrate: e.target.checked });
              change("narrate", e.target.checked);
              if (!e.target.checked) stopSpeaking();
            }}
          />
          <span>
            <span className={styles.settingLabel}>Read each step aloud when it opens</span>
            <span className={styles.settingDetail}>{speech ? "Uses your device's own voice. Every step also has a Listen button." : "This browser has no text-to-speech; the text is always on screen."}</span>
          </span>
        </label>
      </fieldset>
      <section className={styles.setting} aria-labelledby="lab-keys-title">
        <h3 id="lab-keys-title" className={styles.settingHeading}>
          Touch and keyboard
        </h3>
        <dl className={styles.keys}>
          <div>
            <dt>Drag, or arrow keys</dt>
            <dd>Rotate the model (select the model first with Tab)</dd>
          </div>
          <div>
            <dt>Pinch, scroll, or + and −</dt>
            <dd>Zoom</dd>
          </div>
          <div>
            <dt>0, or the target button</dt>
            <dd>Reset the view</dd>
          </div>
          <div>
            <dt>Tab and Enter</dt>
            <dd>Move between and use every control, including parts in the list</dd>
          </div>
          <div>
            <dt>Escape</dt>
            <dd>Close this window</dd>
          </div>
        </dl>
      </section>
      <section className={styles.setting} aria-labelledby="lab-progress-title">
        <h3 id="lab-progress-title" className={styles.settingHeading}>
          Progress
        </h3>
        <p className={styles.settingDetail}>Your progress is kept only in this browser. Nothing you do here is sent to us apart from anonymous counts of steps completed.</p>
        <button
          type="button"
          className={styles.ghost}
          onClick={() => {
            onClearProgress();
            setCleared(true);
          }}
        >
          Clear this mission&rsquo;s progress
        </button>
        <p className={styles.settingDetail} aria-live="polite">
          {cleared ? "Cleared." : ""}
        </p>
      </section>
    </div>
  );
}
