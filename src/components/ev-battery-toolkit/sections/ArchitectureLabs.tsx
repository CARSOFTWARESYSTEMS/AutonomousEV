"use client";
// Fixed / Swappable / Traditional architectures. The fixed lab shows the
// service concept without inventing any OEM fastener sequence; the swappable
// lab simulates correct and incorrect swaps with clear, safe guidance.
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { ARCHITECTURES, ARCHITECTURE_ORDER } from "@/data/ev-battery-toolkit/architectures";
import { FIXED_LAB, FIXED_REMOVAL_NOTE, SWAP_LAB, SWAP_SCENARIOS, type SwapScenarioId } from "@/data/ev-battery-toolkit/content";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import type { ArchitectureId } from "@/lib/ev-battery-toolkit/types";
import { scrollToAndFocus } from "../state/device";
import { useToolkit } from "../state/store";
import { Pill, SafetyBanner } from "../ui/Badges";
import { startWorkspace } from "../workspace/Workspace";
import css from "../toolkit.module.css";

function SwapDiagram({ scenario }: { scenario: SwapScenarioId }) {
  const seated = scenario === "normal" || scenario === "removal-active" || scenario === "damaged-connector";
  const offsetY = scenario === "incomplete-engagement" ? -18 : scenario === "incorrect-insertion" ? -8 : 0;
  const tilt = scenario === "incorrect-insertion" ? -7 : 0;
  const pinColor = scenario === "damaged-connector" ? "#ef4444" : seated ? "#6ee7b7" : "#fbbf24";
  return (
    <svg viewBox="0 0 260 200" className={css.swapSvg} role="img" aria-label="Seat bay with a removable battery, its guide rails and connector">
      <rect x={60} y={30} width={140} height={150} rx={8} className={css.svgBay} />
      <line x1={78} y1={40} x2={78} y2={172} className={css.svgRail} />
      <line x1={182} y1={40} x2={182} y2={172} className={css.svgRail} />
      <g transform={`translate(0 ${offsetY}) rotate(${tilt} 130 110)`}>
        <rect x={86} y={56} width={88} height={110} rx={8} className={css.svgPack} />
        <path d="M112 56 Q130 34 148 56" className={css.svgHandle} />
        <rect x={116} y={160} width={28} height={8} rx={2} fill={pinColor} />
      </g>
      <rect x={112} y={170} width={36} height={8} rx={2} className={css.svgSocket} />
      <circle cx={196} cy={60} r={6} fill={scenario === "normal" ? "#6ee7b7" : scenario === "removal-active" ? "#ef4444" : "#fbbf24"} />
      <text x={186} y={46} className={css.svgTiny}>
        Interlock
      </text>
    </svg>
  );
}

export default function ArchitectureLabs() {
  const [tab, setTab] = useState<ArchitectureId>("fixed-floor");
  const [scenario, setScenario] = useState<SwapScenarioId>("normal");
  const setArchitecture = useToolkit((s) => s.setArchitecture);
  const owner = useToolkit((s) => s.audience === "owner");
  const current = SWAP_SCENARIOS.find((s) => s.id === scenario)!;
  const arch = ARCHITECTURES[tab];

  const choose = (id: ArchitectureId) => {
    setTab(id);
    if (id === "fixed-floor") trackToolkit("fixed_battery_selected");
    if (id === "swappable") trackToolkit("swappable_battery_selected");
  };

  return (
    <div>
      <div className={css.archTabs} role="tablist" aria-label="Battery architecture">
        {ARCHITECTURE_ORDER.map((id, i) => (
          <button key={id} type="button" role="tab" id={`arch-${id}`} aria-selected={tab === id} aria-controls="arch-panel" className={css.archTab} onClick={() => choose(id)}>
            <span className={css.archLetter}>{String.fromCharCode(65 + i)}</span>
            {ARCHITECTURES[id].name}
          </button>
        ))}
      </div>
      <div id="arch-panel" role="tabpanel" aria-labelledby={`arch-${tab}`} className={css.archPanel}>
        <div className={css.archSummary}>
          <p>{arch.summary}</p>
          <dl className={css.archFacts}>
            <div>
              <dt>Location</dt>
              <dd>{arch.location === "floor" ? "Floorboard" : arch.location === "under-seat" ? "Seat bay" : "Under floor / boot"}</dd>
            </div>
            <div>
              <dt>Removal</dt>
              <dd>{arch.removal}</dd>
            </div>
            <div>
              <dt>Modules (concept)</dt>
              <dd>{arch.modules}</dd>
            </div>
            <div>
              <dt>BMS position</dt>
              <dd>{arch.bmsPosition}</dd>
            </div>
          </dl>
          <p className={css.fine}>{arch.serviceability}</p>
          <button
            type="button"
            className={css.textButton}
            onClick={() => {
              setArchitecture(tab);
              startWorkspace("architecture_lab");
              scrollToAndFocus("explorer");
            }}
          >
            Open this architecture in the 3D explorer <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

        {owner && tab !== "swappable" ? (
          <div className={css.lab}>
            <p className={css.notice}>
              Workshop only. Removing or opening a fixed or serviceable battery is work for trained technicians following the manufacturer&apos;s procedure. As an owner, book a professional inspection.
            </p>
          </div>
        ) : tab === "swappable" ? (
          <div className={css.lab}>
            <ol className={css.labSteps} aria-label="Removable / swappable battery service steps">
              {SWAP_LAB.map((s, i) => (
                <li key={s.id}>
                  <span className={css.labIndex}>{i + 1}</span>
                  <span>
                    <strong>{s.title}</strong> {s.text}
                  </span>
                </li>
              ))}
            </ol>
            <div className={css.swapSim}>
              <p className={css.panelLabel}>Swap simulator</p>
              <div className={css.chipRow} role="group" aria-label="Swap scenario">
                {SWAP_SCENARIOS.map((s) => (
                  <button key={s.id} type="button" className={css.chipButton} aria-pressed={scenario === s.id} onClick={() => setScenario(s.id)}>
                    {s.name}
                  </button>
                ))}
              </div>
              <SwapDiagram scenario={scenario} />
              <p className={css.swapResult} aria-live="polite">
                <Pill family={current.tone === "ok" ? "ok" : current.tone === "warning" ? "warning" : "critical"}>{current.tone === "ok" ? "Verified" : current.tone === "warning" ? "Warning" : "Stop"}</Pill> {current.result}
              </p>
              {current.tone === "critical" ? <SafetyBanner level="stop" title="STOP">{<p className={css.safetyText}>{current.guidance}</p>}</SafetyBanner> : <p className={css.muted}>{current.guidance}</p>}
            </div>
          </div>
        ) : tab === "fixed-floor" ? (
          <div className={css.lab}>
            <ol className={css.labSteps} aria-label="Fixed battery service concept">
              {FIXED_LAB.map((s, i) => (
                <li key={s.id}>
                  <span className={css.labIndex}>{i + 1}</span>
                  <span>
                    <strong>{s.title}</strong> {s.text}
                  </span>
                </li>
              ))}
            </ol>
            <p className={css.notice}>{FIXED_REMOVAL_NOTE}</p>
          </div>
        ) : (
          <div className={css.lab}>
            <ul className={css.labSteps} aria-label="Traditional serviceable pack features">
              <li>
                <span className={css.labIndex}>1</span>
                <span>
                  <strong>Case and leads</strong> Metal or ABS case with separate charge and discharge leads, common in 60–72 V class scooter packs.
                </span>
              </li>
              <li>
                <span className={css.labIndex}>2</span>
                <span>
                  <strong>Accessible BMS</strong> The BMS is often reachable for status and communication checks after workshop opening.
                </span>
              </li>
              <li>
                <span className={css.labIndex}>3</span>
                <span>
                  <strong>Modules and groups</strong> Module and cell-group work is possible at Advanced Battery Repair depth, with the right training and equipment.
                </span>
              </li>
            </ul>
            <p className={css.notice}>{FIXED_REMOVAL_NOTE}</p>
          </div>
        )}
      </div>
    </div>
  );
}
