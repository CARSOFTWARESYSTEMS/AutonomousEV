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

  it("states the APEX–Gamyaa AeroSystems engineering collaboration, without the old disclaimer or any stronger claim", () => {
    const { container } = renderPage(Page);
    const text = container.textContent ?? "";
    // The footer statement, on every page, with a link to each organisation.
    expect(text).toMatch(/ongoing engineering collaboration between APEX Rocket Systems and Gamyaa AeroSystems/);
    expect(text).toMatch(/APEX Rocket Systems retains ownership of its rocket-system and propulsion engineering direction/);
    expect(container.querySelector('a[href="https://www.gamyaa.in/"]')).not.toBeNull();
    expect(text).not.toMatch(/no formal agreement is implied|collaboration proposal|partnership proposal|proposed capability( partner)?: gamyaa/i);
    expect(text).not.toMatch(/joint venture|strategic alliance|exclusive partner|equity stake|acquired by/i);
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

  it("never puts a contact address or telephone number in the server-rendered HTML", () => {
    const html = renderToString(<ApexShell><Page /></ApexShell>);
    expect(html).not.toMatch(/vibbhav@|apex-propulsion\.com|gamyaa\.aerosystems|98866|43942/);
  });

  it("addresses every email link to both APEX and Gamyaa AeroSystems, in To, once hydrated", () => {
    const { container } = renderPage(Page);
    const links = Array.from(container.querySelectorAll('a[href^="mailto:"]'));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      const href = link.getAttribute("href") ?? "";
      const recipients = href.replace(/^mailto:/, "").split("?")[0].split(",");
      expect(recipients.sort(), href).toEqual(["gamyaa.aerosystems@gmail.com", "vibbhav@apex-propulsion.com"]);
      expect(href, href).not.toMatch(/[?&]cc=/);
    }
  });
});

describe("home page", () => {
  it("tells the story in the brief's order", () => {
    const { container } = renderPage(HomePage);
    const ids = Array.from(container.querySelectorAll("main section[id]")).map((s) => s.id);
    expect(ids).toEqual(["built", "hardware", "system", "validation", "ecosystem", "collaborate"]);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Engineered to ascend\./i);
    // The hero carries only the short collaboration line, not the full statement.
    const hero = container.querySelector("#apex-hero-title")?.closest("section") as HTMLElement;
    expect(hero.textContent).toMatch(/APEX Rocket Systems × Gamyaa AeroSystems\s*Engineering collaboration toward shared rocket-system development and validation goals\./);
    expect(hero.textContent).not.toMatch(/retains ownership|unless otherwise confirmed/);
    expect(container.textContent).toMatch(/Hardware built/i);
  });

  it("keeps the deep content off the homepage: no 18-domain explorer, roadmap, founders or capability statistics", () => {
    const { container } = renderPage(HomePage);
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/Capabilities mapped|Held by APEX|Building APEX|Evidence first\. Dates when confirmed|Fig\. 0/);
    expect(container.querySelectorAll("main section").length).toBe(7);
    for (const name of ["Propulsion", "Structures", "Avionics", "Guidance & Control", "Software", "Ground & Test"]) {
      expect(screen.getAllByRole("button", { name: new RegExp(`^\\d+\\s*${name.replace("&", "&")}`) }).length).toBeGreaterThan(0);
    }
  });
});

describe("system page domains", () => {
  it("opens a system domain in the detail panel and moves between linked domains", () => {
    renderPage(SystemPage);
    fireEvent.click(screen.getByRole("button", { name: /^Propulsion\s*Produces thrust/ }));
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
    fireEvent.click(screen.getByRole("button", { name: "Avionics", pressed: false }));
    const result = document.getElementById("contribution-result") as HTMLElement;
    fireEvent.click(within(result).getByRole("button", { name: /Avionics & Flight Electronics/ }));
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
    expect(within(dialog).getByText(/Proposed capability partner\. The relationship is not yet confirmed\./)).toBeInTheDocument();
  });

  it("shows Gamyaa AeroSystems as an engineering collaboration, not a proposed partner", () => {
    renderPage(EcosystemPage);
    fireEvent.click(screen.getAllByRole("button", { name: /Gamyaa AeroSystems/ })[0]);
    const dialog = document.querySelector("dialog[aria-labelledby='apex-panel-title']") as HTMLDialogElement;
    expect(dialog.textContent).toMatch(/Engineering Collaboration/);
    expect(dialog.textContent).toMatch(/APEX retains ownership of its rocket-system and propulsion engineering direction/);
    expect(dialog.textContent).not.toMatch(/propos/i);
  });

  it("leads with capabilities: Embedded first, mapped to lifecycle stages, partners and interfaces", () => {
    renderPage(EcosystemPage);
    expect(screen.getByRole("button", { name: "Embedded", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Show all 40 capabilities/ })).toBeInTheDocument();
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

describe("digital twin page", () => {
  it("links the two Gamyaa AeroSystems Digital Twin experiences after the twin story, before the close, with the clarification", () => {
    const { container } = renderPage(DigitalTwinPage);
    const ids = Array.from(container.querySelectorAll("main section[id]")).map((el) => el.id);
    expect(ids.indexOf("related")).toBeGreaterThan(ids.indexOf("configuration"));
    expect(ids.indexOf("related")).toBeGreaterThan(ids.indexOf("twin-loop"));
    expect(ids[ids.length - 1]).toBe("related");
    const section = container.querySelector("#related") as HTMLElement;
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("Explore Related Gamyaa AeroSystems Digital Engineering");
    expect(section.textContent).toMatch(/not represented as an operational APEX production Digital Twin unless explicitly confirmed by APEX/);
    expect(within(section).getByRole("heading", { level: 3, name: "Rocket Engine Digital Twin" })).toBeInTheDocument();
    expect(within(section).getByRole("heading", { level: 3, name: "Advanced Rocket Engine Digital Twin" })).toBeInTheDocument();
    // Same host today: same-tab links.
    const basic = within(section).getByRole("link", { name: "Explore Rocket Engine Digital Twin" });
    const advanced = within(section).getByRole("link", { name: "Explore Advanced Digital Twin" });
    expect(basic).toHaveAttribute("href", "/space/rocket-engine-digital-twin");
    expect(advanced).toHaveAttribute("href", "/space/rocket-engine-digital-twin-advanced");
    expect(basic).not.toHaveAttribute("target");
    expect(basic).toHaveAttribute("data-track-event", "apex_cta_click");
  });
});

describe("company page", () => {
  it("lists the partnership contacts first: APEX, and Gamyaa AeroSystems with its person, email, telephone and contact page", () => {
    const { container } = renderPage(CompanyPage);
    const order = Array.from(container.querySelectorAll("main section[id]")).map((el) => el.id);
    expect(order.indexOf("partnership-contacts")).toBeLessThan(order.indexOf("about"));
    const section = container.querySelector("#partnership-contacts") as HTMLElement;
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("Who to talk to");
    const gamyaa = section.querySelector('[data-contact="gamyaa"]') as HTMLElement;
    expect(gamyaa.textContent).toMatch(/Gamyaa AeroSystems/);
    expect(gamyaa.textContent).toMatch(/Purushothama Padmanabha/);
    expect(within(gamyaa).getByRole("link", { name: "gamyaa.aerosystems@gmail.com" }).getAttribute("href")).toBe("mailto:gamyaa.aerosystems@gmail.com,vibbhav@apex-propulsion.com");
    expect(within(gamyaa).getByRole("link", { name: "+91 98866 43942" })).toHaveAttribute("href", "tel:+919886643942");
    expect(within(gamyaa).getByRole("link", { name: /Contact page/ })).toHaveAttribute("href", "https://www.gamyaa.in/contact");
    expect(gamyaa.textContent).toMatch(/For partnership/);
    // One partnership email for both organisations sits below the cards, not inside either; there is no Call button.
    expect(within(gamyaa).queryByRole("link", { name: "Email for partnership" })).toBeNull();
    expect(within(section).getByRole("link", { name: "Email for partnership" }).getAttribute("href")).toMatch(/^mailto:gamyaa\.aerosystems@gmail\.com,vibbhav@apex-propulsion\.com\?subject=/);
    expect(within(section).queryByRole("link", { name: "Call" })).toBeNull();
    const apex = section.querySelector('[data-contact="apex"]') as HTMLElement;
    expect(within(apex).getByRole("link", { name: "vibbhav@apex-propulsion.com" }).getAttribute("href")).toBe("mailto:vibbhav@apex-propulsion.com,gamyaa.aerosystems@gmail.com");
    expect(container.querySelector("#about")?.textContent).toMatch(/For Partnership\s*Gamyaa AeroSystems · Purushothama Padmanabha/);
    expect(section.textContent).not.toMatch(/propos/i);
    // The collaboration statement closes the page, with both organisations' links.
    const statement = container.querySelector("#collaboration") as HTMLElement;
    expect(statement.textContent).toMatch(/APEX Rocket Systems × Gamyaa AeroSystems/);
    expect(statement.textContent).toMatch(/Gamyaa AeroSystems contributes complementary digital-engineering and quality capabilities/);
    expect(within(statement).getByRole("link", { name: /www\.apexrocketsystems\.com/ })).toHaveAttribute("href", "https://www.apexrocketsystems.com/");
    expect(within(statement).getByRole("link", { name: /www\.gamyaa\.in/ })).toHaveAttribute("href", "https://www.gamyaa.in/");
  });
});

describe("collaboration composer", () => {
  it("sanitises what a visitor types and composes a mailto addressed to APEX", () => {
    expect(sanitise("  Ada\u0000 Lovelace \n", 80)).toBe("Ada Lovelace");
    expect(sanitise("x".repeat(200), 80)).toHaveLength(80);
    expect(sanitise("line one\nline two\t ", 200, true)).toBe("line one\nline two");
    const href = composeMailto({ category: "testing", name: "Ada", organisation: "Lab & Co", role: "", message: "Hello?\nThanks" });
    expect(href.startsWith("mailto:vibbhav@apex-propulsion.com,gamyaa.aerosystems@gmail.com?subject=")).toBe(true);
    const url = new URL(href);
    expect(url.searchParams.get("cc")).toBeNull();
    expect(url.searchParams.get("subject")).toBe("APEX collaboration — Testing — Lab & Co");
    expect(url.searchParams.get("body")).toBe("Area: Testing\nName: Ada\nOrganisation: Lab & Co\n\nHello?\nThanks");
  });
});
