import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import GoogleAnalytics from "./GoogleAnalytics";

vi.mock("next/script", () => ({ default: () => null }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/space/rocket-engine-digital-twin",
  useSearchParams: () => new URLSearchParams(),
}));

const gtag = vi.fn();
/** Events reported by clicks: everything except the page view sent when the tracker mounts. */
const clicks = () => gtag.mock.calls.filter(([, name]) => name !== "page_view").map(([, name, params]) => [name, params]);

beforeEach(() => {
  gtag.mockReset();
  window.gtag = gtag;
});

afterEach(() => {
  // @ts-expect-error gtag is declared as always present; the tests take it away again.
  delete window.gtag;
});

describe("GoogleAnalytics click tracking", () => {
  it("records one page view for the route", () => {
    render(<GoogleAnalytics />);
    const views = gtag.mock.calls.filter(([, name]) => name === "page_view");
    expect(views).toHaveLength(1);
    expect(views[0][2]).toMatchObject({ page_path: "/space/rocket-engine-digital-twin" });
  });

  it("reports a link's data-track-event once, with its data-track parameters", () => {
    render(
      <>
        <GoogleAnalytics />
        <div data-track-manual="">
          <a href="/about/sudarshana-karkala" data-track-event="rocket_twin_profile_click" data-track-placement="prepared_by" onClick={(e) => e.preventDefault()}>
            View full profile
          </a>
        </div>
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: "View full profile" }));
    expect(clicks()).toHaveLength(1);
    expect(clicks()[0][0]).toBe("rocket_twin_profile_click");
    expect(clicks()[0][1]).toMatchObject({ placement: "prepared_by" });
  });

  it("reports the /space project card with its project and placement", () => {
    render(
      <>
        <GoogleAnalytics />
        <a href="/space/rocket-engine-digital-twin" data-track-event="space_project_card_click" data-track-project="rocket_engine_digital_twin" data-track-placement="simulation_projects" onClick={(e) => e.preventDefault()}>
          Explore Rocket Engine Digital Twin
        </a>
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Explore Rocket Engine Digital Twin" }));
    expect(clicks()).toHaveLength(1);
    expect(clicks()[0]).toEqual(["space_project_card_click", expect.objectContaining({ project: "rocket_engine_digital_twin", placement: "simulation_projects" })]);
  });

  it("leaves a data-track-manual area alone, so a control that reports its own event is not counted twice", () => {
    render(
      <>
        <GoogleAnalytics />
        <div data-track-manual="">
          <button type="button">Run simulated engine test</button>
          <a href="https://example.com/elsewhere" onClick={(e) => e.preventDefault()}>
            Elsewhere
          </a>
        </div>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Run simulated engine test" }));
    fireEvent.click(screen.getByRole("link", { name: "Elsewhere" }));
    expect(clicks()).toEqual([]);
  });

  it("still counts an ordinary button elsewhere on the site as before", () => {
    render(
      <>
        <GoogleAnalytics />
        <button type="button">Download brochure</button>
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Download brochure" }));
    expect(clicks()).toEqual([["cta_click", expect.any(Object)]]);
  });
});
