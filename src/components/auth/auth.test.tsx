// @vitest-environment-options {"url": "https://aerospace.ev.engineer/space/satellite-engineering?mode=advanced#telemetry"}
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { trackEvent } from "@/utils/analytics";
import { STORAGE_KEYS } from "@/lib/auth/promptState";
import AuthProvider from "./AuthProvider";
import AuthNavControl from "./AuthNavControl";

vi.mock("next/navigation", () => ({
  usePathname: () => "/space/satellite-engineering",
}));

vi.mock("@/utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const HOST = "aerospace.ev.engineer";
const FIVE_MINUTES = 5 * 60_000;
const RETURN = encodeURIComponent("/space/satellite-engineering?mode=advanced#telemetry");
const ANONYMOUS = { authenticated: false };
const SIGNED_IN = {
  authenticated: true,
  user: { id: "u1", name: "Asha Rao", email: "asha@example.com" },
  roles: ["Viewer"],
  domain: HOST,
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

/** /api/auth/session answers with each body in turn (the last one repeats); logout succeeds. */
function serveSessions(...bodies: Array<unknown | Response>) {
  let call = 0;
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (String(input) === "/api/auth/logout" && init?.method === "POST") return json(ANONYMOUS);
    const body = bodies[Math.min(call++, bodies.length - 1)];
    return body instanceof Response ? body : json(body);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const events = () => (trackEvent as Mock).mock.calls.map(([name, params]) => ({ name, params }));

async function settle(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

function renderSite() {
  return render(
    <AuthProvider>
      <header>
        <AuthNavControl variant="space" />
        <button type="button">Express Interest</button>
      </header>
      <input aria-label="Search" />
    </AuthProvider>,
  );
}

beforeAll(() => {
  // jsdom has no <dialog> behaviour; enough of it for the prompt to open and close.
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal: () => void; close: () => void };
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
  vi.setSystemTime(new Date("2026-10-25T10:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  (trackEvent as Mock).mockClear();
  localStorage.clear();
  sessionStorage.clear();
  document.documentElement.style.overflow = "";
});

describe("header control", () => {
  it("shows Login for an anonymous visitor, returning to the exact page", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    const login = screen.getByRole("link", { name: "Login" });
    expect(login).toHaveAttribute("href", `/api/auth/login?return=${RETURN}`);
  });

  it("keeps the slot empty and hidden while the session is unknown or sign-in is unavailable", async () => {
    serveSessions(new Response("<!doctype html>", { status: 200, headers: { "content-type": "text/html" } }));
    const { container } = renderSite();
    // Before the answer: reserved, invisible, never a flash of Login.
    expect(screen.queryByRole("link", { name: "Login" })).toBeNull();
    expect(container.querySelector('[data-status="loading"]')).toHaveAttribute("aria-hidden", "true");
    await settle();
    expect(screen.queryByRole("link", { name: "Login" })).toBeNull();
    expect(container.querySelector('[data-status="unavailable"]')).toHaveAttribute("aria-hidden", "true");
  });

  it("treats a session for another host as no session", async () => {
    serveSessions({ ...SIGNED_IN, domain: "ev.engineer" });
    renderSite();
    await settle();
    expect(screen.queryByRole("button", { name: /Workspace/ })).toBeNull();
  });

  it("tracks a Login click with site, host, path and trigger, and remembers it for the return", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    fireEvent.click(screen.getByRole("link", { name: "Login" }));
    expect(events()).toContainEqual({
      name: "login_header_click",
      params: { site: "ev_engineer", hostname: HOST, page_path: "/space/satellite-engineering", trigger: "header" },
    });
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEYS.loginPending)!)).toMatchObject({ trigger: "header" });
  });

  it("shows Workspace once signed in, with the account and the real workspace", async () => {
    serveSessions(SIGNED_IN);
    renderSite();
    await settle();
    expect(screen.queryByRole("link", { name: "Login" })).toBeNull();
    const workspace = screen.getByRole("button", { name: /Workspace/ });
    expect(workspace).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(workspace);
    expect(workspace).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByText("asha@example.com")).toBeInTheDocument();
    const open = screen.getByRole("link", { name: /Open Workspace/ });
    expect(open).toHaveAttribute("href", "https://login.autonomous.ev.engineer/");

    fireEvent.click(open);
    expect(events().map((e) => e.name)).toContain("workspace_open");
    // Analytics never carries the person.
    expect(JSON.stringify(events())).not.toMatch(/Asha|asha@example|u1|Viewer/);
  });

  it("closes the account menu on Escape and returns focus to Workspace", async () => {
    serveSessions(SIGNED_IN);
    renderSite();
    await settle();
    const workspace = screen.getByRole("button", { name: /Workspace/ });
    fireEvent.click(workspace);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(workspace).toHaveAttribute("aria-expanded", "false");
    expect(document.activeElement).toBe(workspace);
  });

  it("signs out of this site, back to Login, with focus on it", async () => {
    const fetchMock = serveSessions(SIGNED_IN);
    renderSite();
    await settle();
    fireEvent.click(screen.getByRole("button", { name: /Workspace/ }));
    fireEvent.click(screen.getByRole("button", { name: /Sign out/ }));
    await settle();
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", expect.objectContaining({ method: "POST" }));
    const login = screen.getByRole("link", { name: "Login" });
    expect(document.activeElement).toBe(login);
    expect(screen.getByRole("status")).toHaveTextContent("You’re signed out of this site.");
    // No prompt for the rest of this browsing session.
    expect(sessionStorage.getItem(STORAGE_KEYS.quietThisSession)).toBe("1");
  });
});

describe("returning from sign-in", () => {
  it("reports a successful return once, with the trigger that started it", async () => {
    sessionStorage.setItem(STORAGE_KEYS.loginPending, JSON.stringify({ trigger: "prompt", at: Date.now() - 20_000 }));
    serveSessions(SIGNED_IN);
    renderSite();
    await settle();
    expect(events()).toContainEqual({
      name: "login_success_return",
      params: { site: "ev_engineer", hostname: HOST, page_path: "/space/satellite-engineering", trigger: "prompt" },
    });
    expect(sessionStorage.getItem(STORAGE_KEYS.loginPending)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.sessionChanged)).not.toBeNull();
  });

  it("says, without blocking, when a sign-in came back unfinished", async () => {
    sessionStorage.setItem(STORAGE_KEYS.loginPending, JSON.stringify({ trigger: "header", at: Date.now() - 20_000 }));
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    expect(screen.getByRole("status")).toHaveTextContent("Sign-in wasn’t completed");
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    await settle(8000);
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("re-checks when another tab signs in", async () => {
    serveSessions(ANONYMOUS, SIGNED_IN);
    renderSite();
    await settle();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEYS.sessionChanged, newValue: String(Date.now()) }));
    });
    await settle();
    expect(screen.getByRole("button", { name: /Workspace/ })).toBeInTheDocument();
  });
});

describe("five-minute prompt", () => {
  const dialog = () => document.querySelector("dialog")!;

  it("opens for an anonymous visitor after five minutes, not before", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    await settle(FIVE_MINUTES - 1000);
    expect(dialog()).not.toHaveAttribute("open");

    await settle(1000);
    expect(dialog()).toHaveAttribute("open");
    const title = screen.getByRole("heading", { name: "Continue with EV.ENGINEER™" });
    expect(dialog()).toHaveAttribute("aria-labelledby", title.id);
    expect(document.getElementById(dialog().getAttribute("aria-describedby")!)).toHaveTextContent(
      "Sign in to access your engineering workspace, projects and personalised experiences.",
    );
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue Browsing" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(document.documentElement.style.overflow).toBe("hidden");
    expect(events().map((e) => e.name)).toContain("login_prompt_shown");
  });

  it("does not open if the visitor signed in during the five minutes", async () => {
    serveSessions(ANONYMOUS, SIGNED_IN);
    renderSite();
    await settle();
    await settle(FIVE_MINUTES);
    expect(dialog()?.hasAttribute("open") ?? false).toBe(false);
    expect(screen.getByRole("button", { name: /Workspace/ })).toBeInTheDocument();
  });

  it("never opens for a signed-in visitor", async () => {
    serveSessions(SIGNED_IN);
    renderSite();
    await settle();
    await settle(FIVE_MINUTES * 3);
    expect(dialog()).not.toHaveAttribute("open");
    expect(events().map((e) => e.name)).not.toContain("login_prompt_shown");
  });

  it("Continue Browsing closes it, restores scroll and focus, and keeps it away", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    const before = screen.getByRole("button", { name: "Express Interest" });
    before.focus();
    await settle(FIVE_MINUTES);
    expect(dialog()).toHaveAttribute("open");

    fireEvent.click(screen.getByRole("button", { name: "Continue Browsing" }));
    expect(dialog()).not.toHaveAttribute("open");
    expect(document.documentElement.style.overflow).toBe("");
    expect(document.activeElement).toBe(before);
    expect(localStorage.getItem(STORAGE_KEYS.dismissedAt)).not.toBeNull();
    expect(events()).toContainEqual({
      name: "login_prompt_dismissed",
      params: expect.objectContaining({ trigger: "timer", method: "continue" }),
    });

    await settle(FIVE_MINUTES * 2);
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("closes on Escape and with the close button", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    await settle(FIVE_MINUTES);
    fireEvent(dialog(), new Event("cancel", { cancelable: true }));
    expect(dialog()).not.toHaveAttribute("open");
    expect(events().at(-1)).toMatchObject({ name: "login_prompt_dismissed", params: { method: "escape" } });
  });

  it("keeps Tab and Shift+Tab inside the dialog", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    await settle(FIVE_MINUTES);
    const close = screen.getByRole("button", { name: "Close" });
    const last = screen.getByRole("button", { name: "Continue Browsing" });
    last.focus();
    fireEvent.keyDown(dialog(), { key: "Tab" });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(dialog(), { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("Login in the prompt starts sign-in with the prompt as trigger", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    await settle(FIVE_MINUTES);
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(events().map((e) => e.name)).toContain("login_prompt_login_click");
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEYS.loginPending)!)).toMatchObject({ trigger: "prompt" });
  });

  it("waits while the visitor is typing, then opens", async () => {
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    const search = screen.getByRole("textbox", { name: "Search" });
    search.focus();
    await settle(FIVE_MINUTES);
    expect(dialog()).not.toHaveAttribute("open");
    search.blur();
    await settle(20_000);
    expect(dialog()).toHaveAttribute("open");
  });

  it("does not open on a page that opted out", async () => {
    serveSessions(ANONYMOUS);
    render(
      <AuthProvider>
        <span hidden data-auth-prompt="off" />
      </AuthProvider>,
    );
    await settle();
    await settle(FIVE_MINUTES + 60_000);
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("does not open when it was shown in the last day", async () => {
    localStorage.setItem(STORAGE_KEYS.lastShown, String(Date.now() - 60 * 60_000));
    serveSessions(ANONYMOUS);
    renderSite();
    await settle();
    await settle(FIVE_MINUTES * 2);
    expect(dialog()).not.toHaveAttribute("open");
  });
});
