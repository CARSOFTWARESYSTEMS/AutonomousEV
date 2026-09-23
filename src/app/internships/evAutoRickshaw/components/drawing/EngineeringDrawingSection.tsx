"use client";

import { computeVehicleDimensions, validateDimensions } from "@/lib/evAutoRickshaw/dimensions";
import { PRESETS } from "@/lib/evAutoRickshaw/defaults";
import { useMemo, useState } from "react";
import styles from "../../page.module.css";
import { Badge } from "../Badge";
import type { EvSimulator } from "../useSimulator";
import { DrawingTitleBlock } from "./DrawingTitleBlock";
import { EngineeringSpecificationBlock } from "./EngineeringSpecificationBlock";
import { FrontView } from "./FrontView";
import { RearView } from "./RearView";
import { SideView } from "./SideView";
import { TopView } from "./TopView";

const LEGEND = [
  { index: 1, label: "Traction Battery" },
  { index: 2, label: "Motor Controller" },
  { index: 3, label: "Reduction / Differential" },
  { index: 5, label: "Driver Position" },
  { index: 6, label: "Charge Port (approx.)" },
];

const MATURITY_STAGES = ["Concept GA", "Package Layout", "3D CAD", "CAE / FEA", "Prototype", "Design Validation", "Homologation", "Production Drawing"];

type MobileView = "side" | "front" | "rear" | "top" | "specs";

export function EngineeringDrawingSection({ sim }: { sim: EvSimulator }) {
  const { requirement, overrides, assumptions, outputs, preset } = sim;
  const [mobileView, setMobileView] = useState<MobileView>("side");

  const dimensions = useMemo(() => computeVehicleDimensions(overrides), [overrides]);
  const dimensionWarnings = useMemo(
    () => validateDimensions(dimensions, requirement),
    [dimensions, requirement],
  );

  const configLabel = preset === "custom" ? "Custom" : PRESETS.find((p) => p.id === preset)?.label ?? "City";

  const mobileClass = (view: MobileView) => (view === mobileView ? "" : styles.drawingPanelHiddenMobile);

  return (
    <div className={styles.drawingSheet}>
      <p className={styles.bodyTextCenter} style={{ marginBottom: "1.5rem" }}>
        Concept general-arrangement engineering drawing for a D+6 electric auto rickshaw showing proposed vehicle
        dimensions, wheelbase, ground clearance, passenger packaging, traction battery, electric powertrain,
        charging system and key engineering specifications — driven live by the same configuration as the
        simulator above, not a decorative static image.
      </p>

      <div className={styles.tagRow} style={{ justifyContent: "center", marginBottom: "1.5rem" }}>
        <Badge kind="target" label="CONCEPT / R&D — Rev 0.1" />
      </div>

      <div className={styles.drawingTabs} role="tablist" aria-label="Drawing view">
        {(["side", "front", "rear", "top", "specs"] as MobileView[]).map((view) => (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={mobileView === view}
            className={mobileView === view ? styles.drawingTabActive : styles.drawingTab}
            onClick={() => setMobileView(view)}
          >
            {view === "specs" ? "Specs" : view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.drawingGrid}>
        <div className={`${styles.drawingPanel} ${styles.drawingGridFull} ${mobileClass("side")}`}>
          <div className={styles.drawingPanelLabel}>Side View</div>
          <SideView dimensions={dimensions} passengerCapacity={requirement.passengerCapacity} />
        </div>

        <div className={`${styles.drawingPanel} ${mobileClass("front")}`}>
          <div className={styles.drawingPanelLabel}>Front View</div>
          <FrontView dimensions={dimensions} />
        </div>

        <div className={`${styles.drawingPanel} ${mobileClass("rear")}`}>
          <div className={styles.drawingPanelLabel}>Rear View</div>
          <RearView dimensions={dimensions} />
        </div>

        <div className={`${styles.drawingPanel} ${styles.drawingGridFull} ${mobileClass("top")}`}>
          <div className={styles.drawingPanelLabel}>Top View</div>
          <TopView dimensions={dimensions} passengerCapacity={requirement.passengerCapacity} />
        </div>
      </div>

      <div className={styles.drawingLegend}>
        {LEGEND.map((item) => (
          <span className={styles.drawingLegendItem} key={item.index}>
            <strong>{item.index}</strong> {item.label}
          </span>
        ))}
      </div>

      {dimensionWarnings.length > 0 ? (
        <div className={styles.warningList} style={{ marginTop: "1.5rem" }}>
          {dimensionWarnings.map((w) => (
            <div key={w.title} className={styles.warningCardCaution}>
              <div>
                <div className={styles.warningTitle}>{w.title}</div>
                <div className={styles.warningMessage}>{w.message}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className={`${mobileClass("specs")}`} style={{ marginTop: "1.5rem" }}>
        <DrawingTitleBlock configLabel={configLabel} />
        <div style={{ height: "1rem" }} />
        <EngineeringSpecificationBlock outputs={outputs} requirement={requirement} assumptions={assumptions} dimensions={dimensions} />
      </div>

      <div className={styles.utilityRow} style={{ marginTop: "1.5rem" }}>
        <button type="button" className={`${styles.linkButton} ${styles.printHide}`} onClick={() => window.print()}>
          Print Engineering Drawing
        </button>
      </div>

      <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--accent-primary)", marginTop: "2rem", marginBottom: "0.75rem" }}>
        Next Engineering Stage
      </h4>
      <p className={styles.fieldHint} style={{ marginBottom: "1rem" }}>
        This General Arrangement should later be converted into parametric CAD for chassis design, body structure,
        battery enclosure, suspension hard points, steering geometry, brake packaging, electrical routing, detailed
        passenger ergonomics, CG/axle-load analysis, FEA, and manufacturing drawings.
      </p>

      <div className={styles.flowWrap} style={{ marginBottom: "1.5rem" }}>
        {MATURITY_STAGES.map((stage, i, arr) => (
          <div className={styles.flowWrapPair} key={stage}>
            <div className={stage === "Concept GA" ? styles.flowWrapStepCurrent : styles.flowWrapStep} style={{ minWidth: "auto", fontSize: "0.74rem" }}>
              {stage}
            </div>
            {i < arr.length - 1 ? <span className={styles.flowWrapArrow}>→</span> : null}
          </div>
        ))}
      </div>

      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          <strong>Concept Engineering Drawing — Not for Manufacturing.</strong> Dimensions, packaging, masses and
          specifications shown are preliminary engineering targets or simulator outputs. Final design requires
          detailed CAD, component selection, tolerance analysis, structural and thermal validation, vehicle
          dynamics analysis, prototype testing and applicable regulatory homologation.
        </p>
      </div>
    </div>
  );
}
