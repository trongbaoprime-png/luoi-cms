import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  const url = rawUrl.trim();

  // 1. YouTube & YouTube Shorts
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return NextResponse.json({
      type: "youtube",
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&enablejsapi=1`,
      videoId: ytMatch[1],
    });
  }

  // 2. Facebook Reels & Videos
  if (url.includes("facebook.com") || url.includes("fb.watch")) {
    return NextResponse.json({
      type: "facebook",
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`,
    });
  }

  // 3. TikTok Direct Video URL
  const tkMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tkMatch && tkMatch[1]) {
    return NextResponse.json({
      type: "tiktok",
      embedUrl: `https://www.tiktok.com/embed/v2/${tkMatch[1]}`,
      videoId: tkMatch[1],
    });
  }

  // 4. TikTok Shortlink (vt.tiktok.com, vm.tiktok.com, etc.)
  if (url.includes("tiktok.com")) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
      });
      const resolvedUrl = res.url || "";
      const resolvedMatch = resolvedUrl.match(/tiktok\.com\/.*\/video\/(\d+)/);
      if (resolvedMatch && resolvedMatch[1]) {
        return NextResponse.json({
          type: "tiktok",
          embedUrl: `https://www.tiktok.com/embed/v2/${resolvedMatch[1]}`,
          videoId: resolvedMatch[1],
          resolvedUrl,
        });
      }
    } catch (err) {
      console.error("TikTok shortlink resolution error:", err);
    }
  }

  // Fallback: If URL starts with http, return it as iframe src
  if (url.startsWith("http")) {
    return NextResponse.json({
      type: "generic",
      embedUrl: url,
    });
  }

  return NextResponse.json({ error: "Invalid video URL" }, { status: 400 });
}
