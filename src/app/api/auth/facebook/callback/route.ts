import { NextRequest } from "next/server";
import { exchangeCodeForPages } from "@/lib/facebook-oauth";
import { omniDb } from "@/lib/omni-db";

const PRODUCTION_DOMAIN = "https://luoidonnha.com";

function renderRedirectHtml(targetUrl: string, title: string = "Đang chuyển hướng về LƯỜI CMS...") {
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=${targetUrl}">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; text-align: center; }
    .box { background: #1e293b; padding: 32px 48px; border-radius: 16px; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .spinner { width: 40px; height: 40px; border: 4px solid #3b82f6; border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #38bdf8; }
    p { margin: 0; font-size: 14px; color: #94a3b8; }
    a { display: inline-block; margin-top: 16px; color: #38bdf8; text-decoration: underline; font-weight: 600; font-size: 13px; }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h2>Xác Thực Meta Thành Công!</h2>
    <p>Đang tự động chuyển hướng về hệ thống LƯỜI CMS...</p>
    <a href="${targetUrl}">Bấm vào đây nếu trình duyệt không tự chuyển</a>
  </div>
  <script>
    window.location.replace("${targetUrl}");
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Location": targetUrl,
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

/**
 * GET /api/auth/facebook/callback
 * Nhận code từ Meta, đổi Page Access Token vĩnh viễn và lưu 52 Fanpages vào OmniFanpage
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");
  const state = searchParams.get("state");

  // Xử lý khi người dùng huỷ cấp quyền
  if (error) {
    console.warn("[Meta OAuth Cancel/Error]:", error, errorDescription);
    const target = `${PRODUCTION_DOMAIN}/admin/omnichannel?error=${encodeURIComponent(errorDescription || error)}`;
    return renderRedirectHtml(target, "Đang quay lại LƯỜI CMS...");
  }

  if (!code) {
    const target = `${PRODUCTION_DOMAIN}/admin/omnichannel?error=missing_code`;
    return renderRedirectHtml(target, "Đang quay lại LƯỜI CMS...");
  }

  try {
    // 1. Đổi Code lấy Token vĩnh viễn & Danh sách toàn bộ Fanpages
    const { pages } = await exchangeCodeForPages(code);

    let savedCount = 0;

    // 2. Lưu vào CSDL PostgreSQL OmniFanpage
    for (const p of pages) {
      await omniDb.omniFanpage.upsert({
        where: { pageId: String(p.id) },
        update: {
          pageName: p.name,
          accessToken: p.access_token,
          category: p.category || "Nha Khoa Thẩm Mỹ",
          isActive: true,
          updatedAt: new Date(),
        },
        create: {
          pageId: String(p.id),
          pageName: p.name,
          accessToken: p.access_token,
          category: p.category || "Nha Khoa Thẩm Mỹ",
          isActive: true,
        },
      });
      savedCount++;
    }

    // 3. Đọc returnUrl từ state
    let redirectPath = "/admin/omnichannel";
    if (state) {
      try {
        const parsedState = JSON.parse(Buffer.from(state, "base64").toString());
        if (parsedState.returnUrl && typeof parsedState.returnUrl === "string") {
          if (parsedState.returnUrl.startsWith("http")) {
            const parsedUrl = new URL(parsedState.returnUrl);
            redirectPath = parsedUrl.pathname;
          } else if (parsedState.returnUrl.startsWith("/")) {
            redirectPath = parsedState.returnUrl;
          }
        }
      } catch {}
    }

    const finalTarget = `${PRODUCTION_DOMAIN}${redirectPath}?connected=true&count=${savedCount}`;
    console.log("[Meta OAuth Success Redirect]:", finalTarget);

    return renderRedirectHtml(finalTarget, "Kết Nối Fanpages Thành Công!");
  } catch (err: any) {
    console.error("[Meta OAuth Callback Error]:", err?.message);
    const target = `${PRODUCTION_DOMAIN}/admin/omnichannel?error=${encodeURIComponent(err?.message || "OAuth Error")}`;
    return renderRedirectHtml(target, "Lỗi xác thực Meta...");
  }
}
