import { NextRequest, NextResponse } from "next/server";
import { getMetaConfig } from "@/lib/facebook-oauth";
import fs from "fs";
import path from "path";

/**
 * GET /api/auth/facebook/config
 */
export async function GET() {
  const config = getMetaConfig();

  return NextResponse.json({
    success: true,
    appId: config.appId,
    hasAppSecret: Boolean(config.appSecret && config.appSecret.length > 10),
    redirectUri: config.redirectUri,
    appName: "Nha khoa Tâm Đức Smile",
  });
}

/**
 * POST /api/auth/facebook/config
 * Lưu App Secret trực tiếp vào .env trên server
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appId, appSecret } = body;

    if (!appSecret || appSecret.trim().length < 10) {
      return NextResponse.json({ error: "App Secret không hợp lệ (thường gồm 32 ký tự)" }, { status: 400 });
    }

    const envPath = path.join(process.cwd(), ".env");
    let envContent = "";
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    // Update META_APP_ID
    if (appId) {
      if (envContent.includes("META_APP_ID=")) {
        envContent = envContent.replace(/META_APP_ID=.*/g, `META_APP_ID=${appId.trim()}`);
      } else {
        envContent += `\nMETA_APP_ID=${appId.trim()}`;
      }
    }

    // Update META_APP_SECRET & FACEBOOK_APP_SECRET
    if (envContent.includes("META_APP_SECRET=")) {
      envContent = envContent.replace(/META_APP_SECRET=.*/g, `META_APP_SECRET=${appSecret.trim()}`);
    } else {
      envContent += `\nMETA_APP_SECRET=${appSecret.trim()}`;
    }

    if (envContent.includes("FACEBOOK_APP_SECRET=")) {
      envContent = envContent.replace(/FACEBOOK_APP_SECRET=.*/g, `FACEBOOK_APP_SECRET=${appSecret.trim()}`);
    } else {
      envContent += `\nFACEBOOK_APP_SECRET=${appSecret.trim()}`;
    }

    fs.writeFileSync(envPath, envContent, "utf-8");

    // Update runtime process.env
    process.env.META_APP_SECRET = appSecret.trim();
    process.env.FACEBOOK_APP_SECRET = appSecret.trim();
    if (appId) {
      process.env.META_APP_ID = appId.trim();
      process.env.NEXT_PUBLIC_FACEBOOK_APP_ID = appId.trim();
    }

    return NextResponse.json({
      success: true,
      message: "Đã lưu App Secret thành công! Bạn có thể kết nối Facebook ngay bây giờ.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Lỗi lưu cấu hình" }, { status: 500 });
  }
}
