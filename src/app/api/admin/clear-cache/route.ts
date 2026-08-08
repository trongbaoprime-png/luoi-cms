import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(req: Request) {
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return auth.errorResponse || NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Revalidate all critical frontend & admin routes
    try {
      revalidatePath("/", "layout");
      revalidatePath("/", "page");
      revalidatePath("/[slug]", "page");
      revalidatePath("/blog", "page");
      revalidatePath("/blog/[slug]", "page");
      revalidatePath("/san-pham", "page");
      revalidatePath("/admin/settings", "page");
      revalidatePath("/admin/pages", "page");
    } catch {}

    return NextResponse.json({
      success: true,
      message: "✓ Đã xoá toàn bộ Cache hệ thống & làm tươi giao diện trang chủ thành công!",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi xoá cache" },
      { status: 500 }
    );
  }
}
