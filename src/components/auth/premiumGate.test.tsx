// @vitest-environment-options {"url": "https://autonomous.ev.engineer/space/cubesat?mode=advanced#energy"}
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { trackEvent } from "@/utils/analytics";
import { STORAGE_KEYS } from "@/lib/auth/promptState";
import AuthProvider from "./AuthProvider";
import PremiumRouteGate from "./PremiumRouteGate";

let pathname = "/space/cubesat";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("@/utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

const HOST = "autonomous.ev.engineer";
const FIVE_MINUTES = 5 * 60_000;
const ANONYMOUS = { authenticated: false };
const SIGNED_IN = { authenticated: true, user: { id: "u1", name: "Asha Rao", email: "asha@example.com" }, roles: ["Viewer"], domain: HOST };
const RETURN = encodeURIComponent("/space/cubesat?mode=advanced#energy");

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });

function serveSessions(...bodies: Array<unknown | Response>) {
  let call = 0;
  const fetchMock = vi.fn(async () => {
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

function renderPage() {
  return render(
    <AuthProvider>
      <PremiumRouteGate>
        <article data-testid="premium-content">
          <h1>CubeTwin</h1>
          <section id="energy">Energy budget</section>
        </article>
      </PremiumRouteGate>
    </AuthProvider>,
  );
}

const content = () => screen.queryByTestId("premium-content");

beforeAll(() => {
  const proto = HTMLDialogElement.prototype as HTMLDialogElement & { showModal: () => void; close: () => void };
  proto.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  proto.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
  };
});

beforeEach(() => {
  pathname = "/space/cubesat";
  document.title = "CubeTwin | CubeSat Battery & Energy Digital Twin";
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date", "requestAnimationFrame"] });
  vi.setSystemTime(new Date("2026-10-25T10:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  (trackEvent as Mock).mockClear();
  localStorage.clear();
  sessionStorage.clear();
});

describe("required-login route, anonymous visitor", () => {
  it("shows the premium login gate and never renders the page", async () => {
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    expect(content()).toBeNull();
    expect(screen.queryByText("Energy budget")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Login to view premium content" })).toBeInTheDocument();
    expect(screen.getByText("Sign in to continue to this engineering experience.")).toBeInTheDocument();
    expect(screen.getByText("You’ll return directly to this page after login.")).toBeInTheDocument();
    expect(screen.getByText("CubeSat / CubeTwin")).toBeInTheDocument();
    expect(screen.getByText("EV.ENGINEER™")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("aria-labelledby");
  });

  it("offers Login only — no Continue Browsing — and a way back to the section", async () => {
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Login"]);
    expect(screen.queryByText("Continue Browsing")).toBeNull();
    expect(screen.getByRole("link", { name: "Back to Space" })).toHaveAttribute("href", "/space");
  });

  it("does not wait five minutes, and the optional prompt never opens over it", async () => {
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    expect(events()).toContainEqual({
      name: "premium_route_gate_shown",
      params: { site: "ev_engineer", hostname: HOST, page_path: "/space/cubesat", page_label: "CubeSat / CubeTwin", trigger: "premium_route_required" },
    });
    await settle(FIVE_MINUTES * 2);
    expect(document.querySelector("dialog[open]")).toBeNull();
    expect(events().map((e) => e.name)).not.toContain("premium_login_prompt_shown");
  });

  it("Login starts sign-in returning to the exact page, with the premium trigger and page label", async () => {
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, hostname: HOST, pathname: "/space/cubesat", search: "?mode=advanced", hash: "#energy", assign });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(assign).toHaveBeenCalledWith(
      `/api/auth/login?return=${RETURN}&trigger=premium_route_required&label=${encodeURIComponent("CubeSat / CubeTwin")}`,
    );
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEYS.loginPending)!)).toMatchObject({ trigger: "premium_route_required" });
    expect(events().map((e) => e.name)).toContain("premium_route_login_started");
    expect(JSON.stringify(events())).not.toMatch(/asha|u1|Viewer/i);
  });
});

describe("required-login route, while the session is unknown", () => {
  it("shows a checking panel, not the page", async () => {
    let answer: (r: Response) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => (answer = resolve))));
    renderPage();
    expect(content()).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Checking your sign-in…");
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    await settle();
    expect(content()).toBeNull();
    await act(async () => answer(json(SIGNED_IN)));
    await settle();
    expect(content()).not.toBeNull();
  });
});

describe("required-login route, signed-in visitor", () => {
  it("renders the page", async () => {
    serveSessions(SIGNED_IN);
    renderPage();
    await settle();
    expect(content()).not.toBeNull();
    expect(screen.queryByText("Login to view premium content")).toBeNull();
  });

  it("is signed in without a membership: the page shows, protected data stays a server decision", async () => {
    serveSessions({ ...SIGNED_IN, roles: [] });
    renderPage();
    await settle();
    expect(content()).not.toBeNull();
  });

  it("treats a session for another host as no session", async () => {
    serveSessions({ ...SIGNED_IN, domain: "ev.engineer" });
    renderPage();
    await settle();
    expect(content()).toBeNull();
  });

  it("returning from sign-in: reports success and scrolls to the page's #hash", async () => {
    sessionStorage.setItem(STORAGE_KEYS.loginPending, JSON.stringify({ trigger: "premium_route_required", at: Date.now() - 20_000 }));
    const scrolled = vi.fn();
    Element.prototype.scrollIntoView = scrolled;
    serveSessions(SIGNED_IN);
    renderPage();
    await settle();
    await settle(300);
    expect(content()).not.toBeNull();
    expect(events().map((e) => e.name)).toEqual(expect.arrayContaining(["login_success_return", "premium_route_login_success"]));
    expect(scrolled).toHaveBeenCalled();
    expect(scrolled.mock.contexts[0]).toBe(document.getElementById("energy"));
  });
});

describe("required-login route, sign-in service not answering", () => {
  it("stays closed and offers to try again", async () => {
    serveSessions(new Response("down", { status: 503 }), ANONYMOUS);
    renderPage();
    await settle();
    expect(content()).toBeNull();
    expect(screen.getByRole("heading", { name: "Sign-in is temporarily unavailable" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await settle();
    expect(screen.getByRole("heading", { name: "Login to view premium content" })).toBeInTheDocument();
  });
});

describe("other routes", () => {
  it("leaves an unconfigured page alone, whatever the session", async () => {
    pathname = "/space";
    serveSessions(ANONYMOUS);
    renderPage();
    expect(content()).not.toBeNull();
    await settle();
    expect(content()).not.toBeNull();
    expect(screen.queryByText("Login to view premium content")).toBeNull();
  });

  it("gates a premium page reached by in-app navigation", async () => {
    pathname = "/space";
    serveSessions(ANONYMOUS);
    const view = renderPage();
    await settle();
    expect(content()).not.toBeNull();
    pathname = "/space/space-station";
    view.rerender(
      <AuthProvider>
        <PremiumRouteGate>
          <article data-testid="premium-content" />
        </PremiumRouteGate>
      </AuthProvider>,
    );
    await settle();
    expect(content()).toBeNull();
    expect(screen.getByText("Space Station")).toBeInTheDocument();
  });

  it("shows the page on a host without a sign-in service (local development, previews)", async () => {
    vi.stubGlobal("location", { ...window.location, hostname: "localhost" });
    const fetchMock = serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    expect(content()).not.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("puts /internships in the site's content area, not a full-page takeover", async () => {
    pathname = "/internships";
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    expect(content()).toBeNull();
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.getByRole("region", { name: "Login to view premium content" })).toHaveAttribute("data-family", "core");
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  });
});
