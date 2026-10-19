import { describe, expect, it, vi, beforeAll } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import type { ReactElement } from "react";
import { GLOBAL_PROHIBITED_PHRASES } from "@/data/apex/evidence";
import { APEX_OFFICIAL_SITE_URL } from "@/data/apex/site";
import { ApexShell } from "./ApexShell";
import { HomePage } from "./pages/HomePage";
import { EnginePage } from "./pages/EnginePage";
import { SystemPage } from "./pages/SystemPage";
import { BuildValidatePage } from "./pages/BuildValidatePage";
import { DigitalTwinPage } from "./pages/DigitalTwinPage";
import { RoadmapPage } from "./pages/RoadmapPage";
import { EcosystemPage } from "./pages/EcosystemPage";
import { CompanyPage } from "./pages/CompanyPage";
import { cleanParams } from "./analytics";
import { composeMailto, sanitise } from "./ContactComposer";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/partners/apexrocketsystems" }));
vi.mock("next/font/google", () => ({ Archivo: () => ({ variable: "font-apex-display" }), IBM_Plex_Mono: () => ({ variable: "font-apex-mono" }) }));

beforeAll(() => {
  // jsdom has no <dialog> behaviour; enough of it for the panels to open and close.
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal: () => void; close: () => void };
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  window.scrollTo = (() => {}) as typeof window.scrollTo;
  HTMLElement.prototype.scrollTo = function scrollTo() {};
});

const PAGES: Record<string, () => ReactElement> = {
  home: HomePage,
  engine: EnginePage,
  system: SystemPage,
  "build-validate": BuildValidatePage,
  "digital-twin": DigitalTwinPage,
  roadmap: RoadmapPage,
  ecosystem: EcosystemPage,
  company: CompanyPage,
};

const renderPage = (Page: () => ReactElement) => render(<ApexShell><Page /></ApexShell>);

describe.each(Object.entries(PAGES))("%s page", (_name, Page) => {
  it("makes no unsupported claim and names no stale host", () => {
    const { container } = renderPage(Page);
    const text = (container.textContent ?? "").toLowerCase();
    for (const phrase of GLOBAL_PROHIBITED_PHRASES) expect(text, phrase).not.toContain(phrase.toLowerCase());
    expect(text).not.toMatch(/hot-fired|hot fired|launch-ready|flight-qualified|qualified for flight|ishavasyam/);
    // Performance figures APEX has not confirmed the basis of are never repeated.
    expect(text).not.toMatch(/280\s*s|specific impulse:|multiple restarts/);
    expect(container.innerHTML).not.toMatch(/ishavasyam/i);
  });

  it("has one h1, and every link opening a new tab is safe", () => {
    const { container } = renderPage(Page);
    expect(container.querySelectorAll("h1")).toHaveLength(1);
    for (const link of Array.from(container.querySelectorAll("a[target=_blank]"))) {
      expect(link.getAttribute("rel"), link.getAttribute("href") ?? "").toBe("noopener noreferrer");
    }
  });

  it("points every official-website link at apexrocketsystems.com", () => {
    const { container } = renderPage(Page);
    const official = Array.from(container.querySelectorAll("a")).filter((a) => /apexrocketsystems\.com|official/i.test(a.textContent ?? ""));
    expect(official.length).toBeGreaterThan(0);
    for (const link of official) expect(link.getAttribute("href") ?? "", link.textContent ?? "").toMatch(/^https:\/\/www\.apexrocketsystems\.com\//);
    expect(container.querySelector(`a[href="${APEX_OFFICIAL_SITE_URL}"]`)).not.toBeNull();
  });

  it("never puts the contact address in the server-rendered HTML", () => {
    const html = renderToString(<ApexShell><Page /></ApexShell>);
    expect(html).not.toMatch(/vibbhav@|apex-propulsion\.com/);
  });
});

describe("home page", () => {
  it("tells the story in the brief's order", () => {
    const { container } = renderPage(HomePage);
    const ids = Array.from(container.querySelectorAll("main section[id]")).map((s) => s.id);
    expect(ids).toEqual(["built", "beginning", "system", "engineer-build-prove", "physical-digital", "loop", "ecosystem", "roadmap", "founders", "collaborate"]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Engineered to ascend\./i);
    expect(container.textContent).toMatch(/Concept · Engineering Collaboration Proposal/);
    expect(container.textContent).toMatch(/Hardware built/i);
  });

  it("opens a system domain in the detail panel and moves between linked domains", () => {
    renderPage(HomePage);
    fireEvent.click(screen.getByRole("button", { name: /Propulsion\s*Built/ }));
    const dialog = document.querySelector("dialog[aria-labelledby='apex-panel-title']") as HTMLDialogElement;
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(within(dialog).getByRole("heading", { level: 2 })).toHaveTextContent("Propulsion");
    for (const title of ["Purpose", "Status", "Development evidence", "Partner capabilities", "Related dependencies"]) expect(within(dialog).getByText(title, { exact: false })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Structures" }));
    expect(within(dialog).getByRole("heading", { level: 2 })).toHaveTextContent("Structures");
    fireEvent.click(within(dialog).getByRole("button", { name: "Close panel" }));
    expect(dialog.hasAttribute("open")).toBe(false);
  });
});

describe("ecosystem page", () => {
  it("shows an open capability as Partner Required, able to take more than one partner", () => {
    renderPage(EcosystemPage);
    const card = screen.getAllByRole("button", { name: /Avionics & Flight Electronics/ })[0];
    fireEvent.click(card);
    const dialog = document.querySelector("dialog[aria-labelledby='apex-panel-title']") as HTMLDialogElement;
    expect(within(dialog).getByText(/No partner is identified for this capability yet\. More than one partner can contribute\./)).toBeInTheDocument();
    expect(within(dialog).getAllByText("Partner Required").length).toBeGreaterThan(0);
  });

  it("lists iTelematics with exactly its two capabilities", () => {
    renderPage(EcosystemPage);
    fireEvent.click(screen.getAllByRole("button", { name: /iTelematics Software Private Limited/ })[0]);
    const dialog = document.querySelector("dialog[aria-labelledby='apex-panel-title']") as HTMLDialogElement;
    expect(within(dialog).getByText("Capabilities (2)")).toBeInTheDocument();
    const rows = within(dialog).getAllByRole("button").filter((b) => /Cybersecurity|AI for Engineering|Digital Twin|Software Engineering|Firmware/.test(b.textContent ?? ""));
    expect(rows.map((b) => (b.textContent ?? "").match(/^(Cybersecurity|AI for Engineering)/)?.[1])).toEqual(["Cybersecurity", "AI for Engineering"]);
    expect(within(dialog).getByText(/No formal agreement is implied/)).toBeInTheDocument();
  });

  it("maps a contribution area to lifecycle stages, capabilities and interfaces", () => {
    renderPage(EcosystemPage);
    fireEvent.click(screen.getByRole("button", { name: "Embedded", pressed: false }));
    const result = document.getElementById("contribution-result") as HTMLElement;
    expect(result.textContent).toMatch(/Firmware development/);
    expect(result.textContent).toMatch(/Embedded Systems & Firmware/);
    expect(result.textContent).toMatch(/iFab Innovations/);
    expect(result.textContent).toMatch(/Sensor and actuator interfaces/);
  });
});

describe("system page", () => {
  it("adds the N² interface matrix in the technical view", () => {
    renderPage(SystemPage);
    expect(screen.queryByRole("table")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Technical view" }));
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")).toHaveLength(19);
  });

  it("shows review gates as process concepts, none completed", () => {
    const { container } = renderPage(SystemPage);
    const gates = container.querySelector("#review-gates") as HTMLElement;
    for (const acronym of ["MCR", "SRR", "PDR", "CDR", "TRR", "FRR"]) expect(within(gates).getByText(acronym)).toBeInTheDocument();
    expect(gates.textContent).toMatch(/No review is shown as completed/);
  });
});

describe("analytics parameters", () => {
  it("drop anything that is not a short id", () => {
    expect(cleanParams({ capability_id: "avionics", email: "someone@example.com", url: "https://x.y/z", note: "Hello there", placement: "hero" })).toEqual({ capability_id: "avionics", placement: "hero" });
  });
});

describe("collaboration composer", () => {
  it("sanitises what a visitor types and composes a mailto addressed to APEX", () => {
    expect(sanitise("  Ada\u0000 Lovelace \n", 80)).toBe("Ada Lovelace");
    expect(sanitise("x".repeat(200), 80)).toHaveLength(80);
    expect(sanitise("line one\nline two\t ", 200, true)).toBe("line one\nline two");
    const href = composeMailto({ category: "testing", name: "Ada", organisation: "Lab & Co", role: "", message: "Hello?\nThanks" }, "team@example.org");
    expect(href.startsWith("mailto:team@example.org?subject=")).toBe(true);
    const url = new URL(href);
    expect(url.searchParams.get("subject")).toBe("APEX collaboration — Testing — Lab & Co");
    expect(url.searchParams.get("body")).toBe("Area: Testing\nName: Ada\nOrganisation: Lab & Co\n\nHello?\nThanks");
  });
});
