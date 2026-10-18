import { afterEach, describe, expect, it, vi } from "vitest";
import { ARCHITECTURES, CELL_FORMATS, CHEMISTRIES, DEFAULT_CONFIG, ENERGY_BANDS, PACK_LAYOUTS, VOLTAGE_CLASSES } from "@/data/ev-battery-toolkit/architectures";
import { COMPONENTS } from "@/data/ev-battery-toolkit/components";
import { OWNER_SAFETY_RULES, OWNER_SYMPTOMS } from "@/data/ev-battery-toolkit/content";
import { FAULT_BY_ID, FAULT_CATEGORIES, FAULTS } from "@/data/ev-battery-toolkit/faults";
import { SPEC_FIELDS, VEHICLES, VEHICLE_BY_ID, vehicleLabel } from "@/data/ev-battery-toolkit/vehicles";
import { sanitizeParams, trackToolkit } from "./analytics";
import { FutureLiveBmsSource, SimulationSource, canMergeIntoRealJob, parseDiagnosticFile } from "./dataSources";
import { INSUFFICIENT, compareBeforeAfter, deltaOf, newJobCard, repairDecision, rootCauseCandidates, verifyRepair } from "./diagnosis";
import { assessHealth } from "./health";
import { applyLayout, layoutPack, resolvePack } from "./pack";
import { formatNumber, formatSourced, UNVERIFIED_SPEC } from "./provenance";
import { buildRealReport, buildSimulationReport } from "./report";
import { simulate } from "./simulation";
import type { BatteryConfig, JobCard, MeasurementKey, ObservationKey, Provenance } from "./types";

const measured = (job: JobCard, key: MeasurementKey, value: number, provenance: Provenance = "MEASURED") => {
  job.before[key] = { key, value, provenance };
};
const observed = (job: JobCard, key: ObservationKey, value: string) => {
  job.observations[key] = { key, value, provenance: "USER_ENTERED" };
};
const BAD_TEXT = /undefined|NaN|Infinity/;

describe("pack resolution and architecture switching", () => {
  it("resolves every configuration to finite, positive numbers and a layout with one slot per cell", () => {
    for (const chemistry of CHEMISTRIES) {
      for (const format of CELL_FORMATS) {
        for (const voltage of VOLTAGE_CLASSES) {
          for (const energy of ENERGY_BANDS) {
            for (const layout of PACK_LAYOUTS) {
              const config: BatteryConfig = applyLayout({ ...DEFAULT_CONFIG, chemistry: chemistry.id, format: format.id, voltage: voltage.id, energy: energy.id }, layout.id);
              const pack = resolvePack(config);
              for (const n of [pack.series, pack.parallel, pack.modules, pack.nominalV, pack.capacityAh, pack.energyKWh]) {
                expect(Number.isFinite(n) && n > 0).toBe(true);
              }
              expect(pack.groupsPerModule.reduce((a, b) => a + b, 0)).toBe(pack.series);
              const l = layoutPack(pack);
              expect(l.cells).toHaveLength(pack.totalCells);
              expect(l.groupCenters).toHaveLength(pack.series);
              expect(l.enclosure.every((d) => Number.isFinite(d) && d > 0)).toBe(true);
            }
          }
        }
      }
    }
  });

  it("derives series counts from chemistry: 72 V is 20S for NMC and 23S for LFP", () => {
    expect(resolvePack({ ...DEFAULT_CONFIG, chemistry: "NMC", voltage: "72" }).series).toBe(20);
    expect(resolvePack({ ...DEFAULT_CONFIG, chemistry: "LFP", voltage: "72" }).series).toBe(23);
    expect(resolvePack({ ...DEFAULT_CONFIG, chemistry: "LFP", voltage: "51" }).series).toBe(16);
  });

  it("moves to the architecture a layout implies and keeps the current one for neutral layouts", () => {
    expect(applyLayout(DEFAULT_CONFIG, "swappable").architecture).toBe("swappable");
    expect(applyLayout(DEFAULT_CONFIG, "fixed").architecture).toBe("fixed-floor");
    expect(applyLayout(DEFAULT_CONFIG, "removable").architecture).toBe("serviceable-pack");
    expect(applyLayout({ ...DEFAULT_CONFIG, architecture: "swappable" }, "multi-module").architecture).toBe("swappable");
    expect(resolvePack(applyLayout(DEFAULT_CONFIG, "dual-pack")).modules).toBe(2);
    expect(Object.keys(ARCHITECTURES)).toEqual(["fixed-floor", "swappable", "serviceable-pack"]);
  });

  it("keeps a custom voltage inside a sane range even when the input is not a number", () => {
    const pack = resolvePack({ ...DEFAULT_CONFIG, voltage: "custom", customVoltage: Number.NaN });
    expect(Number.isFinite(pack.nominalV)).toBe(true);
  });
});

describe("simulation and fault engine", () => {
  const pack = resolvePack(DEFAULT_CONFIG);

  it("covers every required fault category and has unique ids", () => {
    expect(FAULT_CATEGORIES.map((c) => c.id)).toEqual(["cell", "thermal", "electrical", "bms", "charging", "environment", "lifecycle", "communication", "safety"]);
    expect(new Set(FAULTS.map((f) => f.id)).size).toBe(FAULTS.length);
    for (const name of ["Weak Cell", "Cell Imbalance", "Hot Cell", "Fuse Open", "BMS Offline", "Charger Mismatch", "Water Ingress", "Deep Discharge", "CAN Failure", "Suspected Thermal Runaway"]) {
      expect(FAULTS.some((f) => f.name === name)).toBe(true);
    }
  });

  it("never produces NaN or Infinity, and labels every value SIMULATED or NOT AVAILABLE", () => {
    for (const fault of [null, ...FAULTS]) {
      for (const load of ["rest", "load", "charge"] as const) {
        const { snapshot } = simulate({ pack, fault, load });
        expect(snapshot.groupVoltages.every(Number.isFinite)).toBe(true);
        expect(snapshot.groupTemps.every(Number.isFinite)).toBe(true);
        for (const [key, value] of Object.entries(snapshot)) {
          if (value && typeof value === "object" && "provenance" in value) {
            expect(["SIMULATED", "NOT_AVAILABLE"], key).toContain(value.provenance);
            expect(formatSourced(value)).not.toMatch(BAD_TEXT);
          }
        }
      }
    }
  });

  it("is deterministic, so server and browser render the same numbers", () => {
    const a = simulate({ pack, fault: FAULT_BY_ID["weak-cell"], load: "load" });
    const b = simulate({ pack, fault: FAULT_BY_ID["weak-cell"], load: "load" });
    expect(a).toEqual(b);
  });

  it("shows a fault's effect: imbalance raises the delta, a hot cell raises the spread, BMS offline hides BMS data", () => {
    const normal = simulate({ pack, fault: null, load: "rest" }).snapshot;
    const imbalance = simulate({ pack, fault: FAULT_BY_ID.imbalance, load: "rest" }).snapshot;
    expect(imbalance.cellDeltaMv.value!).toBeGreaterThan(normal.cellDeltaMv.value! + 150);
    expect(imbalance.weakGroup).not.toBeNull();
    const hot = simulate({ pack, fault: FAULT_BY_ID["hot-cell"], load: "rest" });
    expect(Math.max(...hot.trueTemps)).toBeGreaterThan(Math.max(...simulate({ pack, fault: null, load: "rest" }).trueTemps) + 15);
    const offline = simulate({ pack, fault: FAULT_BY_ID["bms-offline"], load: "rest" }).snapshot;
    expect(offline.soc.provenance).toBe("NOT_AVAILABLE");
    expect(formatSourced(offline.soc)).toBe("Not available.");
    expect(offline.comms.CAN).toBe("OFFLINE");
  });
});

describe("health assessment", () => {
  const pack = resolvePack(DEFAULT_CONFIG);
  it("is Healthy for the normal pack and explains itself with factors and reference rules", () => {
    const sim = simulate({ pack, fault: null, load: "rest" });
    const h = assessHealth(sim.snapshot, "none", sim.limits);
    expect(h.status).toBe("Healthy");
    expect(h.factors.length).toBeGreaterThan(5);
    expect(h.factors.every((f) => f.rule.length > 0)).toBe(true);
  });
  it("is Critical for a stop-level safety fault, whatever the numbers", () => {
    const sim = simulate({ pack, fault: FAULT_BY_ID.swelling, load: "rest" });
    expect(assessHealth(sim.snapshot, "stop", sim.limits).status).toBe("Critical");
  });
  it("uses qualitative statuses only, never a numeric score", () => {
    const sim = simulate({ pack, fault: FAULT_BY_ID.imbalance, load: "rest" });
    const h = assessHealth(sim.snapshot, "none", sim.limits);
    expect(["Healthy", "Attention", "Service Recommended", "Critical"]).toContain(h.status);
    expect(h.status).toBe("Service Recommended");
    expect(h.drivers.map((d) => d.id)).toContain("delta");
  });
});

describe("evidence-based diagnosis", () => {
  it("does not name a root cause from the complaint alone: the gate is insufficient", () => {
    const job = newJobCard(new Date(2026, 9, 18));
    job.complaintCategory = "shutdown-load";
    const candidates = rootCauseCandidates(job);
    expect(candidates.length).toBeGreaterThan(0);
    expect(candidates.every((c) => c.gate === "INSUFFICIENT" && c.confidence === "LOW")).toBe(true);
    const decision = repairDecision(job, candidates);
    expect(decision.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(decision.reason).toContain(INSUFFICIENT);
  });

  it("reaches high confidence for imbalance with the brief's example evidence", () => {
    const job = newJobCard(new Date(2026, 9, 18));
    job.complaintCategory = "shutdown-load";
    measured(job, "packVoltage", 78.2);
    measured(job, "cellMax", 4.08);
    measured(job, "cellMin", 3.74);
    observed(job, "bmsStatus", "Normal");
    observed(job, "loadBehaviour", "Shuts down under load");
    expect(deltaOf(job.before)).toEqual({ value: 340, derived: true });
    const imbalance = rootCauseCandidates(job).find((c) => c.id === "imbalance")!;
    expect(imbalance.gate).toBe("MET");
    expect(imbalance.confidence).toBe("HIGH");
    expect(imbalance.supporting.join(" ")).toContain("340 mV");
    expect(imbalance.missing.join(" ")).toMatch(/Capacity test not recorded/);
    const decision = repairDecision(job);
    expect(["ADVANCED_CELL_REPAIR", "MODULE_REPAIR"]).toContain(decision.status);
    expect(decision.evidence.length).toBeGreaterThan(0);
    expect(decision.verificationRequired.length).toBeGreaterThan(0);
  });

  it("requires charger evidence before blaming the charger", () => {
    const job = newJobCard(new Date());
    job.complaintCategory = "not-charging";
    measured(job, "chargerVoltage", 70);
    const charger = rootCauseCandidates(job).find((c) => c.id === "charger")!;
    expect(charger.gate).toBe("INSUFFICIENT");
    expect(charger.missing.join(" ")).toMatch(/Pack voltage during charge/);
  });

  it("quarantines whenever a safety condition is recorded, before any repair", () => {
    const job = newJobCard(new Date());
    job.safetyFlags = ["Swelling"];
    job.safetyAcknowledged = true;
    measured(job, "cellMax", 4.08);
    measured(job, "cellMin", 3.74);
    expect(repairDecision(job).status).toBe("UNSAFE_QUARANTINE");
    expect(verifyRepair(job).outcome).toBe("UNSAFE_DO_NOT_RETURN");
  });

  it("says no repair is required only when the core measurements are recorded and normal", () => {
    const job = newJobCard(new Date());
    measured(job, "packVoltage", 74.1);
    measured(job, "cellMax", 3.712);
    measured(job, "cellMin", 3.702);
    measured(job, "tempMax", 31);
    observed(job, "bmsStatus", "Normal");
    expect(repairDecision(job).status).toBe("NO_REPAIR_REQUIRED");
  });
});

describe("post-repair verification and comparison", () => {
  const passAll = (job: JobCard) => {
    for (const key of Object.keys(job.verification)) job.verification[key] = "pass";
  };

  it("does not equate a cleared fault with a successful repair", () => {
    const job = newJobCard(new Date());
    job.verification.faultRescan = "pass";
    expect(verifyRepair(job).outcome).toBe("FURTHER_DIAGNOSIS_REQUIRED");
  });

  it("passes only with every check passed and the technician's confirmation", () => {
    const job = newJobCard(new Date());
    passAll(job);
    expect(verifyRepair(job).outcome).toBe("FURTHER_DIAGNOSIS_REQUIRED");
    job.technicianConfirmed = true;
    expect(verifyRepair(job).outcome).toBe("PASS");
    job.verification.dischargeTest = "not-done";
    expect(verifyRepair(job).outcome).toBe("CONDITIONAL_PASS");
  });

  it("fails verification when the after-repair delta is still high", () => {
    const job = newJobCard(new Date());
    passAll(job);
    job.technicianConfirmed = true;
    job.after.cellDelta = { key: "cellDelta", value: 120, provenance: "MEASURED" };
    expect(verifyRepair(job).outcome).toBe("FURTHER_DIAGNOSIS_REQUIRED");
  });

  it("marks each field improved, unchanged, worsened or not comparable", () => {
    const job = newJobCard(new Date());
    measured(job, "cellDelta", 340);
    job.after.cellDelta = { key: "cellDelta", value: 18, provenance: "MEASURED" };
    measured(job, "tempMax", 40);
    job.after.tempMax = { key: "tempMax", value: 46, provenance: "MEASURED" };
    measured(job, "soh", 88);
    job.after.soh = { key: "soh", value: 88, provenance: "MEASURED" };
    const rows = Object.fromEntries(compareBeforeAfter(job).map((r) => [r.key, r]));
    expect(rows.cellDelta.trend).toBe("improved");
    expect(rows.tempMax.trend).toBe("worsened");
    expect(rows.soh.trend).toBe("unchanged");
    expect(rows.packVoltage.trend).toBe("not-comparable");
    expect(rows.packVoltage.before).toBe("NOT MEASURED");
  });
});

describe("reports", () => {
  it("builds a real report with NOT MEASURED for unrecorded fields, a data quality summary and no simulated values", () => {
    const job = newJobCard(new Date(2026, 9, 18));
    job.vehicleId = "tvs-iqube";
    job.variantId = "iqube-s";
    measured(job, "packVoltage", 74.2);
    observed(job, "bmsStatus", "Normal");
    const report = buildRealReport(job, new Date(2026, 9, 18, 10, 30));
    expect(report.context).toBe("real");
    expect(report.sections.map((s) => s.title)).toEqual(["BEFORE REPAIR", "DIAGNOSIS", "ROOT CAUSE", "REPAIR ACTION", "AFTER REPAIR", "FINAL VERIFICATION", "RECOMMENDATION", "EVIDENCE"]);
    expect(report.footer).toBe("Generated using EV.ENGINEER™ — EV Battery Health & Diagnostics Toolkit");
    const allRows = [...report.header, ...report.sections.flatMap((s) => s.rows)];
    expect(allRows.some((r) => r.provenance === "SIMULATED")).toBe(false);
    expect(allRows.find((r) => r.label === "SOC")?.value).toBe("NOT MEASURED");
    expect(allRows.find((r) => r.label === "Chemistry")?.value).toBe(UNVERIFIED_SPEC);
    expect(report.quality.measured).toBe(1);
    expect(report.quality.manufacturerVerified).toBe(0);
    expect(report.quality.unknown).toBeGreaterThan(0);
    expect(JSON.stringify(report)).not.toMatch(BAD_TEXT);
  });

  it("labels the sample report as simulation throughout", () => {
    const pack = resolvePack(DEFAULT_CONFIG);
    const sim = simulate({ pack, fault: FAULT_BY_ID.imbalance, load: "rest" });
    const report = buildSimulationReport(pack, sim, FAULT_BY_ID.imbalance, new Date(2026, 9, 18));
    expect(report.context).toBe("simulation");
    expect(report.title).toContain("SIMULATION / TRAINING DATA");
    expect(report.quality.measured).toBe(0);
    expect(report.quality.simulated).toBeGreaterThan(0);
    expect(JSON.stringify(report)).not.toMatch(BAD_TEXT);
  });
});

describe("diagnostic data sources", () => {
  it("imports CSV and JSON tester exports as MEASURED and lists unknown keys", () => {
    const csv = parseDiagnosticFile("key,value\npackVoltage,74.6\ncellMin,3.71\nbatterySerial,ABC123\nbmsStatus,Normal", "test.csv");
    expect(csv.measurements.packVoltage).toEqual({ key: "packVoltage", value: 74.6, provenance: "MEASURED" });
    expect(csv.observations.bmsStatus?.value).toBe("Normal");
    expect(csv.ignored).toContain("batterySerial");
    const json = parseDiagnosticFile(JSON.stringify({ cellMax: 4.1, groupVoltages: [4.1, 4.09, 3.8] }), "export.json");
    expect(json.measurements.cellMax?.value).toBe(4.1);
    expect(json.groupVoltages).toEqual([4.1, 4.09, 3.8]);
    expect(canMergeIntoRealJob(json)).toBe(true);
    expect(() => parseDiagnosticFile("{ not json", "bad.json")).toThrow(/not valid JSON/);
  });

  it("refuses to merge simulation data into a real job, and has no fake live connection", async () => {
    const pack = resolvePack(DEFAULT_CONFIG);
    const data = await new SimulationSource(simulate({ pack, fault: null, load: "rest" })).read();
    expect(data.context).toBe("simulation");
    expect(canMergeIntoRealJob(data)).toBe(false);
    const live = new FutureLiveBmsSource();
    expect(live.available).toBe(false);
    await expect(live.read()).rejects.toThrow(/not available/);
  });
});

describe("analytics privacy", () => {
  afterEach(() => {
    delete (window as { gtag?: unknown }).gtag;
  });

  it("keeps only short lower-case ids and drops names, serials, numbers and free text", () => {
    expect(sanitizeParams({ fault: "weak-cell", serial: "BAT-SN-0042", name: "Ravi Kumar", notes: "pack smelled hot", value: 74.2 as unknown as string })).toEqual({ fault: "weak-cell" });
  });

  it("sends nothing but sanitised ids through gtag", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    trackToolkit("fault_injected", { fault: "weak-cell", mode: "known" });
    trackToolkit("vehicle_selected", { vehicle: "KA 01 AB 1234" });
    expect(gtag).toHaveBeenNthCalledWith(1, "event", "fault_injected", { fault: "weak-cell", mode: "known" });
    expect(gtag).toHaveBeenNthCalledWith(2, "event", "vehicle_selected", {});
  });
});

describe("data honesty", () => {
  it("shows every priority platform with all technical fields UNKNOWN, never invented", () => {
    expect(VEHICLES.map((v) => v.family)).toEqual(["Ola S1 family", "TVS iQube family", "Ather 450 / Rizta family", "River Indie", "EVeium Cosmo / Comet / Czar family"]);
    for (const v of VEHICLES) {
      expect(v.verificationStatus).toBe("UNKNOWN");
      for (const variant of v.variants) {
        for (const f of SPEC_FIELDS) {
          expect(variant.battery[f.key].value).toBeNull();
          expect(variant.battery[f.key].provenance).toBe("UNKNOWN");
          expect(formatSourced(variant.battery[f.key])).toBe(UNVERIFIED_SPEC);
        }
      }
    }
  });

  it("names vehicles without repeating the model", () => {
    const label = (id: string, variant: string) => vehicleLabel(VEHICLE_BY_ID[id], VEHICLE_BY_ID[id].variants.find((v) => v.id === variant));
    expect(label("ola-s1", "s1-pro")).toBe("Ola Electric S1 Pro");
    expect(label("tvs-iqube", "iqube-s")).toBe("TVS Motor Company iQube S");
    expect(label("ather-450-rizta", "450x")).toBe("Ather Energy 450X");
    expect(label("river-indie", "indie")).toBe("River Indie");
    expect(label("eveium", "czar")).toBe("EVeium Czar");
  });

  it("formats missing numbers as words, never undefined, NaN or Infinity", () => {
    expect(formatNumber(undefined, "V")).toBe("Not available.");
    expect(formatNumber(Number.NaN, "V")).toBe("Not available.");
    expect(formatNumber(Number.POSITIVE_INFINITY, "V", 1, "NOT MEASURED")).toBe("NOT MEASURED");
    expect(formatNumber(3.7456, "V", 3)).toBe("3.746 V");
  });

  it("gives every component a function, common faults and measurements", () => {
    expect(COMPONENTS).toHaveLength(17);
    for (const c of COMPONENTS) {
      expect(c.function.length).toBeGreaterThan(20);
      expect(c.commonFaults.length).toBeGreaterThan(0);
      expect(c.measurements.length).toBeGreaterThan(0);
    }
  });

  it("keeps Owner Mode text free of repair and live-pack instructions", () => {
    const ownerText = JSON.stringify([OWNER_SYMPTOMS, OWNER_SAFETY_RULES]).toLowerCase();
    for (const forbidden of ["remove the cover", "open the enclosure", "open the pack", "replace the cell", "cell replacement", "busbar", "solder", "disconnect the", "live pack", "bypass"]) {
      expect(ownerText).not.toContain(forbidden);
    }
  });
});
