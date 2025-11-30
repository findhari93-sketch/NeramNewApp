import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/account",
          "/account/*",
          "/auth",
          "/auth/*",
          "/profile",
          "/profile/*",
          "/settings",
          "/accountSettings",
          "/applications",
          "/applications/*",
          "/applicationform",
          "/dashboard",
          "/dashboard/*",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: [
          "/api/",
          "/account",
          "/account/*",
          "/auth",
          "/auth/*",
          "/profile",
          "/profile/*",
          "/settings",
          "/accountSettings",
          "/applications",
          "/applications/*",
          "/applicationform",
          "/dashboard",
          "/dashboard/*",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
