import type { MetadataRoute } from "next";

const BASE_URL = "https://autonomous.ev.engineer";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Preserved as-is: this wildcard already covers every crawler not
        // named explicitly below, including GPTBot — its policy is
        // unchanged by this update.
        userAgent: "*",
        allow: "/",
      },
      // Explicit allow rules for conventional and AI-search crawlers.
      { userAgent: "Googlebot", allow: "/" },
      { userAgent: "Bingbot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
