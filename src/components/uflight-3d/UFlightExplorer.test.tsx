import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { DESKTOP_QUERY } from "../satellite-explorer/lib/capabilities";
import MobileUFlight from "./MobileUFlight";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

// The desktop application must never be loaded in these tests: importing it
// would pull in three.js. The mock stands in for the dynamic chunk.
const desktopLoaded = vi.fn();
vi.mock("./DesktopUFlight", () => {
  desktopLoaded();
  return { default: () => <div data-testid="desktop-uflight" /> };
});

const realMatchMedia = window.matchMedia;

function setViewport(desktop: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: query === DESKTOP_QUERY ? desktop : false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

beforeEach(() => {
  trackEvent.mockClear();
  desktopLoaded.mockClear();
  vi.resetModules();
});

afterEach(() => {
  window.matchMedia = realMatchMedia;
  vi.restoreAllMocks();
});

async function renderExplorer() {
  const { default: UFlightExplorer } = await import("./UFlightExplorer");
  return render(<UFlightExplorer />);
}

describe("UFlight 3D on a phone (390 px)", () => {
  beforeEach(() => setViewport(false));

  it("shows the overview with the desktop recommendation, and mounts no 3D application", async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    const { container } = await renderExplorer();

    expect(screen.getByText("DESKTOP EXPERIENCE RECOMMENDED")).toBeInTheDocument();
    expect(
      screen.getByText(
        "For the complete interactive experience — including the 3D aircraft, X-ray systems, HUMS architecture, fault injection, digital twin, mission simulation and health analytics — open UFlight™ 3D on a laptop or desktop computer.",
      ),
    ).toBeInTheDocument();

    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.queryByTestId("desktop-uflight")).toBeNull();
    expect(screen.queryByTestId("uflight-loading")).toBeNull();
    // The heavy chunk is not requested, and WebGL is never probed on a phone.
    expect(desktopLoaded).not.toHaveBeenCalled();
    expect(getContext).not.toHaveBeenCalled();
  });

  it("records that the recommendation was shown", async () => {
    await renderExplorer();
    expect(trackEvent).toHaveBeenCalledWith("uflight_3d_mobile_desktop_recommendation", expect.any(Object));
  });

  it("does not present the recommendation as an error or show disabled desktop controls", async () => {
    const { container } = await renderExplorer();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.textContent).not.toMatch(/unsupported|not supported|error|unavailable on this/i);
    expect(container.querySelectorAll("button:disabled, [aria-disabled='true']")).toHaveLength(0);
    for (const label of ["AIRCRAFT", "SYSTEMS", "MISSION", "FAULT LAB", "TWIN"]) expect(screen.queryByRole("button", { name: label })).toBeNull();
  });
});

describe("UFlight 3D on a desktop viewport", () => {
  beforeEach(() => setViewport(true));

  it("mounts the desktop application when WebGL is available", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => ({ getExtension: () => null, getParameter: () => "" }) as unknown as RenderingContext);
    await renderExplorer();
    expect(await screen.findByTestId("desktop-uflight")).toBeInTheDocument();
    expect(screen.queryByText("DESKTOP EXPERIENCE RECOMMENDED")).toBeNull();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("falls back to a static render and the health-system overview when WebGL is unavailable, without error styling", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null);
    const { container } = await renderExplorer();
    expect(screen.queryByTestId("desktop-uflight")).toBeNull();
    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.getByRole("img", { name: /UFlight™ Reference eVTOL/ })).toBeInTheDocument();
    expect(screen.getByText("HEALTH-SYSTEM OVERVIEW")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "What the aircraft monitors" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(screen.queryByText("DESKTOP EXPERIENCE RECOMMENDED")).toBeNull();
    expect(container.textContent).not.toMatch(/\berror\b|not supported|failed/i);
  });
});

describe("server rendering", () => {
  it("renders without touching browser APIs and ships both experiences, gated by CSS", async () => {
    const { default: UFlightExplorer } = await import("./UFlightExplorer");
    const html = renderToString(<UFlightExplorer />);
    // The overview (and so the H1 and the health content) is in the HTML…
    expect(html).toContain("DESKTOP EXPERIENCE RECOMMENDED");
    expect(html).toContain("What the aircraft monitors");
    expect(html.match(/<h1/g)).toHaveLength(1);
    // …alongside the desktop loading scene, and nothing from the 3D application.
    expect(html).toContain("INITIALIZING DIGITAL AIRCRAFT");
    expect(html).not.toContain("<canvas");
    expect(desktopLoaded).not.toHaveBeenCalled();
  });
});

describe("overview page", () => {
  it("has the title, the headline and the six system cards with the brief's copy", () => {
    render(<MobileUFlight />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("UFlight™ 3D");
    // The headline is set on two lines.
    expect(screen.getByText((_, element) => element?.tagName === "P" && element.textContent === "Advanced Health Monitoring Systems forNext-Generation Air Mobility")).toBeInTheDocument();

    const cards = within(screen.getByRole("heading", { level: 2, name: "What the aircraft monitors" }).closest("section") as HTMLElement).getAllByRole("listitem");
    expect(cards.map((c) => within(c).getByRole("heading", { level: 3 }).textContent)).toEqual(["PROPULSION", "ENERGY", "AVIONICS", "FLIGHT CONTROL", "STRUCTURE", "HUMS"]);
    expect(within(cards[0]).getByText("Monitor motor, inverter, rotor and bearing health.")).toBeInTheDocument();
    expect(within(cards[1]).getByText("Monitor battery state, thermal condition and power capability.")).toBeInTheDocument();
    expect(within(cards[2]).getByText("Track flight computers, networks and electronic-system health.")).toBeInTheDocument();
    expect(within(cards[3]).getByText("Monitor sensors, actuators and control availability.")).toBeInTheDocument();
    expect(within(cards[4]).getByText("Monitor vibration, strain and fatigue exposure.")).toBeInTheDocument();
    expect(within(cards[5]).getByText("Detect anomalies, diagnose degradation and support predictive maintenance.")).toBeInTheDocument();
  });

  it("shows the flow from aircraft to maintenance", () => {
    render(<MobileUFlight />);
    const flow = screen.getByRole("list", { name: /Health monitoring flow/ });
    expect(within(flow).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["AIRCRAFT", "SENSORS", "HEALTH MONITORING", "DIAGNOSIS", "PROGNOSIS", "MAINTENANCE"]);
  });

  it("uses a rendered still of the aircraft with alternative text, not a 3D view", () => {
    const { container } = render(<MobileUFlight />);
    const poster = screen.getByRole("img", { name: /UFlight™ Reference eVTOL/ });
    expect(poster.getAttribute("src")).toContain("uflight-3d%2Fposter.jpg");
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("links back to Aerospace and states what the aircraft is", () => {
    render(<MobileUFlight />);
    screen.getAllByRole("link", { name: /Aerospace/ }).forEach((link) => expect(link).toHaveAttribute("href", "/aerospace"));
    expect(screen.getByText(/UFlight™ Reference eVTOL is a digital engineering demonstrator/)).toBeInTheDocument();
  });

  it("never skips a heading level", () => {
    const { container } = render(<MobileUFlight />);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map((h) => Number(h.tagName[1]));
    levels.reduce((previous, level) => {
      expect(level).toBeLessThanOrEqual(previous + 1);
      return level;
    }, 1);
  });

  it("ends with who prepared it, the attribution and the review date", () => {
    render(<MobileUFlight />);
    const prepared = screen.getByRole("region", { name: "Designed by" });
    expect(within(prepared).getByText("Designed by")).toBeInTheDocument();
    expect(within(prepared).getByRole("heading", { level: 3, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(prepared).getByText("EV.ENGINEER™")).toBeInTheDocument();
    expect(within(prepared).getByRole("img", { name: "Portrait of Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(prepared).getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(within(prepared).getByText("UFlight™ 3D is an EV.ENGINEER™ digital engineering demonstrator.")).toBeInTheDocument();
    expect(within(prepared).getByText("Commercial arrangements, where applicable, are handled by iTelematics Software Private Limited.")).toBeInTheDocument();
    expect(within(prepared).getByText(/Experience information last reviewed:/)).toHaveTextContent("Experience information last reviewed: 1 October 2026.");
    expect(prepared.querySelector("time")).toHaveAttribute("datetime", "2026-10-01");
    expect(prepared.textContent).not.toMatch(/certif|approved|flight[- ]qualified|operational deployment|production aircraft/i);
  });

  it("follows Designed by with the acknowledgement of the early design work that inspired it", () => {
    render(<MobileUFlight />);
    const prepared = screen.getByRole("region", { name: "Designed by" });
    const credit = screen.getByRole("region", { name: "Inspiration & Acknowledgement" });
    expect(prepared.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("main")).toContainElement(credit);
    // The same single paragraph as on every other page: no name line, no line of this page's own.
    expect(Array.from(credit.querySelectorAll("p"), (p) => p.textContent)).toEqual(["Special thanks to Bhavya for inspiring our early approach to interactive engineering visualisation and Digital Twin experiences across Satellite Engineering, Model Rocketry and Aerospace."]);
    expect(within(credit).getByRole("link", { name: /^View Original Work/ })).toHaveAttribute("href", "https://bhavyacyber.github.io/");
    // Designed by is unchanged: the acknowledgement sits beside it, not inside it.
    expect(prepared).not.toContainElement(credit);
  });
});
