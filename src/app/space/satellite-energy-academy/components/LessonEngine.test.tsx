import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import LessonEngine from "./LessonEngine";
import { CAPTURE_THE_SUN as lesson } from "@/lib/satellite-energy-academy/content";
import { PROGRESS_KEY } from "@/lib/satellite-energy-academy/progress";

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function slider(name: string, value: number) { fireEvent.change(screen.getByRole("slider", { name: new RegExp(name) }), { target: { value: String(value) } }); }
const finish = () => fireEvent.click(screen.getByRole("button", { name: "Complete the mission" }));
const explain = () => fireEvent.click(screen.getByRole("radio", { name: lesson.reflection.choices[0].text }));

it("synchronizes power, graph and diagram; resets without a page reload", () => {
  render(<LessonEngine lesson={lesson} />);
  expect(screen.getByTestId("generated-power")).toHaveTextContent("50.0 W");
  slider("Solar-panel angle", 0);
  expect(screen.getByTestId("generated-power")).toHaveTextContent("100.0 W");
  expect(screen.getByRole("img", { name: /Current point: 0 degrees, 100.0 watts/ })).toBeInTheDocument();
  slider("Solar-panel angle", 90);
  expect(screen.getByTestId("generated-power")).toHaveTextContent("0.0 W");
  expect(screen.getByRole("img", { name: /front normal is 90 degrees/ })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reset experiment" }));
  expect(screen.getByTestId("generated-power")).toHaveTextContent("50.0 W");
});

it("requires power and understanding, persists completion and unlocks bounded advanced challenge", async () => {
  const view = render(<LessonEngine lesson={lesson} />);
  finish();
  expect(screen.getByText(/Keep exploring. Meet the power target/)).toBeInTheDocument();
  slider("Solar-panel angle", 0); finish();
  expect(screen.getByText(/Almost there/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("radio", { name: lesson.reflection.choices[1].text }));
  finish(); expect(localStorage.getItem(PROGRESS_KEY)).toBeNull();
  explain(); finish();
  expect(screen.getByText(/Sun Catcher earned!/)).toBeInTheDocument();
  view.unmount(); render(<LessonEngine lesson={lesson} />);
  await waitFor(() => expect(screen.getByRole("button", { name: "Advanced challenge" })).toBeInTheDocument());
  fireEvent.click(screen.getByRole("button", { name: "Advanced challenge" }));
  slider("Solar-panel angle", 0); explain();
  fireEvent.click(screen.getByRole("button", { name: "Complete advanced challenge" }));
  expect(screen.queryByText(/Resourceful Engineer earned!/)).not.toBeInTheDocument();
  slider("Solar-panel area", 0.4);
  fireEvent.click(screen.getByRole("button", { name: "Complete advanced challenge" }));
  expect(screen.getByText(/Resourceful Engineer earned!/)).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(PROGRESS_KEY)!).lessons[lesson.id].advancedCompleted).toBe(true);
});

it("free exploration has no scoring or objectives and never records completion", () => {
  render(<LessonEngine lesson={lesson} />);
  fireEvent.click(screen.getByRole("button", { name: "Free Experiment" }));
  slider("Solar-panel angle", 0);
  expect(screen.queryByRole("button", { name: "Complete the mission" })).not.toBeInTheDocument();
  expect(screen.queryByRole("progressbar", { name: "Power target" })).not.toBeInTheDocument();
  expect(localStorage.getItem(PROGRESS_KEY)).toBeNull();
});

it("keeps the mission playable when storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
  render(<LessonEngine lesson={lesson} />);
  slider("Solar-panel angle", 0); explain(); finish();
  expect(screen.getByText(/Sun Catcher earned!/)).toBeInTheDocument();
  expect(screen.getByText(/Progress is saved for this visit only/)).toBeInTheDocument();
});

it("never starts an animation automatically and disables sweep for reduced motion", () => {
  vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() } as unknown as MediaQueryList);
  render(<LessonEngine lesson={lesson} />);
  expect(screen.getByRole("button", { name: "Play angle sweep" })).toBeDisabled();
  slider("Solar-panel angle", 45);
  expect(screen.getByTestId("generated-power")).toHaveTextContent("70.7 W");
});
