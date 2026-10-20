import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { APEX_EVENTS } from "./analytics";
import { CAPABILITY_DEFINITIONS } from "./capabilities";
import { EVIDENCE, GLOBAL_PROHIBITED_PHRASES } from "./evidence";
import { APEX_IMAGES, imageFile } from "./images";
import { MISSION_TO_FLIGHT } from "./lifecycle";
import { CAPABILITIES, CAPABILITY_PARTNERS, capabilitiesForPartner, capability, partnersForCapability } from "./partner-capabilities";
import { PARTNERS } from "./partners";
import { OWNER_CONFIRM_REQUIRED, ROADMAP, roadmapDateLabel } from "./roadmap";
import { APEX_OFFICIAL_SITE_URL, APEX_ROUTES, apexAsset, apexHref, apexUrl } from "./site";
import { ENGINE_BLOCKS, SYSTEM_DOMAINS } from "./system";
import { CONTRIBUTION_AREAS } from "./business";
import { INSTRUMENTATION_CHAIN } from "./validation";

const ROOT = path.resolve(__dirname, "../../..");
const capabilityIds = new Set(CAPABILITIES.map((item) => item.id));
const partnerIds = new Set(PARTNERS.map((item) => item.id));
const capsOf = (partnerId: string) => capabilitiesForPartner(partnerId).map(({ capability }) => capability.id).sort();

describe("partner ⇄ capability model", () => {
  it("links only known partners to known capabilities, once per pair", () => {
    const pairs = new Set<string>();
    for (const record of CAPABILITY_PARTNERS) {
      expect(capabilityIds.has(record.capabilityId), record.capabilityId).toBe(true);
      expect(partnerIds.has(record.partnerId), record.partnerId).toBe(true);
      const key = `${record.capabilityId}|${record.partnerId}`;
      expect(pairs.has(key), key).toBe(false);
      pairs.add(key);
      expect(record.role.length).toBeGreaterThan(0);
      expect(record.contribution.length).toBeGreaterThan(0);
      expect(record.relationshipStatus).toMatch(/^(PROGRAM_OWNER|COLLABORATION|PROPOSED|CONFIRMED|TO_BE_IDENTIFIED)$/);
    }
  });

  it("is many-to-many: capabilities with several partners, partners with several capabilities", () => {
    expect(CAPABILITIES.some((item) => item.partners.length >= 2)).toBe(true);
    for (const id of ["apex", "gamyaa", "ifab", "itelematics", "evsociety"]) expect(capsOf(id).length, id).toBeGreaterThanOrEqual(2);
    for (const item of CAPABILITIES) expect(Array.isArray(item.partners)).toBe(true);
  });

  it("shows Partner Required, never a guess, where no partner is linked", () => {
    for (const item of CAPABILITIES) {
      if (item.partners.length === 0) expect(item.status, item.id).toBe("PARTNER_REQUIRED");
      if (item.status === "PARTNER_REQUIRED") expect(partnersForCapability(item.id)).toHaveLength(0);
    }
  });

  it("keeps iTelematics to Cybersecurity and AI only", () => {
    expect(capsOf("itelematics")).toEqual(["cybersecurity", "engineering-ai"]);
  });

  it("never places Gamyaa AeroSystems under Cybersecurity or AI", () => {
    expect(capsOf("gamyaa")).not.toContain("cybersecurity");
    expect(capsOf("gamyaa")).not.toContain("engineering-ai");
    expect(capsOf("gamyaa")).toEqual(
      expect.arrayContaining(["digital-twin", "simulation", "software-engineering", "ground-software", "test-data", "manufacturing-quality", "digital-quality-thread", "quality-intelligence", "systems-engineering"]),
    );
  });

  it("gives iFab Innovations embedded systems and firmware work, and EV Society skills and workforce", () => {
    expect(capsOf("ifab")).toContain("embedded-firmware");
    expect(capsOf("ifab").every((id) => ["embedded-firmware", "engine-control", "sensors-instrumentation"].includes(id))).toBe(true);
    expect(capsOf("evsociety")).toEqual(["research-academia", "skills-workforce"]);
  });

  it("keeps APEX as program owner, Gamyaa AeroSystems in an engineering collaboration, and every other relationship proposed", () => {
    for (const record of CAPABILITY_PARTNERS) {
      const key = `${record.partnerId}|${record.capabilityId}`;
      if (record.partnerId === "apex") expect(record.relationshipStatus, key).toBe("PROGRAM_OWNER");
      else if (record.partnerId === "gamyaa") expect(record.relationshipStatus, key).toBe("COLLABORATION");
      else expect(record.relationshipStatus, key).toMatch(/^(PROPOSED|TO_BE_IDENTIFIED)$/);
    }
    for (const p of PARTNERS) {
      if (p.id === "gamyaa") expect(p.relationshipStatus).toBe("ENGINEERING_COLLABORATION");
      else expect(p.relationshipStatus, p.id).not.toBe("ENGINEERING_COLLABORATION");
    }
    expect(PARTNERS.find((p) => p.id === "gamyaa")?.description).not.toMatch(/propos/i);
    for (const id of ["digital-twin", "quality-intelligence", "test-data"]) expect(capability(id).status, id).toBe("COLLABORATION");
    expect(PARTNERS.find((p) => p.id === "apex")?.website).toBe(APEX_OFFICIAL_SITE_URL);
  });

  it("covers every open specialist capability the brief names, each able to take more partners", () => {
    const required = [
      "avionics", "sensors-instrumentation", "gnc", "rf-telemetry", "structures", "mechanical-systems", "aerospace-manufacturing", "additive-manufacturing",
      "precision-machining", "materials", "special-processes", "welding-brazing", "ndt", "environmental-testing", "propulsion-test-infrastructure",
      "structural-test-labs", "emi-emc", "gse", "launch-operations", "regulatory-safety", "supply-chain",
    ];
    for (const id of required) expect(capabilityIds.has(id), id).toBe(true);
    for (const item of CAPABILITY_DEFINITIONS) expect(item.additionalOpportunities.length, item.id).toBeGreaterThan(0);
  });

  it("references only real capabilities from capabilities, system domains, engine blocks, lifecycle stages and contribution areas", () => {
    for (const item of CAPABILITY_DEFINITIONS) for (const id of item.connectsTo) expect(capabilityIds.has(id), `${item.id} → ${id}`).toBe(true);
    for (const domain of SYSTEM_DOMAINS) for (const id of domain.capabilityIds) expect(capabilityIds.has(id), `${domain.id} → ${id}`).toBe(true);
    for (const block of ENGINE_BLOCKS) for (const id of block.capabilityIds) expect(capabilityIds.has(id), `${block.id} → ${id}`).toBe(true);
    for (const node of MISSION_TO_FLIGHT) for (const id of node.capabilityIds) expect(capabilityIds.has(id), `${node.id} → ${id}`).toBe(true);
    for (const area of CONTRIBUTION_AREAS) {
      for (const id of area.capabilityIds) expect(capabilityIds.has(id), `${area.id} → ${id}`).toBe(true);
      for (const id of area.lifecycleIds) expect(MISSION_TO_FLIGHT.some((node) => node.id === id), `${area.id} → ${id}`).toBe(true);
    }
    for (const step of INSTRUMENTATION_CHAIN) for (const id of step.capabilityIds) expect(capabilityIds.has(id), `${step.id} → ${id}`).toBe(true);
  });
});

describe("system model", () => {
  it("has the eighteen domains of the brief, with interfaces that point at real domains", () => {
    expect(SYSTEM_DOMAINS.map((d) => d.name)).toEqual(
      expect.arrayContaining([
        "Propulsion", "Structures", "Avionics", "Embedded Systems", "Firmware", "Sensors", "Instrumentation", "GNC", "Telemetry", "RF Communications",
        "Power", "Flight Software", "Ground Software", "Ground Hardware", "Quality", "Cybersecurity", "Digital Engineering", "Testing",
      ]),
    );
    expect(SYSTEM_DOMAINS).toHaveLength(18);
    const ids = new Set(SYSTEM_DOMAINS.map((d) => d.id));
    for (const domain of SYSTEM_DOMAINS) for (const other of domain.interfaces) expect(ids.has(other), `${domain.id} → ${other}`).toBe(true);
  });

  it("marks only propulsion as built", () => {
    expect(SYSTEM_DOMAINS.filter((d) => d.status === "BUILT").map((d) => d.id)).toEqual(["propulsion"]);
  });

  it("runs the lifecycle from mission need to design iteration in 24 stages", () => {
    expect(MISSION_TO_FLIGHT).toHaveLength(24);
    expect(MISSION_TO_FLIGHT[0].label).toBe("Mission need");
    expect(MISSION_TO_FLIGHT.at(-1)?.label).toBe("Design iteration");
  });
});

describe("evidence and roadmap", () => {
  it("publishes no performance value whose basis APEX has not confirmed", () => {
    const withheld = EVIDENCE.filter((record) => !record.publish);
    expect(withheld.map((r) => r.id).sort()).toEqual(["engine-restart", "engine-specific-impulse"]);
    for (const record of withheld) {
      expect(record.ownerConfirmationRequired).toBe(true);
      expect(record.approvedWording).not.toMatch(/\d+\s*s\b|isp|restart/i);
    }
  });

  it("never approves wording that contains a prohibited phrase", () => {
    for (const record of EVIDENCE) {
      for (const phrase of [...GLOBAL_PROHIBITED_PHRASES, ...record.prohibitedWording]) {
        expect(record.approvedWording.toLowerCase(), `${record.id}: ${phrase}`).not.toContain(phrase.toLowerCase());
      }
    }
  });

  it("guesses no dates and ties every roadmap item to evidence", () => {
    for (const item of ROADMAP) {
      if (!item.ownerConfirmed) expect(item.dateOrPeriod).toBe(OWNER_CONFIRM_REQUIRED);
      if (item.dateOrPeriod === OWNER_CONFIRM_REQUIRED) expect(roadmapDateLabel(item)).toMatch(/owner confirmation required/i);
      if (/^[a-z-]+$/.test(item.evidence)) expect(EVIDENCE.some((record) => record.id === item.evidence), item.evidence).toBe(true);
      if (item.status === "BUILT" || item.status === "ACTIVE" || item.status === "PLANNED") {
        const record = EVIDENCE.find((r) => r.id === item.evidence);
        expect(record?.status, item.id).toMatch(/CONFIRMED_PUBLIC|OWNER_CONFIRMED|PLANNED/);
      }
    }
  });
});

describe("images", () => {
  it("keeps every original and publishes every listed size in AVIF, WebP and JPEG", () => {
    for (const image of APEX_IMAGES) {
      expect(fs.existsSync(path.join(ROOT, "public/apexrocketsystems/original", image.file)), image.file).toBe(true);
      for (const width of image.widths) {
        for (const format of ["avif", "webp", "jpg"] as const) {
          const file = path.join(ROOT, "public", imageFile(image, width, format));
          expect(fs.existsSync(file), file).toBe(true);
        }
      }
    }
  });

  it("names no component it cannot confirm, and asks APEX to confirm every caption", () => {
    for (const image of APEX_IMAGES) {
      expect(image.ownerConfirmationRequired).toBe(true);
      for (const text of [image.publicCaption, image.alt]) expect(text, image.id).not.toMatch(/turbopump|injector|combustion chamber|gas generator|valve|igniter|thrust chamber/i);
      expect(image.alt.length).toBeGreaterThan(20);
    }
  });
});

describe("portability", () => {
  it("builds every link and canonical URL from the configured base path and host", () => {
    expect(apexHref("/")).toBe("/space/partners/apexrocketsystems");
    expect(apexHref("/engine")).toBe("/space/partners/apexrocketsystems/engine");
    expect(apexHref("/company#contact")).toBe("/space/partners/apexrocketsystems/company#contact");
    expect(apexUrl("/system")).toBe("https://aerospace.gamyaa.in/space/partners/apexrocketsystems/system");
    expect(apexAsset("brand/x.png")).toBe("/apexrocketsystems/brand/x.png");
    expect(APEX_ROUTES).toHaveLength(8);
  });

  it("moves to APEX's own host by configuration alone", async () => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_APEX_BASE_PATH", "/");
    vi.stubEnv("NEXT_PUBLIC_APEX_SITE_URL", "https://www.apexrocketsystems.com/");
    vi.stubEnv("NEXT_PUBLIC_APEX_PARENT_PORTAL", "none");
    const site = await import("./site");
    expect(site.apexHref("/")).toBe("/");
    expect(site.apexHref("/engine")).toBe("/engine");
    expect(site.apexUrl("/engine")).toBe("https://www.apexrocketsystems.com/engine");
    expect(site.APEX_PARENT_PORTAL).toBeNull();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("writes the microsite's base path nowhere but the configuration", () => {
    const dirs = ["src/components/apex", "src/data/apex"];
    const offenders: string[] = [];
    for (const dir of dirs) {
      for (const file of fs.readdirSync(path.join(ROOT, dir), { recursive: true }) as string[]) {
        if (!/\.(ts|tsx)$/.test(file) || /\.test\./.test(file) || file.endsWith("site.ts")) continue;
        if (fs.readFileSync(path.join(ROOT, dir, file), "utf-8").includes("/space/partners/apexrocketsystems")) offenders.push(`${dir}/${file}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("analytics", () => {
  it("declares every apex_ event the microsite reports", () => {
    const used = new Set<string>();
    for (const dir of ["src/components/apex", "src/app/space/partners"]) {
      for (const file of fs.readdirSync(path.join(ROOT, dir), { recursive: true }) as string[]) {
        if (!/\.(ts|tsx)$/.test(file) || /\.test\./.test(file)) continue;
        for (const match of fs.readFileSync(path.join(ROOT, dir, file), "utf-8").matchAll(/["'](apex_[a-z_]+)["']/g)) used.add(match[1]);
      }
    }
    expect(used.size).toBeGreaterThan(10);
    for (const event of used) expect(APEX_EVENTS as readonly string[], event).toContain(event);
  });
});

describe("collaboration wording", () => {
  it("never calls the APEX–Gamyaa AeroSystems relationship a proposal, in any APEX source, llms.txt or the docs", () => {
    const targets = ["src/components/apex", "src/data/apex", "src/app/space/partners", "src/app/space/components/PartnersEcosystem.tsx", "public/llms.txt", "docs/apexrocketsystems.md"];
    for (const dir of targets) {
      const full = path.join(ROOT, dir);
      const files = fs.statSync(full).isDirectory() ? (fs.readdirSync(full, { recursive: true }) as string[]).map((f) => path.join(full, f)) : [full];
      for (const file of files) {
        if (!/\.(ts|tsx|css|txt|md)$/.test(file) || /\.test\./.test(file)) continue;
        const text = fs.readFileSync(file, "utf-8");
        expect(text, file).not.toMatch(/no formal agreement is implied|collaboration proposal|partnership proposal|the proposal comes from|proposed capability( partner)?: gamyaa/i);
      }
    }
  });
});

describe("no stale hosts", () => {
  it("mentions no Ishavasyam domain anywhere in the APEX code, data or route", () => {
    for (const dir of ["src/components/apex", "src/data/apex", "src/app/space/partners", "src/app/space/components/PartnersEcosystem.tsx"]) {
      const full = path.join(ROOT, dir);
      const files = fs.statSync(full).isDirectory() ? (fs.readdirSync(full, { recursive: true }) as string[]).map((f) => path.join(full, f)) : [full];
      for (const file of files) {
        if (!/\.(ts|tsx|css)$/.test(file) || /\.test\./.test(file)) continue;
        expect(fs.readFileSync(file, "utf-8"), file).not.toMatch(/ishavasyam/i);
      }
    }
  });
});
