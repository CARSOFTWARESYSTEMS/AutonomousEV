// Illustration for the Advanced Rocket Propulsion Digital Twin card on the
// Space page: a generic engine with its pressure paths on the left, its
// Digital Twin as a dashed outline on the right, the measurements that link
// them, and a telemetry trace with an uncertainty band underneath. Inline SVG,
// so it costs no request. Not a drawing of any engine.
const C = { violet: "#A78BFA", blue: "#60A5FA", cyan: "#67E8F9", amber: "#FBBF24", line: "#8B8FA3", ink: "#0D1126" } as const;

/** The engine outline, drawn once for the hardware and once for its twin. */
function Engine({ stroke, dashed }: { stroke: string; dashed?: boolean }) {
  const dash = dashed ? "4 3" : undefined;
  return (
    <g fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" strokeDasharray={dash}>
      <rect x={93} y={52} width={34} height={8} rx={2} />
      <path d="M95,60 L125,60 L125,86 L117,98 L103,98 L95,86 Z" />
      <path d="M103,98 C99,118 86,136 76,152 L144,152 C134,136 121,118 117,98" />
      <circle cx={64} cy={66} r={11} />
      <circle cx={156} cy={66} r={11} />
      <path d="M75,66 L145,66" strokeWidth={1} />
    </g>
  );
}

export default function PropulsionTwinCardVisual({ className, flowClassName }: { className?: string; flowClassName?: string }) {
  return (
    <svg viewBox="0 0 360 200" className={className} role="img" aria-label="A rocket engine with its pressure paths, beside a dashed outline of its Digital Twin. Dotted links carry measurements from sensors on the engine to the twin, above a telemetry trace drawn with an uncertainty band.">
      <defs>
        <linearGradient id="ptcv-panel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1B1642" stopOpacity="0.9" />
          <stop offset="1" stopColor="#0B1030" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="ptcv-glow" cx="0.3" cy="0.45" r="0.6">
          <stop offset="0" stopColor="#7C3AED" stopOpacity="0.28" />
          <stop offset="1" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={360} height={200} rx={14} fill="url(#ptcv-panel)" />
      <rect width={360} height={200} rx={14} fill="url(#ptcv-glow)" />
      <path d="M0,40 H360 M0,80 H360 M0,120 H360 M0,160 H360 M60,0 V200 M120,0 V200 M180,0 V200 M240,0 V200 M300,0 V200" stroke="#7C3AED" strokeOpacity={0.09} strokeWidth={1} />

      {/* The physical engine and its pressure paths: oxidiser, fuel, and fuel as coolant along the nozzle wall. */}
      <Engine stroke="#E4E6F5" />
      <path d="M64,22 L64,55 M64,77 L64,90 L93,58" fill="none" stroke={C.blue} strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M156,22 L156,55 M156,77 L156,146 Q156,152 148,152" fill="none" stroke={C.amber} strokeWidth={2.2} strokeLinejoin="round" />
      <path d="M146,150 C137,136 124,118 120,98 L127,86 L127,60" fill="none" stroke={C.cyan} strokeWidth={2.2} strokeLinejoin="round" />
      <g fill="none" stroke="#fff" strokeWidth={1} strokeOpacity={0.75} strokeDasharray="3 7" className={flowClassName}>
        <path d="M64,22 L64,55 M64,77 L64,90 L93,58" />
        <path d="M156,22 L156,55 M156,77 L156,146 Q156,152 148,152" />
      </g>
      <path d="M92,160 L88,174 M104,160 L102,177 M116,160 L118,177 M128,160 L132,174" stroke={C.amber} strokeWidth={1.4} strokeOpacity={0.6} strokeLinecap="round" />

      {/* Its Digital Twin: the same engine, as a model. */}
      <g transform="translate(150 0)">
        <Engine stroke={C.cyan} dashed />
      </g>

      {/* Pressure sensors, and the measurements that keep the twin synchronised. */}
      <g stroke={C.violet} strokeWidth={1} strokeDasharray="1.5 4" strokeLinecap="round" fill="none">
        <path d="M64,40 C120,24 170,24 214,40" />
        <path d="M110,74 L260,74" />
        <path d="M156,112 C200,128 220,128 248,112" />
      </g>
      {[
        [64, 40],
        [64, 84],
        [110, 74],
        [156, 112],
        [156, 40],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3.4} fill={C.amber} stroke={C.ink} strokeWidth={1.2} />
      ))}
      {[
        [214, 40],
        [260, 74],
        [248, 112],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={3} fill={C.ink} stroke={C.cyan} strokeWidth={1.4} />
      ))}

      {/* Telemetry: observed against expected, with the predicted band widening. */}
      <path d="M196,176 L236,176 L276,174 L316,171 L348,166 L348,192 L316,187 L276,183 L236,180 L196,180 Z" fill={C.cyan} fillOpacity={0.14} />
      <path d="M14,178 L196,178" stroke={C.line} strokeWidth={1} strokeDasharray="4 3" />
      <path d="M14,179 L26,176 L38,180 L50,177 L62,179 L74,175 L86,180 L98,177 L110,179 L122,176 L134,179 L146,177 L158,180 L170,177 L182,179 L196,178" fill="none" stroke="#E4E6F5" strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M196,178 L236,178 L276,178.5 L316,179 L348,179.5" fill="none" stroke={C.cyan} strokeWidth={1.4} strokeDasharray="1.5 3.5" strokeLinecap="round" />
      <path d="M196,168 L196,190" stroke="#fff" strokeOpacity={0.35} strokeWidth={1} />
    </svg>
  );
}
