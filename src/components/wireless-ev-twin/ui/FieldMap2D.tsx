"use client";
// The field section drawn in 2D: the same analytical basis as the 3D field
// view, on a canvas. Used where WebGL is unavailable and in the laboratories.
import { useEffect, useMemo, useRef } from "react";
import { type CouplerConfig, fieldBasis, fieldFromBasis } from "@/lib/wireless-charging/coils";
import { fieldColor } from "../three/materials";
import { fieldScale } from "../three/fieldScale";
import ui from "../twin.module.css";

export default function FieldMap2D({ config, currents, label }: { config: CouplerConfig; currents: { i1: { re: number; im: number }; i2: { re: number; im: number } } | null; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const basis = useMemo(() => fieldBasis(config, { nx: 96, nz: 40 }), [config]);
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(basis.nx, basis.nz);
    const vals = new Float32Array(basis.nx * basis.nz);
    if (currents) fieldFromBasis(basis, currents, vals);
    const lo = Math.log10(fieldScale.min);
    const span = Math.log10(fieldScale.max) - lo;
    for (let iz = 0; iz < basis.nz; iz++) {
      for (let ix = 0; ix < basis.nx; ix++) {
        const v = vals[iz * basis.nx + ix];
        const o = ((basis.nz - 1 - iz) * basis.nx + ix) * 4;
        if (!Number.isFinite(v) || v <= 0) {
          img.data.set([24, 28, 36, 255], o);
          continue;
        }
        const [r, g, b] = fieldColor((Math.log10(v) - lo) / span);
        img.data.set([r * 255, g * 255, b * 255, 255], o);
      }
    }
    c.width = basis.nx;
    c.height = basis.nz;
    ctx.putImageData(img, 0, 0);
  }, [basis, currents]);
  const w = basis.x1 - basis.x0;
  const h = basis.z1 - basis.z0;
  return (
    <figure className={ui.fieldMap}>
      <div className={ui.fieldFrame} style={{ aspectRatio: `${w} / ${Math.max(h, w * 0.22)}` }}>
        <canvas ref={canvas} role="img" aria-label={label} />
      </div>
      <figcaption>
        <span className={ui.fieldScale} aria-hidden="true" />
        <span>1 µT</span>
        <span>10 mT (log scale) · section through both pad centres · analytical filament model (F1), not FEM</span>
      </figcaption>
    </figure>
  );
}
