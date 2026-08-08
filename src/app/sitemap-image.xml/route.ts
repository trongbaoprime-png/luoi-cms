import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const posts = await db.post.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        title: true,
        coverImage: true,
        content: true,
        updatedAt: true,
      },
    });

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    posts.forEach((post) => {
      const pageUrl = `${origin}/blog/${post.slug}`;
      const images: { url: string; title: string; caption?: string }[] = [];

      // 1. Cover Image
      if (post.coverImage) {
        images.push({
          url: post.coverImage.startsWith("http") ? post.coverImage : `${origin}${post.coverImage}`,
          title: post.title,
          caption: post.title,
        });
      }

      // 2. Extract <img> tags inside post content
      if (post.content) {
        const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
        const altRegex = /alt=["']([^"']+)["']/i;

        let match;
        while ((match = imgRegex.exec(post.content)) !== null) {
          const imgUrl = match[1];
          if (!imgUrl) continue;

          const fullImgUrl = imgUrl.startsWith("http") ? imgUrl : `${origin}${imgUrl}`;
          const altMatch = match[0].match(altRegex);
          const altText = altMatch ? altMatch[1] : post.title;

          // Deduplicate images
          if (!images.some((img) => img.url === fullImgUrl)) {
            images.push({
              url: fullImgUrl,
              title: post.title,
              caption: altText,
            });
          }
        }
      }

      if (images.length > 0) {
        xml += `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString()}</lastmod>
`;
        images.forEach((img) => {
          xml += `    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      ${img.caption ? `<image:caption>${escapeXml(img.caption)}</image:caption>` : ""}
    </image:image>
`;
        });
        xml += `  </url>\n`;
      }
    });

    xml += `</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err) {
    return new Response("Lỗi tạo sitemap image", { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
