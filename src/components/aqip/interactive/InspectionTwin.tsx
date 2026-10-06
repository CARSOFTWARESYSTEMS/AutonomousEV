"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentType } from "react";
import { Check, CircleDashed, Clock, FileWarning, GitCompareArrows, X, type LucideIcon } from "lucide-react";
import { getWebGLSupport } from "@/components/satellite-explorer/lib/capabilities";
import { trackAqip } from "../analytics";
import {
  CERTAINTY,
  DEFAULT_FEATURE,
  FEATURES,
  FEATURE_BY_ID,
  GEOMETRY,
  HIGHLIGHTS,
  INSPECTION_FIELDS,
  STATUS,
  STATUS_LEGEND,
  TWIN,
  TWIN_MODES,
  TWIN_PART,
  isHighlighted,
  reconstructionConfidence,
  type FeatureStatus,
  type Highlight,
  type StatusFamily,
  type TwinFeature,
  type TwinMode,
} from "../data/twin";
import { ISO, ISO_BALLOONS, ISO_SCENES, PART, type StandardView } from "./twin/model";
import type { TwinApi, TwinCanvasProps } from "./twin/TwinCanvas";
import css from "../twin.module.css";

const STATUS_ICON: Record<FeatureStatus, LucideIcon> = {
  pass: Check,
  fail: X,
  pending: Clock,
  "evidence-missing": FileWarning,
  "revision-impacted": GitCompareArrows,
  "not-inspected": CircleDashed,
};

/** A status as an icon and its wording, in its colour family. Never colour alone. */
function StatusMark({ status }: { status: FeatureStatus }) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={css.status} data-family={STATUS[status].family}>
      <Icon size={14} aria-hidden="true" />
      {STATUS[status].label}
    </span>
  );
}

type SelectSource = "sheet" | "model" | "list";
type ControlId = "rotate" | "rotate_back" | "zoom_in" | "zoom_out" | "fit" | "reset" | "pan" | "isolate" | "section" | "balloons" | "dimensions" | "feature_list" | `view_${StandardView}` | `highlight_${Highlight}`;

// ── The 2D sheet: front and top views and Section A-A, drawn from the part's dimensions ──

const SHEET = { width: 420, height: 320, scale: 1.4 } as const;
const tidy = (value: number) => Math.round(value * 10) / 10;
/** Front view (x, z), top view (x, y) with the rear of the part uppermost, and the section (y, z) looking towards the left end. */
const fx = (x: number) => tidy(44 + SHEET.scale * x);
const fz = (z: number) => tidy(40 + SHEET.scale * (PART.height - z));
const ty = (y: number) => tidy(150 + SHEET.scale * (PART.depth - y));
const sy = (y: number) => tidy(262 + SHEET.scale * y);
const mm = (value: number) => tidy(SHEET.scale * value);

/** Where each balloon sits on the sheet, and the point on the drawing its leader runs to. */
const SHEET_BALLOONS: Record<string, { at: readonly [number, number]; to: readonly [number, number] }> = {
  b7: { at: [64, 296], to: [84, 278] },
  b9: { at: [404, 96], to: [388, fz(5)] },
  b12: { at: [198, 250], to: [fx(PART.hole12.x) + 5, ty(PART.hole12.y) + 5] },
  b13: { at: [58, 250], to: [fx(PART.hole13.x) - 5, ty(PART.hole13.y) + 5] },
  b18: { at: [fx(PART.slot.x), 254], to: [fx(PART.slot.x), ty(PART.slot.y) + mm(PART.slot.r)] },
  b17: { at: [56, 56], to: [fx(PART.hole17.x) - 3, fz(PART.hole17.z) - 3] },
  b25: { at: [186, 54], to: [fx(PART.pocket.x1), fz(PART.pocket.z1)] },
  b21: { at: [404, 178], to: [372, 182] },
};

const ZONE_ROWS = ["D", "C", "B", "A"] as const;
const ZONE_COLUMNS = [6, 5, 4, 3, 2, 1] as const;

function Sheet({ selected, onSelect }: { selected: string; onSelect: (id: string, source: SelectSource) => void }) {
  const { hole12, hole13, slot, hole17, pocket, flange, webFront, pocketFloor, length, depth, height, sectionX } = PART;
  const hidden = (x: number, r: number, from: number, to: number) => `M${fx(x - r)} ${from} V${to} M${fx(x + r)} ${from} V${to}`;
  return (
    <div className={css.sheet} role="group" aria-label="2D drawing of the synthetic part. Select a balloon to find its feature on the 3D model.">
      <svg className={css.sheetSvg} viewBox={`0 0 ${SHEET.width} ${SHEET.height}`} aria-hidden="true" focusable="false">
        <rect x="6" y="6" width={SHEET.width - 12} height={SHEET.height - 12} className={css.sheetBorder} />
        {/* Zone references round the border: letters up the side, numbers along the top, as the characteristic records cite them. */}
        <g className={css.sheetZone}>
          {ZONE_ROWS.map((row, i) => (
            <text key={row} x="12" y={i * 80 + 44}>
              {row}
            </text>
          ))}
          {ZONE_COLUMNS.map((column, i) => (
            <text key={column} x={i * 70 + 35} y="17" textAnchor="middle">
              {column}
            </text>
          ))}
        </g>

        {/* Front view. */}
        <g className={css.sheetPart}>
          <rect x={fx(0)} y={fz(height)} width={mm(length)} height={mm(height)} />
          <path d={`M${fx(0)} ${fz(flange)} H${fx(length)}`} />
          <rect x={fx(pocket.x0)} y={fz(pocket.z1)} width={mm(pocket.x1 - pocket.x0)} height={mm(pocket.z1 - pocket.z0)} />
          <circle cx={fx(hole17.x)} cy={fz(hole17.z)} r={mm(hole17.r)} />
        </g>
        <path className={css.sheetHidden} d={`${hidden(hole12.x, hole12.r, fz(flange), fz(0))} ${hidden(hole13.x, hole13.r, fz(flange), fz(0))} ${hidden(slot.x, slot.half + slot.r, fz(flange), fz(0))}`} />

        {/* Top view, with the cutting plane of Section A-A. */}
        <g className={css.sheetPart}>
          <rect x={fx(0)} y={ty(depth)} width={mm(length)} height={mm(depth)} />
          <path d={`M${fx(0)} ${ty(webFront)} H${fx(length)}`} />
          <circle cx={fx(hole12.x)} cy={ty(hole12.y)} r={mm(hole12.r)} />
          <circle cx={fx(hole13.x)} cy={ty(hole13.y)} r={mm(hole13.r)} />
          <rect x={fx(slot.x - slot.half - slot.r)} y={ty(slot.y + slot.r)} width={mm(2 * (slot.half + slot.r))} height={mm(2 * slot.r)} rx={mm(slot.r)} />
        </g>
        <path
          className={css.sheetHidden}
          d={`M${fx(pocket.x0)} ${ty(webFront)} V${ty(pocketFloor)} H${fx(pocket.x1)} V${ty(webFront)} ${hidden(hole17.x, hole17.r, ty(depth), ty(webFront))}`}
        />
        <path className={css.sheetCut} d={`M${fx(sectionX)} ${ty(depth) - 10} V${ty(0) + 10}`} />

        {/* Section A-A: the flange either side of the hole, and the web. */}
        <g className={css.sheetSection}>
          <rect x={sy(0)} y={fz(flange)} width={mm(hole12.y - hole12.r)} height={mm(flange)} />
          <rect x={sy(hole12.y + hole12.r)} y={fz(flange)} width={mm(depth - hole12.y - hole12.r)} height={mm(flange)} />
          <rect x={sy(webFront)} y={fz(height)} width={mm(depth - webFront)} height={mm(height - flange)} />
        </g>
        <path className={css.sheetPart} d={`M${sy(0)} ${fz(0)} H${sy(depth)} V${fz(height)} H${sy(webFront)} V${fz(flange)} H${sy(0)} Z M${sy(hole12.y - hole12.r)} ${fz(flange)} V${fz(0)} M${sy(hole12.y + hole12.r)} ${fz(flange)} V${fz(0)}`} />

        {/* Two dimensions, the notes and the title block. */}
        <path className={css.sheetDim} d={`M${fx(0)} 278 H${fx(length)} M${fx(0)} 272 V284 M${fx(length)} 272 V284 M388 ${fz(flange)} V${fz(0)} M382 ${fz(flange)} H394 M382 ${fz(0)} H394`} />
        <g className={css.sheetText}>
          <text x={fx(0)} y="34">
            FRONT
          </text>
          <text x={fx(0)} y="144">
            TOP
          </text>
          <text x={sy(0)} y="34">
            SECTION A-A
          </text>
          <text x={fx(sectionX) + 4} y={ty(depth) - 4}>
            A
          </text>
          <text x={fx(sectionX) + 4} y={ty(0) + 14}>
            A
          </text>
          <text x={fx(length / 2)} y="292" textAnchor="middle">
            120.00 ±0.10
          </text>
          <text x="262" y="160">
            NOTES
          </text>
          <text x="262" y="174">
            1–3. SEE SHEET 1
          </text>
          <text x="262" y="186">
            4. CHAMFER 2 × 45°
          </text>
        </g>
        <path className={css.sheetBorder} d="M262 252 H408 V306 H262 Z M262 279 H408 M335 252 V306" />
        <g className={css.sheetText}>
          <text x="268" y="270">
            PART AQ-1042
          </text>
          <text x="341" y="270">
            REV C
          </text>
          <text x="268" y="297">
            SYNTHETIC
          </text>
          <text x="341" y="297">
            SHEET 2/2
          </text>
        </g>

        {FEATURES.map((feature) => {
          const { at, to } = SHEET_BALLOONS[feature.id];
          return <path key={feature.id} className={css.sheetLeader} data-selected={feature.id === selected ? "" : undefined} d={`M${to[0]} ${to[1]} L${at[0]} ${at[1]}`} />;
        })}
      </svg>
      {FEATURES.map((feature) => {
        const [x, y] = SHEET_BALLOONS[feature.id].at;
        return (
          <button
            key={feature.id}
            type="button"
            className={css.sheetBalloon}
            style={{ left: `${tidy((x / SHEET.width) * 100)}%`, top: `${tidy((y / SHEET.height) * 100)}%` }}
            aria-pressed={feature.id === selected}
            aria-label={`Balloon ${feature.balloon} on the drawing: ${feature.feature}`}
            onClick={() => onSelect(feature.id, "sheet")}
          >
            {feature.balloon}
          </button>
        );
      })}
    </div>
  );
}

// ── The fixed isometric view: what the server sends, and what stays when WebGL cannot run ──

interface OverlayProps {
  mode: TwinMode;
  selected: string;
  tints: Readonly<Record<string, StatusFamily | null>>;
  isolate: boolean;
  showBalloons: boolean;
}

function IsoView({ mode, selected, tints, isolate, showBalloons }: OverlayProps) {
  const scene = ISO_SCENES[mode];
  return (
    <svg className={css.iso} viewBox={`0 0 ${ISO.width} ${ISO.height}`} data-isolate={isolate ? "" : undefined} aria-hidden="true" focusable="false">
      <g className={css.isoBody}>
        {scene.faces.map((face, i) => (
          <path key={i} d={face.d} data-face={face.id} />
        ))}
        {scene.voids.map((d, i) => (
          <path key={i} d={d} data-face="void" />
        ))}
        <path d={scene.pocketWalls} data-face="wall" />
        <path d={scene.pocketFloor} data-face="floor" />
      </g>
      {scene.unresolved ? <path className={css.isoUnresolved} d={scene.unresolved} /> : null}
      {FEATURES.map((feature) => {
        const d = scene.marks[feature.id];
        const chosen = feature.id === selected;
        if (!d || (!chosen && (isolate || !tints[feature.id]))) return null;
        return <path key={feature.id} className={css.isoMark} d={d} fillRule="evenodd" data-family={chosen ? "selected" : tints[feature.id]} />;
      })}
      {showBalloons ? FEATURES.map((feature) => <path key={feature.id} className={css.isoLeader} d={ISO_BALLOONS[feature.id].leader} />) : null}
    </svg>
  );
}

// ── The viewer ──

/**
 * Where the interactive view has got to. three.js and the scene are their own
 * chunk, fetched with a plain import() at the moment they are wanted, so the
 * page's first load carries none of it and nothing preloads it.
 */
type Engine = { state: "idle" | "offered" | "unavailable" } | { state: "loading" | "live"; Canvas: ComponentType<TwinCanvasProps> | null; simple: boolean; reducedMotion: boolean };

const FIELD_VALUE: Record<(typeof INSPECTION_FIELDS)[number]["key"], (feature: TwinFeature) => string> = {
  requirement: (feature) => feature.requirement,
  source: (feature) => `${feature.sheet} • ${feature.zone}`,
  gdt: (feature) => feature.gdt,
  method: (feature) => feature.method,
  equipment: (feature) => feature.equipment,
  measured: (feature) => feature.measured,
  evidence: (feature) => feature.evidence,
  verification: (feature) => feature.verification,
  fai: (feature) => feature.fai,
};

const VIEWS: readonly { id: StandardView; label: string }[] = [
  { id: "iso", label: "Iso" },
  { id: "front", label: "Front" },
  { id: "top", label: "Top" },
  { id: "side", label: "Side" },
];

const CONFIDENCE = reconstructionConfidence();
const ACCOUNTED = FEATURES.filter((feature) => feature.status === "pass").length;

/**
 * The 3D Inspection Twin, as a demonstration on a synthetic part. A balloon on
 * the 2D drawing, the same balloon on the model and its row in the list are one
 * selection: choosing any of them lights the feature, moves the camera to it
 * and opens its record. Phones get the model, a short row of actions, the
 * record and the list; wide screens add the drawing and the full toolbar.
 */
export default function InspectionTwin() {
  const uid = useId();
  const [selected, setSelected] = useState(DEFAULT_FEATURE);
  const [mode, setMode] = useState<TwinMode>("reconstruction");
  const [highlight, setHighlight] = useState<Highlight>("status");
  const [showBalloons, setShowBalloons] = useState(true);
  const [showDimensions, setShowDimensions] = useState(false);
  const [isolate, setIsolate] = useState(false);
  const [section, setSection] = useState(false);
  const [pan, setPan] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [engine, setEngine] = useState<Engine>({ state: "idle" });

  const viewport = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TwinApi | null>(null);
  const balloonsRef = useRef(new Map<string, HTMLElement>());

  const feature = FEATURE_BY_ID.get(selected) ?? FEATURES[0];
  const modeInfo = TWIN_MODES.find((item) => item.id === mode) ?? TWIN_MODES[0];
  const live = engine.state === "live";
  const TwinCanvas = engine.state === "loading" || engine.state === "live" ? engine.Canvas : null;
  const tints = useMemo(() => Object.fromEntries(FEATURES.map((item) => [item.id, isHighlighted(item, highlight) ? STATUS[item.status].family : null])), [highlight]);

  const start = useCallback(() => {
    if (!getWebGLSupport().supported) {
      setEngine({ state: "unavailable" });
      trackAqip("aqip_twin_view", { view: "isometric" });
      return;
    }
    setEngine({ state: "loading", Canvas: null, simple: window.matchMedia("(pointer: coarse)").matches, reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    import("./twin/TwinCanvas").then(
      (module) => setEngine((current) => (current.state === "loading" ? { ...current, Canvas: module.default } : current)),
      // The chunk did not arrive: the isometric view is already there.
      () => setEngine({ state: "unavailable" }),
    );
  }, []);

  // The 3D view is asked for only when the viewer is about to come on screen, and not at all for a reader saving data.
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const saving = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
        if (saving) setEngine({ state: "offered" });
        else start();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [start]);

  const onReady = useCallback(() => {
    setEngine((current) => (current.state === "loading" ? { ...current, state: "live" } : current));
    trackAqip("aqip_twin_view", { view: "webgl" });
  }, []);
  // A lost context: the isometric view takes its place rather than leaving a blank.
  const onLost = useCallback(() => {
    setEngine({ state: "unavailable" });
    setSection(false);
    setPan(false);
  }, []);

  const select = useCallback((id: string, source: SelectSource) => {
    setSelected(id);
    trackAqip("aqip_twin_feature_select", { feature: id, source });
  }, []);
  const selectOnModel = useCallback((id: string) => select(id, "model"), [select]);

  /** Every toolbar button comes through here, so each is reported the same way. */
  const control = (id: ControlId) => {
    const camera = apiRef.current;
    if (id === "rotate") camera?.rotate(-45);
    else if (id === "rotate_back") camera?.rotate(45);
    else if (id === "zoom_in") camera?.zoom(1.3);
    else if (id === "zoom_out") camera?.zoom(1 / 1.3);
    else if (id === "fit") camera?.fit();
    else if (id === "pan") setPan(!pan);
    else if (id === "isolate") setIsolate(!isolate);
    else if (id === "section") setSection(!section);
    else if (id === "balloons") setShowBalloons(!showBalloons);
    else if (id === "dimensions") setShowDimensions(!showDimensions);
    else if (id === "feature_list") setListOpen(!listOpen);
    else if (id === "reset") {
      camera?.reset();
      setIsolate(false);
      setSection(false);
      setPan(false);
      setHighlight("status");
    } else if (id.startsWith("view_")) camera?.view(id.slice(5) as StandardView);
    else if (id.startsWith("highlight_")) setHighlight(id.slice(10) as Highlight);
    trackAqip("aqip_twin_control", { control: id });
  };

  // One callback for every balloon: it files the button under its feature, and takes it out again on unmount.
  const register = useCallback((element: HTMLButtonElement) => {
    const elements = balloonsRef.current;
    const id = element.dataset.feature ?? "";
    elements.set(id, element);
    return () => {
      elements.delete(id);
    };
  }, []);

  const listId = `${uid}-features`;
  const noteId = `${uid}-note`;

  return (
    <div className={css.twin} data-live={live ? "" : undefined}>
      <div className={css.modeBar}>
        <div className={css.modes} role="group" aria-label="Where the geometry comes from">
          {TWIN_MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={css.mode}
              aria-pressed={mode === item.id}
              onClick={() => {
                setMode(item.id);
                trackAqip("aqip_twin_mode", { mode: item.id });
              }}
            >
              <span className={css.modeCode}>{item.code}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
        <p className={css.modeSource} aria-live="polite">
          {modeInfo.source}
          {mode === "cad" ? " Simulated here: no customer model is loaded." : null}
        </p>
      </div>

      <div className={css.stage}>
        <Sheet selected={selected} onSelect={select} />

        <div className={css.viewer}>
          <div className={css.frame}>
            <div ref={viewport} className={css.viewport} role="group" aria-label={`3D model of part ${TWIN_PART.part}, Revision ${TWIN_PART.revision}`} aria-describedby={noteId}>
              <IsoView mode={mode} selected={selected} tints={tints} isolate={isolate} showBalloons={showBalloons} />
              {TwinCanvas && (engine.state === "loading" || engine.state === "live") ? (
                <div className={css.canvas}>
                  <TwinCanvas
                    label={`Interactive 3D view of the synthetic bracket ${TWIN_PART.part}. Every feature is also listed beside it.`}
                    mode={mode}
                    selected={selected}
                    tints={tints}
                    showBalloons={showBalloons}
                    isolate={isolate}
                    section={section}
                    pan={pan}
                    simple={engine.simple}
                    reducedMotion={engine.reducedMotion}
                    apiRef={apiRef}
                    balloonsRef={balloonsRef}
                    onSelect={selectOnModel}
                    onReady={onReady}
                    onLost={onLost}
                  />
                </div>
              ) : null}
              {FEATURES.map((item) => {
                const position = ISO_BALLOONS[item.id];
                const tint = tints[item.id];
                const chosen = item.id === selected;
                const Icon = STATUS_ICON[item.status];
                return (
                  <button
                    key={item.id}
                    ref={register}
                    type="button"
                    className={css.balloon}
                    data-feature={item.id}
                    style={{ left: `${position.left}%`, top: `${position.top}%` }}
                    data-left={`${position.left}%`}
                    data-top={`${position.top}%`}
                    data-family={tint ?? "off"}
                    data-dim={!chosen && (isolate || !tint) ? "" : undefined}
                    data-unresolved={mode === "reconstruction" && item.geometry === "g-chamfer" ? "" : undefined}
                    hidden={!showBalloons}
                    aria-pressed={chosen}
                    aria-label={`Balloon ${item.balloon}: ${item.feature}, ${STATUS[item.status].label}`}
                    onClick={() => select(item.id, "model")}
                  >
                    <span className={css.balloonNo}>{item.balloon}</span>
                    {highlight === "status" ? <Icon size={12} aria-hidden="true" /> : null}
                    {showDimensions ? <span className={css.balloonDim}>{item.requirement}</span> : null}
                  </button>
                );
              })}
              {engine.state === "offered" ? (
                <button type="button" className={css.load} onClick={start}>
                  Load interactive 3D
                </button>
              ) : null}
            </div>
            {/* Under the model, in the same frame, whichever way the model is drawn. */}
            <p className={css.disclaimer}>{TWIN.disclaimer}</p>
          </div>
          <p id={noteId} className={css.viewNote} aria-live="polite">
            {live
              ? "Drag to rotate. Pinch, or Ctrl + scroll, to zoom. Shift-drag or two fingers to pan. Every action also has a button below."
              : engine.state === "unavailable"
                ? "Interactive 3D is not available on this device, so a fixed isometric view is shown. Every feature, status and record below works the same way."
                : engine.state === "offered"
                  ? "A fixed isometric view is shown because this browser asks to save data."
                  : "A fixed isometric view. The interactive model loads as this section comes into view."}
          </p>

          <div className={css.toolbar} role="toolbar" aria-label="3D viewer controls">
            <div className={css.tools} role="group" aria-label="View">
              <button type="button" className={css.tool} data-phone="" disabled={!live} onClick={() => control("rotate")}>
                Rotate
              </button>
              <button type="button" className={css.tool} disabled={!live} onClick={() => control("rotate_back")}>
                Rotate back
              </button>
              <button type="button" className={css.tool} disabled={!live} onClick={() => control("zoom_in")}>
                Zoom in
              </button>
              <button type="button" className={css.tool} disabled={!live} onClick={() => control("zoom_out")}>
                Zoom out
              </button>
              <button type="button" className={css.tool} disabled={!live} onClick={() => control("fit")}>
                Fit
              </button>
              <button type="button" className={css.tool} data-phone="" onClick={() => control("reset")}>
                Reset
              </button>
            </div>
            <div className={css.tools} role="group" aria-label="Standard views">
              {VIEWS.map((view) => (
                <button key={view.id} type="button" className={css.tool} disabled={!live} onClick={() => control(`view_${view.id}`)}>
                  {view.label}
                </button>
              ))}
            </div>
            <div className={css.tools} role="group" aria-label="Tools">
              <button type="button" className={css.tool} aria-pressed={pan} disabled={!live} onClick={() => control("pan")}>
                Pan
              </button>
              <button type="button" className={css.tool} aria-pressed={isolate} onClick={() => control("isolate")}>
                Isolate feature
              </button>
              <button type="button" className={css.tool} aria-pressed={section} disabled={!live} onClick={() => control("section")}>
                Section view
              </button>
            </div>
            <div className={css.tools} role="group" aria-label="Show">
              <button type="button" className={css.tool} data-phone="" aria-pressed={showBalloons} onClick={() => control("balloons")}>
                <span className={css.phoneOnly}>Show balloons</span>
                <span className={css.wideOnly}>Balloons</span>
              </button>
              <button type="button" className={css.tool} aria-pressed={showDimensions} onClick={() => control("dimensions")}>
                Dimensions
              </button>
              <button type="button" className={`${css.tool} ${css.phoneOnly}`} data-phone="" aria-expanded={listOpen} aria-controls={listId} onClick={() => control("feature_list")}>
                Feature list
              </button>
            </div>
            <div className={css.tools} role="group" aria-label="Highlight">
              {HIGHLIGHTS.map((item) => (
                <button key={item.id} type="button" className={css.tool} aria-pressed={highlight === item.id} title={item.note} onClick={() => control(`highlight_${item.id}`)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <ul className={css.legend} aria-label="What the overlay colours mean">
            {STATUS_LEGEND.map((item) => (
              <li key={item.family} data-family={item.family}>
                <span className={css.swatch} aria-hidden="true" />
                <span>
                  <strong>{item.colour}</strong> {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={css.detail}>
        <div className={css.panel} role="group" aria-live="polite" aria-label="Inspection Mode: the selected feature">
          <p className={css.panelEyebrow}>Inspection Mode</p>
          <h4 className={css.panelTitle}>
            Balloon {feature.balloon} · {feature.feature}
          </h4>
          <p className={css.panelMeta}>
            <StatusMark status={feature.status} />
            {feature.ctq ? <span className={css.ctq}>CTQ</span> : null}
            <span className={css.charId}>{feature.characteristic}</span>
          </p>
          <dl className={css.fields}>
            {INSPECTION_FIELDS.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <dd>{FIELD_VALUE[field.key](feature)}</dd>
              </div>
            ))}
          </dl>
          {feature.note ? <p className={css.featureNote}>{feature.note}</p> : null}
        </div>

        <div className={css.panel} role="group" aria-label="Visual FAI: every characteristic shown">
          <p className={css.panelEyebrow}>Visual FAI</p>
          <h4 className={css.panelTitle}>Move through the part, characteristic by characteristic</h4>
          <p className={css.panelText}>
            {ACCOUNTED} of {FEATURES.length} characteristics accounted for. {TWIN_PART.article}.
          </p>
          <ol id={listId} className={css.features} data-open={listOpen ? "" : undefined}>
            {FEATURES.map((item) => (
              <li key={item.id}>
                <button type="button" className={css.feature} aria-pressed={item.id === selected} onClick={() => select(item.id, "list")}>
                  <span className={css.featureNo}>{item.balloon}</span>
                  <span className={css.featureName}>
                    {item.feature}
                    <span className={css.featureReq}>{item.requirement}</span>
                  </span>
                  <StatusMark status={item.status} />
                </button>
              </li>
            ))}
          </ol>
          <p className={css.panelFine}>{TWIN_PART.shown}</p>
        </div>

        <div className={css.panel} role="group" aria-label="Geometry confidence">
          <p className={css.panelEyebrow}>Geometry confidence</p>
          {mode === "reconstruction" ? (
            <>
              <h4 className={css.panelTitle}>
                Overall reconstruction: <span className={css.figure}>{CONFIDENCE.percent}%</span>
              </h4>
              <p className={css.panelText}>
                {CONFIDENCE.resolved} of {CONFIDENCE.total} geometry elements are resolved from the supplied views, {CONFIDENCE.medium} is medium and {CONFIDENCE.unresolved} is unresolved. The figure is the average of those levels, rounded
                down. It guides review effort; it is not a tolerance and not an approval.
              </p>
              <ul className={css.elements}>
                {GEOMETRY.map((element) => (
                  <li key={element.id} data-certainty={element.certainty} data-current={element.id === feature.geometry ? "" : undefined}>
                    <span className={css.elementName}>{element.name}</span>
                    <span className={css.certainty}>{CERTAINTY[element.certainty].label}</span>
                    <span className={css.elementBasis}>{element.basis}</span>
                    {element.assumption ? (
                      <span className={css.assumption}>
                        <strong>Assumption:</strong> {element.assumption}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className={css.panelFine}>The candidate stays a candidate until an engineer confirms, edits or marks each open item. {TWIN.authority}</p>
            </>
          ) : (
            <>
              <h4 className={css.panelTitle}>Not applicable: nothing is inferred</h4>
              <p className={css.panelText}>
                With approved CAD the geometry is the customer&apos;s own model, so there is no reconstruction to score. The rear chamfer is on the model, on the edge the designer chose. What a person still verifies is the mapping of each balloon to
                its feature.
              </p>
              <p className={css.panelFine}>This demonstration draws the part itself; it does not read a CAD file.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
