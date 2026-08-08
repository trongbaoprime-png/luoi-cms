import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { destroyAdminSession } from "@/lib/redis-session";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("luoi_admin_session");

    if (sessionCookie?.value) {
      // Invalidate session on Redis server-side
      await destroyAdminSession(sessionCookie.value);
    }

    // Clear cookie
    cookieStore.delete("luoi_admin_session");

    return NextResponse.json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi đăng xuất" },
      { status: 500 }
    );
  }
}
