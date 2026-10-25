// ── Browser storage for the sign-in prompt: UX state only ──────────────────
//
// When the prompt last showed, when it was dismissed, when this tab's
// five-minute clock started, and whether a Login click is awaiting its
// return. Never a token, session id, code or identity: the session is the
// site's HttpOnly cookie, read from /api/auth/session.
//
// Storage can be missing or throw (private windows, blocked site data); every
// access is guarded and the prompt then simply behaves as on a first visit.

/** Anonymous browsing time before the prompt may open. */
export const PROMPT_DELAY_MS = 5 * 60_000;
/** Once shown or dismissed, the prompt stays away this long, in every tab. */
export const PROMPT_QUIET_MS = 24 * 60 * 60_000;
/** A Login click older than this no longer counts as returning from sign-in (Intern2026's state lifetime). */
export const LOGIN_PENDING_MS = 10 * 60_000;

export const STORAGE_KEYS = {
  /** localStorage: when the prompt last opened. */
  lastShown: "auth_prompt_last_shown",
  /** localStorage: when the visitor last chose Continue Browsing or closed it. */
  dismissedAt: "auth_prompt_dismissed_at",
  /** sessionStorage: when this tab's five minutes started, so full page loads keep counting. */
  timerStartedAt: "auth_prompt_timer_started_at",
  /** sessionStorage: no prompt for the rest of this browser session (set on sign-out). */
  quietThisSession: "auth_prompt_quiet",
  /** sessionStorage: a Login click awaiting its return ({ trigger, at }). */
  loginPending: "auth_login_pending",
  /** localStorage: a timestamp other tabs watch to re-check the session. */
  sessionChanged: "auth_session_changed",
} as const;

export type LoginTrigger = "header" | "prompt";

type Area = "local" | "session";

function area(kind: Area): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function read(kind: Area, key: string): string | null {
  try {
    return area(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(kind: Area, key: string, value: string): void {
  try {
    area(kind)?.setItem(key, value);
  } catch {
    // UX state only: losing it is harmless.
  }
}

function remove(kind: Area, key: string): void {
  try {
    area(kind)?.removeItem(key);
  } catch {
    // As above.
  }
}

function readTime(kind: Area, key: string): number | null {
  const value = Number(read(kind, key));
  return Number.isFinite(value) && value > 0 ? value : null;
}

/**
 * When the prompt may open in this tab, or null when it should not open at
 * all (shown or dismissed within a day, or quiet for this session). The first
 * call in a tab starts its five-minute clock.
 */
export function promptDueAt(now: number): number | null {
  if (read("session", STORAGE_KEYS.quietThisSession) === "1") return null;
  for (const key of [STORAGE_KEYS.lastShown, STORAGE_KEYS.dismissedAt]) {
    const at = readTime("local", key);
    if (at !== null && at <= now && now - at < PROMPT_QUIET_MS) return null;
  }
  let started = readTime("session", STORAGE_KEYS.timerStartedAt);
  if (started === null || started > now) {
    started = now;
    write("session", STORAGE_KEYS.timerStartedAt, String(now));
  }
  return started + PROMPT_DELAY_MS;
}

export function markPromptShown(now: number): void {
  write("local", STORAGE_KEYS.lastShown, String(now));
}

export function markPromptDismissed(now: number): void {
  write("local", STORAGE_KEYS.dismissedAt, String(now));
}

/** After a sign-out the prompt waits for a future browsing session. */
export function quietPromptForSession(): void {
  write("session", STORAGE_KEYS.quietThisSession, "1");
}

export function markLoginPending(trigger: LoginTrigger, now: number): void {
  write("session", STORAGE_KEYS.loginPending, JSON.stringify({ trigger, at: now }));
}

/** The trigger of a recent Login click in this tab, consumed on read; null if there was none. */
export function takeLoginPending(now: number): LoginTrigger | null {
  const raw = read("session", STORAGE_KEYS.loginPending);
  if (raw === null) return null;
  remove("session", STORAGE_KEYS.loginPending);
  try {
    const value = JSON.parse(raw) as { trigger?: unknown; at?: unknown };
    const at = typeof value.at === "number" ? value.at : NaN;
    if (!(now - at >= 0 && now - at <= LOGIN_PENDING_MS)) return null;
    return value.trigger === "header" || value.trigger === "prompt" ? value.trigger : null;
  } catch {
    return null;
  }
}

/** Tells this site's other tabs to re-check the session. */
export function announceSessionChange(now: number): void {
  write("local", STORAGE_KEYS.sessionChanged, String(now));
}
