import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CubeSatPage from "@/app/space/academy/missions/build-your-first-cubesat/page";
import EclipsePage from "@/app/space/academy/missions/survive-the-eclipse/page";
import RocketPage from "@/app/space/academy/missions/stable-model-rocket/page";

vi.mock("next/navigation", () => ({ usePathname: () => "/space/academy/missions/build-your-first-cubesat" }));
vi.mock("next/font/google", () => ({
  Manrope: () => ({ variable: "--font-space-manrope" }),
  Inter: () => ({ variable: "--font-space-inter" }),
}));

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, "", "/space/academy/missions/build-your-first-cubesat");
});
afterEach(() => window.localStorage.clear());

const tab = (name: string) => screen.getByRole("tab", { name: new RegExp(`^${name}`) });

describe("Mission Lab", () => {
  it.each([
    ["Build Your First CubeSat", CubeSatPage],
    ["Survive the Eclipse", EclipsePage],
    ["Design a Stable Model Rocket", RocketPage],
  ])("%s: a focused player with one heading, an exit, three modes and no site navigation", (title, Page) => {
    render(<Page />);
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual([title]);
    expect(screen.queryByRole("navigation", { name: "Space section navigation" })).toBeNull();
    expect(screen.getByRole("link", { name: /Exit the mission/ })).toHaveAttribute("href", "/space/academy");
    expect(screen.getAllByRole("tab").map((t) => t.textContent?.replace(/(Explore|Learn|Challenge).*/, "$1"))).toEqual(["Explore", "Learn", "Challenge"]);
    expect(tab("Learn")).toHaveAttribute("aria-selected", "true");
    // It says what it is: an educational simulation, not flight data.
    expect(screen.getByText("Educational simulation")).toBeInTheDocument();
    // About this mission is in the HTML (closed dialog), with every notice.
    const about = screen.getByText("About this mission").closest("dialog") as HTMLDialogElement;
    expect(about.textContent).toMatch(/not a validated engineering tool/);
    expect(about.textContent).toMatch(/not affiliated with, endorsed by, or run on behalf of ISRO, IN-SPACe/);
    expect(about.textContent).toMatch(/Missions never ask for a name, school, age or contact details/);
    // Nothing asks a learner to type anything about themselves.
    expect(document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea').length).toBe(0);
  });

  it("opens in the mode the link asks for, and moves between modes with the arrow keys", async () => {
    window.history.replaceState(null, "", "/space/academy/missions/build-your-first-cubesat#explore");
    const user = userEvent.setup();
    render(<CubeSatPage />);
    expect(tab("Explore")).toHaveAttribute("aria-selected", "true");
    tab("Explore").focus();
    await user.keyboard("{ArrowRight}");
    expect(tab("Learn")).toHaveAttribute("aria-selected", "true");
    expect(window.location.hash).toBe("#learn");
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tab("Learn").id);
  });

  it("Explore: selecting a part annotates it, and the sunlight experiment answers in real time", async () => {
    window.history.replaceState(null, "", "/space/academy/missions/build-your-first-cubesat#explore");
    const user = userEvent.setup();
    render(<CubeSatPage />);
    const parts = screen.getByRole("list", { name: "Parts of the CubeSat" });
    await user.click(within(parts).getByRole("button", { name: /Battery pack/ }));
    expect(within(parts).getByRole("button", { name: /Battery pack/ })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { level: 3, name: "Battery pack" })).toBeInTheDocument();
    expect(screen.getByText(/Stores energy from the solar panels/)).toBeInTheDocument();

    const results = screen.getByRole("group", { name: "Live power results" });
    const before = results.textContent;
    // Body panels square-on: 1361 × 0.006 × 0.28 = 2.29 W in sunlight.
    expect(before).toMatch(/2\.29 W/);
    fireEvent.change(screen.getByLabelText("Angle between the Sun and the panels (θ)"), { target: { value: "90" } });
    // Edge-on (90°): no power at all.
    expect(results.textContent).toMatch(/0\.00 W/);
    expect(results.textContent).toMatch(/Not enough/);
  });

  it("Learn: checks give per-criterion feedback, and a failed step can be started over", async () => {
    const user = userEvent.setup();
    render(<CubeSatPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Meet the 1U frame" })).toBeInTheDocument();
    // The maths is optional, behind a disclosure.
    const maths = screen.getByText("Show the maths").closest("details") as HTMLDetailsElement;
    expect(maths.open).toBe(false);
    await user.click(screen.getByRole("button", { name: /Next step/ }));
    expect(screen.getByRole("heading", { level: 2, name: "Install the subsystems" })).toBeInTheDocument();
    const tray = screen.getByRole("list", { name: "Parts tray" });
    await user.click(within(tray).getByRole("button", { name: /Deployable antenna/ }));
    expect(screen.getByText(/Not yet: The antenna mounts on the outside/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check the assembly" }));
    expect(screen.getByText(/8 parts still to install/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Start this step over/ }));
    expect(screen.queryByText(/8 parts still to install/)).toBeNull();
    for (const name of ["Camera payload", "Battery pack", "Power board", "Flight computer", "Radio", "Attitude control", "Solar panels", "Deployable antenna"]) {
      await user.click(within(tray).getByRole("button", { name: new RegExp(name) }));
    }
    await user.click(screen.getByRole("button", { name: "Check the assembly" }));
    expect(screen.getByText("Assembled. Every part is in, and in a workable order.")).toBeInTheDocument();
  });

  it("Challenge: the budget fails as delivered, passes once redesigned, and ends with a reflection that stores nothing typed", async () => {
    window.history.replaceState(null, "", "/space/academy/missions/build-your-first-cubesat#challenge");
    const user = userEvent.setup();
    render(<CubeSatPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Balance the budgets" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Check the budgets" }));
    expect(screen.getByText(/Not yet/)).toBeInTheDocument();
    // Basic camera, deployable wings, radio at the camera's 10%.
    await user.click(screen.getByRole("radio", { name: /Basic camera/ }));
    await user.click(screen.getByRole("radio", { name: /Body panels \+ two deployable wings/ }));
    await user.click(screen.getByRole("button", { name: "Check the budgets" }));
    expect(screen.getByText("The design closes: it fits the mass limit and makes more power than it uses.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Next step/ }));
    await user.click(screen.getByRole("button", { name: /Finish and reflect/ }));
    const question = screen.getByRole("group", { name: /Which change did the most to close your power budget/ });
    await user.click(within(question).getByRole("radio", { name: /deployable solar wings/ }));
    expect(screen.getByText(/the wings triple the cell area facing the Sun/)).toBeInTheDocument();
    expect(window.localStorage.getItem("space-academy:v1:progress:build-your-first-cubesat")).toMatch(/"budget"/);
    expect(Object.keys(window.localStorage).every((k) => !/reflection/.test(k))).toBe(true);
  });

  it("Settings: graphics quality, motion and narration are the learner's to choose, and are kept in this browser only", async () => {
    const user = userEvent.setup();
    render(<CubeSatPage />);
    await user.click(screen.getByRole("button", { name: /^Settings/ }));
    const settings = screen.getByRole("dialog", { name: "Settings" });
    expect(within(settings).getByRole("group", { name: "Graphics quality" })).toBeInTheDocument();
    await user.click(within(settings).getByRole("radio", { name: /^Low/ }));
    await user.click(within(settings).getByRole("radio", { name: /Reduce motion/ }));
    expect(JSON.parse(window.localStorage.getItem("space-academy:v1:lab-settings") as string)).toMatchObject({ quality: "low", motion: "reduce" });
    // jsdom has no speech synthesis: narration is offered but cannot be turned on, and says why.
    expect(within(settings).getByRole("checkbox", { name: /Read each step aloud/ })).toBeDisabled();
    expect(within(settings).getByText(/This browser has no text-to-speech/)).toBeInTheDocument();
    // A 2D drawing is always available.
    expect(within(settings).getByRole("radio", { name: /2D drawing/ })).toBeEnabled();
  });
});
