/* The APEX photographs are pre-encoded to AVIF, WebP and JPEG at fixed widths
   (scripts/apex-images.mjs) and served as a <picture>, so they need no image optimiser and move unchanged to another host. */
import { imageFile, imageSrcSet, type ApexImage } from "@/data/apex/images";
import styles from "./apex.module.css";

type Props = {
  image: ApexImage;
  /** The `sizes` attribute: how wide the image is drawn at each viewport. */
  sizes: string;
  /** Fill the parent box (object-fit: cover) instead of keeping the photo's own ratio. */
  cover?: boolean;
  /** The largest-contentful image of the page: fetched first, never lazy. */
  priority?: boolean;
  /** A different photograph for phones (art direction), below `artBreakpoint`. */
  mobile?: ApexImage;
  mobileSizes?: string;
  artBreakpoint?: number;
  alt?: string;
  className?: string;
};

export function ApexPicture({ image, sizes, cover, priority, mobile, mobileSizes = "100vw", artBreakpoint = 767, alt, className }: Props) {
  const fallbackWidth = image.widths[Math.min(2, image.widths.length - 1)];
  const media = `(max-width: ${artBreakpoint}px)`;
  return (
    <picture className={`${styles.picture} ${cover ? styles.pictureCover : ""} ${className ?? ""}`}>
      {mobile && <source media={media} type="image/avif" srcSet={imageSrcSet(mobile, "avif")} sizes={mobileSizes} />}
      {mobile && <source media={media} type="image/webp" srcSet={imageSrcSet(mobile, "webp")} sizes={mobileSizes} />}
      {mobile && <source media={media} srcSet={imageSrcSet(mobile, "jpg")} sizes={mobileSizes} />}
      <source type="image/avif" srcSet={imageSrcSet(image, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={imageSrcSet(image, "webp")} sizes={sizes} />
      <img
        src={imageFile(image, fallbackWidth, "jpg")}
        srcSet={imageSrcSet(image, "jpg")}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt ?? image.alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        style={image.focus ? { objectPosition: image.focus } : undefined}
      />
    </picture>
  );
}
