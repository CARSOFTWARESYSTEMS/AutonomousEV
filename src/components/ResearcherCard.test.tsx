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

  it("does not inline the full verified bio paragraph — only a short role line", () => {
    render(<ResearcherCard />);
    expect(screen.queryByText(SUDARSHANA_KARKALA.description)).not.toBeInTheDocument();
  });
});
