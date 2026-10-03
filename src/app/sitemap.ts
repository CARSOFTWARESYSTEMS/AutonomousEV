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
  "/internships/AegisCAN",
  "/internships/battery-aadhaar",
  "/internships/battery-circular-economy",
  "/internships/battery-cybersecurity",
  "/internships/battery-diagnostics-12-week-plan",
  "/internships/battery-fire-prevention",
  "/internships/battery-pack-design",
  "/internships/ev-help-agent",
  "/internships/ev-help-agent/usecases",
  "/internships/evAutoRickshaw",
  "/internships/miscellaneous/startup",
  "/internships/roadmap",
  "/internships/training-internship",
  "/si-ems",
  "/space",
  "/space/2026-INSPACe-ROCKETRY-059",
  "/technical-concepts",
  "/workshop-gallery",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const existing: MetadataRoute.Sitemap = ROUTES.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/trust-center" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/trust-center" ? 0.8 : 0.6,
  }));
  return [
    ...existing,
    { url: "https://aerospace.ev.engineer/space/cubesat", lastModified: "2026-09-12", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aerospace.ev.engineer/space/model-rocketry", lastModified: "2026-09-14", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aerospace.ev.engineer/space/everyday-applications", lastModified: "2026-09-14", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aerospace.ev.engineer/space/space-station", lastModified: "2026-09-25", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aerospace.ev.engineer/space/satellite-engineering", lastModified: "2026-09-29", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aerospace.ev.engineer/space/satellite-engineering/interactive-3d", lastModified: "2026-10-01", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aerospace.ev.engineer/aerospace/uflight-3d", lastModified: "2026-10-01", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aerospace.ev.engineer/space/rocket-engine-digital-twin", lastModified: "2026-10-03", changeFrequency: "monthly", priority: 0.8 },
  ];
}
