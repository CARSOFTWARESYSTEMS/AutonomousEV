// Release-gate checks for the EV Battery Health & Diagnostics Toolkit: one
// canonical domain, real diagnosis kept apart from simulation, the evidence
// gate, safety interruptions, Owner Mode limits and analytics privacy with the
// site-wide click listener running.
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FIXED_LAB } from "@/data/ev-battery-toolkit/content";
import { SAFETY_HAZARDS } from "@/data/ev-battery-toolkit/fields";
import { SITE_URL } from "@/data/public-entities";
import { REFERENCE_LOGIC_NOTICE } from "@/lib/ev-battery-toolkit/diagnosis";
import { useToolkit } from "@/components/ev-battery-toolkit/state/store";
import { buildInternshipsGraph } from "@/lib/structured-data/internshipsGraph";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import sitemap from "@/app/sitemap";

vi.mock("next/script", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/internships/ev-battery-health-diagnostics-toolkit",
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

import Page, { metadata } from "./page";

const CANONICAL = `${SITE_URL}/internships/ev-battery-health-diagnostics-toolkit`;
const gtag = vi.fn();
const section = (id: string) => document.getElementById(id) as HTMLElement;

beforeEach(() => {
  useToolkit.setState(useToolkit.getInitialState(), true);
  gtag.mockReset();
  window.gtag = gtag;
  window.print = vi.fn();
});
afterEach(() => {
  delete (window as { gtag?: unknown }).gtag;
});

describe("one authoritative domain", () => {
  it("uses autonomous.ev.engineer for canonical, Open Graph, Twitter image and every JSON-LD URL", () => {
    expect(CANONICAL).toBe("https://autonomous.ev.engineer/internships/ev-battery-health-diagnostics-toolkit");
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect((metadata.openGraph as { url: string }).url).toBe(CANONICAL);
    expect(JSON.stringify(metadata)).not.toContain("aerospace.ev.engineer");
    const { container } = render(<Page />);
    const json = container.querySelector('script[type="application/ld+json"]')!.textContent!;
    expect(json).not.toContain("aerospace.ev.engineer");
    const graph = JSON.parse(json)["@graph"] as Record<string, unknown>[];
    for (const type of ["WebPage", "WebApplication"]) expect(graph.find((n) => n["@type"] === type)!.url).toBe(CANONICAL);
    const crumbs = graph.find((n) => n["@type"] === "BreadcrumbList") as { itemListElement: { item: string }[] };
    expect(crumbs.itemListElement.map((c) => c.item)).toEqual([`${SITE_URL}/`, `${SITE_URL}/internships`, CANONICAL]);
  });

  it("lists the same URL in the sitemap, the internships graph and llms.txt", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).toContain(CANONICAL);
    expect(urls.filter((u) => u === CANONICAL)).toHaveLength(1);
    expect(urls.filter((u) => u.includes("ev-battery-health-diagnostics-toolkit")).every((u) => u.startsWith(CANONICAL))).toBe(true);
    const graph = JSON.stringify(buildInternshipsGraph({ title: "t", description: "d", dateModified: "2026-10-18" }));
    expect(graph).toContain(CANONICAL);
    expect(graph).not.toContain("aerospace.ev.engineer/internships");
    const llms = fs.readFileSync(path.resolve(process.cwd(), "public/llms.txt"), "utf-8");
    expect(llms).toContain(`(${CANONICAL})`);
    expect(llms).not.toContain("aerospace.ev.engineer/internships");
  });
});

describe("real diagnosis kept apart from simulation", () => {
  it("labels the guided case as a simulated case and keeps its conclusion out of the real workflow", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const diagnosis = section("diagnosis");

    // A real job in progress survives switching to the guided case and back.
    await user.click(within(diagnosis).getByRole("button", { name: "Start real vehicle diagnosis" }));
    await user.type(within(diagnosis).getByLabelText("Customer complaint (their words)"), "Dies on climbs");

    await user.click(within(diagnosis).getByRole("tab", { name: /Guided Simulation/ }));
    const guided = within(diagnosis).getByRole("tabpanel", { name: /Guided Simulation/ });
    expect(guided).toHaveTextContent("SIMULATED DIAGNOSTIC CASE");
    await user.click(within(guided).getByRole("button", { name: "Start guided case" }));
    for (let i = 0; i < 11; i++) await user.click(within(guided).getByRole("button", { name: "Run step" }));
    const conclusion = within(guided).getByText("Technician conclusion").nextElementSibling as HTMLElement;
    expect(conclusion).toHaveTextContent("SIMULATED DIAGNOSTIC CASE · not a decision for a real vehicle");
    expect(conclusion).toHaveTextContent("MODULE REPAIR");

    await user.click(within(diagnosis).getByRole("tab", { name: /Real Vehicle Diagnosis/ }));
    const real = within(diagnosis).getByRole("tabpanel", { name: /Real Vehicle Diagnosis/ });
    expect(within(real).getByLabelText("Customer complaint (their words)")).toHaveValue("Dies on climbs");
    expect(real).toHaveTextContent("REAL VEHICLE DIAGNOSIS");
    expect(real).not.toHaveTextContent(/SIMULATION|SIMULATED/);

    await user.click(within(real).getByRole("button", { name: /Safety Screen/ }));
    await user.click(within(real).getByRole("button", { name: /No hazards present — continue/ }));
    await user.click(within(real).getByRole("button", { name: /Repair Decision/ }));
    expect(within(real).getByText("INSUFFICIENT EVIDENCE — PERFORM NEXT TEST")).toBeInTheDocument();
    expect(real).not.toHaveTextContent("MODULE REPAIR");

    await user.click(within(real).getByRole("button", { name: /Customer Report/ }));
    await user.click(within(real).getByRole("button", { name: "Preview diagnostic report" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("REAL VEHICLE DIAGNOSIS");
    expect(dialog).not.toHaveTextContent("MODULE REPAIR");
    expect(dialog.querySelectorAll('[data-family="simulated"]')).toHaveLength(0);
  });

  it("shows the reference-logic notice where diagnosis begins and where repair decisions are made", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const diagnosis = section("diagnosis");
    expect(within(diagnosis).getByText(REFERENCE_LOGIC_NOTICE)).toBeInTheDocument();
    await user.click(within(diagnosis).getByRole("button", { name: "Start real vehicle diagnosis" }));
    await user.click(within(diagnosis).getByRole("button", { name: /Safety Screen/ }));
    await user.click(within(diagnosis).getByRole("button", { name: /No hazards present — continue/ }));
    await user.click(within(diagnosis).getByRole("button", { name: /Root-Cause Analysis/ }));
    expect(within(diagnosis).getByText(REFERENCE_LOGIC_NOTICE)).toBeInTheDocument();
    await user.click(within(diagnosis).getByRole("button", { name: /Repair Decision/ }));
    expect(within(diagnosis).getByText(REFERENCE_LOGIC_NOTICE)).toBeInTheDocument();
  });
});

describe("safety interruptions", () => {
  it("lists every required hazard, including thermal runaway indicators", () => {
    const labels = SAFETY_HAZARDS.map((h) => h.label.toLowerCase()).join(" | ");
    for (const term of ["swelling", "puncture", "electrolyte leakage", "smoke", "severe overheating", "enclosure breach", "flood damage", "suspected internal short", "thermal runaway"]) expect(labels).toContain(term);
  });

  it.each(SAFETY_HAZARDS.map((h) => h.label))("stops normal diagnosis for %s until acknowledged, then decides UNSAFE — QUARANTINE / ESCALATE", async (label) => {
    const user = userEvent.setup();
    render(<Page />);
    const diagnosis = section("diagnosis");
    await user.click(within(diagnosis).getByRole("button", { name: "Start real vehicle diagnosis" }));
    await user.click(within(diagnosis).getByRole("button", { name: /Safety Screen/ }));
    await user.click(within(diagnosis).getByLabelText(label));
    expect(within(diagnosis).getAllByText("DO NOT CHARGE").length).toBeGreaterThan(0);
    expect(within(diagnosis).getByRole("button", { name: /Electrical Measurements/ })).toBeDisabled();
    expect(within(diagnosis).queryByRole("button", { name: /No hazards present/ })).toBeNull();
    await user.click(within(diagnosis).getByLabelText(/I acknowledge the safety state/));
    await user.click(within(diagnosis).getByRole("button", { name: /Repair Decision/ }));
    expect(within(diagnosis).getAllByText("UNSAFE — QUARANTINE / ESCALATE").length).toBeGreaterThan(0);
  });
});

describe("Owner Mode limits", () => {
  it("hides workshop removal steps and the workbench from owners", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(within(section("modes")).getByRole("tab", { name: /Owner Mode/ }));
    const arch = section("architectures");
    expect(within(arch).getByText(/Workshop only\./)).toBeInTheDocument();
    for (const step of FIXED_LAB) expect(arch.textContent).not.toContain(step.text);
    await user.click(within(arch).getByRole("tab", { name: /Traditional Serviceable/ }));
    // The lab steps are hidden; the one-line serviceability summary (scope, not instructions) stays.
    expect(arch.textContent).not.toMatch(/Module and cell-group work is possible|Accessible BMS/);
    expect(within(arch).getByText(/Workshop only\./)).toBeInTheDocument();
    const explorer = section("explorer");
    expect(within(explorer).getByText(/the diagnostic workbench is for trained technicians/)).toBeInTheDocument();
    expect(within(explorer).queryByRole("button", { name: "Measure" })).toBeNull();
  });
});

describe("analytics privacy with the site-wide click listener", () => {
  it("never sends registration numbers, serials, names, notes, measurements, cell values or report contents", async () => {
    const user = userEvent.setup();
    render(
      <>
        <GoogleAnalytics />
        <Page />
      </>,
    );
    const d = section("diagnosis");
    await user.click(within(d).getByRole("button", { name: "Start real vehicle diagnosis" }));
    await user.selectOptions(within(d).getByLabelText("Complaint category"), "shutdown-load");
    await user.type(within(d).getByLabelText("Customer complaint (their words)"), "Owner Lakshmi Rao, KA 01 AB 1234, cuts out");
    await user.click(within(d).getByRole("button", { name: /Safety Screen/ }));
    await user.click(within(d).getByRole("button", { name: /No hazards present — continue/ }));
    await user.type(within(d).getByLabelText("Battery ID (optional)"), "PACK-ID-7731");
    await user.type(within(d).getByLabelText("Battery serial (optional)"), "SER-55621-XZ");
    await user.type(within(d).getByLabelText("Technician"), "Suresh Naik");
    await user.click(within(d).getByRole("button", { name: /Electrical Measurements/ }));
    await user.type(within(d).getByRole("spinbutton", { name: /Measured pack voltage/ }), "76.35");
    await user.type(within(d).getByRole("spinbutton", { name: /^Pack current/ }), "41.7");
    await user.click(within(d).getByRole("button", { name: /Cell \/ Module Comparison/ }));
    await user.type(within(d).getByRole("spinbutton", { name: /Maximum cell-group voltage/ }), "4.081");
    await user.type(within(d).getByRole("spinbutton", { name: /Minimum cell-group voltage/ }), "3.742");
    await user.type(within(d).getByLabelText(/Individual cell-group values/), "4.071, 4.069, 3.742");
    await user.click(within(d).getByRole("button", { name: /Use these values/ }));
    await user.click(within(d).getByRole("button", { name: /Repair Action/ }));
    await user.type(within(d).getByLabelText("Repair performed"), "Technician note: replaced group 7 holder");
    await user.click(within(d).getByRole("button", { name: /Customer Report/ }));
    await user.click(within(d).getByRole("button", { name: "Preview diagnostic report" }));
    const dialog = screen.getByRole("dialog");
    // Click every control in the report, then the report body itself.
    await user.click(within(dialog).getByRole("button", { name: /Print \/ Save as PDF/ }));
    await user.click(within(dialog).getByText("BEFORE REPAIR"));
    await user.click(within(dialog).getByRole("button", { name: /Close report preview/ }));

    const sent = JSON.stringify(gtag.mock.calls);
    for (const secret of ["Lakshmi", "KA 01 AB 1234", "PACK-ID-7731", "SER-55621-XZ", "Suresh", "76.35", "41.7", "4.081", "3.742", "4.071", "replaced group 7", "BEFORE REPAIR", "Battery Diagnostic Report"]) {
      expect(sent).not.toContain(secret);
    }
    // Only bounded, declared event names reach analytics from this page.
    const names = new Set(gtag.mock.calls.map((c) => c[1] as string));
    const allowed = new Set(["page_view", "ev_battery_toolkit_page_view", "diagnosis_started", "diagnosis_completed", "repair_workflow_started", "report_preview_opened", "report_generated"]);
    for (const name of names) expect(allowed).toContain(name);
    for (const call of gtag.mock.calls) {
      const params = call[2] as Record<string, unknown> | undefined;
      for (const [key, value] of Object.entries(params ?? {})) {
        if (call[1] === "page_view") continue;
        expect(typeof value).toBe("string");
        expect(value as string, key).toMatch(/^[a-z0-9][a-z0-9_-]{0,39}$/);
      }
    }
  });
});
