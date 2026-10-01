import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

// Design D21: allow the public site, keep the CMS and API out of search engines.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
