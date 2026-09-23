const STROKE = "#4CA930";
const EXT_STROKE = "rgba(76, 169, 48, 0.45)";
const TEXT_FILL = "#EAF7F1";
const ARROW_SIZE = 5;

function ArrowHead({ x, y, direction }: { x: number; y: number; direction: "left" | "right" | "up" | "down" }) {
  const points: Record<typeof direction, string> = {
    left: `${x},${y} ${x + ARROW_SIZE},${y - ARROW_SIZE / 2} ${x + ARROW_SIZE},${y + ARROW_SIZE / 2}`,
    right: `${x},${y} ${x - ARROW_SIZE},${y - ARROW_SIZE / 2} ${x - ARROW_SIZE},${y + ARROW_SIZE / 2}`,
    up: `${x},${y} ${x - ARROW_SIZE / 2},${y + ARROW_SIZE} ${x + ARROW_SIZE / 2},${y + ARROW_SIZE}`,
    down: `${x},${y} ${x - ARROW_SIZE / 2},${y - ARROW_SIZE} ${x + ARROW_SIZE / 2},${y - ARROW_SIZE}`,
  };
  return <polygon points={points[direction]} fill={STROKE} />;
}

/**
 * Standard engineering horizontal dimension line: extension lines rising from
 * the two reference points, a dimension line with arrowheads at each end, and
 * the value centred above it — the standard convention, not text repeated
 * inside the vehicle silhouette.
 */
export function HorizontalDimension({
  x1,
  x2,
  dimY,
  refY1,
  refY2,
  label,
}: {
  x1: number;
  x2: number;
  dimY: number;
  refY1: number;
  refY2?: number;
  label: string;
}) {
  const midX = (x1 + x2) / 2;
  return (
    <g aria-hidden="true">
      <line x1={x1} y1={refY1} x2={x1} y2={dimY + 4} stroke={EXT_STROKE} strokeWidth={0.6} />
      <line x1={x2} y1={refY2 ?? refY1} x2={x2} y2={dimY + 4} stroke={EXT_STROKE} strokeWidth={0.6} />
      <line x1={x1} y1={dimY} x2={x2} y2={dimY} stroke={STROKE} strokeWidth={0.7} />
      <ArrowHead x={x1} y={dimY} direction="left" />
      <ArrowHead x={x2} y={dimY} direction="right" />
      <rect x={midX - label.length * 2.6} y={dimY - 8} width={label.length * 5.2} height={8} fill="#04140E" opacity={0.85} />
      <text x={midX} y={dimY - 2} textAnchor="middle" fontSize={6} fill={TEXT_FILL} fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}

/** Standard engineering vertical dimension line — mirrors HorizontalDimension for height/clearance callouts. */
export function VerticalDimension({
  y1,
  y2,
  dimX,
  refX1,
  refX2,
  label,
}: {
  y1: number;
  y2: number;
  dimX: number;
  refX1: number;
  refX2?: number;
  label: string;
}) {
  const midY = (y1 + y2) / 2;
  return (
    <g aria-hidden="true">
      <line x1={refX1} y1={y1} x2={dimX - 4} y2={y1} stroke={EXT_STROKE} strokeWidth={0.6} />
      <line x1={refX2 ?? refX1} y1={y2} x2={dimX - 4} y2={y2} stroke={EXT_STROKE} strokeWidth={0.6} />
      <line x1={dimX} y1={y1} x2={dimX} y2={y2} stroke={STROKE} strokeWidth={0.7} />
      <ArrowHead x={dimX} y={y1} direction="up" />
      <ArrowHead x={dimX} y={y2} direction="down" />
      <rect x={dimX + 3} y={midY - 4} width={label.length * 5.2} height={8} fill="#04140E" opacity={0.85} />
      <text x={dimX + 5} y={midY + 2} fontSize={6} fill={TEXT_FILL} fontFamily="monospace">
        {label}
      </text>
    </g>
  );
}

/** Centreline convention: long dash, short dash, repeating. */
export function CentreLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--drawing-hint)" strokeWidth={0.5} strokeDasharray="8 2 2 2" aria-hidden="true" />;
}

/** Numbered component callout: a small circled index number with a leader line, used with a legend below the drawing. */
export function Callout({ x, y, index }: { x: number; y: number; index: number }) {
  return (
    <g aria-hidden="true">
      <circle cx={x} cy={y} r={7} fill="#062A1C" stroke={STROKE} strokeWidth={0.8} />
      <text x={x} y={y + 2.5} textAnchor="middle" fontSize={7} fill={STROKE} fontWeight={700}>
        {index}
      </text>
    </g>
  );
}
