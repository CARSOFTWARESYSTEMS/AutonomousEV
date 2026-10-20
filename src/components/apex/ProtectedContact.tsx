"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { CONTACTS, joinEmail, mailto, phoneDisplay, phoneHref, type Contact } from "@/data/apex/contacts";
import { trackApex } from "./analytics";

/*
 * Contact details assembled in the browser. The server-rendered HTML never
 * contains an address or the telephone number, so simple scrapers that do not
 * run scripts cannot harvest them. Clicks are reported without the details.
 *
 * Server components pass only a contact id: a whole Contact passed as a prop
 * would be serialised into the page's HTML (the RSC payload) and expose it.
 */

type ContactId = Contact["id"];
const contactById = (id: ContactId): Contact => CONTACTS.find((c) => c.id === id)!;

const subscribe = () => () => {};
const onServer = () => false;
const inBrowser = () => true;

function useHydrated(): boolean {
  // False during the server render and hydration, true afterwards.
  return useSyncExternalStore(subscribe, inBrowser, onServer);
}

/** An email link addressed to `contact` and the other party, both in To (see contacts.ts). */
export function ProtectedEmail({
  contactId = "apex",
  placement,
  className,
  children,
  subject,
}: {
  contactId?: ContactId;
  placement: string;
  className?: string;
  /** Link text. Defaults to the address itself. */
  children?: ReactNode;
  subject?: string;
}) {
  const hydrated = useHydrated();
  const contact = contactById(contactId);
  if (!hydrated) {
    return (
      <span className={className} data-email-pending="">
        {children ?? `Email ${contact.organisation}`}
      </span>
    );
  }
  return (
    <a href={mailto(contact, { subject })} className={className} onClick={() => trackApex("apex_email_click", { placement, contact_id: contact.id })}>
      {children ?? joinEmail(contact.email)}
    </a>
  );
}

/** A telephone link, for contacts that publish a number. */
export function ProtectedPhone({ contactId, placement, className, children }: { contactId: ContactId; placement: string; className?: string; children?: ReactNode }) {
  const hydrated = useHydrated();
  const contact = contactById(contactId);
  if (!contact.phone) return null;
  if (!hydrated) {
    return (
      <span className={className} data-phone-pending="">
        {children ?? "Telephone"}
      </span>
    );
  }
  return (
    <a href={phoneHref(contact.phone)} className={className} onClick={() => trackApex("apex_phone_click", { placement, contact_id: contact.id })}>
      {children ?? phoneDisplay(contact.phone)}
    </a>
  );
}
