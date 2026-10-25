"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { trackAuth } from "@/lib/auth/analytics";
import {
  announceSessionChange,
  markLoginPending,
  quietPromptForSession,
  STORAGE_KEYS,
  takeLoginPending,
  type LoginTrigger,
} from "@/lib/auth/promptState";
import { checkSession, endSession, type AuthUser } from "@/lib/auth/session";
import { authSiteForHost, loginHref, normalizeHostname, workspaceUrlFor, type AuthSite } from "@/lib/auth/sites";
import AuthNotice from "./AuthNotice";
import LoginPrompt from "./LoginPrompt";

/**
 * - loading: not known yet (always the state on the server and at hydration)
 * - none: this host has no sign-in service
 * - unavailable: the service gave no usable answer; Login stays hidden
 */
export type AuthStatus = "loading" | "none" | "unavailable" | "anonymous" | "authenticated";

export interface AuthNoticeMessage {
  id: number;
  text: string;
  tone: "info" | "error";
}

interface AuthState {
  status: AuthStatus;
  site: AuthSite | null;
  user: AuthUser | null;
}

interface AuthContextValue extends AuthState {
  workspaceUrl: string | null;
  /** Re-reads the session and resolves with the status it leaves. */
  refresh: () => Promise<AuthStatus>;
  /** Sends the browser to this site's sign-in, returning to the current page. */
  startLogin: (trigger: LoginTrigger) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  status: "none",
  site: null,
  user: null,
  workspaceUrl: null,
  refresh: async () => "none",
  startLogin: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

/** A tab coming back to the front re-checks at most this often; other tabs' sign-ins arrive by storage event. */
const VISIBILITY_RECHECK_MS = 15_000;

const sameUser = (a: AuthUser | null, b: AuthUser | null) =>
  a === b || (a !== null && b !== null && a.id === b.id && a.name === b.name && a.email === b.email);

const INITIAL_STATE: AuthState = { status: "loading", site: null, user: null };

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const [notice, setNotice] = useState<AuthNoticeMessage | null>(null);
  // Mirrors `state` for callbacks; only apply() changes either.
  const stateRef = useRef(INITIAL_STATE);
  const checkSeq = useRef(0);
  const lastCheckAt = useRef(0);

  const announce = useCallback((text: string, tone: AuthNoticeMessage["tone"] = "info") => {
    setNotice({ id: Date.now(), text, tone });
  }, []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const apply = useCallback((next: AuthState) => {
    const prev = stateRef.current;
    if (prev.status === next.status && prev.site === next.site && sameUser(prev.user, next.user)) return;
    stateRef.current = next;
    setState(next);
  }, []);

  const refresh = useCallback(async (): Promise<AuthStatus> => {
    const site = authSiteForHost(window.location.hostname);
    if (!site) {
      apply({ status: "none", site: null, user: null });
      return "none";
    }
    const seq = ++checkSeq.current;
    lastCheckAt.current = Date.now();
    const result = await checkSession(normalizeHostname(window.location.hostname) ?? "");
    if (seq !== checkSeq.current) return stateRef.current.status;

    const prev = stateRef.current;
    if (result.kind === "unavailable") {
      // Only the first answer decides that sign-in is unavailable; a failed re-check keeps what the visitor sees.
      if (prev.status === "loading") apply({ status: "unavailable", site, user: null });
      return stateRef.current.status;
    }

    // A Login click in this tab that has now come back: signed in, or not (failed or cancelled).
    const trigger = takeLoginPending(Date.now());
    if (result.kind === "authenticated") {
      apply({ status: "authenticated", site, user: result.user });
      if (trigger) {
        trackAuth("login_success_return", site, { trigger });
        announceSessionChange(Date.now());
      }
    } else {
      apply({ status: "anonymous", site, user: null });
      if (trigger) announce("Sign-in wasn’t completed. You can keep browsing, or log in again from the menu.");
    }
    return stateRef.current.status;
  }, [apply, announce]);

  useEffect(() => {
    // The first check, deferred a tick so it never competes with hydration.
    const first = window.setTimeout(() => void refresh(), 0);

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCheckAt.current < VISIBILITY_RECHECK_MS) return;
      void refresh();
    };
    // Back/forward cache: the page comes back as it was, possibly from the login host.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) void refresh();
    };
    // Another tab of this site signed in or out.
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.sessionChanged) void refresh();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(first);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  const startLogin = useCallback((trigger: LoginTrigger) => {
    const { site } = stateRef.current;
    // Read at click time, so the return is the page the visitor is on now, after any in-app navigation.
    const href = loginHref(window.location);
    if (!site || !href) return;
    trackAuth(trigger === "header" ? "login_header_click" : "login_prompt_login_click", site, { trigger });
    markLoginPending(trigger, Date.now());
    window.location.assign(href);
  }, []);

  const signOut = useCallback(async () => {
    const { site } = stateRef.current;
    if (!site) return;
    if (!(await endSession())) {
      announce("We couldn’t sign you out. Please try again.", "error");
      return;
    }
    checkSeq.current++;
    apply({ status: "anonymous", site, user: null });
    quietPromptForSession();
    announceSessionChange(Date.now());
    announce("You’re signed out of this site.");
  }, [apply, announce]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      workspaceUrl: state.site ? workspaceUrlFor(state.site) : null,
      refresh,
      startLogin,
      signOut,
    }),
    [state, refresh, startLogin, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {state.site && <LoginPrompt />}
      {state.site && <AuthNotice notice={notice} onDismiss={dismissNotice} />}
    </AuthContext.Provider>
  );
}
