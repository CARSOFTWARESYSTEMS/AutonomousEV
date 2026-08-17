import { describe, expect, it } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModelRocketryPage, { metadata } from "./page";
import { SEO_TITLE, SEO_CANONICAL } from "./seo";

describe("Model Rocketry learning guide page", () => {
  it("renders exactly one H1 with the guide headline", () => {
    render(<ModelRocketryPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(/Model Rocketry/);
  });

  it("has the specified metadata title, description and canonical URL", () => {
    expect(metadata.title).toBe(SEO_TITLE);
    expect(metadata.alternates?.canonical).toBe(SEO_CANONICAL);
    expect(typeof metadata.description).toBe("string");
  });

  it("is indexable", () => {
    const robots = metadata.robots as {
      index: boolean;
      follow: boolean;
      googleBot: { index: boolean; follow: boolean };
    };
    expect(robots.index).toBe(true);
    expect(robots.follow).toBe(true);
    expect(robots.googleBot.index).toBe(true);
  });

  it("lists the seven learning outcomes", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("outcomes") as HTMLElement;
    expect(section).not.toBeNull();
    expect(
      within(section).getByText(/Identify the main parts of a model rocket/)
    ).toBeInTheDocument();
  });

  it("renders the mission-sequence and flight-phase step flows with real text content", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("mission-flow") as HTMLElement;
    expect(within(section).getByText("Mission definition")).toBeInTheDocument();
    expect(within(section).getByText("Apogee")).toBeInTheDocument();
    expect(within(section).getByText("Safing")).toBeInTheDocument();
  });

  it("renders the labelled rocket anatomy diagram with an accessible name and a visible caption", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("anatomy") as HTMLElement;
    const svg = within(section).getByRole("img", { name: /Labelled side view of a model rocket/ });
    expect(svg).toBeInTheDocument();
    expect(within(section).getByText(/Top to bottom: nose cone/)).toBeInTheDocument();
  });

  it("switches the visible day panel when a different day tab is clicked", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryPage />);
    const section = document.getElementById("learning-path") as HTMLElement;
    expect(within(section).getByText(/Mission briefing/)).toBeInTheDocument();

    const day1Tab = within(section).getByRole("tab", { name: "Day 1" });
    expect(day1Tab).toHaveAttribute("aria-selected", "false");
    await user.click(day1Tab);
    expect(day1Tab).toHaveAttribute("aria-selected", "true");
    expect(within(section).getByText(/Flight foundations/)).toBeInTheDocument();
  });

  it("keeps every day panel (including the Day 5 self-check quiz) server-rendered, revealing only the active one", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryPage />);
    const section = document.getElementById("learning-path") as HTMLElement;

    // All seven day panels — and the quiz nested in Day 5's — are present in the
    // DOM from first render (so crawlers/no-JS clients see the full content),
    // just not visible until their tab is active.
    expect(within(section).getByText(/self-check quiz/)).toBeInTheDocument();
    expect(within(section).getByText(/self-check quiz/)).not.toBeVisible();

    await user.click(within(section).getByRole("tab", { name: "Day 5" }));
    expect(within(section).getByText(/self-check quiz/)).toBeVisible();
    expect(
      within(section).getByText(/Name the four main forces acting on a model rocket in flight\./)
    ).toBeVisible();
  });

  it("keeps quiz answers inside native, keyboard-operable details/summary disclosures", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("learning-path") as HTMLElement;
    fireEvent.click(within(section).getByRole("tab", { name: "Day 5" }));

    const summary = within(section).getByText(/Name the four main forces acting on a model rocket in flight\./);
    const details = summary.closest("details") as HTMLDetailsElement;
    expect(details).not.toBeNull();
    expect(details.open).toBe(false);

    fireEvent.click(summary);
    expect(details.open).toBe(true);
    expect(within(details).getByText(/Thrust, weight, drag/)).toBeInTheDocument();
  });

  it("tutorial modules are collapsed by default and expand on click, revealing safety-gate content for the motor module", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryPage />);
    const section = document.getElementById("modules") as HTMLElement;

    const button = within(section).getByRole("button", { name: /Validation of motors on a static stand/ });
    expect(button).toHaveAttribute("aria-expanded", "false");

    await user.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    const panel = document.getElementById("module-panel-l12") as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.hasAttribute("hidden")).toBe(false);
    expect(within(panel).getByText(/Safety gate/)).toBeInTheDocument();
    expect(
      within(panel).getByText(/motor testing is performed only with certified commercial motors/)
    ).toBeInTheDocument();
  });

  it("expand-all and collapse-all controls toggle every tutorial module", async () => {
    const user = userEvent.setup();
    render(<ModelRocketryPage />);
    const section = document.getElementById("modules") as HTMLElement;

    await user.click(within(section).getByRole("button", { name: "Expand all" }));
    const buttons = within(section)
      .getAllByRole("button")
      .filter((b) => b.hasAttribute("aria-expanded"));
    expect(buttons.length).toBeGreaterThan(15);
    buttons.forEach((b) => expect(b).toHaveAttribute("aria-expanded", "true"));

    await user.click(within(section).getByRole("button", { name: "Collapse all" }));
    buttons.forEach((b) => expect(b).toHaveAttribute("aria-expanded", "false"));
  });

  it("shows the fifteen blank engineering workbook worksheets without any pre-filled example values", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("workbook") as HTMLElement;
    expect(within(section).getByText("Mission objective")).toBeInTheDocument();
    expect(within(section).getByText("Lessons learned / improvement actions")).toBeInTheDocument();
    expect(within(section).getByText("Hazard / failure mode")).toBeInTheDocument();
  });

  it("states the safety and quality gate prominently, including the range-authority control statement", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("safety") as HTMLElement;
    expect(
      within(section).getByText(/No team member may treat this page as authority to ignite or launch/)
    ).toBeInTheDocument();
    expect(
      within(section).getByText(/does not provide/)
    ).toBeInTheDocument();
  });

  it("never states a specific numeric flight or regulatory limit as fact", () => {
    render(<ModelRocketryPage />);
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/minimum rail[- ]exit (speed|velocity) of \d/i);
    expect(text).not.toMatch(/static margin (must be|of) \d/i);
    expect(text).not.toMatch(/\d+(\.\d+)?\s*(MHz|GHz)\b/);
  });

  it("renders the glossary with real definitions", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("glossary") as HTMLElement;
    expect(within(section).getByText("Apogee")).toBeInTheDocument();
    expect(within(section).getByText(/highest point of the flight trajectory/)).toBeInTheDocument();
  });

  it("links to the official workshop listing and the two source PDFs, marking the external link safely", () => {
    render(<ModelRocketryPage />);
    const section = document.getElementById("source") as HTMLElement;
    const officialLink = within(section).getByRole("link", { name: /IN-SPACe Workshop Listing/ });
    expect(officialLink).toHaveAttribute("href", expect.stringContaining("inspace.gov.in"));
    expect(officialLink).toHaveAttribute("target", "_blank");
    expect(officialLink).toHaveAttribute("rel", "noopener noreferrer");

    expect(within(section).getByRole("link", { name: /Workshop Brochure/ })).toHaveAttribute(
      "href",
      "/workbook/inspace-model-rocketry-workshop-brochure.pdf"
    );
    expect(within(section).getByRole("link", { name: /7-Day Learning Workbook/ })).toHaveAttribute(
      "href",
      "/workbook/model-rocketry-7-day-learning-workbook-2026.pdf"
    );
  });

  it("shows an editorial freshness line naming the EV Society technical team and a real review date", () => {
    render(<ModelRocketryPage />);
    expect(
      screen.getByText(/Prepared by the EV Society \/ EV\.ENGINEER technical team\. Last reviewed: .+\./)
    ).toBeInTheDocument();
  });

  it("injects a valid JSON-LD graph without dangerouslySetInnerHTML, safely escaped", () => {
    const { container } = render(<ModelRocketryPage />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script?.textContent ?? "");
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(Array.isArray(parsed["@graph"])).toBe(true);
    expect(parsed["@graph"].length).toBeGreaterThan(0);
    expect(script?.textContent).not.toMatch(/</);
  });

  it("contains no href=\"#\" placeholder links", () => {
    const { container } = render(<ModelRocketryPage />);
    expect(container.querySelectorAll('a[href="#"]').length).toBe(0);
  });

  it("every same-page nav anchor resolves to a real section id on the page", () => {
    const { container } = render(<ModelRocketryPage />);
    const anchorHrefs = Array.from(container.querySelectorAll('a[href^="#"]')).map(
      (a) => a.getAttribute("href") as string
    );
    expect(anchorHrefs.length).toBeGreaterThan(0);
    anchorHrefs.forEach((href) => {
      const id = href.slice(1);
      expect(container.querySelector(`#${CSS.escape(id)}`)).not.toBeNull();
    });
  });

  it("states independence from IN-SPACe / ISRO / Department of Space", () => {
    render(<ModelRocketryPage />);
    expect(
      screen.getByText(/Independent educational companion\./)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/is not an official IN-SPACe, ISRO or Department of Space publication/)
    ).toBeInTheDocument();
  });

  it("offers a print/save-as-PDF control for the workbook", () => {
    render(<ModelRocketryPage />);
    expect(
      screen.getByRole("button", { name: /Print or save this page as a PDF/ })
    ).toBeInTheDocument();
  });
});
