import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-guard";

export async function GET() {
  try {
    const settings = await db.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
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

    const updates = Object.entries(body).map(([key, value]) =>
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
