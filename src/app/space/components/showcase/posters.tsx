// Still drawings of each showcase subject: rendered on the server, shown
// before the 3D scene loads and instead of it where WebGL is unavailable.
// The same subjects and the same honest simplifications as the 3D scenes.
const BG = (id: string, a: string, b: string) => (
  <defs>
    <radialGradient id={`${id}-bg`} cx="30%" cy="20%" r="90%">
      <stop offset="0" stopColor={a} stopOpacity="0.32" />
      <stop offset="1" stopColor={b} stopOpacity="0" />
    </radialGradient>
  </defs>
);

const frame = { width: "100%", height: "100%", preserveAspectRatio: "xMidYMid meet" } as const;

export function EarthPoster() {
  return (
    <svg viewBox="0 0 400 300" {...frame} aria-hidden="true" focusable="false">
      {BG("earth", "#3b82f6", "#070917")}
      <rect width="400" height="300" fill="url(#earth-bg)" />
      <ellipse cx="200" cy="150" rx="168" ry="58" fill="none" stroke="#67e8f9" strokeOpacity="0.6" strokeWidth="1.4" transform="rotate(-24 200 150)" />
      <polygon points="330,92 186,126 214,178" fill="#67e8f9" fillOpacity="0.1" />
      <circle cx="200" cy="150" r="40" fill="#1d4ed8" />
      <path d="M163 140c14-8 30-4 40 4s28 6 36 0M168 164c16 6 32 2 46-6" stroke="#67e8f9" strokeOpacity="0.35" fill="none" />
      <ellipse cx="200" cy="150" rx="12" ry="45" fill="none" stroke="#fcd34d" strokeWidth="1.4" strokeOpacity="0.8" transform="rotate(8 200 150)" />
      <g fill="#e5e7eb">
        <rect x="326" y="88" width="8" height="8" />
        <rect x="314" y="91" width="10" height="2" fill="#3b82f6" />
        <rect x="336" y="91" width="10" height="2" fill="#3b82f6" />
        <rect x="64" y="200" width="8" height="8" />
        <rect x="205" y="102" width="6" height="6" />
      </g>
    </svg>
  );
}

export function CubeSatPoster({ wings = false, sun = false }: { wings?: boolean; sun?: boolean }) {
  const layers = [0, 1, 2, 3, 4];
  return (
    <svg viewBox="0 0 400 300" {...frame} aria-hidden="true" focusable="false">
      {BG(wings ? "eps" : "cube", "#7c3aed", "#070917")}
      <rect width="400" height="300" fill={`url(#${wings ? "eps" : "cube"}-bg)`} />
      {sun && (
        <>
          <circle cx="70" cy="64" r="20" fill="#fde68a" />
          <circle cx="70" cy="64" r="30" fill="#f59e0b" fillOpacity="0.2" />
          <line x1="88" y1="78" x2="188" y2="148" stroke="#fcd34d" strokeWidth="2" strokeDasharray="5 5" />
        </>
      )}
      {wings && (
        <g fill="#1e3a8a" stroke="#3b82f6" strokeOpacity="0.6">
          <polygon points="96,150 160,126 160,186 96,210" />
          <polygon points="240,126 304,150 304,210 240,186" />
        </g>
      )}
      {layers.map((i) => {
        const y = (sun ? 112 : 70) + i * (sun ? 14 : 34);
        return (
          <g key={i} transform={`translate(0 ${y})`}>
            <polygon points="200,0 250,22 200,44 150,22" fill={i === 2 && sun ? "#f59e0b" : "#17603f"} fillOpacity={i === 2 && sun ? 0.85 : 0.9} stroke="#d4c58a" strokeOpacity="0.5" />
          </g>
        );
      })}
      <g stroke="#b6bcc6" strokeWidth="2.4" fill="none" opacity="0.85">
        <line x1="150" y1={sun ? 134 : 92} x2="150" y2={sun ? 190 : 250} />
        <line x1="250" y1={sun ? 134 : 92} x2="250" y2={sun ? 190 : 250} />
        <line x1="200" y1={sun ? 112 : 70} x2="200" y2={sun ? 168 : 228} strokeOpacity="0.4" />
      </g>
    </svg>
  );
}

export function RocketPoster() {
  return (
    <svg viewBox="0 0 400 300" {...frame} aria-hidden="true" focusable="false">
      {BG("rocket", "#f59e0b", "#070917")}
      <rect width="400" height="300" fill="url(#rocket-bg)" />
      <path d="M96 262 Q180 -10 262 46" fill="none" stroke="#fcd34d" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <path d="M262 46 L318 236" fill="none" stroke="#f87171" strokeWidth="3" strokeDasharray="2 9" strokeLinecap="round" />
      <circle cx="262" cy="46" r="7" fill="none" stroke="#fcd34d" strokeWidth="2" />
      <path d="M300 196a18 18 0 0 1 36 0z" fill="#ef4444" />
      <line x1="40" y1="266" x2="370" y2="266" stroke="#475569" strokeWidth="2" />
      <g transform="translate(80 92)">
        <path d="M12 0 C4 14 2 26 2 34 L22 34 C22 26 20 14 12 0z" fill="#e5e7eb" />
        <rect x="2" y="34" width="20" height="120" fill="#3b5bdb" />
        <polygon points="2,128 -14,158 2,152" fill="#f59e0b" />
        <polygon points="22,128 38,158 22,152" fill="#f59e0b" />
        <rect x="8" y="154" width="8" height="6" fill="#78716c" />
      </g>
    </svg>
  );
}

export function StationPoster() {
  return (
    <svg viewBox="0 0 400 300" {...frame} aria-hidden="true" focusable="false">
      {BG("station", "#3b82f6", "#070917")}
      <rect width="400" height="300" fill="url(#station-bg)" />
      <rect x="40" y="144" width="320" height="10" fill="#cbd5e1" />
      {[52, 312].map((x) => (
        <g key={x}>
          <rect x={x} y="62" width="36" height="74" fill="#1e3a8a" stroke="#3b82f6" />
          <rect x={x} y="162" width="36" height="74" fill="#1e3a8a" stroke="#3b82f6" />
        </g>
      ))}
      <rect x="146" y="158" width="34" height="46" fill="#f8fafc" opacity="0.85" />
      <rect x="220" y="158" width="34" height="46" fill="#f8fafc" opacity="0.85" />
      <rect x="182" y="96" width="36" height="106" rx="16" fill="#e2e8f0" />
      <circle cx="200" cy="88" r="16" fill="#e2e8f0" />
      <path d="M188 64 L212 64 L206 44 L194 44 Z" fill="#94a3b8" />
    </svg>
  );
}

export function EnginePoster() {
  return (
    <svg viewBox="0 0 400 300" {...frame} aria-hidden="true" focusable="false">
      {BG("engine", "#f59e0b", "#070917")}
      <rect width="400" height="300" fill="url(#engine-bg)" />
      <rect x="170" y="38" width="60" height="14" rx="3" fill="#94a3b8" />
      <path d="M176 52 L224 52 L224 112 C224 128 212 134 208 146 L192 146 C188 134 176 128 176 112 Z" fill="#b45309" fillOpacity="0.75" stroke="#fcd34d" strokeOpacity="0.6" />
      <path d="M200 52 L224 52 L224 112 C224 128 212 134 208 146 L200 146 Z" fill="#fde68a" fillOpacity="0.25" />
      <path d="M192 146 C178 186 154 226 130 268 L270 268 C246 226 222 186 208 146 Z" fill="#475569" stroke="#cbd5e1" strokeOpacity="0.5" />
      <path d="M200 146 L208 146 C222 186 246 226 270 268 L200 268 Z" fill="#0f172a" fillOpacity="0.55" />
      <circle cx="132" cy="84" r="20" fill="#64748b" />
      <circle cx="268" cy="84" r="20" fill="#64748b" />
      <path d="M152 84 L176 84 M248 84 L224 84" stroke="#93c5fd" strokeWidth="5" />
    </svg>
  );
}

export function VenturePoster() {
  const cube = (x: number, fill: number) => (
    <g transform={`translate(${x} 120)`}>
      <ellipse cx="0" cy="78" rx="46" ry="10" fill="#1e2448" />
      <polygon points="0,0 36,16 0,32 -36,16" fill="none" stroke="#b6bcc6" strokeWidth="2" />
      <polygon points="-36,16 0,32 0,76 -36,60" fill={fill > 1 ? "#1e3a8a" : "none"} stroke="#b6bcc6" strokeWidth="2" />
      <polygon points="36,16 0,32 0,76 36,60" fill={fill > 1 ? "#1e3a8a" : "none"} stroke="#b6bcc6" strokeWidth="2" />
      {Array.from({ length: fill === 0 ? 1 : 4 }, (_, i) => (
        <polygon key={i} points={`0,${40 + i * 9} 28,${30 + i * 9} 0,${20 + i * 9} -28,${30 + i * 9}`} fill="#17603f" opacity={fill > 1 ? 0 : 0.9} />
      ))}
    </g>
  );
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      {BG("venture", "#f59e0b", "#070917")}
      <rect width="400" height="300" fill="url(#venture-bg)" />
      {cube(82, 0)}
      {cube(200, 1)}
      {cube(318, 2)}
      <path d="M128 160 l14 6 -14 6z M246 160 l14 6 -14 6z" fill="#fcd34d" />
    </svg>
  );
}

export function AcademyPoster() {
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      {BG("academy", "#7c3aed", "#070917")}
      <rect width="400" height="300" fill="url(#academy-bg)" />
      {[90, 200, 306].map((x) => (
        <ellipse key={x} cx={x} cy="262" rx="40" ry="8" fill="#1e2448" />
      ))}
      <ellipse cx="90" cy="228" rx="44" ry="14" fill="none" stroke="#c4b5fd" strokeOpacity="0.6" />
      <polygon points="90,212 104,219 90,226 76,219" fill="#b6bcc6" />
      <polygon points="76,219 90,226 90,246 76,239" fill="#1e3a8a" />
      <polygon points="104,219 90,226 90,246 104,239" fill="#1e3a8a" />
      <path d="M200 40 C194 50 192 58 192 64 L208 64 C208 58 206 50 200 40z" fill="#e5e7eb" />
      <rect x="192" y="64" width="16" height="190" fill="#3b5bdb" />
      <polygon points="192,230 178,256 192,252" fill="#f59e0b" />
      <polygon points="208,230 222,256 208,252" fill="#f59e0b" />
      <path d="M276 150 a30 30 0 0 1 60 0z" fill="#ef4444" />
      {[278, 292, 306, 320, 334].map((x) => (
        <line key={x} x1={x} y1="150" x2="306" y2="226" stroke="#e5e7eb" strokeOpacity="0.6" />
      ))}
      <rect x="298" y="226" width="16" height="30" rx="3" fill="#cbd5e1" />
    </svg>
  );
}

/**
 * Research pathway: telemetry against a model's prediction, the residual
 * between them crossing a threshold, and the validation stages, which are
 * planned. A drawing of the method, with no measured data.
 */
export function ResearchStill() {
  const x = (i: number) => 40 + i * 8;
  const measured = Array.from({ length: 41 }, (_, i) => 120 - 30 * Math.sin(i / 5) - (i > 26 ? (i - 26) * 2.6 : 0));
  const model = Array.from({ length: 41 }, (_, i) => 120 - 30 * Math.sin(i / 5));
  const line = (ys: number[]) => ys.map((y, i) => `${i ? "L" : "M"}${x(i)} ${y.toFixed(1)}`).join(" ");
  const residual = measured.map((m, i) => Math.abs(m - model[i]));
  return (
    <svg viewBox="0 0 400 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
      {BG("research", "#06b6d4", "#070917")}
      <rect width="400" height="300" fill="url(#research-bg)" />
      <text x="40" y="44" fill="#a3a7bd" fontSize="11">Telemetry vs model prediction</text>
      <path d={line(model)} fill="none" stroke="#c4b5fd" strokeWidth="2" strokeDasharray="5 4" />
      <path d={line(measured)} fill="none" stroke="#67e8f9" strokeWidth="2.4" />
      <rect x={x(26)} y="56" width={x(40) - x(26)} height="104" fill="#f59e0b" fillOpacity="0.08" />
      <text x="40" y="186" fill="#a3a7bd" fontSize="11">Residual</text>
      <line x1="40" x2="360" y1="206" y2="206" stroke="#fca5a5" strokeDasharray="4 4" />
      {residual.map((r, i) => (
        <rect key={i} x={x(i) - 2.5} y={232 - Math.min(40, r * 1.1)} width="5" height={Math.min(40, r * 1.1)} fill={r * 1.1 > 26 ? "#f59e0b" : "#3b82f6"} opacity="0.85" />
      ))}
      {["Simulation", "Emulation", "Digital twin", "Supervised", "Flight-rep."].map((s, i) => (
        <g key={s} transform={`translate(${40 + i * 66} 258)`}>
          <rect width="60" height="22" rx="11" fill="#0e2a35" stroke="#06b6d4" strokeOpacity="0.5" />
          <text x="30" y="15" fill="#67e8f9" fontSize="9.5" textAnchor="middle">{s}</text>
        </g>
      ))}
    </svg>
  );
}
