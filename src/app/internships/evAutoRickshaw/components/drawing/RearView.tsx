import type { VehicleDimensions } from "@/lib/evAutoRickshaw/dimensions";
import { CentreLine, HorizontalDimension } from "./DimensionLine";

const SCALE = 0.1;
const mm = (v: number) => v * SCALE;

export function RearView({ dimensions }: { dimensions: VehicleDimensions }) {
  const widthU = mm(dimensions.overallWidthMm);
  const heightU = mm(dimensions.overallHeightMm);
  const trackU = mm(dimensions.rearTrackMm);
  const wheelDiaU = mm(dimensions.wheelDiameterMm);
  const wheelRU = wheelDiaU * 0.65; // dual/wider rear wheel footprint hint at concept level
  const clearanceU = mm(dimensions.groundClearanceMm);

  const marginTop = 22;
  const marginBottom = 34;
  const marginX = 40;

  const groundY = marginTop + heightU + 4;
  const centerX = marginX + widthU / 2;
  const wheelCenterY = groundY - wheelRU;

  const viewBoxW = marginX * 2 + widthU;
  const viewBoxH = groundY + marginBottom;

  return (
    <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="drawingSvg" role="img" aria-labelledby="rear-view-title rear-view-desc">
      <title id="rear-view-title">Rear view — General Arrangement</title>
      <desc id="rear-view-desc">Concept rear-view drawing showing overall width, rear track and passenger compartment reference.</desc>

      <line x1={0} y1={groundY} x2={viewBoxW} y2={groundY} stroke="var(--drawing-ground)" strokeWidth={0.8} />

      <rect x={marginX} y={marginTop} width={widthU} height={groundY - marginTop - clearanceU * 0.4} rx={6} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />
      <rect
        x={marginX + widthU * 0.1}
        y={marginTop + heightU * 0.55}
        width={widthU * 0.8}
        height={heightU * 0.35}
        fill="none"
        stroke="var(--drawing-hint)"
        strokeWidth={0.6}
        strokeDasharray="4 2"
      />

      <circle cx={centerX - trackU / 2} cy={wheelCenterY} r={wheelRU} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />
      <circle cx={centerX + trackU / 2} cy={wheelCenterY} r={wheelRU} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />

      <CentreLine x1={centerX} y1={groundY + 10} x2={centerX} y2={marginTop - 8} />

      <HorizontalDimension x1={marginX} x2={marginX + widthU} dimY={viewBoxH - 10} refY1={groundY - clearanceU * 0.4} label={`${dimensions.overallWidthMm} mm`} />
      <HorizontalDimension x1={centerX - trackU / 2} x2={centerX + trackU / 2} dimY={groundY + 16} refY1={wheelCenterY + wheelRU} label={`${dimensions.rearTrackMm} mm (rear track)`} />
    </svg>
  );
}
