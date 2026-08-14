import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-guard";

const SENSITIVE_KEYS = [
  "meta_access_token",
  "meta_app_secret",
  "tiktok_access_token",
  "telegram_bot_token",
  "google_sheets_webhook_url",
];

function maskSecret(val: string): string {
  if (!val) return "";
  if (val.length <= 8) return "••••••••";
  return `${val.slice(0, 4)}...${val.slice(-4)}`;
}

function isMaskedValue(val: string): boolean {
  if (!val) return false;
  return val.includes("...") || val.includes("••••");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wantUnmasked = searchParams.get("unmask") === "1";

    let authorized = false;
    if (wantUnmasked) {
      const perm = await requirePermission("settings:edit", req);
      authorized = perm.authorized;
    }

    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};

    settings.forEach((s) => {
      if (SENSITIVE_KEYS.includes(s.key) && !authorized) {
        settingsMap[s.key] = maskSecret(s.value);
      } else {
        settingsMap[s.key] = s.value;
      }
    });

    return NextResponse.json(
      { success: true, data: settingsMap },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Lỗi nạp cấu hình hệ thống" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const perm = await requirePermission("settings:edit", req);
  if (!perm.authorized) {
    return perm.errorResponse || NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    // Filter out masked values to avoid overwriting real keys with masked placeholders
    const updates = Object.entries(body)
      .filter(([key, value]) => {
        if (SENSITIVE_KEYS.includes(key) && isMaskedValue(String(value))) {
          return false; // Skip updating token if user submitted masked string
        }
        return true;
      })
      .map(([key, value]) =>
        db.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      );

    await Promise.all(updates);

    // Tức thì làm tươi Cache toàn bộ hệ thống
    try {
      revalidatePath("/", "layout");
      revalidatePath("/", "page");
      revalidatePath("/[slug]", "page");
      revalidatePath("/blog", "page");
      revalidatePath("/san-pham", "page");
      revalidatePath("/admin/settings", "page");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật cấu hình thành công và làm tươi bộ nhớ đệm Cache!",
    });
  } catch (error: any) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi lưu cấu hình: " + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}

