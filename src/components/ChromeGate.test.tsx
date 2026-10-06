import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));
vi.mock("./Navbar", () => ({ default: () => <nav aria-label="Site" /> }));
vi.mock("./Footer", () => ({ default: () => <footer /> }));

import ChromeGate from "./ChromeGate";

const renderAt = (path: string) => {
  pathname.current = path;
  return render(
    <ChromeGate>
      <p>Page</p>
    </ChromeGate>,
  );
};

describe("ChromeGate", () => {
  it.each(["/", "/internships", "/internships/ev-help-agent", "/internships/aerospace-quality-intelligence-platform/other", "/consulting"])("wraps %s in the site navbar, a main landmark and the footer", (path) => {
    renderAt(path);
    expect(screen.getByRole("navigation", { name: "Site" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Page");
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it.each(["/internships/aerospace-quality-intelligence-platform", "/aerospace", "/aerospace/uflight-3d", "/space", "/space/rocket-engine-digital-twin", "/ishavasyam-space"])("leaves %s to draw its own header and footer", (path) => {
    const { container } = renderAt(path);
    expect(screen.queryByRole("navigation", { name: "Site" })).toBeNull();
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.queryByRole("contentinfo")).toBeNull();
    expect(container.innerHTML).toBe("<p>Page</p>");
  });
});
