import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function verifyAdminAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("luoi_admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      return {
        authenticated: false,
        errorResponse: NextResponse.json(
          { success: false, error: "401 Unauthorized - Yêu cầu xác thực Admin!" },
          { status: 401 }
        ),
      };
    }

    // Decode session token
    const decoded = Buffer.from(sessionCookie.value, "base64").toString("utf-8");
    const [username] = decoded.split(":");

    return {
      authenticated: true,
      username: username || "admin",
    };
  } catch {
    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        { success: false, error: "401 Unauthorized - Phiên đăng nhập không hợp lệ!" },
        { status: 401 }
      ),
    };
  }
}
