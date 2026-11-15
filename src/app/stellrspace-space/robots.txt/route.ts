import { ROBOTS_TXT } from "../host-files";

// aerospace.stellrspace.com/robots.txt (see ../host-files.ts).
export const dynamic = "force-static";

export function GET() {
  return new Response(ROBOTS_TXT, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
