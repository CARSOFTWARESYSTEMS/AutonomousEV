import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Quiz } from "./Quiz";
import { QUIZ_QUESTIONS } from "@/lib/battery-cybersecurity/data/quiz";

describe("Quiz", () => {
  it("disables submission until every question is answered", async () => {
    const user = userEvent.setup();
    render(<Quiz />);
    const submit = screen.getByRole("button", { name: "Check My Answers" });
    expect(submit).toBeDisabled();

    for (const q of QUIZ_QUESTIONS) {
      const correctOption = screen.getByLabelText(q.options[q.correctIndex]);
      await user.click(correctOption);
    }
    expect(submit).toBeEnabled();
  });

  it("scores all-correct answers as a perfect score with no network calls", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("fetch should never be called");
    });

    const user = userEvent.setup();
    render(<Quiz />);

    for (const q of QUIZ_QUESTIONS) {
      await user.click(screen.getByLabelText(q.options[q.correctIndex]));
    }
    await user.click(screen.getByRole("button", { name: "Check My Answers" }));

    expect(screen.getByText(`Score: ${QUIZ_QUESTIONS.length} / ${QUIZ_QUESTIONS.length}`)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("resets state when Try Again is clicked", async () => {
    const user = userEvent.setup();
    render(<Quiz />);

    for (const q of QUIZ_QUESTIONS) {
      await user.click(screen.getByLabelText(q.options[q.correctIndex]));
    }
    await user.click(screen.getByRole("button", { name: "Check My Answers" }));
    await user.click(screen.getByRole("button", { name: "Try Again" }));

    expect(screen.getByRole("button", { name: "Check My Answers" })).toBeDisabled();
  });
});
