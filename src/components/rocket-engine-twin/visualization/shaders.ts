// Materials for what cannot be seen on a real engine: flow, pressure, heat,
// combustion, the plume and the twin's reference state. Each one encodes a
// quantity; none is decoration. All are additive and kept restrained.
import { AdditiveBlending, Color, DoubleSide, FrontSide, ShaderMaterial } from "three";

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vLocal;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

/** Low to high pressure, or cool to hot coolant: blue, pale, red. */
const RAMP = /* glsl */ `
  vec3 ramp(float t) {
    vec3 low = vec3(0.22, 0.44, 0.88);
    vec3 mid = vec3(0.93, 0.88, 0.74);
    vec3 high = vec3(0.94, 0.36, 0.28);
    t = clamp(t, 0.0, 1.0);
    return t < 0.5 ? mix(low, mid, t * 2.0) : mix(mid, high, (t - 0.5) * 2.0);
  }
`;

const base = { transparent: true, depthWrite: false, blending: AdditiveBlending, toneMapped: false } as const;

/** Something moving along a pipe: a faint continuous line with pulses travelling down it. */
export function flowMaterial(color: string, repeat: number, speed = 0.5): ShaderMaterial {
  return new ShaderMaterial({
    ...base,
    side: FrontSide,
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0 }, uColor: { value: new Color(color) }, uRepeat: { value: repeat }, uSpeed: { value: speed }, uPressure: { value: 0 }, uP0: { value: 0 }, uP1: { value: 0 } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uTime, uStrength, uRepeat, uSpeed, uPressure, uP0, uP1;
      uniform vec3 uColor;
      varying vec2 vUv;
      ${RAMP}
      void main() {
        float d = fract(vUv.x * uRepeat - uTime * uSpeed);
        float pulse = smoothstep(0.0, 0.22, d) * (1.0 - smoothstep(0.5, 1.0, d));
        vec3 color = mix(uColor, ramp(mix(uP0, uP1, vUv.x)), uPressure);
        // With pressure shown the line is steady: the colour is the message, not the motion.
        float alpha = uStrength * mix(0.16 + 0.6 * pulse, 0.5 + 0.2 * pulse, uPressure);
        gl_FragColor = vec4(color * (0.6 + 0.5 * pulse), alpha);
        #include <colorspace_fragment>
      }
    `,
  });
}

/**
 * Coolant in the wall: it climbs from the inlet manifold and warms as it goes.
 * `passages` draws it as separate channels (the wall seen from outside); without
 * it the coolant is a solid band (the wall seen in section). Conceptual: no dimensions.
 */
export function coolantMaterial(bottom: number, top: number, passages: boolean): ShaderMaterial {
  return new ShaderMaterial({
    ...base,
    side: DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
    uniforms: { uTime: { value: 0 }, uStrength: { value: 0 }, uHeat: { value: 1 }, uBottom: { value: bottom }, uTop: { value: top }, uPassages: { value: passages ? 1 : 0 } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uTime, uStrength, uHeat, uBottom, uTop, uPassages;
      varying vec2 vUv;
      varying vec3 vLocal;
      ${RAMP}
      void main() {
        float along = clamp((vLocal.y - uBottom) / (uTop - uBottom), 0.0, 1.0);
        float passage = mix(1.0, smoothstep(0.15, 0.5, abs(fract(vUv.x * 60.0) - 0.5) * 2.0), uPassages);
        float d = fract(vLocal.y * 5.5 - uTime * 0.6);
        float pulse = smoothstep(0.0, 0.3, d) * (1.0 - smoothstep(0.55, 1.0, d));
        vec3 color = ramp(along * 0.6 * uHeat);
        gl_FragColor = vec4(color * (0.34 + 0.34 * pulse), uStrength * (0.14 + 0.3 * pulse) * (0.2 + 0.8 * passage));
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Heat load on the gas side of the wall. It peaks at the throat. */
export function wallHeatMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    ...base,
    side: DoubleSide,
    uniforms: { uHeat: { value: 0 } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uHeat;
      varying vec3 vLocal;
      void main() {
        float throat = exp(-pow(vLocal.y / 0.19, 2.0));
        float load = uHeat * (0.3 + 0.7 * throat);
        vec3 cool = vec3(0.45, 0.06, 0.03);
        vec3 warm = vec3(0.98, 0.42, 0.1);
        vec3 hot = vec3(1.0, 0.9, 0.66);
        vec3 color = load < 0.5 ? mix(cool, warm, load * 2.0) : mix(warm, hot, clamp((load - 0.5) * 1.4, 0.0, 1.0));
        gl_FragColor = vec4(color, clamp(load, 0.0, 1.0) * 0.9);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** The burning gas: a mixing zone under the injector, a bright combustion region, converging to the throat. Conceptual. */
export function combustionMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    ...base,
    side: FrontSide,
    uniforms: { uTime: { value: 0 }, uActivity: { value: 0 }, uTop: { value: 0.78 } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uTime, uActivity, uTop;
      varying vec3 vLocal;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float depth = clamp((uTop - vLocal.y) / uTop, 0.0, 1.0);
        float body = pow(abs(dot(vNormal, vView)), 1.3);
        float mixing = smoothstep(0.0, 0.26, depth);
        float flicker = 0.92 + 0.08 * sin(uTime * 23.0 + vLocal.y * 31.0);
        vec3 pale = vec3(0.62, 0.78, 1.0);
        vec3 bright = vec3(1.0, 0.93, 0.78);
        vec3 deep = vec3(1.0, 0.56, 0.22);
        vec3 color = mix(pale, mix(bright, deep, smoothstep(0.45, 1.0, depth)), mixing);
        gl_FragColor = vec4(color * flicker, uActivity * body * (0.22 + 0.36 * mixing));
        #include <colorspace_fragment>
      }
    `,
  });
}

/** Exhaust: a bright core that fades smoothly as it expands. How far it spreads depends on the ambient pressure. */
export function plumeMaterial(core: number): ShaderMaterial {
  return new ShaderMaterial({
    ...base,
    side: FrontSide,
    uniforms: { uTime: { value: 0 }, uPlume: { value: 0 }, uSpread: { value: 0.05 }, uDiamonds: { value: 1 }, uExit: { value: -1.6 }, uLength: { value: 2.9 }, uCore: { value: core } },
    vertexShader: /* glsl */ `
      uniform float uSpread, uExit, uLength;
      varying vec3 vLocal;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vBelow;
      void main() {
        vBelow = clamp((uExit - position.y) / uLength, 0.0, 1.0);
        vec3 p = position;
        p.xz *= 1.0 + uSpread * vBelow * 3.2;
        vLocal = p;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uPlume, uDiamonds, uCore, uSpread;
      varying vec3 vLocal;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vBelow;
      void main() {
        float body = pow(abs(dot(vNormal, vView)), 1.6);
        float fade = pow(1.0 - vBelow, 1.7 + uSpread * 2.0);
        float diamonds = 1.0 + uDiamonds * 0.55 * sin(vBelow * 30.0) * exp(-vBelow * 3.4) * step(0.001, vBelow);
        float shimmer = 0.95 + 0.05 * sin(uTime * 17.0 + vLocal.y * 9.0);
        vec3 inner = vec3(1.0, 0.95, 0.86);
        vec3 outer = vec3(0.98, 0.52, 0.24);
        vec3 color = mix(outer, inner, uCore);
        float alpha = uPlume * body * fade * diamonds * shimmer * mix(0.16, 0.5, uCore) / (1.0 + uSpread * 1.6);
        gl_FragColor = vec4(color, alpha);
        #include <colorspace_fragment>
      }
    `,
  });
}

/** The twin's expected state: the same geometry, drawn as a pale outline that the observed engine is measured against. */
export function ghostMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    ...base,
    side: FrontSide,
    uniforms: { uGhost: { value: 0 }, uColor: { value: new Color("#a9d4ff") } },
    vertexShader: VERTEX,
    fragmentShader: /* glsl */ `
      uniform float uGhost;
      uniform vec3 uColor;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.4);
        gl_FragColor = vec4(uColor, uGhost * (0.035 + 0.5 * rim));
        #include <colorspace_fragment>
      }
    `,
  });
}

export const FLOW_COLOR = { oxidiser: "#6fb7ff", fuel: "#f2a544", coolant: "#5ed3e6", hot: "#f07a4a", data: "#a9cdf7" } as const;
