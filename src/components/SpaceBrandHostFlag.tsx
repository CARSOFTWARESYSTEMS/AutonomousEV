import { STELLR_SPACE } from "@/data/space-host-brands";

/**
 * Marks <html data-space-brand="stellr"> before first paint on
 * aerospace.stellrspace.com, so the Space header shows STELLR SPACE from the
 * start instead of switching after hydration. Pages are static, so the
 * server cannot know the host; this inline script can.
 */
export default function SpaceBrandHostFlag() {
  const script = `(function(){try{var hosts=${JSON.stringify(STELLR_SPACE.hosts)};var h=location.hostname.toLowerCase().replace(/\\.$/,"");if(hosts.indexOf(h)!==-1)document.documentElement.setAttribute("data-space-brand",${JSON.stringify(STELLR_SPACE.id)})}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
