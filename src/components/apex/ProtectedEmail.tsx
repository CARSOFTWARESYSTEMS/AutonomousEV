"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { APEX_CONTACT_PARTS } from "@/data/apex/founders";
import { trackApex } from "./analytics";

const subscribe = () => () => {};
const browserAddress = () => `${APEX_CONTACT_PARTS.user}@${APEX_CONTACT_PARTS.domain}.${APEX_CONTACT_PARTS.tld}`;
const serverAddress = () => null;

/**
 * APEX's contact address, assembled in the browser. The server-rendered HTML
 * never contains it, so simple scrapers that do not run scripts cannot
 * harvest it. The click is reported without the address.
 */
export function ProtectedEmail({
  placement,
  className,
  children,
  subject,
}: {
  placement: string;
  className?: string;
  /** Link text. Defaults to the address itself. */
  children?: ReactNode;
  subject?: string;
}) {
  // The server snapshot is null, so the address exists only in the browser, after hydration.
  const address = useSyncExternalStore(subscribe, browserAddress, serverAddress);

  if (!address) {
    return (
      <span className={className} data-email-pending="">
        {children ?? "Email APEX"}
      </span>
    );
  }

  const href = `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
  return (
    <a href={href} className={className} onClick={() => trackApex("apex_email_click", { placement })}>
      {children ?? address}
    </a>
  );
}
