import AerospacePage from "../aerospace/AerospacePage";

// The /aerospace page as served on aerospace.gamyaa.in: next.config.ts rewrites
// that host's /aerospace here, so the browser keeps /aerospace in the address
// bar. Same content; the top menu's home button is Gamyaa.in, not EV.ENGINEER.
// Rendered on the server per route, so no other host's brand ever flashes.
export { metadata } from "../aerospace/layout";

export default function Page() {
  return <AerospacePage brand="gamyaa" />;
}
