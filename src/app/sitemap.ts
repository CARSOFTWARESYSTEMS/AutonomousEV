import type { MetadataRoute } from "next";

const BASE_URL = "https://autonomous.ev.engineer";

const ROUTES = [
  "/",
  "/about",
  "/about/sudarshana-karkala",
  "/trust-center",
  "/av-concepts",
  "/challenges",
  "/consulting",
  "/contact",
  "/corporate-training",
  "/cybersecurity",
  "/design-development",
  "/design-development/airport-cargo",
  "/design-development/passenger-taxi",
  "/design-development/passenger-taxi/battery-cybersecurity",
  "/developer-portal",
  "/ecosystem",
  "/ecosystem/singapore",
  "/ev-battery-talent-network",
  "/ev-career",
  "/insights/customer-discovery-toolkit",
  "/internships",
  "/internships/battery-aadhaar",
  "/internships/battery-circular-economy",
  "/internships/battery-cybersecurity",
  "/internships/battery-diagnostics-12-week-plan",
  "/internships/battery-fire-prevention",
  "/internships/battery-pack-design",
  "/internships/ev-help-agent",
  "/internships/ev-help-agent/usecases",
  "/internships/miscellaneous/startup",
  "/internships/roadmap",
  "/internships/training-internship",
  "/si-ems",
  "/space",
  "/technical-concepts",
  "/workshop-gallery",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/trust-center" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/trust-center" ? 0.8 : 0.6,
  }));
}
