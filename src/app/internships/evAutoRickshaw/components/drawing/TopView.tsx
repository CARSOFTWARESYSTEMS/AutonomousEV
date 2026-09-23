import type { VehicleDimensions } from "@/lib/evAutoRickshaw/dimensions";
import { Callout, CentreLine, HorizontalDimension, VerticalDimension } from "./DimensionLine";

const SCALE = 0.1;
const mm = (v: number) => v * SCALE;

// Seat width (across the cabin, sets column spacing) and seat depth (along
// the vehicle's length, sets row spacing) are kept as two separate
// constants — collapsing them into one square size is what previously let
// two seat rows silently claim the same longitudinal space as the battery.
const SEAT_WIDTH = mm(380);
const SEAT_DEPTH = mm(300);

export function TopView({ dimensions, passengerCapacity }: { dimensions: VehicleDimensions; passengerCapacity: number }) {
  const lengthU = mm(dimensions.overallLengthMm);
  const widthU = mm(dimensions.overallWidthMm);
  const wheelbaseU = mm(dimensions.wheelbaseMm);
  const frontOverhangU = mm(dimensions.frontOverhangMm);

  const margin = 26;
  // The right-side overall-width dimension needs its own clearance beyond
  // `margin`, or its label chip gets clipped by the viewBox edge (a real
  // bug found from a screenshot — "1475 mm" rendered as just "14").
  const marginRight = 60;
  const viewBoxW = margin + lengthU + marginRight;
  const viewBoxH = margin * 2 + widthU;

  const bodyY = margin;
  const centerY = margin + widthU / 2;
  const frontAxleX = margin + frontOverhangU;
  const rearAxleX = frontAxleX + wheelbaseU;

  const driverX = frontAxleX + mm(150);

  // Battery zone is reserved first (immediately ahead of the rear axle),
  // and the seat zone is derived to end before it starts — so the two can
  // never overlap by construction, instead of being computed independently
  // and hoping they don't collide (they previously did).
  const batteryW = wheelbaseU * 0.35;
  const batteryX = rearAxleX - batteryW - mm(150);
  const batteryDepth = widthU * 0.5;

  const cabinStartX = frontAxleX + mm(500);
  const cabinEndX = batteryX - mm(40);

  const seats = Math.min(6, Math.max(0, passengerCapacity));
  const cols = 3;
  const rows = Math.max(1, Math.ceil(seats / cols));
  const availableCabinLength = Math.max(0, cabinEndX - cabinStartX);
  const rowGap = Math.max(4, (availableCabinLength - SEAT_DEPTH * rows) / (rows + 1));
  const colGap = Math.max(4, (widthU - SEAT_WIDTH * cols) / (cols + 1));

  return (
    <svg viewBox={`0 0 ${viewBoxW} ${viewBoxH}`} className="drawingSvg" role="img" aria-labelledby="top-view-title top-view-desc">
      <title id="top-view-title">Top view — General Arrangement</title>
      <desc id="top-view-desc">
        Concept top-view drawing showing overall length and width, D+{seats} passenger/driver seating layout,
        battery position and rear axle/motor location.
      </desc>

      <rect x={margin} y={bodyY} width={lengthU} height={widthU} rx={10} fill="none" stroke="var(--drawing-body)" strokeWidth={1} />
      <CentreLine x1={margin - 8} y1={centerY} x2={margin + lengthU + 8} y2={centerY} />

      {/* Front and rear axle lines */}
      <line x1={frontAxleX} y1={bodyY} x2={frontAxleX} y2={bodyY + widthU} stroke="var(--drawing-hint)" strokeWidth={0.5} strokeDasharray="3 3" />
      <line x1={rearAxleX} y1={bodyY} x2={rearAxleX} y2={bodyY + widthU} stroke="var(--drawing-hint)" strokeWidth={0.5} strokeDasharray="3 3" />

      {/* Driver seat */}
      <rect x={driverX} y={centerY - SEAT_WIDTH / 2} width={SEAT_DEPTH} height={SEAT_WIDTH} rx={3} fill="rgba(252,211,77,0.12)" stroke="#fcd34d" strokeWidth={0.7} />
      <text x={driverX + SEAT_DEPTH / 2} y={centerY + 2.5} textAnchor="middle" fontSize={6} fill="#fcd34d" fontWeight={700}>
        D
      </text>

      {/* Passenger seats — guaranteed non-overlapping with the battery zone below */}
      {Array.from({ length: seats }).map((_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const x = cabinStartX + rowGap * (row + 1) + SEAT_DEPTH * row;
        const y = margin + colGap * (col + 1) + SEAT_WIDTH * col;
        return (
          <rect key={i} x={x} y={y} width={SEAT_DEPTH} height={SEAT_WIDTH} rx={3} fill="rgba(125,211,252,0.1)" stroke="#7dd3fc" strokeWidth={0.6} />
        );
      })}

      {/* Battery */}
      <rect
        x={batteryX}
        y={centerY - batteryDepth / 2}
        width={batteryW}
        height={batteryDepth}
        fill="rgba(76,169,48,0.15)"
        stroke="#4CA930"
        strokeWidth={0.8}
      />
      <text x={batteryX + batteryW / 2} y={centerY + 2} textAnchor="middle" fontSize={5.5} fill="#4CA930" fontFamily="monospace">
        BATTERY
      </text>

      <Callout x={driverX + SEAT_DEPTH / 2} y={bodyY - 8} index={5} />
      <Callout x={batteryX + batteryW / 2} y={bodyY - 8} index={1} />
      <Callout x={rearAxleX} y={bodyY - 8} index={3} />

      <HorizontalDimension x1={margin} x2={margin + lengthU} dimY={viewBoxH - 8} refY1={bodyY + widthU} label={`${dimensions.overallLengthMm} mm`} />
      <VerticalDimension y1={bodyY} y2={bodyY + widthU} dimX={margin + lengthU + 14} refX1={margin + lengthU} label={`${dimensions.overallWidthMm} mm`} />
    </svg>
  );
}
