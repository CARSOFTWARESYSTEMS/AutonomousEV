import { Archivo, IBM_Plex_Mono } from "next/font/google";

/** Display face: Archivo with its width axis, set wide for headings. */
export const apexDisplay = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-apex-display",
  display: "swap",
});

/** Technical labels and record fields. */
export const apexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-apex-mono",
  display: "swap",
  // Small labels only; not preloaded, so it never competes with the hero photograph.
  preload: false,
});
