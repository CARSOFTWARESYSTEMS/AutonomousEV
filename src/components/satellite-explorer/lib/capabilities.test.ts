import { describe, expect, it } from "vitest";
import { DESKTOP_MIN_WIDTH, MAX_DPR, resolveExperience, selectQuality, selectQualityTier } from "./capabilities";

describe("experience breakpoint", () => {
  it("gives phones and portrait tablets the compact page, whatever their WebGL support", () => {
    for (const width of [320, 390, 768, 900, 1023]) {
      expect(resolveExperience({ width, webgl: true })).toBe("mobile");
      expect(resolveExperience({ width, webgl: false })).toBe("mobile");
    }
  });

  it("gives the full 3D application from 1024 px up when WebGL works", () => {
    expect(DESKTOP_MIN_WIDTH).toBe(1024);
    for (const width of [1024, 1280, 1440, 1920, 2560]) {
      expect(resolveExperience({ width, webgl: true })).toBe("desktop");
    }
  });

  it("falls back to the static overview on a wide viewport without WebGL", () => {
    expect(resolveExperience({ width: 1440, webgl: false })).toBe("fallback");
  });
});

describe("render quality", () => {
  const capable = { devicePixelRatio: 2, deviceMemoryGb: 8, hardwareConcurrency: 8, webgl2: true, softwareRenderer: false };

  it("never renders above the pixel-ratio clamp", () => {
    expect(MAX_DPR).toBe(1.75);
    expect(selectQuality({ ...capable, devicePixelRatio: 3 }).dpr).toBe(1.75);
    expect(selectQuality({ ...capable, devicePixelRatio: 1 }).dpr).toBe(1);
    expect(selectQuality({ ...capable, devicePixelRatio: 3, deviceMemoryGb: 4 }).dpr).toBe(1.5);
  });

  it("uses the full feature set on a capable device", () => {
    const quality = selectQuality(capable);
    expect(quality).toMatchObject({ tier: "high", shadows: true, postprocessing: true, earthTexture: "4k", clouds: true });
  });

  it("steps down for mid-range devices without dropping the essentials", () => {
    expect(selectQualityTier({ ...capable, deviceMemoryGb: 4 })).toBe("medium");
    expect(selectQualityTier({ ...capable, hardwareConcurrency: 4 })).toBe("medium");
    expect(selectQuality({ ...capable, hardwareConcurrency: 4 })).toMatchObject({ shadows: true, postprocessing: true, earthTexture: "2k" });
  });

  it("drops shadows, post-processing and clouds on weak or software-rendered devices", () => {
    for (const caps of [
      { ...capable, softwareRenderer: true },
      { ...capable, webgl2: false },
      { ...capable, deviceMemoryGb: 2 },
      { ...capable, hardwareConcurrency: 2 },
    ]) {
      expect(selectQuality(caps)).toMatchObject({ tier: "low", dpr: 1, shadows: false, postprocessing: false, clouds: false });
    }
  });

  it("assumes a capable device when the browser does not report memory or cores", () => {
    expect(selectQualityTier({ devicePixelRatio: 2, webgl2: true, softwareRenderer: false })).toBe("high");
  });

  it("asks for fewer stars as quality drops", () => {
    const high = selectQuality(capable).starCount;
    const low = selectQuality({ ...capable, softwareRenderer: true }).starCount;
    expect(low).toBeLessThan(high);
  });
});
