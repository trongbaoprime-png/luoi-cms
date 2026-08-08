import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Check headers from CDN / reverse proxies (Cloudflare, Vercel, Nginx)
    const headerCountry =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-country-code") ||
      req.headers.get("x-vercel-ip-country");

    if (headerCountry && headerCountry !== "XX" && headerCountry !== "T1") {
      const code = headerCountry.toUpperCase();
      return NextResponse.json({
        success: true,
        countryCode: code,
        isVietnam: code === "VN",
      });
    }

    // Try fetching IP location via ipwho.is with 2s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const res = await fetch("https://ipwho.is/", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.country_code) {
        const code = (data.country_code as string).toUpperCase();
        return NextResponse.json({
          success: true,
          countryCode: code,
          countryName: data.country,
          dialCode: data.calling_code ? `+${data.calling_code}` : undefined,
          isVietnam: code === "VN",
        });
      }
    }
  } catch {}

  // Default fallback for Vietnam visitors
  return NextResponse.json({
    success: true,
    countryCode: "VN",
    isVietnam: true,
  });
}
