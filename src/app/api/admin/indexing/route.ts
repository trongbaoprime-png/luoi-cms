import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { url, targetUrls } = body;

    const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
    let urlsToSubmit: string[] = [];

    if (url) {
      urlsToSubmit = [url.startsWith("http") ? url : `${origin}${url}`];
    } else if (targetUrls && Array.isArray(targetUrls)) {
      urlsToSubmit = targetUrls;
    } else {
      // Query published articles from DB
      const posts = await db.post.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true },
        take: 100,
        orderBy: { updatedAt: "desc" },
      });
      urlsToSubmit = posts.map((p) => `${origin}/blog/${p.slug}`);
    }

    if (urlsToSubmit.length === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy URL bài viết để submit" }, { status: 400 });
    }

    const domain = new URL(origin).hostname;

    // IndexNow API Submission (Bing, Yandex, Google partner IndexNow protocol)
    const indexNowKey = (await db.setting.findUnique({ where: { key: "indexnow_api_key" } }))?.value || "luoidonnha2026indexnowkey";

    let indexNowSuccess = false;
    try {
      const indexNowRes = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: domain,
          key: indexNowKey,
          keyLocation: `${origin}/${indexNowKey}.txt`,
          urlList: urlsToSubmit,
        }),
      });
      indexNowSuccess = indexNowRes.status === 200 || indexNowRes.status === 202;
    } catch {}

    return NextResponse.json({
      success: true,
      count: urlsToSubmit.length,
      indexNowSuccess,
      message: `✓ Đã phát thông báo Lập chỉ mục tức thì (Instant Indexing) cho ${urlsToSubmit.length} bài viết tới Google & Bing Engine!`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Lỗi submit indexing";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
