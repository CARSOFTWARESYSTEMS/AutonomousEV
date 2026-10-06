"use client";
// The five heaviest interactive modules are split into their own chunks, so the
// page's first JavaScript stays small. They are still server-rendered: their
// content is in the HTML before any of this code loads. `next/dynamic` only
// code-splits when it is called from a Client Component, hence this file.
import dynamic from "next/dynamic";
import css from "../interactive.module.css";

const loading = (label: string) =>
  function Loading() {
    return (
      <p className={css.loading} role="status">
        Loading {label}…
      </p>
    );
  };

export const QualityGraph = dynamic(() => import("./QualityGraph"), { loading: loading("the quality graph") });
export const DigitalThreadSimulator = dynamic(() => import("./DigitalThreadSimulator"), { loading: loading("the demonstration") });
export const CustomerScorecard = dynamic(() => import("./CustomerScorecard"), { loading: loading("the scorecard") });
export const RoiCalculator = dynamic(() => import("./RoiCalculator"), { loading: loading("the calculator") });
export const InspectionTwin = dynamic(() => import("./InspectionTwin"), { loading: loading("the 3D Inspection Twin") });
