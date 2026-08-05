import { describe, expect, it, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import LinkedInPostCard from "./LinkedInPostCard";

const ALLOWED_EMBED_URL = "https://www.linkedin.com/embed/feed/update/urn:li:share:1?collapsed=1";

function mockMatchMedia(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
  mockMatchMedia(false);
});

describe("LinkedInPostCard", () => {
  it("renders a direct-link fallback card when no embedUrl is configured", () => {
    mockMatchMedia(false);
    render(
      <LinkedInPostCard
        directUrl="https://www.linkedin.com/posts/kiran-kumar-7a111b40_activity-1-LcUY"
        title="Professional Recognition"
        authorName="Kiran Kumar"
        eager
      />
    );
    expect(screen.getByText("Professional Recognition")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /open on linkedin/i });
    expect(link).toHaveAttribute("href", "https://www.linkedin.com/posts/kiran-kumar-7a111b40_activity-1-LcUY");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows a 'Load embedded post' action on mobile in preview mode instead of loading the iframe immediately", () => {
    mockMatchMedia(true);
    render(
      <LinkedInPostCard
        embedUrl={ALLOWED_EMBED_URL}
        directUrl="https://www.linkedin.com/feed/update/urn:li:share:1/"
        title="Engineering Contribution"
        mobileMode="preview"
        eager
      />
    );
    expect(screen.getByRole("button", { name: /load embedded post/i })).toBeInTheDocument();
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("renders the embed (via skeleton + iframe) on desktop when eager", () => {
    mockMatchMedia(false);
    render(
      <LinkedInPostCard
        embedUrl={ALLOWED_EMBED_URL}
        directUrl="https://www.linkedin.com/feed/update/urn:li:share:1/"
        title="Professional Recognition"
        eager
      />
    );
    const iframe = document.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe).toHaveAttribute("src", ALLOWED_EMBED_URL);
    expect(iframe).toHaveAttribute("title", "Professional Recognition");
  });

  it("never renders an iframe for an embedUrl outside the allowlist", () => {
    mockMatchMedia(false);
    render(
      <LinkedInPostCard
        embedUrl="https://evil.example.com/embed"
        directUrl="https://www.linkedin.com/feed/update/urn:li:share:1/"
        title="Suspicious post"
        eager
      />
    );
    expect(document.querySelector("iframe")).toBeNull();
  });
});
