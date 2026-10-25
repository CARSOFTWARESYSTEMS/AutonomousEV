import { trackEvent } from "@/utils/analytics";
import { pageLabelFor } from "./loginContext";
import type { AuthSite } from "./sites";

export type AuthEventName =
  | "login_header_click"
  | "login_success_return"
  | "workspace_open"
  // The optional premium prompt (five minutes into an anonymous visit).
  | "premium_login_prompt_shown"
  | "premium_login_prompt_login"
  | "premium_login_prompt_continue"
  // The required-login gate on premium routes.
  | "premium_route_gate_shown"
  | "premium_route_login_started"
  | "premium_route_login_success";

/**
 * Sign-in events through the site's existing analytics. Parameters are the
 * site, host, path (no query, which can carry personal data), the page's
 * label and how the event came about: never a name, email, role, token or
 * session id.
 */
export function trackAuth(name: AuthEventName, site: AuthSite, params: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  trackEvent(name, {
    site: site.id,
    hostname: window.location.hostname,
    page_path: window.location.pathname,
    page_label: pageLabelFor(window.location.pathname, document.title),
    ...params,
  });
}
