import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ResearcherCard from "./ResearcherCard";
import { SUDARSHANA_KARKALA } from "@/data/public-entities";

describe("ResearcherCard", () => {
  it("shows the researcher's name and links to the canonical profile", () => {
    render(<ResearcherCard />);
    expect(screen.getByText(SUDARSHANA_KARKALA.name)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /View full profile/ });
    expect(link).toHaveAttribute("href", "/about/sudarshana-karkala");
  });

  it("keeps its default portrait alt text and adds nothing to the profile link", () => {
    render(<ResearcherCard />);
    expect(screen.getByRole("img", { name: `Portrait of ${SUDARSHANA_KARKALA.name}` })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /View full profile/ });
    expect(link.getAttributeNames().filter((name) => name.startsWith("data-track"))).toEqual([]);
  });

  it("takes a page's own portrait alt text and tracking attributes for the profile link", () => {
    render(<ResearcherCard imageAlt="Sudarshana Karkala — EV.ENGINEER" profileLinkProps={{ "data-track-event": "rocket_twin_profile_click", "data-track-placement": "prepared_by" }} />);
    expect(screen.getByRole("img", { name: "Sudarshana Karkala — EV.ENGINEER" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /View full profile/ });
    expect(link).toHaveAttribute("href", "/about/sudarshana-karkala");
    expect(link).toHaveAttribute("data-track-event", "rocket_twin_profile_click");
    expect(link).toHaveAttribute("data-track-placement", "prepared_by");
  });

  it("links to another copy of the profile when a page names one", () => {
    render(<ResearcherCard href="https://aerospace.ev.engineer/about/sudarshana-karkala" />);
    expect(screen.getByRole("link", { name: /View full profile/ })).toHaveAttribute("href", "https://aerospace.ev.engineer/about/sudarshana-karkala");
  });

  it("credits him by his engineering identity unless a page gives the role it credits him in", () => {
    const { unmount } = render(<ResearcherCard />);
    expect(screen.getByText("EV.ENGINEER™")).toBeInTheDocument();
    unmount();
    render(<ResearcherCard role="Founder · ISHAVASYAM.ORG" />);
    expect(screen.getByText("Founder · ISHAVASYAM.ORG")).toBeInTheDocument();
    expect(screen.queryByText("EV.ENGINEER™")).toBeNull();
    // Never as a founder of EV.ENGINEER.
    expect(document.body.textContent).not.toMatch(/founder[^.]*EV\.ENGINEER/i);
  });

  it("does not inline the full verified bio paragraph — only a short role line", () => {
    render(<ResearcherCard />);
    expect(screen.queryByText(SUDARSHANA_KARKALA.description)).not.toBeInTheDocument();
  });
});
