import { describe, expect, it } from "vitest";
import {
  AUTH_SITES,
  authRewrites,
  authSiteForHost,
  getLoginUrl,
  hostSiteIds,
  loginHref,
  returnPathFor,
  sanitizeReturnPath,
  withoutCredentialParams,
  workspaceUrlFor,
} from "./sites";

/** The specification's host → login service table. */
const SPEC: Record<string, string> = {
  "itelematics.com": "https://login.itelematics.com",
  "www.itelematics.com": "https://login.itelematics.com",
  "ev.engineer": "https://login.autonomous.ev.engineer",
  "www.ev.engineer": "https://login.autonomous.ev.engineer",
  "autonomous.ev.engineer": "https://login.autonomous.ev.engineer",
  "aerospace.ev.engineer": "https://login.autonomous.ev.engineer",
  "aerospace.ishavasyam.org": "https://login.autonomous.ev.engineer",
  "gamyaa.in": "https://login.gamyaa.in",
  "www.gamyaa.in": "https://login.gamyaa.in",
  "aerospace.gamyaa.in": "https://login.gamyaa.in",
  "aerosystems.gamyaa.in": "https://login.gamyaa.in",
  "uflight.in": "https://login.uflight.in",
  "www.uflight.in": "https://login.uflight.in",
  "cybersecurity.uflight.in": "https://login.uflight.in",
};

const page = (url: string) => {
  const u = new URL(url);
  return { hostname: u.hostname, pathname: u.pathname, search: u.search, hash: u.hash };
};

/** What the login service receives as `return` for a Login click on `url`. */
const returnOf = (url: string) => {
  const href = loginHref(page(url));
  return href === null ? null : new URL(href, "https://x.invalid").searchParams.get("return");
};

describe("login service per host", () => {
  it("is exactly the specified table, and nothing else has a login service", () => {
    const table = Object.fromEntries(AUTH_SITES.flatMap((site) => site.hosts.map((host) => [host, getLoginUrl(host)])));
    expect(table).toEqual(SPEC);
  });

  it.each(Object.entries(SPEC))("%s signs in at %s", (host, url) => {
    expect(getLoginUrl(host)).toBe(url);
  });

  it("names each brand as the prompt shows it", () => {
    expect(authSiteForHost("itelematics.com")?.brand).toBe("iTelematics®");
    expect(authSiteForHost("aerospace.ev.engineer")?.brand).toBe("EV.ENGINEER™");
    expect(authSiteForHost("aerospace.ishavasyam.org")?.brand).toBe("EV.ENGINEER™");
    expect(authSiteForHost("aerospace.gamyaa.in")?.brand).toBe("Gamyaa AeroSystems");
    expect(authSiteForHost("cybersecurity.uflight.in")?.brand).toBe("UFlight™");
  });

  it("maps every host to exactly one service", () => {
    const hosts = AUTH_SITES.flatMap((site) => site.hosts);
    expect(new Set(hosts).size).toBe(hosts.length);
  });

  it("normalises case, a port and a trailing dot", () => {
    expect(getLoginUrl("AeroSpace.EV.Engineer")).toBe("https://login.autonomous.ev.engineer");
    expect(getLoginUrl("www.uflight.in.")).toBe("https://login.uflight.in");
    expect(getLoginUrl("autonomous.ev.engineer:443")).toBe("https://login.autonomous.ev.engineer");
  });

  it.each([
    "ishavasyam.org",
    "www.ishavasyam.org",
    "localhost",
    "evil.example",
    "ev.engineer.evil.example",
    "evil-ev.engineer",
    "deep.aerospace.ev.engineer",
    "login.autonomous.ev.engineer",
    "itelematics.co",
    "",
    "javascript:alert(1)",
    "https://ev.engineer",
  ])("has no service on %j", (host) => {
    expect(getLoginUrl(host)).toBeNull();
    expect(loginHref({ hostname: host, pathname: "/", search: "", hash: "" })).toBeNull();
  });

  it("sends Workspace to the Engineering Command Center on the site's own login host", () => {
    expect(workspaceUrlFor(authSiteForHost("aerospace.gamyaa.in")!)).toBe("https://login.gamyaa.in/");
    expect(workspaceUrlFor(authSiteForHost("autonomous.ev.engineer")!)).toBe("https://login.autonomous.ev.engineer/");
  });
});

describe("return to the exact page", () => {
  it.each([
    ["https://autonomous.ev.engineer/space/satellite-engineering/interactive-3d", "/space/satellite-engineering/interactive-3d"],
    ["https://ev.engineer/internships/toolkit?mode=advanced#telemetry", "/internships/toolkit?mode=advanced#telemetry"],
    ["https://aerospace.ev.engineer/aerospace/uflight-3d?view=orbit&q=a%20b#top", "/aerospace/uflight-3d?view=orbit&q=a%20b#top"],
    ["https://itelematics.com/research", "/research"],
    ["https://gamyaa.in/aerosystems/daqip", "/aerosystems/daqip"],
    ["https://uflight.in/research", "/research"],
    ["https://cybersecurity.uflight.in/aerospace", "/aerospace"],
    ["https://aerospace.ishavasyam.org/space/model-rocketry?level=intro#stability", "/space/model-rocketry?level=intro#stability"],
  ])("%s returns to %s", (url, expected) => {
    expect(returnOf(url)).toBe(expected);
  });

  it("starts sign-in on the site's own /api/auth/login, never on an absolute URL", () => {
    expect(loginHref(page("https://aerospace.ev.engineer/aerospace?x=1#y"))).toBe(
      `/api/auth/login?return=${encodeURIComponent("/aerospace?x=1#y")}`,
    );
  });

  it("keeps query parameters exactly as encoded, dropping only credential-like ones", () => {
    expect(withoutCredentialParams("?q=a%20b&tag=x+y&empty=&flag")).toBe("?q=a%20b&tag=x+y&empty=&flag");
    expect(withoutCredentialParams("?mode=advanced&code=abc&state=xyz&TOKEN=1&access_token=2&sid=3")).toBe("?mode=advanced");
    expect(withoutCredentialParams("?code=abc")).toBe("");
    expect(withoutCredentialParams("")).toBe("");
    expect(returnOf("https://autonomous.ev.engineer/av-concepts?id_token=x&page=2#faq")).toBe("/av-concepts?page=2#faq");
  });

  it("drops the hash, then the query, rather than exceed the service's 2048-character limit", () => {
    const longHash = `#${"h".repeat(2100)}`;
    expect(returnOf(`https://aerospace.ev.engineer/aerospace?view=orbit${longHash}`)).toBe("/aerospace?view=orbit");
    const longQuery = `?q=${"a".repeat(2100)}`;
    expect(returnOf(`https://aerospace.ev.engineer/aerospace${longQuery}`)).toBe("/aerospace");
  });

  it.each([
    "https://evil.example/",
    "//evil.example/",
    "/\\evil.example",
    "\\\\evil.example",
    "javascript:alert(1)",
    "data:text/html,hi",
    "relative/path",
    "/ok\nLocation: https://evil.example",
    "/tab\there",
    "",
  ])("refuses %j as a return destination", (raw) => {
    expect(sanitizeReturnPath(raw, "aerospace.ev.engineer")).toBeNull();
  });

  it("normalises a path so it can only resolve on its own host", () => {
    expect(sanitizeReturnPath("/a/../b?x=1#y", "ev.engineer")).toBe("/b?x=1#y");
    expect(sanitizeReturnPath("/space path", "ev.engineer")).toBe("/space%20path");
  });

  it("falls back to the home page when the path itself cannot be used", () => {
    expect(returnPathFor({ hostname: "ev.engineer", pathname: `/${"p".repeat(2100)}`, search: "", hash: "" })).toBe("/");
  });
});

describe("rewrites to Intern2026", () => {
  const rewrites = authRewrites();

  it("serves login, callback, session and logout for every host from its own login host", () => {
    expect(rewrites).toHaveLength(Object.keys(SPEC).length);
    for (const [host, loginUrl] of Object.entries(SPEC)) {
      const rule = rewrites.find((r) => r.has[0].value === host.replace(/\./g, "\\."));
      expect(rule, host).toEqual({
        source: "/api/auth/:action(login|callback|session|logout)",
        has: [{ type: "host", value: host.replace(/\./g, "\\.") }],
        destination: `${loginUrl}/api/auth/app/${host}/:action`,
      });
    }
  });

  it("sends aerospace.gamyaa.in and cybersecurity.uflight.in to their own providers, not EV.ENGINEER", () => {
    const dest = (host: string) => rewrites.find((r) => r.has[0].value === host.replace(/\./g, "\\."))?.destination;
    expect(dest("aerospace.gamyaa.in")).toBe("https://login.gamyaa.in/api/auth/app/aerospace.gamyaa.in/:action");
    expect(dest("cybersecurity.uflight.in")).toBe("https://login.uflight.in/api/auth/app/cybersecurity.uflight.in/:action");
  });

  it("matches hosts literally (dots escaped)", () => {
    for (const rule of rewrites) expect(rule.has[0].value).not.toMatch(/(^|[^\\])\.(?!\*)/);
  });

  it("gives the pre-paint flag every host", () => {
    expect(Object.keys(hostSiteIds()).sort()).toEqual(Object.keys(SPEC).sort());
    expect(hostSiteIds()["aerospace.gamyaa.in"]).toBe("gamyaa");
  });
});
