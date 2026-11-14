import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SpaceBrandHostFlag from "./SpaceBrandHostFlag";

/** The inline script, run against a page on `hostname`; returns <html data-space-brand>. */
function brandOn(hostname: string): string | null {
  const html = renderToStaticMarkup(<SpaceBrandHostFlag />);
  const script = html.replace(/^<script>/, "").replace(/<\/script>$/, "");
  const root = document.createElement("html");
  new Function("location", "document", script)({ hostname }, { documentElement: root });
  return root.getAttribute("data-space-brand");
}

describe("SpaceBrandHostFlag", () => {
  it("marks aerospace.stellrspace.com as STELLR SPACE before first paint", () => {
    expect(brandOn("aerospace.stellrspace.com")).toBe("stellr");
    expect(brandOn("AEROSPACE.STELLRSPACE.COM.")).toBe("stellr");
  });

  it("leaves every other host on the ISHAVASYAM.ORG brand", () => {
    for (const host of ["aerospace.ishavasyam.org", "autonomous.ev.engineer", "aerospace.gamyaa.in", "stellrspace.com", "aerospacexstellrspace.com", "localhost"]) {
      expect(brandOn(host)).toBeNull();
    }
  });
});
