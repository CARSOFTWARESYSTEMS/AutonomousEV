import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EV.ENGINEER™ | Engineering the Future of Autonomous eMobility",
  description: "Production-grade training, technical concepts, simulation-driven learning, cybersecurity insight, and engineering consulting for Autonomous EV systems by iTelematics.",
  keywords: ["Autonomous EV training Singapore", "Autonomous vehicle consulting", "AV simulations", "AV cybersecurity", "EV battery health diagnostics for autonomous vehicles", "CETRAN AV ecosystem", "Singapore autonomous vehicle training", "Autonomous passenger taxi design", "Airport cargo autonomous EV design"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
