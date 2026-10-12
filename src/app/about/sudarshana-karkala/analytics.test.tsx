import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

const trackEvent = vi.fn();
vi.mock("@/utils/analytics", () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));
// The page uses the Space fonts; next/font is not available under Vitest.
vi.mock("next/font/google", () => ({ Manrope: () => ({ variable: "font-manrope" }), Inter: () => ({ variable: "font-inter" }) }));

import ProfilePage from "./page";
import ProfileAnalytics from "./ProfileAnalytics";
import { declaredEvent, profileTracking, trackProfile } from "./analytics";

const calls = (event: string) => trackEvent.mock.calls.filter(([name]) => name === event);
/** Every value the profile has sent to analytics, in one string. */
const everythingSent = () => JSON.stringify(trackEvent.mock.calls);

beforeEach(() => {
  trackEvent.mockReset();
  // The site's analytics is loaded: `gtag` exists.
  window.gtag = vi.fn();
});
afterEach(() => {
  vi.useRealTimers();
  // @ts-expect-error the test removes what it added
  delete window.gtag;
});

describe("profile analytics: what is declared", () => {
  it("writes an event and its parameters as attributes of a link, and reads them back", () => {
    const attributes = profileTracking("profile_project_click", { project_name: "cubetwin", destination: "/space/cubesat", section: "selected_work" });
    expect(attributes).toEqual({
      "data-profile-event": "profile_project_click",
      "data-profile-project_name": "cubetwin",
      "data-profile-destination": "/space/cubesat",
      "data-profile-section": "selected_work",
    });
    const link = document.createElement("a");
    for (const [name, value] of Object.entries(attributes)) link.setAttribute(name, value);
    expect(declaredEvent(link)).toEqual({ event: "profile_project_click", params: { project_name: "cubetwin", destination: "/space/cubesat", section: "selected_work" } });
  });

  it("drops any value that is not a short id, a host or a route: an address with a scheme, a telephone number, a sentence", () => {
    // @ts-expect-error values outside the taxonomy, as a mistake elsewhere might pass them
    trackProfile("profile_contact_click", { contact_type: "phone", destination_type: "tel:+919845561518", note: "Call me on +91 9845561518", who: "someone@example.com" });
    expect(trackEvent).toHaveBeenCalledWith("profile_contact_click", { contact_type: "phone" });
  });

  it("reads nothing from an element that declares some other event", () => {
    const link = document.createElement("a");
    link.setAttribute("data-profile-event", "page_view");
    expect(declaredEvent(link)).toBeNull();
    expect(declaredEvent(document.createElement("a"))).toBeNull();
  });
});

describe("profile analytics: the view", () => {
  it("reports the profile as viewed once, with what kind of page it is and whose", () => {
    const { rerender } = render(<ProfilePage />);
    rerender(<ProfilePage />);
    expect(calls("profile_view")).toEqual([["profile_view", { page_type: "profile", profile_name: "sudarshana_karkala" }]]);
    // It is its own event. The site's page view is reported by the site, not a second time from here.
    expect(calls("page_view")).toHaveLength(0);
  });

  it("waits for the site's analytics to load, reports the view when it has, and gives up quietly if it never does", () => {
    vi.useFakeTimers();
    // @ts-expect-error not loaded yet
    delete window.gtag;
    const first = render(<ProfileAnalytics rootId="none" />);
    act(() => void vi.advanceTimersByTime(1000));
    expect(calls("profile_view")).toHaveLength(0);
    window.gtag = vi.fn();
    act(() => void vi.advanceTimersByTime(400));
    expect(calls("profile_view")).toHaveLength(1);
    act(() => void vi.advanceTimersByTime(10000));
    expect(calls("profile_view")).toHaveLength(1);
    first.unmount();

    // @ts-expect-error never loads
    delete window.gtag;
    trackEvent.mockReset();
    render(<ProfileAnalytics rootId="none" />);
    act(() => void vi.advanceTimersByTime(60000));
    expect(trackEvent).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("counts a view again when the profile is opened again", () => {
    render(<ProfilePage />).unmount();
    render(<ProfilePage />);
    expect(calls("profile_view")).toHaveLength(2);
  });
});

describe("profile analytics: what a visitor uses", () => {
  beforeEach(() => {
    render(<ProfilePage />);
    trackEvent.mockClear();
  });

  it("reports one event for one click on a piece of selected work, naming the project", () => {
    fireEvent.click(screen.getByRole("link", { name: /Advanced Rocket Propulsion Digital Twin/ }));
    expect(trackEvent.mock.calls).toEqual([["profile_project_click", { project_name: "advanced_propulsion_twin", destination: "/space/rocket-engine-digital-twin-advanced", section: "selected_work" }]]);
  });

  it("names each of the six projects by a fixed id", () => {
    for (const link of screen.getByRole("region", { name: "Selected Work" }).querySelectorAll("a")) fireEvent.click(link);
    expect(calls("profile_project_click").map(([, params]) => params.project_name)).toEqual(["space_station", "satellite_engineering", "advanced_propulsion_twin", "cubetwin", "model_rocketry", "ev_battery_intelligence"]);
  });

  it("reports which initiative attracted interest, and where its link leads", () => {
    fireEvent.click(screen.getByRole("link", { name: /^ishavasyam\.org/ }));
    fireEvent.click(screen.getByRole("link", { name: "Space initiative" }));
    fireEvent.click(screen.getByRole("link", { name: /^ev\.engineer/ }));
    fireEvent.click(screen.getByRole("link", { name: "Workshop gallery" }));
    fireEvent.click(screen.getByRole("link", { name: /^carsoftwaresystems\.com/ }));
    expect(trackEvent.mock.calls).toEqual([
      ["profile_initiative_click", { initiative_name: "ishavasyam", destination: "ishavasyam.org", section: "primary_initiative" }],
      ["profile_initiative_click", { initiative_name: "ishavasyam", destination: "/space", section: "primary_initiative" }],
      ["profile_initiative_click", { initiative_name: "ev_engineer", destination: "ev.engineer", section: "initiatives" }],
      ["profile_initiative_click", { initiative_name: "ev_engineer", destination: "/workshop-gallery", section: "initiatives" }],
      ["profile_initiative_click", { initiative_name: "car_software_systems", destination: "carsoftwaresystems.com", section: "initiatives" }],
    ]);
  });

  it("reports a name used in the hero as the same event, and says that it was the hero", () => {
    const hero = screen.getByRole("region", { name: "Sudarshana Karkala" });
    for (const link of hero.querySelectorAll("a")) fireEvent.click(link);
    expect(trackEvent.mock.calls).toEqual([
      ["profile_initiative_click", { initiative_name: "ev_engineer", destination: "ev.engineer", section: "hero" }],
      ["profile_initiative_click", { initiative_name: "ishavasyam", destination: "ishavasyam.org", section: "hero" }],
    ]);
  });

  it("reports a name used in Professional Background likewise, with the page of Thasmai's site it leads to", () => {
    const background = screen.getByRole("region", { name: "Professional Background" });
    for (const link of background.querySelectorAll("a")) fireEvent.click(link);
    expect(trackEvent.mock.calls).toEqual([
      ["profile_initiative_click", { initiative_name: "itelematics", destination: "itelematics.com", section: "background" }],
      ["profile_initiative_click", { initiative_name: "thasmai", destination: "thasmaiinfotech.com/space-research", section: "background" }],
    ]);
    // The link to a former employer was clicked too, and reported nothing: there is no event for an employer.
    expect(background.querySelectorAll("a")).toHaveLength(3);
    expect(everythingSent()).not.toMatch(/nms|enphase|mcafee|employer/i);
  });

  it("reports a contact action by its kind, and never sends the telephone number, an address or the text of a link", () => {
    const contact = screen.getByRole("region", { name: "Contact / Consultation" });
    for (const link of contact.querySelectorAll("a")) fireEvent.click(link);
    fireEvent.click(screen.getByRole("link", { name: "EV.ENGINEER contact page" }));
    expect(trackEvent.mock.calls).toEqual([
      ["profile_contact_click", { contact_type: "linkedin", destination_type: "external" }],
      ["profile_contact_click", { contact_type: "resume", destination_type: "document" }],
      ["profile_contact_click", { contact_type: "consultation", destination_type: "internal" }],
      ["profile_contact_click", { contact_type: "phone", destination_type: "telephone" }],
      ["profile_contact_click", { contact_type: "contact_page", destination_type: "internal" }],
    ]);
    expect(everythingSent()).not.toMatch(/9845561518|tel:|https?:|linkedin\.com|\.pdf|@/);
  });

  it("sends only fixed ids, hosts and routes, whatever is clicked", () => {
    for (const link of document.querySelectorAll("#profile a")) fireEvent.click(link);
    for (const [, params] of trackEvent.mock.calls) {
      for (const value of Object.values(params as Record<string, string>)) expect(value).toMatch(/^[a-z0-9_./-]{1,80}$/);
    }
    expect(everythingSent()).not.toMatch(/9845561518|label|url/);
  });

  it("does not turn ordinary navigation into events: the bar, the Trust Center link and plain text report nothing", () => {
    fireEvent.click(screen.getByRole("link", { name: "Space" }));
    fireEvent.click(screen.getByRole("link", { name: "Contact / Consultation" }));
    fireEvent.click(screen.getByRole("link", { name: "EV.ENGINEER™" }));
    fireEvent.click(screen.getByRole("link", { name: "Trust Center" }));
    fireEvent.click(screen.getByRole("heading", { level: 1 }));
    expect(trackEvent).not.toHaveBeenCalled();
    // And no click here is a lead: that event is for an enquiry that was actually sent.
    for (const link of document.querySelectorAll("#profile a")) fireEvent.click(link);
    expect(calls("generate_lead")).toHaveLength(0);
  });

  it("keeps the site-wide click listener out, so that no click is counted twice and no address is added to it", () => {
    const root = document.getElementById("profile")!;
    expect(root).toHaveAttribute("data-track-manual");
    expect(root.querySelectorAll("[data-track-event]")).toHaveLength(0);
  });
});
