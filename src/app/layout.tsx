import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EV.ENGINEER™ | Engineering the Future of Autonomous eMobility",
  description: "Production-grade training, technical concepts, simulation-driven learning, cybersecurity insight, and engineering consulting for Autonomous EV systems by Sudarshana Karkala, Principal Architect at Thasmai Infotech Private Limited.",
  keywords: ["Autonomous EV training Singapore", "Autonomous vehicle consulting", "AV simulations", "AV cybersecurity", "EV battery health diagnostics for autonomous vehicles", "CETRAN AV ecosystem", "Singapore autonomous vehicle training", "Autonomous passenger taxi design", "Airport cargo autonomous EV design", "Sudarshana Karkala", "Sudarshana Karkala EV Engineer", "Sudarshana Karkala iTelematics", "Sudarshana Karkala Principal Architect"],
  authors: [{ name: "Sudarshana Karkala" }],
  creator: "Sudarshana Karkala",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <GoogleAnalytics />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
