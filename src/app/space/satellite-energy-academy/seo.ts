import type { Metadata } from "next";
export const CANONICAL = "https://aerospace.ev.engineer/space/satellite-energy-academy";
export const TITLE = "Satellite Energy Academy | Learn Physics & Mathematics Through Space Missions";
export const DESCRIPTION = "Learn physics, mathematics, solar energy, batteries and satellite engineering through fun interactive experiments, 3D missions and beginner-friendly challenges.";
const image = { url: `${CANONICAL}/opengraph-image`, width: 1200, height: 630, alt: "Satellite Energy Academy — Play with Physics. Discover Mathematics. Power a Satellite." };
export const metadata: Metadata = {
  metadataBase: new URL("https://aerospace.ev.engineer"),
  title: { absolute: TITLE }, description: DESCRIPTION,
  alternates: { canonical: CANONICAL },
  keywords: ["satellite energy", "interactive physics", "learn mathematics", "solar panel experiment", "beginner space missions"],
  openGraph: { title: TITLE, description: DESCRIPTION, url: CANONICAL, type: "website", siteName: "EV.ENGINEER", images: [image] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [image] },
};
