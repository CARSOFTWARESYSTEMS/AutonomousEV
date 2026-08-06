const CX = 110;
const CY = 105;
const R = 90;

function pointForValue(value: number) {
  const angleDeg = 180 - (Math.max(0, Math.min(100, value)) / 100) * 180;
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + R * Math.cos(rad), y: CY - R * Math.sin(rad) };
}

const LEFT = pointForValue(0);
const RIGHT = pointForValue(100);

// Same trust-state palette used everywhere else on this page — no new colors.
function bandColor(value: number): string {
  if (value >= 80) return "#22d3ee"; // trusted
  if (value >= 60) return "#fbbf24"; // degraded
  if (value >= 40) return "#94a3b8"; // unverified
  return "#f87171"; // compromised
}

export function MaturityGauge({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const fillPoint = pointForValue(clamped);
  const color = bandColor(clamped);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width={220} height={130} viewBox="0 0 220 130" role="img" aria-label={`${label}: ${clamped} out of 100`}>
        <path d={`M ${LEFT.x} ${LEFT.y} A ${R} ${R} 0 0 1 ${RIGHT.x} ${RIGHT.y}`} fill="none" stroke="rgba(148,163,184,0.18)" strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${LEFT.x} ${LEFT.y} A ${R} ${R} 0 0 1 ${fillPoint.x} ${fillPoint.y}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" />
        <text x={CX} y={CY - 10} textAnchor="middle" fontSize={30} fontWeight={800} fill={color}>
          {clamped}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize={11} fill="rgba(234,247,241,0.6)">
          / 100
        </text>
      </svg>
      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{label}</p>
    </div>
  );
}
