import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EverydayApplicationsContent from "./EverydayApplicationsContent";

vi.mock("next/navigation", () => ({
  usePathname: () => "/space/everyday-applications",
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

describe("Everyday Applications learning page", () => {
  afterEach(() => {
    mockMatchMedia(false);
  });

  it("renders exactly one H1 with the page headline", () => {
    render(<EverydayApplicationsContent />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
  });

  it("every same-page nav anchor resolves to a real section id on the page", () => {
    const { container } = render(<EverydayApplicationsContent />);
    const anchorHrefs = Array.from(container.querySelectorAll('a[href^="#"]')).map((a) => a.getAttribute("href") as string);
    expect(anchorHrefs.length).toBeGreaterThan(0);
    anchorHrefs.forEach((href) => {
      const id = href.slice(1);
      expect(container.querySelector(`#${CSS.escape(id)}`)).not.toBeNull();
    });
  });

  it('contains no href="#" placeholder links', () => {
    const { container } = render(<EverydayApplicationsContent />);
    expect(container.querySelectorAll('a[href="#"]').length).toBe(0);
  });

  it("defaults to Simple view and reveals Engineering-only content when switched", async () => {
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);
    expect(screen.getByRole("tab", { name: "Simple" })).toHaveAttribute("aria-selected", "true");

    const applications = document.getElementById("applications") as HTMLElement;
    expect(within(applications).queryByText("Engineering view")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Engineering View" }));
    expect(within(applications).getAllByText("Engineering view").length).toBeGreaterThan(0);
  });

  it("reveals Business-only content when Business View is selected", async () => {
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);
    const applications = document.getElementById("applications") as HTMLElement;
    expect(within(applications).queryByText("Business view")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Business View" }));
    expect(within(applications).getAllByText("Business view").length).toBeGreaterThan(0);
    expect(within(applications).getAllByText(/Validation needed/).length).toBeGreaterThan(0);
  });

  it("desktop: selecting a persona highlights the tab as selected", async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);
    const farmerTab = screen.getByRole("tab", { name: "Farmer" });
    expect(farmerTab).toHaveAttribute("aria-selected", "false");
    await user.click(farmerTab);
    expect(farmerTab).toHaveAttribute("aria-selected", "true");
  });

  it("mobile: persona selector is a compact trigger that opens a sheet of options", async () => {
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);
    expect(screen.queryByRole("tab", { name: "Farmer" })).not.toBeInTheDocument();

    const trigger = screen.getByRole("button", { name: /Everyone/ });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Who are you?" });
    await user.click(within(dialog).getByRole("button", { name: "Farmer" }));
    expect(screen.queryByRole("dialog", { name: "Who are you?" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Farmer" })).toBeInTheDocument();
  });

  it("filters applications by category using friendlier category labels", async () => {
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);
    const applications = document.getElementById("applications") as HTMLElement;
    expect(within(applications).getByText("Weather & Extreme Weather")).toBeInTheDocument();
    expect(within(applications).queryByRole("button", { name: "Agriculture" })).not.toBeInTheDocument();
    expect(within(applications).queryByRole("button", { name: "Business" })).not.toBeInTheDocument();

    await user.click(within(applications).getByRole("button", { name: "Food & Water" }));
    expect(within(applications).queryByText("Weather & Extreme Weather")).not.toBeInTheDocument();
    expect(within(applications).getByText(/Is my crop stressed or diseased/)).toBeInTheDocument();
  });

  it("caps the question wall and applications to a mobile preview with a working expand control", async () => {
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);

    const questionsSection = document.getElementById("questions") as HTMLElement;
    const questionsExpand = within(questionsSection).getByRole("button", { name: /Show all questions/ });
    await user.click(questionsExpand);
    expect(within(questionsSection).queryByRole("button", { name: /Show all questions/ })).not.toBeInTheDocument();

    const applicationsSection = document.getElementById("applications") as HTMLElement;
    const appsExpand = within(applicationsSection).getByRole("button", { name: /Explore all applications/ });
    await user.click(appsExpand);
    expect(within(applicationsSection).queryByRole("button", { name: /Explore all applications/ })).not.toBeInTheDocument();
  });

  it("shows a six-ish-chapter mobile navigation control that opens a chapter sheet", async () => {
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);

    const navButton = screen.getByRole("button", { name: /01 \/ 04.*Understand/ });
    await user.click(navButton);
    const dialog = screen.getByRole("dialog", { name: /Jump to a chapter/ });
    expect(within(dialog).getByText("Explore Applications")).toBeInTheDocument();

    await user.click(within(dialog).getByRole("link", { name: "A Day in the Life" }));
    expect(screen.queryByRole("dialog", { name: /Jump to a chapter/ })).not.toBeInTheDocument();
  });

  it("desktop: the central system diagram advances between stages", () => {
    mockMatchMedia(true);
    render(<EverydayApplicationsContent />);
    const section = document.getElementById("system-diagram") as HTMLElement;
    fireEvent.click(within(section).getByRole("tab", { name: "Satellite" }));
    expect(within(section).getByRole("tab", { name: "Satellite" })).toHaveAttribute("aria-selected", "true");
  });

  it("mobile: the central system diagram and day-in-life render as an exclusive vertical accordion", () => {
    render(<EverydayApplicationsContent />);
    const diagramSection = document.getElementById("system-diagram") as HTMLElement;
    expect(within(diagramSection).queryByRole("tab")).not.toBeInTheDocument();
    const diagramDetails = diagramSection.querySelectorAll("details[name='system-diagram']");
    expect(diagramDetails.length).toBeGreaterThan(1);

    const daySection = document.getElementById("day-in-life") as HTMLElement;
    const dayDetails = daySection.querySelectorAll("details[name='day-in-life']");
    expect(dayDetails.length).toBeGreaterThan(1);
  });

  it("India's Space Systems entries render as a grouped, exclusive accordion", () => {
    render(<EverydayApplicationsContent />);
    const section = document.getElementById("space-systems") as HTMLElement;
    expect(within(section).getByText("Navigation")).toBeInTheDocument();
    expect(within(section).getByText("Public Platforms & Institutions")).toBeInTheDocument();
    const details = section.querySelectorAll("details[name='space-systems']");
    expect(details.length).toBeGreaterThan(5);
  });

  it("Satellite-to-Phone shows extra detail only in the matching view", async () => {
    const user = userEvent.setup();
    render(<EverydayApplicationsContent />);
    const section = document.getElementById("satellite-to-phone") as HTMLElement;
    expect(within(section).queryByText(/large dish antennas/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Engineering View" }));
    expect(within(section).getByText(/large dish antennas/)).toBeInTheDocument();
  });

  it("shows the India's Space Systems disclaimer, verified dates and an official source link", () => {
    render(<EverydayApplicationsContent />);
    const section = document.getElementById("space-systems") as HTMLElement;
    expect(within(section).getByText(/does not claim affiliation, endorsement or partnership/)).toBeInTheDocument();
    expect(within(section).getAllByText(/Verified on:/).length).toBeGreaterThan(0);
    const isroLinks = within(section).getAllByRole("link", { name: /ISRO/ });
    expect(isroLinks.length).toBeGreaterThan(0);
    expect(isroLinks[0]).toHaveAttribute("href", expect.stringContaining("isro.gov.in"));
  });

  it("injects a valid JSON-LD graph without dangerouslySetInnerHTML, safely escaped", () => {
    const { container } = render(<EverydayApplicationsContent />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(Array.isArray(parsed["@graph"])).toBe(true);
    expect(script?.textContent).not.toMatch(/</);
  });

  it("shows a researcher attribution card linking to the canonical profile", () => {
    render(<EverydayApplicationsContent />);
    const link = screen.getByRole("link", { name: /View full profile/ });
    expect(link).toHaveAttribute("href", "/about/sudarshana-karkala");
  });

  it("does not fabricate ISRO/IN-SPACe affiliation or make revenue promises", () => {
    render(<EverydayApplicationsContent />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/guarantee(d)? revenue/i);
    expect(text).toMatch(/does not claim affiliation, endorsement or partnership/i);
  });
});
