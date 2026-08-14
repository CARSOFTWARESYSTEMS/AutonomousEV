/**
 * Safely injects a JSON-LD structured-data graph without dangerouslySetInnerHTML.
 * React renders a string child of <script> as a text node (not parsed as HTML),
 * so this is XSS-safe on its own; `<` is additionally escaped as < per the
 * OWASP guidance for embedding JSON inside a <script> tag.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script type="application/ld+json">
      {json}
    </script>
  );
}
