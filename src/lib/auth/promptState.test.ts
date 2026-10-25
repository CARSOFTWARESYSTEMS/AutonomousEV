import { afterEach, describe, expect, it, vi } from "vitest";
import {
  LOGIN_PENDING_MS,
  markLoginPending,
  markPromptDismissed,
  markPromptShown,
  PROMPT_DELAY_MS,
  PROMPT_QUIET_MS,
  promptDueAt,
  quietPromptForSession,
  STORAGE_KEYS,
  takeLoginPending,
} from "./promptState";

const T0 = 1_800_000_000_000;

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.restoreAllMocks();
});

describe("five-minute prompt timing", () => {
  it("is due five minutes after the tab's first anonymous moment, across page loads", () => {
    expect(promptDueAt(T0)).toBe(T0 + PROMPT_DELAY_MS);
    // A later full page load in the same tab keeps the original start.
    expect(promptDueAt(T0 + 3 * 60_000)).toBe(T0 + PROMPT_DELAY_MS);
    expect(sessionStorage.getItem(STORAGE_KEYS.timerStartedAt)).toBe(String(T0));
  });

  it("stays away for a day after it was shown, in every tab", () => {
    markPromptShown(T0);
    expect(promptDueAt(T0 + 60_000)).toBeNull();
    expect(promptDueAt(T0 + PROMPT_QUIET_MS - 1)).toBeNull();
    sessionStorage.clear();
    expect(promptDueAt(T0 + PROMPT_QUIET_MS)).toBe(T0 + PROMPT_QUIET_MS + PROMPT_DELAY_MS);
  });

  it("stays away for a day after Continue Browsing", () => {
    markPromptDismissed(T0);
    expect(promptDueAt(T0 + 2 * 60 * 60_000)).toBeNull();
  });

  it("waits for a future browsing session after a sign-out", () => {
    quietPromptForSession();
    expect(promptDueAt(T0)).toBeNull();
    sessionStorage.clear(); // a new browsing session
    expect(promptDueAt(T0)).toBe(T0 + PROMPT_DELAY_MS);
  });

  it("ignores timestamps from the future or that are not numbers", () => {
    localStorage.setItem(STORAGE_KEYS.lastShown, String(T0 + 60_000));
    localStorage.setItem(STORAGE_KEYS.dismissedAt, "soon");
    sessionStorage.setItem(STORAGE_KEYS.timerStartedAt, String(T0 + 999_999));
    expect(promptDueAt(T0)).toBe(T0 + PROMPT_DELAY_MS);
  });

  it("still works when storage throws (private windows, blocked site data)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(promptDueAt(T0)).toBe(T0 + PROMPT_DELAY_MS);
    expect(() => markPromptShown(T0)).not.toThrow();
    expect(takeLoginPending(T0)).toBeNull();
  });

  it("keeps only timestamps in storage: no token, session, user or role", () => {
    markPromptShown(T0);
    markPromptDismissed(T0);
    promptDueAt(T0);
    markLoginPending("header_login", T0);
    const stored = [...Object.entries(localStorage), ...Object.entries(sessionStorage)].map(([k, v]) => `${k}=${v}`).join("\n");
    expect(stored).not.toMatch(/token|session_id|cookie|email|role|@/i);
  });
});

describe("returning from sign-in", () => {
  it("reports a recent Login click once, with its trigger", () => {
    markLoginPending("five_minute_prompt", T0);
    expect(takeLoginPending(T0 + 30_000)).toBe("five_minute_prompt");
    expect(takeLoginPending(T0 + 31_000)).toBeNull();
    markLoginPending("premium_route_required", T0);
    expect(takeLoginPending(T0 + 30_000)).toBe("premium_route_required");
  });

  it("reads a Login click stored before the triggers were renamed", () => {
    sessionStorage.setItem(STORAGE_KEYS.loginPending, JSON.stringify({ trigger: "header", at: T0 }));
    expect(takeLoginPending(T0 + 1000)).toBe("header_login");
    sessionStorage.setItem(STORAGE_KEYS.loginPending, JSON.stringify({ trigger: "prompt", at: T0 }));
    expect(takeLoginPending(T0 + 1000)).toBe("five_minute_prompt");
  });

  it("forgets a Login click older than the sign-in can last", () => {
    markLoginPending("header_login", T0);
    expect(takeLoginPending(T0 + LOGIN_PENDING_MS + 1)).toBeNull();
  });

  it("rejects anything that is not its own record", () => {
    sessionStorage.setItem(STORAGE_KEYS.loginPending, "{not json");
    expect(takeLoginPending(T0)).toBeNull();
    sessionStorage.setItem(STORAGE_KEYS.loginPending, JSON.stringify({ trigger: "evil", at: T0 }));
    expect(takeLoginPending(T0)).toBeNull();
  });
});
