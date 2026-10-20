/**
 * Audit of the APEX photographs supplied for this concept experience, and the optimised
 * files made from them by scripts/apex-images.mjs.
 *
 * The audit names only what can be seen. No component is identified as a
 * turbopump, injector, chamber, gas generator, valve or igniter: that needs
 * APEX's confirmation, so every caption stays at "propulsion development
 * hardware" or "engineering hardware". Originals are kept unchanged in
 * public/apexrocketsystems/original/.
 */
import { apexAsset } from "./site";

export type Confidence = "LOW" | "MEDIUM" | "HIGH";

export interface ApexImage {
  id: string;
  /** The file as supplied, in original/. */
  file: string;
  width: number;
  height: number;
  /** Widths published in hardware/, smallest first. */
  widths: number[];
  probableSubject: string;
  /** Confidence in `probableSubject`, not in any component identification. */
  confidence: Confidence;
  orientation: "portrait" | "landscape";
  visualQuality: string;
  recommendedUsage: string;
  publicCaption: string;
  alt: string;
  ownerConfirmationRequired: true;
  ownerQuestion: string;
  /** CSS object-position for crops. */
  focus?: string;
}

const ASK = "Confirm the caption, and whether this is the 5 kN-class demonstrator.";

export const APEX_IMAGES: readonly ApexImage[] = [
  {
    id: "01",
    file: "1.jpg",
    width: 1536,
    height: 2048,
    widths: [480, 768, 1080, 1536],
    probableSubject: "The assembled propulsion hardware seen in 05, standing on a workshop floor among tools and parts.",
    confidence: "HIGH",
    orientation: "portrait",
    visualQuality: "Medium — cluttered floor and mixed daylight; strong sense of hands-on work.",
    recommendedUsage: "Hardware gallery: workshop context.",
    publicCaption: "APEX propulsion development hardware in the workshop.",
    alt: "APEX propulsion development hardware standing on a workshop floor, with tubing, cabling and a spherical vessel above a large conical section.",
    ownerConfirmationRequired: true,
    ownerQuestion: ASK,
    focus: "50% 45%",
  },
  {
    id: "02",
    file: "2.jpg",
    width: 1536,
    height: 2048,
    widths: [480, 768, 1080, 1536],
    probableSubject: "Top-down view of the same hardware lying on its side: tube routing, fittings, cable harnesses and a spherical vessel.",
    confidence: "MEDIUM",
    orientation: "portrait",
    visualQuality: "Medium — sharp detail, busy floor background.",
    recommendedUsage: "Hardware gallery: plumbing and harness detail.",
    publicCaption: "Top view of APEX propulsion development hardware, showing tube routing and harnessing.",
    alt: "Top-down view of APEX propulsion development hardware on a wooden floor, with bent stainless tubing, fittings, cabling and a spherical vessel.",
    ownerConfirmationRequired: true,
    ownerQuestion: ASK,
  },
  {
    id: "03",
    file: "3.jpg",
    width: 1536,
    height: 2048,
    widths: [480, 768, 1080, 1536],
    probableSubject: "Close-up of the hardware with sensor cabling, connectors and fluid fittings attached.",
    confidence: "MEDIUM",
    orientation: "portrait",
    visualQuality: "Good — close, well lit, clear engineering detail.",
    recommendedUsage: "Physical validation and instrumentation sections.",
    publicCaption: "APEX propulsion development hardware: close-up of cabling and fluid fittings.",
    alt: "Close-up of APEX propulsion development hardware with flanged metal sections, fluid fittings, yellow connectors and cabling.",
    ownerConfirmationRequired: true,
    ownerQuestion: ASK,
  },
  {
    id: "04",
    file: "4.jpg",
    width: 1536,
    height: 2048,
    widths: [480, 768, 1080, 1536],
    probableSubject: "Detail view of the assembled hardware with a spherical vessel in the foreground and cabled assemblies behind.",
    confidence: "MEDIUM",
    orientation: "portrait",
    visualQuality: "Good — shallow depth of field, calm background.",
    recommendedUsage: "Hardware gallery; system-of-systems section.",
    publicCaption: "APEX propulsion development hardware — detail.",
    alt: "Detail of APEX propulsion development hardware: a spherical vessel in the foreground, metal assemblies, tubing and cabling behind.",
    ownerConfirmationRequired: true,
    ownerQuestion: ASK,
  },
  {
    id: "05",
    file: "5.jpg",
    width: 1280,
    height: 1707,
    widths: [480, 768, 1080, 1280],
    probableSubject: "The complete assembled hardware on a workbench in front of the APEX Rocket Systems logo and the Indian flag.",
    confidence: "HIGH",
    orientation: "portrait",
    visualQuality: "Good — whole assembly in frame, clean background, APEX branding visible.",
    recommendedUsage: "Built at APEX: the primary evidence image.",
    publicCaption: "APEX propulsion development hardware at APEX Rocket Systems.",
    alt: "APEX propulsion development hardware on a white workbench, in front of an APEX Rocket Systems poster and the Indian flag.",
    ownerConfirmationRequired: true,
    ownerQuestion: ASK,
    focus: "50% 55%",
  },
  {
    id: "06",
    file: "6.jpg",
    width: 2048,
    height: 1536,
    widths: [640, 1024, 1600, 2048],
    probableSubject: "Low-angle landscape view of the assembled hardware, polished metal sections and a conical section, with the Indian flag behind.",
    confidence: "HIGH",
    orientation: "landscape",
    visualQuality: "Very good — strong composition, even light, the only landscape image.",
    recommendedUsage: "Hero (desktop) and social card.",
    publicCaption: "APEX propulsion development hardware.",
    alt: "Low-angle view of APEX propulsion development hardware: polished metal sections, cabling and a large conical section, with the Indian flag in the background.",
    ownerConfirmationRequired: true,
    ownerQuestion: ASK,
    focus: "60% 50%",
  },
  {
    id: "07",
    file: "7.jpg",
    width: 1536,
    height: 2048,
    widths: [480, 768, 1080, 1536],
    probableSubject: "Front view of the assembled hardware on a bench, background blurred.",
    confidence: "HIGH",
    orientation: "portrait",
    visualQuality: "Good — subject isolated by shallow depth of field.",
    recommendedUsage: "Hero (mobile).",
    publicCaption: "APEX propulsion development hardware.",
    alt: "Front view of APEX propulsion development hardware on a bench, with tubing, cabling and yellow connectors against a blurred background.",
    ownerConfirmationRequired: true,
    ownerQuestion: ASK,
    focus: "50% 40%",
  },
  {
    id: "08",
    file: "8.png",
    width: 279,
    height: 440,
    widths: [279],
    probableSubject: "A smaller hardware assembly — a tapered metal section above a conical section — without its plumbing.",
    confidence: "LOW",
    orientation: "portrait",
    visualQuality: "Low — 279 px wide; usable only as a small thumbnail.",
    recommendedUsage: "Hardware gallery thumbnail only.",
    publicCaption: "APEX engineering hardware before integration.",
    alt: "A tapered metal assembly mounted above a conical metal section, on a wooden floor.",
    ownerConfirmationRequired: true,
    ownerQuestion: "Confirm the caption, and supply a higher-resolution original if one exists.",
  },
  {
    id: "09",
    file: "9.jpg",
    width: 1280,
    height: 1707,
    widths: [480, 768, 1080, 1280],
    probableSubject: "Individual machined and fabricated parts laid out on a bench: plates, bearings, small fittings and a cylindrical part.",
    confidence: "MEDIUM",
    orientation: "portrait",
    visualQuality: "Good — clear parts layout; shows manufacturing work.",
    recommendedUsage: "Manufacturing and digital quality thread sections.",
    publicCaption: "APEX engineering hardware: components during build.",
    alt: "Machined and fabricated metal components laid out on a dark bench, including flanged plates, bearings and small fittings.",
    ownerConfirmationRequired: true,
    ownerQuestion: "Confirm the caption. Component names are not published without APEX's confirmation.",
  },
];

export function apexImage(id: string): ApexImage {
  const found = APEX_IMAGES.find((image) => image.id === id);
  if (!found) throw new Error(`Unknown APEX image: ${id}`);
  return found;
}

export type ImageFormat = "avif" | "webp" | "jpg";

export function imageFile(image: ApexImage, width: number, format: ImageFormat): string {
  return apexAsset(`hardware/apex-hardware-${image.id}-${width}.${format}`);
}

export function imageSrcSet(image: ApexImage, format: ImageFormat): string {
  return image.widths.map((width) => `${imageFile(image, width, format)} ${width}w`).join(", ");
}

const logoSet = (tone: "white" | "black", format: "png" | "webp") =>
  [320, 640, 1280].map((width) => `${apexAsset(`brand/apex-logo-${tone}-${width}.${format}`)} ${width}w`).join(", ");

/** The wordmark at three resolutions; 1280 is the supplied original's own width. Width ÷ height = 1280 ÷ 157. */
export const APEX_LOGO = {
  ratio: 1280 / 157,
  white: { png: apexAsset("brand/apex-logo-white-1280.png"), pngSet: logoSet("white", "png"), webpSet: logoSet("white", "webp"), width: 1280, height: 157 },
  black: { png: apexAsset("brand/apex-logo-black-1280.png"), pngSet: logoSet("black", "png"), webpSet: logoSet("black", "webp"), width: 1280, height: 157 },
  socialCard: { url: apexAsset("hero/apex-og.jpg"), width: 1200, height: 630 },
} as const;
