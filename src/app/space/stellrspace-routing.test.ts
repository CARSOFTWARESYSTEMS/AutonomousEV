import { describe, expect, it } from "vitest";
import nextConfig from "../../../next.config";

type Rule = { source: string; has?: { type: string; value?: string }[]; destination: string; permanent?: boolean };

const HOST = "aerospace.stellrspace.com";
const matchesHost = (rule: Rule, host: string) =>
  rule.has?.some((h) => h.type === "host" && new RegExp(`^${h.value}$`).test(host)) ?? false;

describe("aerospace.stellrspace.com routing", () => {
  it("redirects the host's root to /space, permanently", async () => {
    const redirects = (await nextConfig.redirects!()) as Rule[];
    const rule = redirects.find((r) => r.source === "/" && matchesHost(r, HOST));
    expect(rule).toMatchObject({ destination: "/space", permanent: true });
    // The host pattern matches that host only.
    expect(matchesHost(rule!, "aerospacexstellrspace.com")).toBe(false);
    expect(matchesHost(rule!, "aerospace.gamyaa.in")).toBe(false);
    expect(matchesHost(rule!, "stellrspace.com")).toBe(false);
  });

  it("serves the regular Space page at /space (no host rewrite)", async () => {
    const rewrites = (await nextConfig.rewrites!()) as { beforeFiles: Rule[] };
    expect(rewrites.beforeFiles.find((r) => r.source === "/space" && matchesHost(r, HOST))).toBeUndefined();
  });
});
