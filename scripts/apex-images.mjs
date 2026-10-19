// Builds the optimised APEX Rocket Systems image set from the untouched
// originals in public/apexrocketsystems/original/. The originals are never
// written to. Run from the repository root:
//
//   node scripts/apex-images.mjs
//
// Output (all metadata stripped, so no camera or location data is published):
//   public/apexrocketsystems/hardware/apex-hardware-NN-<width>.{avif,webp,jpg}
//   public/apexrocketsystems/brand/apex-logo-{white,black}-<width>.{png,webp}
//   public/apexrocketsystems/brand/apex-mark-white.png
//   public/apexrocketsystems/hero/apex-og.jpg            (1200x630 social card)
//   src/app/space/partners/apexrocketsystems/{icon,apple-icon}.png
//
// The widths written for each photo are listed in src/data/apex/images.ts,
// and a test checks that every file it names exists.
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SRC = path.join(ROOT, "public/apexrocketsystems/original");
const OUT = path.join(ROOT, "public/apexrocketsystems");
const ICON_DIR = path.join(ROOT, "src/app/space/partners/apexrocketsystems");

/** Original file → the widths to publish. Never wider than the original. */
const PHOTOS = {
  "1.jpg": [480, 768, 1080, 1536],
  "2.jpg": [480, 768, 1080, 1536],
  "3.jpg": [480, 768, 1080, 1536],
  "4.jpg": [480, 768, 1080, 1536],
  "5.jpg": [480, 768, 1080, 1280],
  "6.jpg": [640, 1024, 1600, 2048],
  "7.jpg": [480, 768, 1080, 1536],
  "8.png": [279],
  "9.jpg": [480, 768, 1080, 1280],
};

const GRAPHITE = { r: 5, g: 6, b: 7, alpha: 1 };

async function photos() {
  await mkdir(path.join(OUT, "hardware"), { recursive: true });
  for (const [file, widths] of Object.entries(PHOTOS)) {
    const id = String(parseInt(file, 10)).padStart(2, "0");
    for (const width of widths) {
      const base = path.join(OUT, "hardware", `apex-hardware-${id}-${width}`);
      const pipeline = () => sharp(path.join(SRC, file)).rotate().resize({ width, withoutEnlargement: true });
      await pipeline().avif({ quality: 52, effort: 6 }).toFile(`${base}.avif`);
      await pipeline().webp({ quality: 74 }).toFile(`${base}.webp`);
      await pipeline().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${base}.jpg`);
    }
    console.log("photo", file, widths.join(","));
  }
}

async function brand() {
  await mkdir(path.join(OUT, "brand"), { recursive: true });
  const variants = { white: "logo-2.png", black: "logo-1.png" };
  for (const [tone, file] of Object.entries(variants)) {
    // 1280 is the supplied original's own resolution: sharp on retina screens at the masthead size.
    for (const width of [320, 640, 1280]) {
      const base = path.join(OUT, "brand", `apex-logo-${tone}-${width}`);
      const pipeline = () => sharp(path.join(SRC, file)).trim().resize({ width });
      await pipeline().png({ compressionLevel: 9 }).toFile(`${base}.png`);
      await pipeline().webp({ quality: 90, alphaQuality: 100 }).toFile(`${base}.webp`);
    }
  }
  // The "A" mark alone: columns 17–214 of the 1280px-wide logo (measured).
  const markArea = await sharp(path.join(SRC, "logo-2.png")).extract({ left: 17, top: 0, width: 198, height: 158 }).png().toBuffer();
  await sharp(markArea).trim().png().toFile(path.join(OUT, "brand", "apex-mark-white.png"));
  console.log("brand logos");
}

async function icons() {
  const mark = await sharp(path.join(OUT, "brand", "apex-mark-white.png")).resize({ height: 300 }).png().toBuffer();
  for (const [name, size] of [["icon.png", 512], ["apple-icon.png", 180]]) {
    const inner = await sharp(mark).resize({ height: Math.round(size * 0.58) }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: GRAPHITE } })
      .composite([{ input: inner, gravity: "center" }])
      .png()
      .toFile(path.join(ICON_DIR, name));
  }
  console.log("icons");
}

async function socialCard() {
  await mkdir(path.join(OUT, "hero"), { recursive: true });
  const W = 1200;
  const H = 630;
  const photo = await sharp(path.join(SRC, "6.jpg")).rotate().resize({ width: 760, height: H, fit: "cover", position: "centre" }).toBuffer();
  const logo = await sharp(path.join(SRC, "logo-2.png")).trim().resize({ width: 330 }).png().toBuffer();
  const text = Buffer.from(`
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#050607" stop-opacity="1"/>
          <stop offset="0.46" stop-color="#050607" stop-opacity="1"/>
          <stop offset="0.72" stop-color="#050607" stop-opacity="0.35"/>
          <stop offset="1" stop-color="#050607" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#fade)"/>
      <rect x="72" y="236" width="44" height="3" fill="#FF6A1A"/>
      <text x="72" y="300" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="60" font-weight="800" letter-spacing="1" fill="#F5F5F2">ENGINEERED</text>
      <text x="72" y="366" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="60" font-weight="800" letter-spacing="1" fill="#F5F5F2">TO ASCEND.</text>
      <text x="72" y="424" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="24" fill="#D6D8DA">From propulsion hardware toward validated rocket systems.</text>
      <text x="72" y="560" font-family="Menlo, Courier New, monospace" font-size="17" letter-spacing="3" fill="#9a9fa5">CONCEPT · ENGINEERING COLLABORATION PROPOSAL</text>
    </svg>`);
  await sharp({ create: { width: W, height: H, channels: 4, background: GRAPHITE } })
    .composite([
      { input: photo, left: W - 760, top: 0 },
      { input: text, left: 0, top: 0 },
      { input: logo, left: 72, top: 92 },
    ])
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, "hero", "apex-og.jpg"));
  await writeFile(path.join(OUT, "hero", "README.txt"), "apex-og.jpg is generated by scripts/apex-images.mjs from original/6.jpg and original/logo-2.png.\n");
  console.log("social card");
}

// `node scripts/apex-images.mjs brand` rebuilds everything except the photos, which take ~40s.
const only = process.argv[2];
if (only !== "brand") await photos();
await brand();
await icons();
await socialCard();
