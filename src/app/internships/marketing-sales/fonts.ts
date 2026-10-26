import { Manrope } from "next/font/google";

/** The display face the aerospace pages use, loaded here for this page's headings and figures. */
export const display = Manrope({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-rv-display",
});
