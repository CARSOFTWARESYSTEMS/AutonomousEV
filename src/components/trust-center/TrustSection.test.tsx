import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustSection from "./TrustSection";

describe("TrustSection", () => {
  it("renders children when not empty", () => {
    render(
      <TrustSection id="s1" heading="Section One" isEmpty={false} displayMode="content" hideEmptySections={true}>
        <p>real content</p>
      </TrustSection>
    );
    expect(screen.getByText("real content")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Section One" })).toBeInTheDocument();
  });

  it("renders nothing when displayMode is hidden, even with content", () => {
    const { container } = render(
      <TrustSection id="s2" heading="Hidden Section" isEmpty={false} displayMode="hidden" hideEmptySections={true}>
        <p>should not render</p>
      </TrustSection>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for an empty content section when hideEmptySections is true", () => {
    const { container } = render(
      <TrustSection id="s3" heading="Empty Section" isEmpty={true} displayMode="content" hideEmptySections={true}>
        <p>never shown</p>
      </TrustSection>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the neutral placeholder for an empty section when displayMode is placeholder", () => {
    render(
      <TrustSection
        id="s4"
        heading="Awards"
        isEmpty={true}
        displayMode="placeholder"
        hideEmptySections={true}
        placeholderMessage="Content is being curated."
      >
        <p>never shown</p>
      </TrustSection>
    );
    expect(screen.getByText("Content is being curated.")).toBeInTheDocument();
    expect(screen.queryByText("never shown")).not.toBeInTheDocument();
  });
});
