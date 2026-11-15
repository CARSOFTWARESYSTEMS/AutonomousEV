import { brandGraph } from "@/lib/host-brand";
import { renderHostBrand } from "@/lib/host-brand-render";

/**
 * Safely injects a JSON-LD structured-data graph without dangerouslySetInnerHTML.
 * React renders a string child of <script> as a text node (not parsed as HTML),
 * so this is XSS-safe on its own; `<` is additionally escaped as < per the
 * OWASP guidance for embedding JSON inside a <script> tag.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  // On a host with its own brand (src/app/stellrspace-space), the graph names it. Rendered in a client
  // component, the parent passes a branded graph itself: there this reads no brand.
  const brand = renderHostBrand();
  const json = JSON.stringify(brand ? brandGraph(data, brand) : data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json">
      {json}
    </script>
  );
}
