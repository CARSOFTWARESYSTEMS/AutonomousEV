// Device gating for the explorer: which experience to mount, and how much
// rendering quality the device can sustain. Decisions use viewport size and
// measured capabilities — never the user-agent string.

/** Minimum viewport width for the full interactive 3D application. */
export const DESKTOP_MIN_WIDTH = 1024;
export const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`;
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** `mobile` = compact learning page; `fallback` = desktop-sized viewport without usable WebGL. */
export type Experience = "desktop" | "mobile" | "fallback";

export function resolveExperience({ width, webgl }: { width: number; webgl: boolean }): Experience {
  if (width < DESKTOP_MIN_WIDTH) return "mobile";
  return webgl ? "desktop" : "fallback";
}

export interface WebGLSupport {
  supported: boolean;
  webgl2: boolean;
  /** True when the browser is rendering WebGL on the CPU. */
  software: boolean;
}

const SOFTWARE_RENDERER = /swiftshader|llvmpipe|software|basic render/i;

export function detectWebGL(): WebGLSupport {
  if (typeof document === "undefined") return { supported: false, webgl2: false, software: false };
  try {
    const canvas = document.createElement("canvas");
    const gl2 = canvas.getContext("webgl2");
    const gl = gl2 ?? canvas.getContext("webgl");
    if (!gl) return { supported: false, webgl2: false, software: false };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { supported: true, webgl2: Boolean(gl2), software: SOFTWARE_RENDERER.test(renderer) };
  } catch {
    return { supported: false, webgl2: false, software: false };
  }
}

let cachedSupport: WebGLSupport | null = null;
/** WebGL is probed once per page, and only when something asks for it. */
export const getWebGLSupport = (): WebGLSupport => (cachedSupport ??= detectWebGL());

export type QualityTier = "high" | "medium" | "low";

export interface DeviceCapabilities {
  devicePixelRatio: number;
  /** navigator.deviceMemory in GB, where the browser exposes it. */
  deviceMemoryGb?: number;
  hardwareConcurrency?: number;
  webgl2: boolean;
  softwareRenderer: boolean;
}

export interface QualitySettings {
  tier: QualityTier;
  /** Renderer pixel ratio, already clamped. */
  dpr: number;
  shadows: boolean;
  shadowMapSize: number;
  postprocessing: boolean;
  starCount: number;
  earthTexture: "4k" | "2k";
  clouds: boolean;
}

/** Never render above this pixel ratio, whatever the display reports. */
export const MAX_DPR = 1.75;

export function selectQualityTier(caps: DeviceCapabilities): QualityTier {
  const memory = caps.deviceMemoryGb ?? 8;
  const cores = caps.hardwareConcurrency ?? 8;
  if (caps.softwareRenderer || !caps.webgl2 || memory <= 2 || cores <= 2) return "low";
  if (memory < 8 || cores < 8) return "medium";
  return "high";
}

export function selectQuality(caps: DeviceCapabilities): QualitySettings {
  const tier = selectQualityTier(caps);
  const dpr = Math.max(1, caps.devicePixelRatio || 1);
  switch (tier) {
    case "high":
      return { tier, dpr: Math.min(dpr, MAX_DPR), shadows: true, shadowMapSize: 2048, postprocessing: true, starCount: 2600, earthTexture: "4k", clouds: true };
    case "medium":
      return { tier, dpr: Math.min(dpr, 1.5), shadows: true, shadowMapSize: 1024, postprocessing: true, starCount: 1800, earthTexture: "2k", clouds: true };
    case "low":
      return { tier, dpr: 1, shadows: false, shadowMapSize: 512, postprocessing: false, starCount: 900, earthTexture: "2k", clouds: false };
  }
}

export function readDeviceCapabilities(webgl: WebGLSupport): DeviceCapabilities {
  const nav = typeof navigator === "undefined" ? undefined : (navigator as Navigator & { deviceMemory?: number });
  return {
    devicePixelRatio: typeof window === "undefined" ? 1 : window.devicePixelRatio || 1,
    deviceMemoryGb: nav?.deviceMemory,
    hardwareConcurrency: nav?.hardwareConcurrency,
    webgl2: webgl.webgl2,
    softwareRenderer: webgl.software,
  };
}
