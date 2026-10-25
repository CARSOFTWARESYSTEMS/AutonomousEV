import { hostSiteIds } from "@/lib/auth/sites";

/**
 * Marks <html data-auth-site="…"> before first paint on hosts with a sign-in
 * service, so the header lays out the Login slot from the start and never
 * shifts when the session answer arrives. Pages are static, so the server
 * cannot know the host; this inline script can.
 */
export default function AuthHostFlag() {
  const script = `(function(){try{var m=${JSON.stringify(hostSiteIds())};var h=location.hostname.toLowerCase().replace(/\\.$/,"");if(Object.prototype.hasOwnProperty.call(m,h))document.documentElement.setAttribute("data-auth-site",m[h])}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
