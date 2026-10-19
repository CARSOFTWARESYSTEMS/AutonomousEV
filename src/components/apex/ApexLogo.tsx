/* A pre-encoded brand mark at three resolutions; see ApexPicture.tsx. */
import { APEX_LOGO } from "@/data/apex/images";

/**
 * The APEX Rocket Systems wordmark, white for the dark theme or black for paper.
 * Its height is set in CSS by `className` (the masthead changes it by
 * breakpoint), or by `height` in pixels; the width always follows the logo's
 * own proportions, and the browser picks the sharpest file for the screen.
 */
export function ApexLogo({
  tone = "white",
  height,
  className,
  sizes,
  alt = "APEX Rocket Systems",
  priority,
}: {
  tone?: "white" | "black";
  height?: number;
  className?: string;
  /** Rendered width at each breakpoint, for the browser's choice of file. */
  sizes?: string;
  alt?: string;
  priority?: boolean;
}) {
  const logo = APEX_LOGO[tone];
  const width = height ? Math.round(height * APEX_LOGO.ratio) : undefined;
  const resolvedSizes = sizes ?? (width ? `${width}px` : "360px");
  return (
    <picture className={className} style={{ display: "block", lineHeight: 0 }}>
      <source type="image/webp" srcSet={logo.webpSet} sizes={resolvedSizes} />
      <img
        src={logo.png}
        srcSet={logo.pngSet}
        sizes={resolvedSizes}
        alt={alt}
        width={logo.width}
        height={logo.height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        style={height ? { height, width: "auto", display: "block" } : { display: "block" }}
      />
    </picture>
  );
}
