import type { VehicleDimensions } from "@/lib/evAutoRickshaw/dimensions";
import { Callout, CentreLine, HorizontalDimension, VerticalDimension } from "./DimensionLine";

const SCALE = 0.1; // SVG units per mm
const mm = (v: number) => v * SCALE;

export function SideView({
  dimensions,
  passengerCapacity,
}: {
  dimensions: VehicleDimensions;
  passengerCapacity: number;
}) {
  const lengthU = mm(dimensions.overallLengthMm);
  const heightU = mm(dimensions.overallHeightMm);
  const wheelDiaU = mm(dimensions.wheelDiameterMm);
  const wheelRU = wheelDiaU / 2;
  const clearanceU = mm(dimensions.groundClearanceMm);
  const wheelbaseU = mm(dimensions.wheelbaseMm);
  const frontOverhangU = mm(dimensions.frontOverhangMm);

  const marginTop = 22;
  // Three stacked dimension rows (wheelbase / front overhang / overall
  // length) live below the ground line — this needs enough room that their
  // label chips don't overlap each other (a real bug found by inspecting an
  // actual screenshot: two of these rows previously landed only 2 units
  // apart).
  const marginBottom = 50;
  const marginLeft = 14;
  // The right-side overall-height dimension label needs its own clearance
  // or it gets clipped by the viewBox edge (another real bug found from a
  // screenshot — "1850 mm" rendered as "1850" with the unit cut off).
  const marginRight = 60;

  const groundY = marginTop + heightU + 4;
  // frontOverhang/rearOverhang are already defined as body-edge -> wheel
  // CENTRE (not wheel edge), so the wheel radius must not be added again
  // here — doing so previously starved the rear overhang of half its
  // clearance and let the body's rounded corner visually clip the rear
  // wheel.
  const frontWheelX = marginLeft + frontOverhangU;
  // Derived from wheelbase (an independently overridable dimension) rather
  // than from the fixed rearOverhang constant, so an Engineering-mode
  // wheelbase change visibly moves the rear wheel/axle relative to a fixed
  // overall length, instead of silently ignoring the override.
  const rearWheelX = frontWheelX + wheelbaseU;
  const wheelCenterY = groundY - wheelRU;

  const bodyTop = marginTop;
  const bodyBottom = groundY - clearanceU * 0.4; // body sits above a protected underbody strip
  const cabinFloorY = groundY - mm(dimensions.cabinFloorHeightMm);

  const viewBoxW = marginLeft + lengthU + marginRight;
  const viewBoxH = groundY + marginBottom;

  const batteryX = frontWheelX + wheelbaseU * 0.15;
  const batteryW = wheelbaseU * 0.45;
  const batteryY = groundY - clearanceU - mm(120);
  const batteryH = mm(120);

  const motorCx = rearWheelX - wheelRU * 0.3;
  const motorCy = groundY - clearanceU - mm(90);

  return (
    <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="drawingSvg" role="img" aria-labelledby="side-view-title side-view-desc">
      <title id="side-view-title">Side view — General Arrangement</title>
      <desc id="side-view-desc">
        Concept side-view technical drawing showing overall length, height, wheelbase, ground clearance, front/rear
        overhang, wheel diameter, cabin, traction battery and motor/differential locations.
      </desc>

      {/* Ground line */}
      <line x1={0} y1={groundY} x2={viewBoxW} y2={groundY} stroke="var(--drawing-ground)" strokeWidth={0.8} />

      {/* Body outline */}
      <rect
        x={marginLeft}
        y={bodyTop}
        width={lengthU}
        height={bodyBottom - bodyTop}
        rx={6}
        fill="none"
        stroke="var(--drawing-body)"
        strokeWidth={1}
      />
      {/* Cabin roofline hint */}
      <line x1={marginLeft + frontOverhangU * 0.6} y1={bodyTop} x2={marginLeft + lengthU * 0.92} y2={bodyTop} stroke="var(--drawing-body)" strokeWidth={1} />
      {/* Cabin floor */}
      <line x1={marginLeft} y1={cabinFloorY} x2={marginLeft + lengthU} y2={cabinFloorY} stroke="var(--drawing-hint)" strokeWidth={0.6} strokeDasharray="4 2" />

      {/* Battery pack (hatched block, underfloor) */}
      <rect x={batteryX} y={batteryY} width={batteryW} height={batteryH} fill="rgba(76,169,48,0.15)" stroke="#4CA930" strokeWidth={0.8} />
      <text x={batteryX + batteryW / 2} y={batteryY + batteryH / 2 + 2} textAnchor="middle" fontSize={5.5} fill="#4CA930" fontFamily="monospace">
        BATTERY
      </text>

      {/* Motor block near rear axle */}
      <rect x={motorCx - mm(90)} y={motorCy - mm(60)} width={mm(180)} height={mm(120)} fill="rgba(125,211,252,0.12)" stroke="#7dd3fc" strokeWidth={0.7} />

      {/* Wheels. Dual rear wheels (if any) sit side-by-side across vehicle
          WIDTH, not offset along its length, so they perfectly overlap in a
          side elevation — a single circle is the physically correct
          representation here, not two offset circles. */}
      <circle cx={frontWheelX} cy={wheelCenterY} r={wheelRU} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />
      <circle cx={rearWheelX} cy={wheelCenterY} r={wheelRU} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />
      {/* Diameter callout placed inside the wheel itself (standard CAD convention) rather than
          in the bottom dimension-line row, which was crowded enough to visually collide with
          the front-overhang label. */}
      <text x={frontWheelX} y={wheelCenterY + 2} textAnchor="middle" fontSize={5} fill="var(--drawing-hint)" fontFamily="monospace">
        ⌀{dimensions.wheelDiameterMm.toFixed(0)}
      </text>

      <CentreLine x1={frontWheelX} y1={groundY + 10} x2={frontWheelX} y2={bodyTop - 8} />
      <CentreLine x1={rearWheelX} y1={groundY + 10} x2={rearWheelX} y2={bodyTop - 8} />

      {/* Callouts */}
      <Callout x={batteryX + batteryW / 2} y={batteryY - 6} index={1} />
      <Callout x={motorCx} y={motorCy - mm(60) - 6} index={2} />
      <Callout x={marginLeft + lengthU * 0.15} y={bodyTop + 10} index={5} />
      <Callout x={marginLeft + lengthU * 0.95} y={groundY - clearanceU - mm(40)} index={6} />

      {/* Dimensions — three stacked rows below the ground line, spaced 13
          units apart so their label chips never touch. */}
      <HorizontalDimension x1={frontWheelX} x2={rearWheelX} dimY={groundY + 14} refY1={wheelCenterY + wheelRU} label={`${dimensions.wheelbaseMm} mm`} />
      <HorizontalDimension x1={marginLeft} x2={frontWheelX} dimY={groundY + 27} refY1={groundY} label={`${dimensions.frontOverhangMm} mm`} />
      <HorizontalDimension x1={marginLeft} x2={marginLeft + lengthU} dimY={groundY + 40} refY1={bodyBottom} label={`${dimensions.overallLengthMm} mm`} />
      <VerticalDimension y1={bodyTop} y2={groundY} dimX={marginLeft + lengthU + 8} refX1={marginLeft + lengthU} label={`${dimensions.overallHeightMm} mm`} />
      <VerticalDimension y1={groundY - clearanceU} y2={groundY} dimX={marginLeft - 8} refX1={marginLeft} label={`${dimensions.groundClearanceMm} mm`} />

      <text x={marginLeft + lengthU * 0.4} y={cabinFloorY - 6} textAnchor="middle" fontSize={5.5} fill="var(--drawing-hint)" fontFamily="monospace">
        D + {passengerCapacity} CABIN
      </text>
    </svg>
  );
}
