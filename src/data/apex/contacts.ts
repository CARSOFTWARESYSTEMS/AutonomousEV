/**
 * Who to contact, said once.
 *
 * Every email the microsite opens is addressed to both APEX and Gamyaa
 * AeroSystems, its engineering-collaboration partner — both in To, neither in cc.
 * Addresses and the telephone number are stored in parts so they are never
 * written out whole in the page source; ProtectedContact.tsx joins them in the
 * browser after hydration.
 */

export interface ContactParts {
  user: string;
  domain: string;
  tld: string;
}

export interface Contact {
  id: "apex" | "gamyaa";
  organisation: string;
  role: string;
  person: string;
  personTitle?: string;
  email: ContactParts;
  /** International digits without the plus, in display groups: ["91", "98866", "43942"]. */
  phone?: string[];
  website: string;
  websiteLabel: string;
}

export const APEX_CONTACT: Contact = {
  id: "apex",
  organisation: "APEX Rocket Systems",
  role: "Rocket System & Propulsion Program Owner",
  person: "Vibbhav Gopaal",
  personTitle: "Founder",
  email: { user: "vibbhav", domain: "apex-propulsion", tld: "com" },
  website: "https://www.apexrocketsystems.com/",
  websiteLabel: "Official website",
};

export const COLLABORATION_PARTNER_CONTACT: Contact = {
  id: "gamyaa",
  organisation: "Gamyaa AeroSystems",
  role: "Engineering collaboration · Digital engineering & quality",
  person: "Purushothama Padmanabha",
  email: { user: "gamyaa.aerosystems", domain: "gmail", tld: "com" },
  phone: ["91", "98866", "43942"],
  website: "https://www.gamyaa.in/contact",
  websiteLabel: "Contact page",
};

export const CONTACTS: readonly Contact[] = [APEX_CONTACT, COLLABORATION_PARTNER_CONTACT];

export const joinEmail = (parts: ContactParts) => `${parts.user}@${parts.domain}.${parts.tld}`;

export const phoneDisplay = (phone: string[]) => `+${phone[0]} ${phone.slice(1).join(" ")}`;
export const phoneHref = (phone: string[]) => `tel:+${phone.join("")}`;

/** The other party on every email. */
export function otherParty(contact: Contact): Contact {
  return contact.id === "apex" ? COLLABORATION_PARTNER_CONTACT : APEX_CONTACT;
}

/**
 * A mailto link addressed to `first` and to the other party, both in To
 * (comma-separated, RFC 6068). Subject and body are encoded; the addresses
 * hold only letters, dots and "@", which every mail client reads as written.
 */
export function mailto(first: Contact, options: { subject?: string; body?: string } = {}): string {
  const recipients = [joinEmail(first.email), joinEmail(otherParty(first).email)].join(",");
  const params: string[] = [];
  if (options.subject) params.push(`subject=${encodeURIComponent(options.subject)}`);
  if (options.body) params.push(`body=${encodeURIComponent(options.body)}`);
  return `mailto:${recipients}${params.length ? `?${params.join("&")}` : ""}`;
}
