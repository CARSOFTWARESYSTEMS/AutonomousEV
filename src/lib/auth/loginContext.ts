import { routeConfigFor } from "@/config/premiumAuthRoutes";

// ── Why and where a sign-in starts ─────────────────────────────────────────
//
// Sent with Login (/api/auth/login?return=…&trigger=…&label=…) so Intern2026
// can record, on the user's activation, which page and which prompt led to
// the sign-in. Mirrors src/auth/loginContext.ts in Intern2026, which is the
// authority: it reads an unknown trigger as manual_login and keeps a label to
// 80 characters of plain text.

export type LoginTrigger =
  | "header_login"
  | "five_minute_prompt"
  | "premium_route_required"
  | "workspace_access"
  | "manual_login";

/** The triggers this site starts sign-in with. */
export type SiteLoginTrigger = "header_login" | "five_minute_prompt" | "premium_route_required";

export const SITE_LOGIN_TRIGGERS: readonly SiteLoginTrigger[] = ["header_login", "five_minute_prompt", "premium_route_required"];

export type LoginPromptType = "optional" | "required";

export function promptTypeFor(trigger: SiteLoginTrigger): LoginPromptType | null {
  if (trigger === "five_minute_prompt") return "optional";
  if (trigger === "premium_route_required") return "required";
  return null;
}

const MAX_LABEL = 80;

/**
 * The page as people know it: its label in the route table, else the
 * document title up to the brand suffix ("Space Station | EV.ENGINEER™" →
 * "Space Station"), at most 80 characters.
 */
export function pageLabelFor(pathname: string, documentTitle: string): string {
  const configured = routeConfigFor(pathname)?.label;
  const raw = configured ?? documentTitle.split(" | ")[0];
  const text = raw.replace(/\s+/g, " ").trim();
  return Array.from(text).slice(0, MAX_LABEL).join("").trim();
}

export interface LoginContext {
  trigger: SiteLoginTrigger;
  label: string;
}

/** The context of a Login click on the page the visitor is on now. */
export function currentLoginContext(trigger: SiteLoginTrigger): LoginContext {
  return { trigger, label: pageLabelFor(window.location.pathname, document.title) };
}
