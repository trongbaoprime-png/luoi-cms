import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST() {
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
