import AerospacePage from "../aerospace/AerospacePage";

// The /aerospace page as served on aerospace.gamyaa.in: next.config.ts rewrites
// that host's /aerospace here, so the browser keeps /aerospace in the address
// bar. Same content; the top menu's home button is Gamyaa.in, not EV.ENGINEER.
// Rendered on the server per route, so no other host's brand ever flashes.
import { aerospaceMetadata, GAMYAA_CANONICAL } from "../aerospace/seo";

// Same title, description and image as /aerospace; its own address, so a share opens on aerospace.gamyaa.in.
export const metadata = aerospaceMetadata(GAMYAA_CANONICAL);

export default function Page() {
  return <AerospacePage brand="gamyaa" />;
}
