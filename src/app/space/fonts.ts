import { Manrope, Inter } from "next/font/google";
export const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-space-manrope",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space-inter",
});

export const FONT_MANROPE = "var(--font-space-manrope)";
export const FONT_INTER = "var(--font-space-inter)";
