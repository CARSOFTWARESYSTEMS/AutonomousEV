import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aerospace Learning Platform",
  description:
    "Aerospace is a next-generation platform focused on aviation, drones, autonomous aircraft, embedded systems, AI security, cloud security, and practical engineering. Powered by EV.ENGINEER.",
  robots: { index: false, follow: false },
};

export default function AerospaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
