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
  title: "EV.ENGINEER™ | Lithium-Ion EV Battery Intelligence Platform",
  description: "Lithium-Ion EV Battery Intelligence Platform. Building intelligent battery ecosystems through AI-driven diagnostics, thermal safety systems, battery lifecycle intelligence, second-life battery technologies, and deep-tech engineering innovation.",
  keywords: ["Lithium-Ion EV Battery Intelligence", "EV Battery Diagnostics", "Battery AI", "Battery Safety", "Battery Analytics", "Battery Lifecycle Intelligence", "Second-Life Batteries", "BMS Intelligence", "Battery Thermal Intelligence", "EV Battery Research", "Battery Intelligence Platform", "Sudarshana Karkala", "Autonomous EV training Singapore"],
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
