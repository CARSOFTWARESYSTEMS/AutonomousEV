"use client";
// Small client pieces used by the server-rendered page: the page-view event,
// the hero's launch button and the phone's "open on desktop" actions.
import { useEffect, useState } from "react";
import { ArrowRight, Copy, Mail } from "lucide-react";
import { TOOLKIT } from "@/data/ev-battery-toolkit/content";
import { trackToolkit } from "@/lib/ev-battery-toolkit/analytics";
import { scrollToAndFocus } from "../state/device";
import { startWorkspace } from "../workspace/Workspace";
import css from "../toolkit.module.css";

export function PageViewTracker() {
  useEffect(() => {
    trackToolkit("ev_battery_toolkit_page_view");
  }, []);
  return null;
}

export function LaunchButton() {
  return (
    <button
      type="button"
      className={css.primaryButton}
      onClick={() => {
        startWorkspace("hero");
        scrollToAndFocus("explorer");
      }}
    >
      Launch 3D Toolkit <ArrowRight size={16} aria-hidden="true" />
    </button>
  );
}

export function DesktopCta() {
  const [copied, setCopied] = useState(false);
  const url = `https://aerospace.ev.engineer${TOOLKIT.route}`;
  return (
    <div className={css.desktopCta}>
      <button
        type="button"
        className={css.secondary}
        onClick={async () => {
          trackToolkit("mobile_desktop_cta_clicked", { action: "copy_link" });
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        <Copy size={15} aria-hidden="true" /> {copied ? "Link copied" : "Copy link for desktop"}
      </button>
      <a className={css.secondary} href={`mailto:?subject=${encodeURIComponent(TOOLKIT.shortName)}&body=${encodeURIComponent(`Open on a laptop or desktop: ${url}`)}`} onClick={() => trackToolkit("mobile_desktop_cta_clicked", { action: "email_link" })}>
        <Mail size={15} aria-hidden="true" /> Email me the link
      </a>
    </div>
  );
}
