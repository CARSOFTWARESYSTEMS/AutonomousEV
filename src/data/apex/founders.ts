/**
 * The founders of APEX Rocket Systems, as supplied by APEX for this concept experience.
 * Titles, education, past employers and specialisations are not published
 * until APEX supplies them. No portrait has been supplied, so cards show the
 * founder's initials.
 */
export interface Founder {
  id: string;
  name: string;
  initials: string;
  /** The confirmed title. "Founder" is what has been supplied. */
  title: string;
  linkedin?: string;
  portrait?: string;
}

export const FOUNDERS: readonly Founder[] = [
  {
    id: "vibbhav-gopaal",
    name: "Vibbhav Gopaal",
    initials: "VG",
    title: "Founder",
    linkedin: "https://www.linkedin.com/in/vibbhav-gopaal/",
  },
  {
    id: "arcchit-gopaal",
    name: "Arcchit Gopaal",
    initials: "AG",
    title: "Founder",
  },
];
