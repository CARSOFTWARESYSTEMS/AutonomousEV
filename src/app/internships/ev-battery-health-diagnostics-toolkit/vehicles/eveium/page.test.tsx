import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CZAR_CAPACITY_CONFLICT, EVEIUM_UNKNOWN_FIELDS, EVEIUM_VEHICLES, nominalEnergy } from "@/data/ev-battery-toolkit/eveium";
import { compareBeforeAfter, newJobCard, repairDecision, rootCauseCandidates } from "@/lib/ev-battery-toolkit/diagnosis";
import { buildRealReport } from "@/lib/ev-battery-toolkit/report";
import { formatSourced } from "@/lib/ev-battery-toolkit/provenance";
import type { JobCard, MeasurementKey, ObservationKey } from "@/lib/ev-battery-toolkit/types";
import GoogleAnalytics from "@/components/GoogleAnalytics";

vi.mock("next/script", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({ usePathname: () => "/internships/ev-battery-health-diagnostics-toolkit/vehicles/eveium", useSearchParams: () => new URLSearchParams() }));
vi.mock("next/font/google", () => ({ Manrope: () => ({ variable: "m" }), Inter: () => ({ variable: "i" }) }));

import Page, { metadata } from "./page";

const gtag = vi.fn();
beforeEach(() => {
  gtag.mockReset();
  window.gtag = gtag;
});
afterEach(() => {
  delete (window as { gtag?: unknown }).gtag;
});

const spec = (id: string) => EVEIUM_VEHICLES.find((v) => v.id === id)!.variants[0].battery;
const m = (job: JobCard, key: MeasurementKey, value: number) => (job.before[key] = { key, value, provenance: "MEASURED" });
const o = (job: JobCard, key: ObservationKey, value: string) => (job.observations[key] = { key, value, provenance: "USER_ENTERED" });
const eveiumJob = (model: string, complaint: string) => {
  const job = newJobCard(new Date(2026, 9, 18));
  job.vehicleId = `eveium-${model}`;
  job.variantId = "not-specified";
  job.complaintCategory = complaint;
  return job;
};

describe("EVeium public battery data", () => {
  it("publishes Cosmo 72 V / 30 Ah and Comet 72 V / 50 Ah lithium-ion with sources and HIGH confidence", () => {
    for (const [id, ah, kwh] of [["eveium-cosmo", 30, 2.16], ["eveium-comet", 50, 3.6]] as const) {
      const b = spec(id);
      expect(b.nominalVoltage).toMatchObject({ value: 72, provenance: "MANUFACTURER_VERIFIED", confidence: "HIGH" });
      expect(b.capacityAh).toMatchObject({ value: ah, provenance: "MANUFACTURER_VERIFIED", confidence: "HIGH" });
      expect(b.capacityAh.claims!.map((c) => c.sourceId)).toContain("eveium-scooters");
      expect(b.energyKWh).toMatchObject({ value: kwh, provenance: "CALCULATED" });
      expect(b.batteryType.value).toBe("Lithium-ion");
    }
  });

  it("keeps the Czar capacity conflict visible instead of choosing a value", () => {
    const b = spec("eveium-czar");
    expect(b.capacityAh.value).toBeNull();
    expect(b.capacityAh.conflict).toBe(true);
    expect(b.capacityAh.claims!.map((c) => c.value)).toEqual(expect.arrayContaining(["40 Ah", "42 Ah"]));
    expect(CZAR_CAPACITY_CONFLICT.manufacturer.energy.kwh).toBe(2.88);
    expect(CZAR_CAPACITY_CONFLICT.launch2022.energy.kwh).toBe(3.024);
    expect(formatSourced(b.capacityAh)).toMatch(/Sources disagree/);
  });

  it("calculates nominal energy transparently", () => {
    expect(nominalEnergy(72, 30).text).toBe("72 V × 30 Ah = 2160 Wh = 2.16 kWh");
    expect(nominalEnergy(72, 50).wh).toBe(3600);
    expect(nominalEnergy(72, 42).kwh).toBe(3.024);
  });

  it("invents no chemistry, cell format, BMS protocol, connector or location", () => {
    for (const v of EVEIUM_VEHICLES) {
      const b = v.variants[0].battery;
      for (const key of ["chemistry", "cellType", "bmsCommunication", "connectorType", "batteryLocation", "chargingSpecification", "thermalSystem"] as const) {
        expect(b[key].value, `${v.id}.${key}`).toBeNull();
        expect(b[key].provenance).toBe("UNKNOWN");
      }
    }
    expect(EVEIUM_UNKNOWN_FIELDS).toHaveLength(15);
  });
});

describe("EVeium evidence gates and flows", () => {
  it("does not blame the charger without charger output, pack voltage and charge response", () => {
    const job = eveiumJob("comet", "not-charging");
    m(job, "chargerVoltage", 70.1);
    expect(rootCauseCandidates(job).find((c) => c.id === "charger")!.gate).toBe("INSUFFICIENT");
    m(job, "packVoltage", 74.6);
    o(job, "chargeResponse", "No response");
    const charger = rootCauseCandidates(job).find((c) => c.id === "charger")!;
    expect(charger.gate).toBe("MET");
    expect(charger.supporting.join(" ")).toMatch(/not above pack voltage/);
    expect(repairDecision(job).status).toBe("SERVICEABLE");
  });

  it("needs cell min, max and SOC or load context for imbalance", () => {
    const job = eveiumJob("cosmo", "reduced-range");
    m(job, "cellMax", 4.08);
    m(job, "cellMin", 3.74);
    expect(rootCauseCandidates(job).find((c) => c.id === "imbalance")!.gate).toBe("INSUFFICIENT");
    m(job, "soc", 92);
    expect(rootCauseCandidates(job).find((c) => c.id === "imbalance")!.gate).toBe("MET");
  });

  it("rates a weak cell group HIGH with the brief's shutdown evidence despite normal temperature", () => {
    const job = eveiumJob("czar", "shutdown-load");
    m(job, "packVoltage", 76.0);
    m(job, "loadedPackVoltage", 66.0);
    m(job, "cellMax", 4.05);
    m(job, "cellMin", 3.85);
    m(job, "tempMax", 33);
    o(job, "loadBehaviour", "Shuts down under load");
    const weak = rootCauseCandidates(job).find((c) => c.id === "weak-group")!;
    expect(weak.confidence).toBe("HIGH");
    expect(weak.conflicting.join(" ")).toMatch(/No abnormal temperature/);
    expect(weak.missing.join(" ")).toMatch(/Capacity test not recorded/);
  });

  it("requires communication plus a fault code or protection state for a BMS fault", () => {
    const job = eveiumJob("comet", "bms-comm");
    o(job, "commStatus", "Offline");
    expect(rootCauseCandidates(job).find((c) => c.id === "bms")!.gate).toBe("INSUFFICIENT");
    o(job, "bmsStatus", "Offline / no data");
    expect(rootCauseCandidates(job).find((c) => c.id === "bms")!.gate).toBe("MET");
  });

  it("asks for specialist evaluation of a suspected deep discharge when cell condition is unknown", () => {
    const job = eveiumJob("cosmo", "storage");
    m(job, "packVoltage", 52.0);
    o(job, "commStatus", "Offline");
    o(job, "chargeResponse", "No response");
    o(job, "storageHistory", "Stored over 3 months");
    job.cellConfig = { ...job.cellConfig, series: 20, cellNominalV: 3.6, cellMinV: 2.8, cellMaxV: 4.2 };
    job.selectedRootCause = "deep-discharge";
    const d = repairDecision(job);
    expect(d.status).toBe("SPECIALIST_EVALUATION_REQUIRED");
    expect(d.risk).toMatch(/no blind recovery charging/);
    expect(d.evidence.join(" ")).toMatch(/below the calculated lower limit 56.0 V/);
  });

  it("never creates a decision from the complaint alone, and reports missing evidence, risk and next action", () => {
    const d = repairDecision(eveiumJob("czar", "shutdown-load"));
    expect(d.status).toBe("INSUFFICIENT_EVIDENCE");
    expect(d.missingEvidence.length).toBeGreaterThan(0);
    expect(d.risk).toBeTruthy();
    expect(d.nextAction).toBeTruthy();
  });

  it("compares before and after, marking unmeasured fields", () => {
    const job = eveiumJob("comet", "reduced-range");
    m(job, "cellDelta", 210);
    job.after.cellDelta = { key: "cellDelta", value: 15, provenance: "MEASURED" };
    const rows = Object.fromEntries(compareBeforeAfter(job).map((r) => [r.key, r.trend]));
    expect(rows.cellDelta).toBe("improved");
    expect(rows.soh).toBe("not-comparable");
  });

  it("titles the report for EVeium and counts manufacturer and calculated fields in the data quality summary", () => {
    const job = eveiumJob("comet", "reduced-range");
    m(job, "packVoltage", 74.1);
    const r = buildRealReport(job, new Date(2026, 9, 18));
    expect(r.title).toBe("EVeium Battery Diagnostic Report");
    expect(r.quality.manufacturerVerified).toBeGreaterThan(0);
    expect(r.quality.calculated).toBe(1);
    expect(r.quality.simulated).toBe(0);
    expect(r.header.find((h) => h.label === "Rated Capacity")).toMatchObject({ value: "50 Ah", provenance: "MANUFACTURER_VERIFIED" });
    expect(r.header.find((h) => h.label === "Cell Chemistry")?.provenance).toBe("UNKNOWN");
  });
});

describe("EVeium page", () => {
  it("has its own canonical URL and visible, sourced content", () => {
    expect(metadata.alternates?.canonical).toBe("https://autonomous.ev.engineer/internships/ev-battery-health-diagnostics-toolkit/vehicles/eveium");
    render(<Page />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("EVeium Battery Diagnostics");
    expect(screen.getByText("REAL VEHICLE WORKFLOW")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Explore Generic 72-V Battery Digital Twin" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Publicly Documented Battery Specification" })).toBeInTheDocument();
    expect(screen.getByText("PUBLICLY DOCUMENTED / THIRD-PARTY CORROBORATED")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Technical Data Still Requiring Verification" })).toBeInTheDocument();
    for (const f of EVEIUM_UNKNOWN_FIELDS) expect(screen.getByText(f)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Battery Location: NOT YET VERIFIED" })).toBeInTheDocument();
    expect(screen.getByText("SCHEMATIC VEHICLE — NOT OEM GEOMETRY")).toBeInTheDocument();
    expect(screen.getByText(/GENERIC 72-V BATTERY ARCHITECTURE · NOT VERIFIED AS EVeium INTERNAL PACK CONSTRUCTION/)).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\bNMC\b|\bLFP\b/);
  });

  it("selects a model, starts with NOT MEASURED fields, and sends only ids to analytics", async () => {
    const user = userEvent.setup();
    render(
      <>
        <GoogleAnalytics />
        <Page />
      </>,
    );
    await user.click(screen.getByRole("radio", { name: "Comet" }));
    expect(gtag).toHaveBeenCalledWith("event", "eveium_model_selected", { model: "comet" });
    const d = document.getElementById("diagnosis")!;
    await user.click(within(d).getByRole("button", { name: "Start real vehicle diagnosis" }));
    expect(within(d).getByText("REAL VEHICLE DIAGNOSIS")).toBeInTheDocument();
    await user.click(within(d).getByRole("button", { name: /Safety Screen/ }));
    await user.click(within(d).getByLabelText("Strong chemical smell"));
    expect(within(d).getByRole("button", { name: /Electrical Measurements/ })).toBeDisabled();
    await user.click(within(d).getByLabelText("Strong chemical smell"));
    await user.click(within(d).getByRole("button", { name: /No hazards present/ }));
    expect(gtag).toHaveBeenCalledWith("event", "eveium_safety_screen_completed", { result: "clear" });
    expect(within(d).getByLabelText("Manufacturer")).toBeDisabled();
    expect(within(d).getByLabelText("Model")).toHaveValue("eveium-comet");
    await user.type(within(d).getByLabelText("Battery serial (optional)"), "EVM-SER-4471");
    await user.click(within(d).getByRole("button", { name: "Use published rated capacity" }));
    await user.click(within(d).getByRole("button", { name: /Electrical Measurements/ }));
    const pack = within(d).getByRole("spinbutton", { name: /Measured pack voltage/ });
    expect(pack).toHaveValue(null);
    await user.type(pack, "73.42");
    expect(gtag).toHaveBeenCalledWith("event", "eveium_measurement_entered", { field: "packvoltage" });
    await user.click(within(d).getByRole("button", { name: /Repair Decision/ }));
    expect(gtag).toHaveBeenCalledWith("event", "eveium_evidence_gate_failed", expect.any(Object));
    const sent = JSON.stringify(gtag.mock.calls);
    for (const secret of ["EVM-SER-4471", "73.42", "50 Ah"]) expect(sent).not.toContain(secret);
  });
});
