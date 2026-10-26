// @vitest-environment-options {"url": "https://autonomous.ev.engineer/space/cubesat?mode=advanced#energy"}
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { trackEvent } from "@/utils/analytics";
import { STORAGE_KEYS } from "@/lib/auth/promptState";
import { PROGRAMME_TRACKS } from "@/lib/structured-data/internshipsGraph";
import AuthProvider from "./AuthProvider";
import PremiumContent from "./PremiumContent";
import PremiumPreview from "./PremiumPreview";
import PremiumRouteGate from "./PremiumRouteGate";

let pathname = "/space/cubesat";
vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

vi.mock("@/utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

// Every listed route has a public preview today. The layout gate is the
// fallback for one that doesn't, so its tests take the preview away.
let previews = true;
vi.mock("@/config/premiumAuthRoutes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/config/premiumAuthRoutes")>();
  return {
    ...actual,
    routeConfigFor: (path: string | null | undefined) => {
      const route = actual.routeConfigFor(path);
      return route && !previews ? { ...route, publicPreview: false } : route;
    },
  };
});

const HOST = "autonomous.ev.engineer";
const FIVE_MINUTES = 5 * 60_000;
const ANONYMOUS = { authenticated: false };
const SIGNED_IN = { authenticated: true, user: { id: "u1", name: "Asha Rao", email: "asha@example.com" }, roles: ["Viewer"], domain: HOST };
const RETURN = encodeURIComponent("/space/cubesat?mode=advanced#energy");
const LABEL = encodeURIComponent("CubeSat / CubeTwin");
const STRUCTURED = {
  "@context": "https://schema.org",
  "@graph": [{ "@type": "Course", name: "CubeTwin", teaches: ["Orbit sunlight", "Battery state of charge", "Fault injection"] }],
};

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

const fullPage = (
  <article data-testid="premium-content">
    <h1>CubeTwin</h1>
    <section id="energy">Energy budget</section>
  </article>
);

/** The root layout's gate around a page that renders no preview of its own. */
const layoutOnly = () => (
  <AuthProvider>
    <PremiumRouteGate>{fullPage}</PremiumRouteGate>
  </AuthProvider>
);

/** A page with a public preview, inside the root layout's gate (which steps aside). */
const withPreview = () => (
  <AuthProvider>
    <PremiumRouteGate>
      <PremiumContent
        preview={
          <PremiumPreview
            path="/space/cubesat"
            title="CubeTwin | CubeSat Battery & Energy Digital Twin"
            description="Learn CubeSat power systems with an interactive digital twin."
            structuredData={STRUCTURED}
          />
        }
      >
        {fullPage}
      </PremiumContent>
    </PremiumRouteGate>
  </AuthProvider>
);

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
  previews = true;
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

// ── Public preview (every listed route today) ──────────────────────────────

describe("required-login page with a public preview", () => {
  it("server-renders the indexable preview — title, description, structured data, topics — and never the full page", () => {
    serveSessions(ANONYMOUS);
    const html = renderToString(withPreview());
    expect(html).toContain("<h1");
    expect(html).toContain(">CubeTwin</h1>");
    expect(html).toContain("Learn CubeSat power systems with an interactive digital twin.");
    expect(html).toContain('<script type="application/ld+json">');
    expect(html).toContain("Battery state of charge");
    expect(html).toContain("Checking your sign-in");
    expect(html).not.toContain("premium-content");
    expect(html).not.toContain("Energy budget");
  });

  it("shows a signed-out visitor the preview beside the login card, with Login only", async () => {
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    expect(content()).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CubeTwin");
    expect(screen.getByRole("heading", { level: 2, name: "Login to view premium content" })).toBeInTheDocument();
    expect(screen.getByText("Learn CubeSat power systems with an interactive digital twin.")).toBeInTheDocument();
    expect(within(screen.getByRole("list")).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "Orbit sunlight", "Battery state of charge", "Fault injection",
    ]);
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Login"]);
    expect(screen.queryByText("Continue Browsing")).toBeNull();
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toHaveTextContent("Space");
    expect(screen.getByRole("link", { name: "Space" })).toHaveAttribute("href", "/space");
    expect(screen.getByRole("main")).toHaveAttribute("aria-labelledby", "premium-preview-title");
  });

  it("Login returns to the exact page, with the premium trigger and page label", async () => {
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, hostname: HOST, pathname: "/space/cubesat", search: "?mode=advanced", hash: "#energy", assign });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
    expect(assign).toHaveBeenCalledWith(`/api/auth/login?return=${RETURN}&trigger=premium_route_required&label=${LABEL}`);
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEYS.loginPending)!)).toMatchObject({ trigger: "premium_route_required" });
    expect(events().map((e) => e.name)).toEqual(expect.arrayContaining(["premium_route_gate_shown", "premium_route_login_started"]));
  });

  it("does not wait five minutes, and the optional prompt never opens over it", async () => {
    serveSessions(ANONYMOUS);
    renderPage();
    await settle();
    await settle(FIVE_MINUTES * 2);
    expect(document.querySelector("dialog[open]")).toBeNull();
  });

  it("gives a signed-in visitor the full page and no preview", async () => {
    serveSessions(SIGNED_IN);
    renderPage();
    await settle();
    expect(content()).not.toBeNull();
    expect(screen.queryByText("Login to view premium content")).toBeNull();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("returning from sign-in: reports success and scrolls to the page's #hash", async () => {
    sessionStorage.setItem(STORAGE_KEYS.loginPending, JSON.stringify({ trigger: "premium_route_required", at: Date.now() - 20_000 }));
    const scrolled = vi.fn();
    Element.prototype.scrollIntoView = scrolled;
    serveSessions(SIGNED_IN);
    renderPage();
    await settle();
    await settle(300);
    expect(events().map((e) => e.name)).toEqual(expect.arrayContaining(["login_success_return", "premium_route_login_success"]));
    expect(scrolled).toHaveBeenCalledTimes(1);
    expect(scrolled.mock.contexts[0]).toBe(document.getElementById("energy"));
  });

  it("stays locked, preview showing, while sign-in is unavailable", async () => {
    serveSessions(new Response("down", { status: 503 }), ANONYMOUS);
    renderPage();
    await settle();
    expect(content()).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("CubeTwin");
    expect(screen.getByRole("heading", { level: 2, name: "Sign-in is temporarily unavailable" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await settle();
    expect(screen.getByRole("heading", { level: 2, name: "Login to view premium content" })).toBeInTheDocument();
  });

  it("treats a session for another host as no session", async () => {
    serveSessions({ ...SIGNED_IN, domain: "ev.engineer" });
    renderPage();
    await settle();
    expect(content()).toBeNull();
  });

  function renderPage() {
    return render(withPreview());
  }
});

describe("/internships preview", () => {
  it("lists every programme track the structured data lists, linked on this host", async () => {
    pathname = "/internships";
    serveSessions(ANONYMOUS);
    const { default: InternshipsPage } = await import("@/app/internships/page");
    render(<AuthProvider>{InternshipsPage()}</AuthProvider>);
    await settle();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Engineering Internships & R&D — EV, AI, Aerospace & Space");
    const catalogue = screen.getByRole("region", { name: "Programme tracks" });
    const links = within(catalogue).getAllByRole("link");
    expect(links.map((a) => a.textContent)).toEqual(PROGRAMME_TRACKS.map((t) => t.name));
    expect(links.find((a) => a.textContent === "EV Battery Pack Design")).toHaveAttribute("href", "/internships/battery-pack-design");
    expect(links.find((a) => a.textContent === "EV Help Agent")).toHaveAttribute("href", "https://help.ev.engineer/");
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeNull();
    // Under the site Navbar: a section, not a second <main>.
    expect(screen.queryByRole("main")).toBeNull();
  });
});

// ── Layout gate (a required-login route without a public preview) ──────────

describe("layout gate, for a route without a public preview", () => {
  beforeEach(() => {
    previews = false;
  });

  it("replaces the whole page with the login card and never renders the page", async () => {
    serveSessions(ANONYMOUS);
    render(layoutOnly());
    await settle();
    expect(content()).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Login to view premium content" })).toBeInTheDocument();
    expect(screen.getByText("CubeSat / CubeTwin")).toBeInTheDocument();
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Login"]);
    expect(screen.getByRole("link", { name: "Back to Space" })).toHaveAttribute("href", "/space");
  });

  it("shows a checking panel, not the page, while the session is unknown", async () => {
    let answer: (r: Response) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => (answer = resolve))));
    render(layoutOnly());
    expect(content()).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Checking your sign-in…");
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
    await settle();
    expect(content()).toBeNull();
    await act(async () => answer(json(SIGNED_IN)));
    await settle();
    expect(content()).not.toBeNull();
  });

  it("is signed in without a membership: the page shows, protected data stays a server decision", async () => {
    serveSessions({ ...SIGNED_IN, roles: [] });
    render(layoutOnly());
    await settle();
    expect(content()).not.toBeNull();
  });

  it("gates a premium page reached by in-app navigation", async () => {
    pathname = "/space";
    serveSessions(ANONYMOUS);
    const view = render(layoutOnly());
    await settle();
    expect(content()).not.toBeNull();
    pathname = "/space/space-station";
    view.rerender(layoutOnly());
    await settle();
    expect(content()).toBeNull();
    expect(screen.getByText("Space Station")).toBeInTheDocument();
  });

  it("puts a core page's gate in the site's content area, not a full-page takeover", async () => {
    pathname = "/internships";
    serveSessions(ANONYMOUS);
    render(layoutOnly());
    await settle();
    expect(screen.queryByRole("main")).toBeNull();
    expect(screen.getByRole("region", { name: "Login to view premium content" })).toHaveAttribute("data-family", "core");
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  });
});

// ── Everywhere ──────────────────────────────────────────────────────────────

describe("other routes and hosts", () => {
  it("leaves an unconfigured page alone, whatever the session", async () => {
    pathname = "/space";
    serveSessions(ANONYMOUS);
    render(withPreview());
    expect(content()).not.toBeNull();
    await settle();
    expect(content()).not.toBeNull();
    expect(screen.queryByText("Login to view premium content")).toBeNull();
  });

  it("shows the full page on a host without a sign-in service (local development, previews)", async () => {
    vi.stubGlobal("location", { ...window.location, hostname: "localhost" });
    const fetchMock = serveSessions(ANONYMOUS);
    render(withPreview());
    await settle();
    expect(content()).not.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
