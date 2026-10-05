import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { DESKTOP_QUERY } from "./lib/capabilities";
import MobileExplorer from "./MobileExplorer";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/satellite-engineering/interactive-3d" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

// The desktop application must never be loaded in these tests: importing it
// would pull in three.js. The mock stands in for the dynamic chunk.
const desktopLoaded = vi.fn();
vi.mock("./DesktopExplorer", () => {
  desktopLoaded();
  return { default: () => <div data-testid="desktop-explorer" /> };
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
  const { default: SatelliteExplorer } = await import("./SatelliteExplorer");
  return render(<SatelliteExplorer />);
}

describe("SatelliteExplorer on a phone (390 px)", () => {
  beforeEach(() => setViewport(false));

  it("shows the compact page with the desktop recommendation, and mounts no WebGL scene", async () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, "getContext");
    const { container } = await renderExplorer();

    expect(screen.getByText("DESKTOP EXPERIENCE RECOMMENDED")).toBeInTheDocument();
    expect(screen.getByText("Interactive 3D experience is designed for Laptop/Desktop")).toBeInTheDocument();
    expect(
      screen.getByText(
        "For the complete interactive 3D experience — including satellite assembly, exploded views, subsystem animations, power flow, signal flow and mission simulation — open this page on a laptop or desktop computer.",
      ),
    ).toBeInTheDocument();

    expect(container.querySelector("canvas")).toBeNull();
    expect(screen.queryByTestId("desktop-explorer")).toBeNull();
    expect(screen.queryByTestId("explorer-loading")).toBeNull();
    // The heavy chunk is not requested, and WebGL is never probed on a phone.
    expect(desktopLoaded).not.toHaveBeenCalled();
    expect(getContext).not.toHaveBeenCalled();
  });

  it("records that the recommendation was shown", async () => {
    await renderExplorer();
    expect(trackEvent).toHaveBeenCalledWith("desktop_recommendation_mobile", expect.any(Object));
  });

  it("does not present the recommendation as an error or show disabled desktop controls", async () => {
    const { container } = await renderExplorer();
    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.textContent).not.toMatch(/unsupported|not supported|error/i);
    expect(container.querySelectorAll("button:disabled, [aria-disabled='true']")).toHaveLength(0);
    for (const label of ["BUILD", "EXPLORE", "MISSION", "ORBIT", "SIGNALS"]) {
      expect(screen.queryByRole("button", { name: label })).toBeNull();
    }
  });
});

describe("SatelliteExplorer on a desktop viewport", () => {
  beforeEach(() => setViewport(true));

  it("mounts the desktop application when WebGL is available", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => ({ getExtension: () => null, getParameter: () => "" }) as unknown as RenderingContext,
    );
    await renderExplorer();
    expect(await screen.findByTestId("desktop-explorer")).toBeInTheDocument();
    expect(screen.queryByText("DESKTOP EXPERIENCE RECOMMENDED")).toBeNull();
    expect(trackEvent).not.toHaveBeenCalled();
  });

  it("falls back to the static overview, with the brief's message, when WebGL is unavailable", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => null);
    const { container } = await renderExplorer();
    expect(screen.getByText("Interactive 3D rendering is unavailable on this browser or device.")).toBeInTheDocument();
    expect(screen.queryByTestId("desktop-explorer")).toBeNull();
    expect(container.querySelector("canvas")).toBeNull();
    // Basic subsystem learning is still offered.
    expect(screen.getByRole("heading", { level: 2, name: "How a satellite works" })).toBeInTheDocument();
    expect(screen.queryByText("DESKTOP EXPERIENCE RECOMMENDED")).toBeNull();
  });
});

describe("server rendering", () => {
  it("renders without touching browser APIs and ships both experiences, gated by CSS", async () => {
    const { default: SatelliteExplorer } = await import("./SatelliteExplorer");
    const html = renderToString(<SatelliteExplorer />);
    // The compact page (and so the H1 and the learning content) is in the HTML…
    expect(html).toContain("DESKTOP EXPERIENCE RECOMMENDED");
    expect(html).toContain("How a satellite works");
    expect(html.match(/<h1/g)).toHaveLength(1);
    // …alongside the desktop loading scene, and nothing from the 3D application.
    expect(html).toContain("Preparing spacecraft…");
    expect(html).not.toContain("<canvas");
    expect(desktopLoaded).not.toHaveBeenCalled();
  });
});

describe("compact overview page", () => {
  it("has the title, subtitle and the six subsystem cards", () => {
    render(<MobileExplorer />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("SATELLITE EXPLORER 3D");
    expect(screen.getByText("Build · Explore · Operate a Satellite")).toBeInTheDocument();

    const cards = within(screen.getByRole("heading", { level: 2, name: "How a satellite works" }).closest("section") as HTMLElement).getAllByRole("listitem");
    expect(cards).toHaveLength(6);
    expect(cards.map((c) => within(c).getByRole("heading", { level: 3 }).textContent)).toEqual(["POWER", "AVIONICS", "ADCS", "PAYLOAD", "COMMUNICATIONS", "THERMAL"]);
    expect(within(cards[0]).getByText("Sunlight → Electricity → Battery")).toBeInTheDocument();
    expect(within(cards[4]).getByText("Ground ↔ Satellite")).toBeInTheDocument();
  });

  it("shows the mission flow from ground to ground", () => {
    render(<MobileExplorer />);
    const flow = screen.getByRole("list", { name: /Mission flow/ });
    expect(within(flow).getAllByRole("listitem").map((li) => li.textContent)).toEqual(["GROUND", "UPLINK", "SATELLITE", "PAYLOAD", "DOWNLINK", "GROUND"]);
  });

  it("links to Satellite Engineering and CubeTwin", () => {
    render(<MobileExplorer />);
    expect(screen.getByRole("link", { name: "Satellite Engineering" })).toHaveAttribute("href", "/space/satellite-engineering");
    const cubeTwin = screen.getByRole("link", { name: "CubeTwin" });
    expect(cubeTwin).toHaveAttribute("href", "/space/cubesat");
    expect(cubeTwin).toHaveAttribute("data-track-event", "cubesat_crosslink");
  });

  it("uses a static poster with alternative text instead of a 3D view", () => {
    const { container } = render(<MobileExplorer />);
    expect(screen.getByRole("img", { name: /6U Earth-observation satellite/ })).toBeInTheDocument();
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("ends with who prepared it, the attribution and the review date", () => {
    render(<MobileExplorer />);
    const prepared = screen.getByRole("region", { name: "Prepared by" });
    expect(within(prepared).getByText("Prepared by")).toBeInTheDocument();
    expect(within(prepared).getByRole("heading", { level: 3, name: "Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(prepared).getByText("EV.ENGINEER™")).toBeInTheDocument();
    expect(within(prepared).getByRole("img", { name: "Portrait of Sudarshana Karkala" })).toBeInTheDocument();
    expect(within(prepared).getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(within(prepared).getByText("Satellite Explorer 3D is an EV.ENGINEER™ interactive engineering learning experience within the EV Society™ Space initiative.")).toBeInTheDocument();
    expect(within(prepared).getByText(/Experience information last reviewed:/)).toHaveTextContent("Experience information last reviewed: 1 October 2026.");
    expect(prepared.querySelector("time")).toHaveAttribute("datetime", "2026-10-01");
    // Nothing about the aircraft project, and no overstatement.
    expect(prepared.textContent).not.toMatch(/uflight|aircraft|evtol|certif|accredit|flight heritage|operational/i);
  });

  it("follows Prepared by with the acknowledgement of the early design work that inspired it", () => {
    render(<MobileExplorer />);
    const prepared = screen.getByRole("region", { name: "Prepared by" });
    const credit = screen.getByRole("region", { name: "Inspiration & Acknowledgement" });
    expect(prepared.compareDocumentPosition(credit) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByRole("main")).toContainElement(credit);
    expect(within(credit).getByText("Bhavya Naga Sai Parvathi Kshatri")).toBeInTheDocument();
    expect(within(credit).getByText("Her early interactive design work helped inspire our approach to visualising spacecraft systems and developing interactive Satellite Engineering and Digital Twin learning experiences.")).toBeInTheDocument();
    expect(within(credit).getByRole("link", { name: /^View Original Work/ })).toHaveAttribute("href", "https://bhavyacyber.github.io/");
    // Prepared by is unchanged: the acknowledgement sits beside it, not inside it.
    expect(prepared).not.toContainElement(credit);
  });

  it("never skips a heading level and states what the spacecraft is", () => {
    const { container } = render(<MobileExplorer />);
    const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4")).map((h) => Number(h.tagName[1]));
    levels.reduce((previous, level) => {
      expect(level).toBeLessThanOrEqual(previous + 1);
      return level;
    }, 1);
    expect(screen.getByText(/Educational reference spacecraft/)).toBeInTheDocument();
  });
});
