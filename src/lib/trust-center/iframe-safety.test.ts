import { describe, expect, it } from "vitest";
import { isAllowedEmbedUrl, isAllowedExternalUrl } from "./iframe-safety";

describe("isAllowedEmbedUrl", () => {
  it("allows the exact configured LinkedIn and YouTube hosts over https", () => {
    expect(isAllowedEmbedUrl("https://www.linkedin.com/embed/feed/update/urn:li:share:1?collapsed=1")).toBe(true);
    expect(isAllowedEmbedUrl("https://www.youtube.com/embed/abc123")).toBe(true);
    expect(isAllowedEmbedUrl("https://www.youtube-nocookie.com/embed/abc123")).toBe(true);
  });

  it("rejects unknown hosts", () => {
    expect(isAllowedEmbedUrl("https://evil.example.com/embed")).toBe(false);
    expect(isAllowedEmbedUrl("https://facebook.com/plugins/post.php")).toBe(false);
  });

  it("rejects non-https protocols, including javascript: and data:", () => {
    expect(isAllowedEmbedUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedEmbedUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isAllowedEmbedUrl("http://www.linkedin.com/embed/feed/update/urn:li:share:1")).toBe(false);
  });

  it("rejects malformed URLs and empty values", () => {
    expect(isAllowedEmbedUrl("not a url")).toBe(false);
    expect(isAllowedEmbedUrl(undefined)).toBe(false);
    expect(isAllowedEmbedUrl(null)).toBe(false);
    expect(isAllowedEmbedUrl("")).toBe(false);
  });
});

describe("isAllowedExternalUrl", () => {
  it("allows http(s) links", () => {
    expect(isAllowedExternalUrl("https://topmate.io/sudarshana_karkala")).toBe(true);
    expect(isAllowedExternalUrl("http://example.com")).toBe(true);
  });

  it("rejects javascript: and other unsafe protocols", () => {
    expect(isAllowedExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedExternalUrl("data:text/html,evil")).toBe(false);
  });
});
