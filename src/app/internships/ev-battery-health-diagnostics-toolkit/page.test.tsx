import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FAQ } from "@/data/ev-battery-toolkit/content";
import { useToolkit } from "@/components/ev-battery-toolkit/state/store";

vi.mock("next/navigation", () => ({ usePathname: () => "/internships/ev-battery-health-diagnostics-toolkit" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

import Page, { metadata } from "./page";

const gtag = vi.fn();
const sentText = () => JSON.stringify(gtag.mock.calls);
const events = () => gtag.mock.calls.map((c) => c[1]);
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

describe("toolkit route", () => {
  it("renders the hero: one H1, the subtitle, the statement and both calls to action", () => {
    render(<Page />);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent("EV.ENGINEER™ — EV Battery Health & Diagnostics Toolkit");
    expect(screen.getByText("Interactive 3D Battery Diagnostics & Repair Workspace")).toBeInTheDocument();
    expect(screen.getByText("Locate the battery. Inspect the pack. Analyse BMS data. Identify faults. Understand repair options. Verify battery health.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Launch 3D Toolkit/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore Battery Diagnostics" })).toHaveAttribute("href", "#diagnosis");
    expect(screen.getByText(/Vehicle-specific repair procedures must follow verified manufacturer service information\./, { selector: "span" })).toBeInTheDocument();
  });

  it("orders the sections as specified and ends with Designed By", () => {
    const { container } = render(<Page />);
    const ids = Array.from(container.querySelectorAll("main > section[id]")).map((s) => s.id);
    expect(ids).toEqual(["modes", "locator", "architectures", "explorer", "hierarchy", "health", "bms", "faults", "diagnosis", "platforms", "report", "equipment", "desktop", "faq"]);
    const last = container.querySelector("main > section:last-of-type")!;
    expect(last).toHaveAttribute("aria-label", "Designed by");
    expect(within(last as HTMLElement).getByText("Sudarshana Karkala")).toBeInTheDocument();
    expect(within(last as HTMLElement).getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(within(last as HTMLElement).getByRole("link", { name: /View full profile/ })).toHaveAttribute("data-track-event", "profile_clicked");
  });

  it("never skips a heading level", () => {
    const { container } = render(<Page />);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
    levels.reduce((prev, level) => {
      expect(level).toBeLessThanOrEqual(prev + 1);
      return level;
    }, 1);
  });

  it("reports the page view", () => {
    render(<Page />);
    expect(events()).toContain("ev_battery_toolkit_page_view");
  });
});

describe("SEO", () => {
  it("has the specified title, description, canonical, Open Graph and Twitter metadata", () => {
    expect(metadata.title).toBe("EV Battery Health & Diagnostics Toolkit — 3D Battery Repair & BMS Diagnostics | EV.ENGINEER™");
    expect(metadata.description).toBe(
      "Interactive 3D EV battery diagnostics toolkit for electric-scooter technicians. Explore battery packs, BMS, cells, SOC, SOH, thermal behaviour, faults and guided repair workflows.",
    );
    expect(metadata.alternates?.canonical).toBe("https://aerospace.ev.engineer/internships/ev-battery-health-diagnostics-toolkit");
    expect(metadata.openGraph).toMatchObject({ title: metadata.title, url: "https://aerospace.ev.engineer/internships/ev-battery-health-diagnostics-toolkit" });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.keywords).toEqual(expect.arrayContaining(["EV battery diagnostics", "BMS diagnostics", "72V battery diagnostics", "LFP battery diagnostics"]));
  });

  it("injects a JSON-LD graph whose FAQ matches the visible FAQ", () => {
    const { container } = render(<Page />);
    const graph = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)["@graph"] as Record<string, unknown>[];
    const types = graph.map((n) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["WebPage", "WebApplication", "BreadcrumbList", "FAQPage", "DefinedTermSet"]));
    const faq = graph.find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string }[] };
    expect(faq.mainEntity.map((q) => q.name)).toEqual(FAQ.map((f) => f.q));
    for (const f of FAQ) expect(screen.getByText(f.q)).toBeInTheDocument();
    expect(JSON.stringify(graph)).not.toMatch(/"offers"|"aggregateRating"/);
  });

  it("answers the key questions in visible text, not only in WebGL", () => {
    render(<Page />);
    for (const q of ["What is SOC?", "What is SOH?", "What is cell imbalance?", "What is a swappable battery?", "What is Owner Mode?", "What is Technician Mode?"]) {
      expect(screen.getByText(q)).toBeInTheDocument();
    }
  });
});

describe("Owner Mode and Technician Mode", () => {
  it("defaults to Technician Mode with the nine-step flow and repair depths that are not certification levels", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const modes = section("modes");
    const flow = within(modes).getByRole("list", { name: "Technician workflow" });
    expect(within(flow).getAllByRole("listitem").map((li) => li.querySelector("span:nth-child(2)")!.textContent)).toEqual(["Locate", "Inspect", "Connect", "Measure", "Diagnose", "Isolate", "Repair", "Verify", "Report"]);
    await user.click(within(modes).getByRole("tab", { name: "Advanced Battery Repair" }));
    expect(within(modes).getByText("Cell replacement concepts")).toBeInTheDocument();
    expect(within(modes).getByText(/They are not certification levels\./)).toBeInTheDocument();
    await user.click(within(modes).getByRole("tab", { name: /Technician Mode/ }));
    expect(events()).toContain("technician_mode_selected");
  });

  it("Owner Mode explains symptoms safely and hides technician repair content across the page", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const modes = section("modes");
    await user.click(within(modes).getByRole("tab", { name: /Owner Mode/ }));
    expect(events()).toContain("owner_mode_selected");
    const symptoms = within(modes).getAllByRole("button").filter((b) => b.hasAttribute("aria-pressed"));
    expect(symptoms).toHaveLength(10);
    for (const s of symptoms) {
      await user.click(s);
      for (const label of ["Possible causes", "Severity", "Safe next step", "Professional inspection"]) expect(within(modes).getByText(label)).toBeInTheDocument();
    }
    expect(gtag).toHaveBeenCalledWith("event", "owner_symptom_selected", { symptom: "overheating" });
    const ownerText = modes.textContent!.toLowerCase();
    for (const forbidden of ["cell replacement", "busbar", "remove the cover", "open the pack", "solder", "module replacement"]) expect(ownerText).not.toContain(forbidden);
    // A stop-level symptom shows the stop banner.
    await user.click(within(modes).getByRole("button", { name: /Overheating/ }));
    expect(within(modes).getByRole("alert")).toHaveTextContent("STOP");
    // The technician workflow is gated and the workspace panel gives no repair depth.
    const diagnosis = section("diagnosis");
    expect(within(diagnosis).queryByRole("button", { name: "Start real vehicle diagnosis" })).toBeNull();
    expect(within(diagnosis).getByText(/This workflow is for trained technicians\./)).toBeInTheDocument();
    await user.click(within(section("explorer")).getByRole("button", { name: "Battery enclosure" }));
    expect(within(section("explorer")).getByText(/Owner Mode: do not open the battery/)).toBeInTheDocument();
    expect(within(section("explorer")).queryByText(/Repair depth:/)).toBeNull();
  });
});

describe("Vehicle Battery Locator", () => {
  it("walks manufacturer → model → variant → year, shows unverified data and locates the confirmed architecture", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const locator = section("locator");
    expect(within(locator).getByRole("button", { name: "Show vehicle" })).toBeDisabled();
    await user.selectOptions(within(locator).getByLabelText("Manufacturer"), "TVS Motor Company");
    await user.selectOptions(within(locator).getByLabelText("Model"), "tvs-iqube");
    await user.selectOptions(within(locator).getByLabelText("Variant"), "iqube-s");
    await user.click(within(locator).getByRole("button", { name: "Show vehicle" }));
    expect(gtag).toHaveBeenCalledWith("event", "vehicle_selected", { vehicle: "tvs-iqube" });
    expect(within(locator).getAllByText("Technical specification not verified.").length).toBeGreaterThanOrEqual(4);
    expect(within(locator).getAllByText("UNKNOWN").length).toBeGreaterThanOrEqual(4);
    expect(within(locator).getByText("LOW")).toBeInTheDocument();
    expect(within(locator).getByText("Generic procedural scooter — not OEM geometry")).toBeInTheDocument();
    const locate = within(locator).getByRole("button", { name: /LOCATE BATTERY/ });
    expect(locate).toBeDisabled();
    await user.selectOptions(within(locator).getByLabelText("Architecture seen on the vehicle"), "swappable");
    await user.click(locate);
    expect(within(locator).getByText(/Battery located: Removable \/ Swappable Battery, in the seat bay/)).toBeInTheDocument();
    expect(within(locator).getAllByText("USER ENTERED").length).toBeGreaterThan(0);
  });
});

describe("3D Battery Explorer", () => {
  it("falls back to the 2D schematic on a phone and never creates a canvas", () => {
    const { container } = render(<Page />);
    const explorer = section("explorer");
    expect(container.querySelector("canvas")).toBeNull();
    expect(within(explorer).getByRole("group", { name: "2D schematic of the simulated pack" })).toBeInTheDocument();
    expect(within(explorer).getByText(/Open this toolkit on a laptop or desktop for the complete interactive 3D diagnostic experience\./)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Built for Laptop & Desktop" })).toBeInTheDocument();
  });

  it("switches architecture and chemistry from the configurator", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const config = within(section("explorer")).getByRole("complementary", { name: "Battery configurator" });
    expect(config).toHaveTextContent("20S");
    expect(config).toHaveTextContent("Integrated / Fixed Floor Battery");
    await user.click(within(config).getByRole("button", { name: "Swappable" }));
    expect(config).toHaveTextContent("Removable / Swappable Battery");
    expect(events()).toContain("swappable_battery_selected");
    await user.click(within(config).getByRole("button", { name: "LFP" }));
    expect(config).toHaveTextContent("23S");
  });

  it("selects components and cell groups from the keyboard-reachable lists", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const explorer = section("explorer");
    await user.click(within(explorer).getByRole("button", { name: "Next component" }));
    expect(within(explorer).getByRole("heading", { name: "Battery enclosure" })).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("event", "component_selected", { component: "enclosure" });
    expect(gtag).toHaveBeenCalledWith("event", "battery_3d_started", expect.any(Object));
    await user.click(within(explorer).getByRole("button", { name: /^Group 3:/ }));
    expect(within(explorer).getByRole("heading", { name: "Cells and cell groups" })).toBeInTheDocument();
    expect(within(explorer).getAllByText("SIMULATED").length).toBeGreaterThan(0);
  });

  it("reports x-ray, exploded, thermal, cell and BMS views", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const explorer = section("explorer");
    await user.click(within(explorer).getByRole("button", { name: /X-Ray/ }));
    await user.click(within(explorer).getByRole("button", { name: /Explode/ }));
    await user.click(within(explorer).getByRole("button", { name: "Thermal" }));
    expect(within(explorer).getByText(/Thermal view: hottest group/)).toBeInTheDocument();
    await user.click(within(explorer).getByRole("button", { name: "Cell Voltage" }));
    await user.click(within(explorer).getByRole("button", { name: "BMS" }));
    for (const e of ["battery_xray_opened", "pack_exploded", "thermal_view_opened", "cell_view_opened", "bms_view_opened"]) expect(events()).toContain(e);
  });

  it("measures with the multimeter and labels the reading SIMULATED", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const explorer = section("explorer");
    await user.click(within(explorer).getByRole("button", { name: "Measure" }));
    const reading = within(explorer).getByText(/Pack \+ to Pack −/, { selector: "p" });
    expect(reading).toHaveTextContent("SIMULATED");
    expect(gtag).toHaveBeenCalledWith("event", "measurement_completed", { tool: "multimeter" });
  });
});

describe("faults, dashboard and BMS", () => {
  it("injects a known fault: the dashboard, BMS twin and safety banners follow", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const faults = section("faults");
    expect(within(section("health")).getByText("Healthy")).toBeInTheDocument();
    await user.click(within(faults).getByRole("radio", { name: "KNOWN FAULT" }));
    await user.click(within(faults).getByRole("tab", { name: "Thermal" }));
    await user.click(within(faults).getByRole("radio", { name: /Hot Cell/ }));
    await user.click(within(faults).getByRole("button", { name: "Inject fault" }));
    expect(gtag).toHaveBeenCalledWith("event", "fault_injected", { fault: "hot-cell", mode: "known" });
    expect(within(faults).getByText("EARLY WARNING")).toBeInTheDocument();
    expect(within(section("health")).queryByText("Healthy", { selector: "span" })).toBeNull();
    await user.click(within(section("health")).getByRole("button", { name: "WHY THIS STATUS?" }));
    expect(within(section("health")).getByRole("table")).toHaveTextContent("Temperature spread");
    const why = within(section("bms")).getAllByRole("button", { name: "WHY?" });
    await user.click(why[0]);
    expect(within(section("bms")).getByText(/is highlighted in the 3D explorer and the chart/)).toBeInTheDocument();
  });

  it("hides an unknown fault's root cause until it is revealed", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const faults = section("faults");
    await user.click(within(faults).getByRole("radio", { name: "UNKNOWN FAULT" }));
    await user.click(within(faults).getByRole("button", { name: "Inject unknown fault" }));
    expect(within(faults).getByText("Unknown fault injected.")).toBeInTheDocument();
    expect(within(faults).queryByText("Injected fault")).toBeNull();
    expect(gtag).toHaveBeenCalledWith("event", "fault_injected", { fault: "hidden", mode: "unknown" });
    await user.click(within(faults).getByRole("button", { name: /Reveal root cause/ }));
    expect(within(faults).getByText("Injected fault")).toBeInTheDocument();
  });

  it("shows CRITICAL — STOP SERVICE PROCEDURE for suspected thermal runaway", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const faults = section("faults");
    await user.click(within(faults).getByRole("radio", { name: "KNOWN FAULT" }));
    await user.click(within(faults).getByRole("tab", { name: "Safety" }));
    await user.click(within(faults).getByRole("radio", { name: /Suspected Thermal Runaway/ }));
    await user.click(within(faults).getByRole("button", { name: "Inject fault" }));
    expect(within(faults).getByText("CRITICAL — STOP SERVICE PROCEDURE")).toBeInTheDocument();
    expect(within(faults).getByText("DO NOT CHARGE")).toBeInTheDocument();
    expect(within(section("health")).getAllByText("Critical").length).toBeGreaterThan(0);
  });

  it("opens a common issue in the toolkit", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(within(section("faults")).getByRole("button", { name: /Open Cell Imbalance in the toolkit/ }));
    expect(useToolkit.getState().faultId).toBe("imbalance");
    expect(within(section("explorer")).getByText("Injected fault: Cell Imbalance")).toBeInTheDocument();
  });
});

describe("platforms, equipment and report", () => {
  it("lists the five priority platforms with unverified data and no defect ranking", () => {
    render(<Page />);
    const platforms = section("platforms");
    expect(within(platforms).getByRole("heading", { name: "Priority South India EV Scooter Battery Platforms" })).toBeInTheDocument();
    const rows = within(platforms).getAllByRole("row").slice(1);
    expect(rows.map((r) => within(r).getByRole("rowheader").firstChild!.textContent)).toEqual(["Ola S1 family", "TVS iQube family", "Ather 450 / Rizta family", "River Indie", "EVeium Cosmo / Comet / Czar family"]);
    expect(platforms.textContent).not.toMatch(/most battery failures/i);
    expect(within(platforms).getAllByText("Technical specification not verified.", { exact: false })).toHaveLength(5);
  });

  it("keeps commercial tools in the equipment section with the external-product label", () => {
    render(<Page />);
    const equipment = section("equipment");
    expect(within(equipment).getByText("External product. Verify vehicle and BMS compatibility before use.")).toBeInTheDocument();
    const link = within(equipment).getByRole("link", { name: /External website/ });
    expect(link).toHaveAttribute("data-track-event", "external_tool_clicked");
    expect(link).toHaveAttribute("target", "_blank");
    for (const id of ["modes", "locator", "explorer", "faults", "diagnosis", "report"]) expect(section(id).textContent).not.toMatch(/EV DOCTOR|BatteryOK/i);
  });

  it("previews and prints the sample report, labelled as simulation", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await user.click(within(section("report")).getByRole("button", { name: /Open sample report/ }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("Battery Diagnostic Report — SIMULATION / TRAINING DATA");
    expect(dialog).toHaveTextContent("SIMULATION / TRAINING DATA");
    expect(dialog).toHaveTextContent("DATA QUALITY SUMMARY");
    expect(dialog).toHaveTextContent("Generated using EV.ENGINEER™ — EV Battery Health & Diagnostics Toolkit");
    expect(dialog).not.toHaveTextContent(/undefined|NaN|Infinity/);
    await user.click(within(dialog).getByRole("button", { name: /Print \/ Save as PDF/ }));
    expect(window.print).toHaveBeenCalled();
    expect(gtag).toHaveBeenCalledWith("event", "report_preview_opened", { context: "simulation" });
    expect(gtag).toHaveBeenCalledWith("event", "report_generated", { context: "simulation" });
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("Real Vehicle Diagnosis", () => {
  it("starts empty, gates on the safety screen, and keeps job-card data out of analytics", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const diagnosis = section("diagnosis");
    expect(within(diagnosis).getByRole("tab", { name: /Real Vehicle Diagnosis/ })).toHaveAttribute("aria-selected", "true");
    await user.click(within(diagnosis).getByRole("button", { name: "Start real vehicle diagnosis" }));
    expect(within(diagnosis).getByText("REAL VEHICLE DIAGNOSIS")).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledWith("event", "diagnosis_started", { context: "real" });

    await user.selectOptions(within(diagnosis).getByLabelText("Complaint category"), "shutdown-load");
    await user.type(within(diagnosis).getByLabelText("Customer complaint (their words)"), "Customer Meera says it dies on the flyover");

    // Stages after the safety screen are locked.
    expect(within(diagnosis).getByRole("button", { name: /Electrical Measurements/ })).toBeDisabled();
    await user.click(within(diagnosis).getByRole("button", { name: /Safety Screen/ }));
    await user.click(within(diagnosis).getByLabelText("Swelling"));
    expect(within(diagnosis).getAllByText("STOP DIAGNOSIS").length).toBeGreaterThan(0);
    expect(within(diagnosis).getByRole("button", { name: /Electrical Measurements/ })).toBeDisabled();
    await user.click(within(diagnosis).getByLabelText("Swelling"));
    await user.click(within(diagnosis).getByRole("button", { name: /No hazards present — continue/ }));

    // Identification: private values typed here must never reach analytics.
    await user.type(within(diagnosis).getByLabelText("Battery serial (optional)"), "SN-PRIVATE-9981");
    await user.type(within(diagnosis).getByLabelText("Technician"), "Ravi Kumar");
    await user.selectOptions(within(diagnosis).getByLabelText("Manufacturer"), "Ather Energy");

    // Measurements start NOT MEASURED; recording one makes it MEASURED.
    await user.click(within(diagnosis).getByRole("button", { name: /Electrical Measurements/ }));
    const pack = within(diagnosis).getByRole("spinbutton", { name: /Measured pack voltage/ });
    expect(pack).toHaveValue(null);
    expect(within(diagnosis).getByLabelText("Measured pack voltage — data origin")).toHaveValue("NOT_MEASURED");
    await user.type(pack, "77.9");
    expect(within(diagnosis).getByLabelText("Measured pack voltage — data origin")).toHaveValue("MEASURED");

    await user.click(within(diagnosis).getByRole("button", { name: /Cell \/ Module Comparison/ }));
    await user.type(within(diagnosis).getByRole("spinbutton", { name: /Maximum cell-group voltage/ }), "4.08");
    await user.type(within(diagnosis).getByRole("spinbutton", { name: /Minimum cell-group voltage/ }), "3.74");
    await user.selectOptions(within(diagnosis).getByLabelText("Load behaviour"), "Shuts down under load");

    // Without the BMS status the imbalance gate is not met.
    await user.click(within(diagnosis).getByRole("button", { name: /Root-Cause Analysis/ }));
    const imbalance = within(diagnosis).getByRole("article", { name: "Cell-group imbalance" });
    expect(imbalance).toHaveTextContent("INSUFFICIENT EVIDENCE — PERFORM NEXT TEST");
    expect(imbalance).toHaveTextContent("BMS status — required");

    await user.click(within(diagnosis).getByRole("button", { name: /BMS \/ Diagnostic Data/ }));
    await user.selectOptions(within(diagnosis).getByLabelText("BMS status"), "Normal");
    await user.click(within(diagnosis).getByRole("button", { name: /Root-Cause Analysis/ }));
    expect(within(diagnosis).getByRole("article", { name: "Cell-group imbalance" })).toHaveTextContent("HIGH confidence");

    await user.click(within(diagnosis).getByRole("button", { name: /Repair Decision/ }));
    expect(within(diagnosis).getByText("ADVANCED CELL REPAIR")).toBeInTheDocument();

    await user.click(within(diagnosis).getByRole("button", { name: /Customer Report/ }));
    await user.click(within(diagnosis).getByRole("button", { name: "Preview diagnostic report" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("REAL VEHICLE DIAGNOSIS");
    expect(dialog).toHaveTextContent("SN-PRIVATE-9981");
    // No value in a real report carries a SIMULATED badge; the quality summary states "SIMULATED fields: 0".
    expect(dialog.querySelectorAll('[data-family="simulated"]')).toHaveLength(0);
    expect(within(dialog).getByText("SIMULATED fields").nextElementSibling).toHaveTextContent("0");
    expect(dialog).toHaveTextContent("NOT MEASURED");

    const sent = sentText();
    for (const secret of ["SN-PRIVATE-9981", "Ravi", "Meera", "flyover", "77.9", "4.08"]) expect(sent).not.toContain(secret);
    expect(events()).toEqual(expect.arrayContaining(["diagnosis_started", "diagnosis_completed", "report_preview_opened"]));
  });

  it("runs the guided simulation to a decision that is never an automatic battery replacement", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const diagnosis = section("diagnosis");
    await user.click(within(diagnosis).getByRole("tab", { name: /Guided Simulation/ }));
    expect(within(diagnosis).getByText(/Battery shows 60%, but scooter shuts down during acceleration\./)).toBeInTheDocument();
    await user.click(within(diagnosis).getByRole("button", { name: "Start guided case" }));
    for (let i = 0; i < 11; i++) await user.click(within(diagnosis).getByRole("button", { name: "Run step" }));
    expect(within(diagnosis).getByText("Tests completed").nextElementSibling).toHaveTextContent("11");
    expect(diagnosis.textContent).not.toMatch(/replace battery/i);
    expect(within(diagnosis).getByText("Technician conclusion").nextElementSibling).toHaveTextContent("MODULE REPAIR");
  });
});

describe("WebGL unavailable on a desktop-sized screen", () => {
  it("shows the 2D schematic with an explanation instead of a blank canvas", async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes("min-width: 1024px") })) as typeof window.matchMedia;
    try {
      const { container } = render(<Page />);
      expect(container.querySelector("canvas")).toBeNull();
      expect(await screen.findByText(/Interactive 3D is not available in this browser, so a 2D schematic is shown\./)).toBeInTheDocument();
    } finally {
      window.matchMedia = original;
    }
  });
});
