import { describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SpaceStationPage from "./page";
import { FAQ } from "./data/faq";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/space-station" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

describe("/space/space-station page", () => {
  it("renders one H1 with the hero copy and both CTAs", () => {
    render(<SpaceStationPage />);
    const h1 = screen.getAllByRole("heading", { level: 1 });
    expect(h1).toHaveLength(1);
    expect(h1[0]).toHaveTextContent("SPACE STATION");
    expect(screen.getByText("Interactive Research Platform · Space Systems")).toBeInTheDocument();
    expect(screen.getByText("Research & Engineering Simulator")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Enter Simulator$/ })).toHaveAttribute("href", "#simulators");
    expect(screen.getByRole("link", { name: /^Research Explorer$/ })).toHaveAttribute("href", "#frontier");
  });

  it("labels the hero station as generic, not a real station model", () => {
    render(<SpaceStationPage />);
    expect(screen.getAllByText(/Generic Modular Research Station/).length).toBeGreaterThan(0);
    expect(screen.getByRole("toolbar", { name: "Scene controls" })).toBeInTheDocument();
    for (const name of [/Pause|Play/, /^Orbit$/, /Day\/Night/, /Docking Demo/, /Power Flow/, /Communications/, /Research Mode/]) {
      expect(within(screen.getByRole("toolbar", { name: "Scene controls" })).getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("defaults to Learn mode and reveals research depth when switched", async () => {
    const user = userEvent.setup();
    render(<SpaceStationPage />);
    const group = screen.getByRole("group", { name: "Mode" });
    expect(within(group).getByRole("button", { name: "Learn" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("heading", { name: "Candidate hypothesis" })).not.toBeInTheDocument();
    await user.click(within(group).getByRole("button", { name: "Research" }));
    expect(within(group).getByRole("button", { name: "Research" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Candidate hypothesis" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Potential PhD / postdoc research questions" })).toBeInTheDocument();
    expect(screen.getByText(/Open research problem:/)).toBeInTheDocument();
  });

  it("switches engineering-system depth with the mode", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpaceStationPage />);
    const systems = container.querySelector("#systems") as HTMLElement;
    expect(within(systems).queryByRole("heading", { name: "Engineering" })).not.toBeInTheDocument();
    await user.click(within(screen.getByRole("group", { name: "Mode" })).getByRole("button", { name: "Engineering" }));
    expect(within(systems).getByRole("heading", { name: "Engineering" })).toBeInTheDocument();
    expect(within(systems).queryByRole("heading", { name: "Research directions" })).not.toBeInTheDocument();
  });

  it("covers BAS with planned status and never estimates unpublished data", () => {
    const { container } = render(<SpaceStationPage />);
    const bas = container.querySelector("#bas") as HTMLElement;
    expect(within(bas).getByRole("heading", { level: 2 })).toHaveTextContent("India's Bharatiya Antariksh Station");
    expect(within(bas).getAllByText("Planned").length).toBeGreaterThan(0);
    expect(within(bas).getAllByText("Not publicly specified").length).toBeGreaterThanOrEqual(5);
    expect(bas.textContent).toMatch(/BAS-01 targeted by 2028/);
    expect(bas.textContent).toMatch(/All five modules by 2035/);
    expect(bas.textContent).toMatch(/crewed lunar mission by 2040/);
    const links = within(bas).getAllByRole("link").map((a) => a.getAttribute("href") ?? "");
    expect(links.some((h) => h.startsWith("https://www.pib.gov.in/"))).toBe(true);
    expect(links.some((h) => h.startsWith("https://www.isro.gov.in/"))).toBe(true);
  });

  it("keeps station lifecycle labels distinct, including Gateway's paused status", () => {
    const { container } = render(<SpaceStationPage />);
    const world = container.querySelector("#world") as HTMLElement;
    expect(world.textContent).toMatch(/International Space Station/);
    expect(world.textContent).toMatch(/Tiangong/);
    expect(world.textContent).toMatch(/intends to pause Gateway in its current form/);
    expect(world.textContent).toMatch(/None of the commercial stations below is operational/);
    for (const name of ["Axiom Station", "Starlab", "Orbital Reef", "Haven-1"]) {
      const row = within(world).getByRole("rowheader", { name }).closest("tr") as HTMLElement;
      expect(row.textContent).not.toMatch(/Operational/);
    }
  });

  it("renders every FAQ and filters them by search", () => {
    const { container } = render(<SpaceStationPage />);
    const faq = container.querySelector("#faq") as HTMLElement;
    expect(faq.querySelectorAll("details")).toHaveLength(FAQ.length);
    fireEvent.change(within(faq).getByRole("searchbox", { name: "Search questions" }), { target: { value: "docking" } });
    const shown = Array.from(faq.querySelectorAll("summary")).map((s) => s.textContent);
    expect(shown).toContain("How does docking work?");
    expect(shown.length).toBeLessThan(FAQ.length);
  });

  it("places the research direction profile near the end, after scientific content", () => {
    const { container } = render(<SpaceStationPage />);
    const ids = Array.from(container.querySelectorAll("main section[id]")).map((s) => s.id);
    expect(ids.at(-1)).toBe("direction");
    expect(ids.indexOf("direction")).toBeGreaterThan(ids.indexOf("faq"));
    const direction = container.querySelector("#direction") as HTMLElement;
    expect(within(direction).getByRole("heading", { level: 2 })).toHaveTextContent("Research & Project Direction");
    expect(within(direction).getByText("Sudarshana Karkala")).toBeInTheDocument();
    expect(within(direction).getByRole("link", { name: /View profile/ })).toHaveAttribute("href", "/about/sudarshana-karkala");
  });

  it("does not mention EV Society anywhere, including header and footer", async () => {
    const user = userEvent.setup();
    const { container } = render(<SpaceStationPage />);
    expect(container.innerHTML).not.toMatch(/EV Society|evsociety/i);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(document.getElementById("space-mobile-menu")).toBeInTheDocument();
    expect(document.body.innerHTML).not.toMatch(/EV Society|evsociety/i);
  });

  it("server-rendered markup contains no EV Society string", async () => {
    const { renderToString } = await import("react-dom/server");
    expect(renderToString(<SpaceStationPage />)).not.toMatch(/EV Society|evsociety/i);
  });

  it("opens every external link safely", () => {
    const { container } = render(<SpaceStationPage />);
    const external = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href^="http"]'));
    expect(external.length).toBeGreaterThan(40);
    for (const a of external) {
      expect(a.getAttribute("href")).toMatch(/^https:\/\//);
      expect(a).toHaveAttribute("target", "_blank");
      expect(a.getAttribute("rel")).toMatch(/noopener/);
    }
  });

  it("uses only valid internal anchor targets in page navigation", () => {
    const { container } = render(<SpaceStationPage />);
    const nav = screen.getByRole("navigation", { name: "On this page" });
    for (const a of within(nav).getAllByRole("link")) {
      const id = (a.getAttribute("href") ?? "").slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
    for (const id of ["simulators", "frontier"]) expect(container.querySelector(`#${id}`)).not.toBeNull();
  });
});
