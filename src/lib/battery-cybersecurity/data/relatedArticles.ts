import type { RelatedArticle } from "../types";

// Every href here is a real, existing route (cross-checked against
// src/app/sitemap.ts) — no invented internal links.
export const RELATED_ARTICLES: RelatedArticle[] = [
  {
    id: "cybersecurity-in-av",
    title: "Cybersecurity in Autonomous Vehicles",
    href: "/cybersecurity",
    description: "The broader attack-surface, in-vehicle-network, and V2X cybersecurity picture this battery-specific page sits within.",
  },
  {
    id: "battery-cybersecurity-internship",
    title: "EV Battery Intelligence & Cybersecurity Internship",
    href: "/internships/battery-cybersecurity",
    description: "A 12-month internship track covering battery intrusion detection, secure telemetry, and BMS threat modelling.",
  },
  {
    id: "passenger-air-taxi-architecture",
    title: "Passenger Air Taxi Component Architecture",
    href: "/design-development/passenger-taxi",
    description: "The full eVTOL component architecture — battery, propulsion, flight control, avionics, and cybersecurity — this page's parent.",
  },
  {
    id: "battery-aadhaar",
    title: "Battery Pack Aadhaar System",
    href: "/internships/battery-aadhaar",
    description: "Digital identity protocols for battery lifecycle tracking — directly related to the Battery Identity trust question on this page.",
  },
  {
    id: "trust-center",
    title: "EV.ENGINEER™ Trust Center",
    href: "/trust-center",
    description: "Verified credibility sources, reviews, and professional recognition for EV.ENGINEER™.",
  },
  {
    id: "airport-cargo-ev",
    title: "Autonomous Airport Cargo EV",
    href: "/design-development/airport-cargo",
    description: "A sibling design-and-development programme with its own duty-cycle and energy-system considerations.",
  },
];
