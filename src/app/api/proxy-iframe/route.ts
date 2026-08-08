import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    let html = await response.text();

    // Inject base tag so relative assets load from the target URL
    const baseTag = `<base href="${new URL(targetUrl).origin}">`;
    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>\n${baseTag}\n`);
    } else if (html.includes("<head ")) {
      html = html.replace(/<head\b[^>]*>/, (match) => `${match}\n${baseTag}\n`);
    } else {
      html = `<head>${baseTag}</head>` + html;
    }

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e: any) {
    return new NextResponse("Error fetching: " + e.message, { status: 500 });
  }
}
