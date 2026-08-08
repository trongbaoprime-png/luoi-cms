import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let discourage = false;
  try {
    const setting = await db.setting.findUnique({
      where: { key: "discourage_search_engines" },
    });
    discourage = setting?.value === "true";
  } catch {}

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://luoidonnha.com";

  if (discourage) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/sitemap-image.xml`],
  };
}
