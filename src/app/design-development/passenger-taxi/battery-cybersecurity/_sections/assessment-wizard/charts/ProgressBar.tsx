function bandColor(value: number): string {
  if (value >= 80) return "#22d3ee";
  if (value >= 60) return "#fbbf24";
  if (value >= 40) return "#94a3b8";
  return "#f87171";
}

export function ProgressBar({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = bandColor(clamped);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
        <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{label}</span>
        <span style={{ color, fontWeight: 700 }}>{clamped}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{ height: "8px", borderRadius: "999px", background: "rgba(148,163,184,0.14)", overflow: "hidden" }}
      >
        <div style={{ width: `${clamped}%`, height: "100%", background: color, borderRadius: "999px", transition: "width 0.3s ease" }} />
      </div>
    </div>
  );
}
