import type { VehicleDimensions } from "@/lib/evAutoRickshaw/dimensions";
import { CentreLine, HorizontalDimension, VerticalDimension } from "./DimensionLine";

const SCALE = 0.1;
const mm = (v: number) => v * SCALE;

export function FrontView({ dimensions }: { dimensions: VehicleDimensions }) {
  const widthU = mm(dimensions.overallWidthMm);
  const heightU = mm(dimensions.overallHeightMm);
  const trackU = mm(dimensions.frontTrackMm);
  const wheelDiaU = mm(dimensions.wheelDiameterMm);
  const wheelRU = wheelDiaU / 2;
  const clearanceU = mm(dimensions.groundClearanceMm);

  const marginTop = 22;
  const marginBottom = 34;
  const marginX = 40;
  // The right-side vertical height dimension needs its own clearance beyond
  // marginX, or its label chip gets clipped by the viewBox edge (a real bug
  // found from an actual screenshot — "1850 mm" was rendering as "1850"
  // with the unit cut off).
  const marginRight = 70;

  const groundY = marginTop + heightU + 4;
  const centerX = marginX + widthU / 2;
  const wheelCenterY = groundY - wheelRU;

  const viewBoxW = marginX + widthU + marginRight;
  const viewBoxH = groundY + marginBottom;

  return (
    <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="drawingSvg" role="img" aria-labelledby="front-view-title front-view-desc">
      <title id="front-view-title">Front view — General Arrangement</title>
      <desc id="front-view-desc">Concept front-view drawing showing overall width, overall height, front track and ground clearance reference.</desc>

      <line x1={0} y1={groundY} x2={viewBoxW} y2={groundY} stroke="var(--drawing-ground)" strokeWidth={0.8} />

      <rect x={marginX} y={marginTop} width={widthU} height={groundY - marginTop - clearanceU * 0.4} rx={6} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />
      {/* Windscreen hint */}
      <line x1={marginX + widthU * 0.15} y1={marginTop + heightU * 0.28} x2={marginX + widthU * 0.85} y2={marginTop + heightU * 0.28} stroke="var(--drawing-hint)" strokeWidth={0.6} strokeDasharray="4 2" />

      <circle cx={centerX - trackU / 2} cy={wheelCenterY} r={wheelRU} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />
      <circle cx={centerX + trackU / 2} cy={wheelCenterY} r={wheelRU} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />

      <CentreLine x1={centerX} y1={groundY + 10} x2={centerX} y2={marginTop - 8} />

      <HorizontalDimension x1={marginX} x2={marginX + widthU} dimY={viewBoxH - 10} refY1={groundY - clearanceU * 0.4} label={`${dimensions.overallWidthMm} mm`} />
      <HorizontalDimension x1={centerX - trackU / 2} x2={centerX + trackU / 2} dimY={groundY + 16} refY1={wheelCenterY + wheelRU} label={`${dimensions.frontTrackMm} mm (front track)`} />
      <VerticalDimension y1={marginTop} y2={groundY} dimX={marginX + widthU + 20} refX1={marginX + widthU} label={`${dimensions.overallHeightMm} mm`} />
    </svg>
  );
}
