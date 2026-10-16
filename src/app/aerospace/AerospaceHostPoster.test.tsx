import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Vitest's jsdom environment exposes the JSDOM instance, which can move the page to another host.
declare const jsdom: { reconfigure(options: { url: string }): void };

const DIALOG_NAME = "Sudarshana Karkala — Aerospace Quality Intelligence";

function visit(url: string) {
  jsdom.reconfigure({ url });
}

/** A fresh copy of the module, as a full page load would give. */
async function loadPoster() {
  vi.resetModules();
  return import("./AerospaceHostPoster");
}

describe("AerospaceHostPoster", () => {
  beforeEach(() => visit("https://aerospace.ev.engineer/aerospace"));
  afterAll(() => visit("http://localhost:3000/"));

  it("opens on aerospace.ev.engineer with the poster and Profile, WhatsApp and Continue, in that order", async () => {
    const { default: AerospaceHostPoster, WHATSAPP_URL } = await loadPoster();
    render(<AerospaceHostPoster />);

    const dialog = screen.getByRole("dialog", { name: DIALOG_NAME });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByRole("img", { name: /Sudarshana Karkala, Aerospace Quality Intelligence/ })).toBeInTheDocument();

    const profile = within(dialog).getByRole("link", { name: "Profile" });
    expect(profile).toHaveAttribute("href", "/about/sudarshana-karkala");

    const whatsapp = within(dialog).getByRole("link", { name: "WhatsApp" });
    expect(whatsapp).toHaveAttribute("href", WHATSAPP_URL);
    expect(WHATSAPP_URL).toMatch(/^https:\/\/wa\.me\/919845561518\?text=/);
    expect(whatsapp).toHaveAttribute("target", "_blank");
    expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");

    const proceed = within(dialog).getByRole("button", { name: "Continue" });
    expect(proceed).toHaveAttribute("type", "button");
    expect(profile.compareDocumentPosition(whatsapp) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(whatsapp.compareDocumentPosition(proceed) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Text labels only, no arrow icons.
    [profile, whatsapp, proceed].forEach((el) => expect(el.querySelector("svg")).toBeNull());

    expect(within(dialog).getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it.each([
    "https://ev.engineer/aerospace",
    "https://autonomous.ev.engineer/aerospace",
    "https://cybersecurity.uflight.in/aerospace",
    "https://www.aerospace.ev.engineer/aerospace",
    "http://localhost:3000/aerospace",
  ])("stays hidden on %s", async (url) => {
    visit(url);
    const { default: AerospaceHostPoster } = await loadPoster();
    render(<AerospaceHostPoster />);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("img", { name: /Aerospace Quality Intelligence/ })).toBeNull();
  });

  it("closes from the close button and stays closed until the next full page load", async () => {
    const user = userEvent.setup();
    const { default: AerospaceHostPoster } = await loadPoster();
    const first = render(<AerospaceHostPoster />);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();

    // Coming back to /aerospace in the same page load, e.g. Back from the profile.
    first.unmount();
    render(<AerospaceHostPoster />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Continue closes it, the same as the close button", async () => {
    const user = userEvent.setup();
    const { default: AerospaceHostPoster } = await loadPoster();
    const first = render(<AerospaceHostPoster />);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.body.style.overflow).toBe("");

    first.unmount();
    render(<AerospaceHostPoster />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens again on a new page load after being closed", async () => {
    const user = userEvent.setup();
    let { default: AerospaceHostPoster } = await loadPoster();
    const first = render(<AerospaceHostPoster />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    first.unmount();

    ({ default: AerospaceHostPoster } = await loadPoster());
    render(<AerospaceHostPoster />);
    expect(screen.getByRole("dialog", { name: DIALOG_NAME })).toBeInTheDocument();
  });

  it("closes on Escape and on a click outside the poster, but not on a click inside it", async () => {
    const user = userEvent.setup();
    const { default: AerospaceHostPoster } = await loadPoster();
    const { unmount } = render(<AerospaceHostPoster />);

    fireEvent.click(screen.getByRole("img", { name: /Aerospace Quality Intelligence/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    unmount();

    const fresh = await loadPoster();
    render(<fresh.default />);
    fireEvent.click(screen.getByTestId("aerospace-poster-backdrop"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("locks page scroll while open and keeps Tab inside the dialog", async () => {
    const user = userEvent.setup();
    const { default: AerospaceHostPoster } = await loadPoster();
    render(<AerospaceHostPoster />);
    expect(document.body.style.overflow).toBe("hidden");

    const close = screen.getByRole("button", { name: "Close" });
    const proceed = screen.getByRole("button", { name: "Continue" });
    await user.tab({ shift: true });
    expect(proceed).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    await user.click(close);
    expect(document.body.style.overflow).toBe("");
  });
});
