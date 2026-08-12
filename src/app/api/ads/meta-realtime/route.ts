import { NextResponse } from "next/server";
import { getMetaConfig, getMetaRealtimeData } from "@/lib/meta-realtime-service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = (searchParams.get("scope") || "core").toLowerCase();
  const since = searchParams.get("since") || searchParams.get("from") || "";
  const until = searchParams.get("until") || searchParams.get("to") || "";
  const fresh = searchParams.get("fresh") === "1" || searchParams.get("refresh") === "1";

  // 1. Check health scope
  const config = await getMetaConfig();
  const isConfigured = config.accessToken.length > 0;

  if (scope === "health") {
    return NextResponse.json({
      ok: isConfigured,
      configured: isConfigured,
      graphVersion: config.graphVersion,
      accountsCount: config.accountIds.length,
      accounts: config.accountIds.map((id) => `act_***${id.slice(-4)}`),
      tokenConfigured: config.accessToken.length > 0,
      message: isConfigured
        ? "Meta Ads API đã kết nối sẵn sàng."
        : "Chưa đọc được Meta Access Token. Vui lòng cấu hình Token trong mục Cấu hình Ads APIs.",
    });
  }

  // 2. Fetch realtime or cached data safely
  try {
    const data = await getMetaRealtimeData(scope, since, until, fresh);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Meta Realtime Route Error:", error);
    return NextResponse.json(
      {
        ok: false,
        code: "META_REALTIME_FAILED",
        message: error.message || "Lỗi khi gọi Meta Ads Realtime API",
      },
      { status: 502 }
    );
  }
}
