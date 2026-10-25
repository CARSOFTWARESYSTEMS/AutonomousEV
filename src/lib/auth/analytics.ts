import { trackEvent } from "@/utils/analytics";
import type { AuthSite } from "./sites";

export type AuthEventName =
  | "login_header_click"
  | "login_prompt_shown"
  | "login_prompt_login_click"
  | "login_prompt_dismissed"
  | "login_success_return"
  | "workspace_open";

/**
 * Sign-in events through the site's existing analytics. Parameters are the
 * site, host, path (no query, which can carry personal data) and how the
 * event came about: never a name, email, role, token or session id.
 */
export function trackAuth(name: AuthEventName, site: AuthSite, params: Record<string, string> = {}): void {
  if (typeof window === "undefined") return;
  trackEvent(name, {
    site: site.id,
    hostname: window.location.hostname,
    page_path: window.location.pathname,
    ...params,
  });
}
