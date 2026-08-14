import { NextResponse } from "next/server";
import { generateFacebookAuthUrl } from "@/lib/facebook-oauth";

/**
 * GET /api/auth/facebook/login
 * Chuyển hướng sang Meta OAuth Dialog chính thống
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const returnUrl = searchParams.get("returnUrl") || "/admin/omnichannel";
    const state = Buffer.from(JSON.stringify({ returnUrl, timestamp: Date.now() })).toString("base64");

    const authUrl = generateFacebookAuthUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Không thể tạo liên kết đăng nhập Facebook" }, { status: 500 });
  }
}
