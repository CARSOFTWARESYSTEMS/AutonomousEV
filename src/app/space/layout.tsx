import type { Metadata } from "next";

const TITLE = "Autonomous Spacecraft Health Mission 2040 | EV Society";
const DESCRIPTION =
  "A long-term pathway from space education and engineering internships to research and young space startups, focused on autonomous spacecraft health management and safe recovery.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://autonomous.ev.engineer/space",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://autonomous.ev.engineer/space",
    type: "website",
    locale: "en_US",
    siteName: "EV.ENGINEER",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function SpaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
