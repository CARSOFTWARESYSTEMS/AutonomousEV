"use client";

import { useState } from "react";

export interface PieDataItem {
  name: string;
  value: number;
}

interface PriorityPieChartProps {
  title: string;
  description: string;
  data: PieDataItem[];
  insight: string;
}

const COLORS = [
  "#4CA930",
  "#22D3EE",
  "#A78BFA",
  "#FBBF24",
  "#F472B6",
  "#34D399",
  "#FB923C",
];

const CX = 110;
const CY = 110;
const OUTER_R = 88;
const INNER_R = 52;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutPath(startAngle: number, endAngle: number): string {
  const startOuter = polarToCartesian(CX, CY, OUTER_R, startAngle);
  const endOuter = polarToCartesian(CX, CY, OUTER_R, endAngle);
  const startInner = polarToCartesian(CX, CY, INNER_R, endAngle);
  const endInner = polarToCartesian(CX, CY, INNER_R, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${startOuter.x.toFixed(2)} ${startOuter.y.toFixed(2)}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${largeArc} 1 ${endOuter.x.toFixed(2)} ${endOuter.y.toFixed(2)}`,
    `L ${startInner.x.toFixed(2)} ${startInner.y.toFixed(2)}`,
    `A ${INNER_R} ${INNER_R} 0 ${largeArc} 0 ${endInner.x.toFixed(2)} ${endInner.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function PriorityPieChart({ title, description, data, insight }: PriorityPieChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const total = data.reduce((s, d) => s + d.value, 0);

  type Slice = typeof data[number] & { startAngle: number; endAngle: number; color: string; path: string };
  const slices = data.reduce<Slice[]>((acc, d, i) => {
    const startAngle = i === 0 ? 0 : acc[i - 1].endAngle;
    const endAngle = startAngle + (d.value / total) * 360;
    return [...acc, { ...d, startAngle, endAngle, color: COLORS[i % COLORS.length], path: donutPath(startAngle, endAngle) }];
  }, []);

  const hoveredSlice = hovered !== null ? slices[hovered] : null;

  return (
    <div
      className="glass-panel"
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
          {title}
        </h3>
        <p style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>{description}</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
        <svg
          width={220}
          height={220}
          viewBox="0 0 220 220"
          aria-label={`Pie chart: ${title}`}
          role="img"
        >
          {slices.map((slice, i) => (
            <path
              key={i}
              d={slice.path}
              fill={slice.color}
              stroke="var(--bg-dark)"
              strokeWidth={2}
              opacity={hovered === null || hovered === i ? 1 : 0.35}
              style={{
                cursor: "pointer",
                transition: "opacity 0.15s ease, transform 0.15s ease",
                transform: hovered === i ? "scale(1.04)" : "scale(1)",
                transformOrigin: `${CX}px ${CY}px`,
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          ))}

          {/* Inner circle */}
          <circle cx={CX} cy={CY} r={INNER_R - 2} fill="var(--bg-dark)" />

          {/* Center label on hover */}
          {hoveredSlice ? (
            <>
              <text
                x={CX}
                y={CY - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={22}
                fontWeight={700}
                fill={hoveredSlice.color}
              >
                {hoveredSlice.value}%
              </text>
              <text
                x={CX}
                y={CY + 16}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={9}
                fill="rgba(234,247,241,0.6)"
              >
                {hoveredSlice.name.length > 14 ? hoveredSlice.name.slice(0, 13) + "…" : hoveredSlice.name}
              </text>
            </>
          ) : (
            <text
              x={CX}
              y={CY}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={11}
              fill="rgba(234,247,241,0.3)"
            >
              Hover slice
            </text>
          )}
        </svg>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", maxWidth: "360px" }}>
          {slices.map((slice, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: hovered === null || hovered === i ? 1 : 0.45,
                cursor: "pointer",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: slice.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                {slice.name}{" "}
                <span style={{ color: slice.color, fontWeight: 600 }}>{slice.value}%</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Insight */}
      <div
        style={{
          background: "rgba(76,169,48,0.07)",
          border: "1px solid rgba(76,169,48,0.2)",
          borderRadius: "var(--radius-md)",
          padding: "12px 14px",
        }}
      >
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.5 }}>
          {insight}
        </p>
      </div>
    </div>
  );
}
