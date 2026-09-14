import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModelRocketryContent from "./ModelRocketryContent";

vi.mock("next/navigation", () => ({
  usePathname: () => "/space/model-rocketry",
}));

vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe("Model Rocketry learning page", () => {
  afterEach(() => {
    mockMatchMedia(false);
  });


  it("renders exactly one H1 with the page headline", () => {
    render(<ModelRocketryContent />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("Model Rocketry");
  });

  it("every same-page nav anchor resolves to a real section id on the page", () => {
    const { container } = render(<ModelRocketryContent />);
    const anchorHrefs = Array.from(container.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute("href") as string);
    expect(anchorHrefs.length).toBeGreaterThan(0);
    anchorHrefs.forEach((href) => {
      const id = href.slice(1);
      expect(container.querySelector(`#${CSS.escape(id)}`)).not.toBeNull();
    });
  });

  it("contains no href=\"#\" placeholder links", () => {
    const { container } = render(<ModelRocketryContent />);
    expect(container.querySelectorAll('a[href="#"]').length).toBe(0);
  });

  it("defaults to Beginner and reveals Advanced-only content when the level is switched", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryContent />);
    expect(screen.getByRole("tab", { name: "Beginner" })).toHaveAttribute("aria-selected", "true");

    // FMEA severity/occurrence/detectability columns are Intermediate+ only.
    expect(screen.queryByText("Detectability")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Advanced" }));
    expect(screen.getByRole("tab", { name: "Advanced" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByText("Detectability").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Risk priority/i).length).toBeGreaterThan(0);
  });

  it("selecting a rocket component in the explorer reveals its detail panel on desktop", async () => {
    mockMatchMedia(true); // desktop breakpoint
    const user = userEvent.setup();
    render(<ModelRocketryContent />);
    const explorer = document.getElementById("explorer") as HTMLElement;
    const target = within(explorer).getByRole("button", { name: "Nose cone" });
    await user.click(target);
    expect(target).toHaveAttribute("aria-pressed", "true");
    expect(within(explorer).getByText(/reduce aerodynamic drag/)).toBeInTheDocument();
  });

  it("is keyboard-operable: Enter on a component activates it", () => {
    mockMatchMedia(true);
    render(<ModelRocketryContent />);
    const explorer = document.getElementById("explorer") as HTMLElement;
    const target = within(explorer).getByRole("button", { name: "Fins" });
    fireEvent.keyDown(target, { key: "Enter" });
    expect(target).toHaveAttribute("aria-pressed", "true");
  });

  it("opens a mobile bottom sheet dialog when selecting a component on mobile viewports", async () => {
    mockMatchMedia(false); // below desktop breakpoint
    const user = userEvent.setup();
    render(<ModelRocketryContent />);
    const explorer = document.getElementById("explorer") as HTMLElement;
    const target = within(explorer).getByRole("button", { name: "Motor mount" });
    await user.click(target);
    const dialog = screen.getByRole("dialog", { name: "Motor mount" });
    expect(dialog).toBeInTheDocument();
  });

  it("updates the stability readout live region as the CG slider moves", () => {
    mockMatchMedia(false);
    render(<ModelRocketryContent />);
    const section = document.getElementById("flight-physics") as HTMLElement;
    const cgSlider = within(section).getByLabelText(/Centre of gravity position/);
    fireEvent.change(cgSlider, { target: { value: "400" } });
    expect(within(section).getByText(/Unstable configuration/)).toBeInTheDocument();
  });

  it("renders the reduced-motion fallback as a static, non-animated phase list", () => {
    mockMatchMedia(true); // (prefers-reduced-motion: reduce) matches
    render(<ModelRocketryContent />);
    expect(screen.queryByText("Start the mission sequence")).not.toBeInTheDocument();
    expect(screen.getByText("Ignition")).toBeInTheDocument();
    expect(screen.getAllByText("Apogee").length).toBeGreaterThan(0);
  });

  it("injects a valid JSON-LD graph without dangerouslySetInnerHTML, safely escaped", () => {
    const { container } = render(<ModelRocketryContent />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(Array.isArray(parsed["@graph"])).toBe(true);
    expect(script?.textContent).not.toMatch(/</);
  });

  it("cross-links to the existing 7-day workshop learning guide instead of duplicating it", () => {
    render(<ModelRocketryContent />);
    const link = screen.getByRole("link", { name: /Open the 7-Day Learning Guide/ });
    expect(link).toHaveAttribute("href", "/space/2026-INSPACe-ROCKETRY-059");
  });

  it("shows a researcher attribution card linking to the canonical profile", () => {
    render(<ModelRocketryContent />);
    const link = screen.getByRole("link", { name: /View full profile/ });
    expect(link).toHaveAttribute("href", "/about/sudarshana-karkala");
  });

  it("does not provide propulsion manufacturing instructions", () => {
    render(<ModelRocketryContent />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/propellant formulation/i);
    expect(text).toMatch(/does not cover, and will not cover, motor or propellant manufacture/i);
  });

  it("enters Presentation Mode, navigates with the keyboard, and exits back to the webpage on Escape", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryContent />);

    await user.click(screen.getByRole("button", { name: /Start Workshop/ }));
    expect(screen.getByText("01 / 16")).toBeInTheDocument();
    expect(document.getElementById("main-content")).not.toBeVisible();

    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByText("02 / 16")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(screen.getByText("01 / 16")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByText("01 / 16")).not.toBeInTheDocument();
    expect(document.getElementById("main-content")).toBeVisible();
  });

  it("Presentation Mode speaker notes are hidden by default and toggle on", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryContent />);
    await user.click(screen.getByRole("button", { name: /Start Workshop/ }));

    expect(screen.queryByText(/Speaker notes:/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Show speaker notes/ }));
    expect(screen.getByText(/Speaker notes:/)).toBeInTheDocument();
  });

  it("shows the IN-SPACe/competition disclaimer and a verification date in the Competitions section", () => {
    render(<ModelRocketryContent />);
    const section = document.getElementById("competitions") as HTMLElement;
    expect(within(section).getByText(/does not claim affiliation, endorsement or partnership/)).toBeInTheDocument();
    expect(within(section).getAllByText(/Verified on:/).length).toBeGreaterThan(0);
    const inspaceLinks = within(section).getAllByRole("link", { name: /IN-SPACe official listing/ });
    expect(inspaceLinks.length).toBeGreaterThan(0);
    expect(inspaceLinks[0]).toHaveAttribute("href", expect.stringContaining("inspace.gov.in"));
  });

  it("switches cost-anatomy tier content when a different tier tab is selected", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryContent />);
    const section = document.getElementById("cost") as HTMLElement;
    expect(within(section).getByText(/Tier 1 — Fundamentals/)).toBeInTheDocument();

    await user.click(within(section).getByRole("tab", { name: "Tier 3" }));
    expect(within(section).getByText(/Tier 3 — Student Competition System/)).toBeInTheDocument();
  });

  it("reveals opportunity-category detail in the Enterprise map when a category is selected", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryContent />);
    const section = document.getElementById("enterprise") as HTMLElement;
    expect(within(section).getByText(/Learn/)).toBeInTheDocument();

    await user.click(within(section).getByRole("button", { name: "Avionics" }));
    expect(within(section).getByText(/Hobbyist and student teams need affordable, reliable flight computers/)).toBeInTheDocument();
  });
});
