// The daylight sky, shared by the visible backdrop and the reflection
// environment so that paint, glass and metal reflect the same sky the visitor
// sees: a Rayleigh-like zenith-to-horizon gradient, a warm Mie halo and disc
// around the sun, thin procedural cumulus, and a warm-grey ground below the
// horizon. Colours are linear HDR; the renderer's tone mapping maps them.
// `studio` blends everything to the neutral inspection studio.
import { BackSide, Color, ShaderMaterial, Vector3 } from "three";

/** Direction toward the sun (late morning, from the south-east of the site), world frame. */
export const SUN_DIR = new Vector3(0.52, 0.62, 0.59).normalize();
/** Sun colour and the hemispheric sky/ground colours, linear. */
export const SUN_COLOR = new Color("#fff1de");
export const SKY_COLOR = new Color("#b9d1ee");
export const GROUND_COLOR = new Color("#6f665a");
/** Haze colour at the horizon (the fog uses it, so distance fades into the sky). */
export const HAZE = new Color("#c7d3de");

const vertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}`;

const fragment = /* glsl */ `
uniform vec3 sunDir;
uniform float studio;
uniform float sunScale;
uniform float clouds;
varying vec3 vDir;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(17.3, 9.1); a *= 0.5; }
  return v;
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 zenith = vec3(0.105, 0.245, 0.56);
  vec3 horizon = vec3(0.62, 0.70, 0.79);
  vec3 col = mix(horizon, zenith, pow(smoothstep(-0.02, 0.62, h), 0.55));
  // Thin bright band just above the horizon (multiple scattering).
  col += vec3(0.10, 0.10, 0.09) * exp(-abs(h) * 22.0);
  float mu = max(dot(d, sunDir), 0.0);
  // Mie halo and the sun disc.
  col += vec3(1.0, 0.84, 0.62) * (0.16 * pow(mu, 6.0) + 0.55 * pow(mu, 64.0)) * sunScale;
  col += vec3(1.0, 0.95, 0.85) * smoothstep(0.99955, 0.99985, mu) * 40.0 * sunScale;
  // Cumulus: a domain-warped fbm projected on a dome, fading out toward the horizon.
  if (h > 0.0 && clouds > 0.0) {
    vec2 uv = d.xz / (h + 0.18) * 1.6;
    float n = fbm(uv + 0.6 * fbm(uv * 0.7 + 3.1));
    float c = smoothstep(0.52, 0.78, n) * smoothstep(0.0, 0.22, h) * clouds;
    vec3 lit = mix(vec3(0.86, 0.89, 0.94), vec3(1.25, 1.18, 1.08), pow(mu, 3.0));
    col = mix(col, lit * (0.82 + 0.25 * n), c * 0.85);
  }
  // Below the horizon: warm-grey ground fading into the haze.
  if (h < 0.0) col = mix(horizon * 0.82, vec3(0.20, 0.19, 0.17), smoothstep(0.0, 0.2, -h));
  // Inspection studio: a calm graphite gradient, lighter at the floor line.
  vec3 st = mix(vec3(0.030, 0.042, 0.058), vec3(0.008, 0.012, 0.018), smoothstep(-0.1, 0.7, h));
  st += vec3(0.035, 0.045, 0.06) * exp(-abs(h) * 9.0);
  col = mix(col, st, studio);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export function skyMaterial(opts: { sunScale?: number; clouds?: number } = {}): ShaderMaterial {
  return new ShaderMaterial({
    side: BackSide,
    depthWrite: false,
    // Drawn after the opaque scene at the far plane: only pixels where the sky is visible are shaded.
    depthTest: true,
    uniforms: {
      sunDir: { value: SUN_DIR.clone() },
      studio: { value: 0 },
      sunScale: { value: opts.sunScale ?? 1 },
      clouds: { value: opts.clouds ?? 1 },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  });
}
