import { NextResponse } from "next/server";
import { processFormSubmission } from "@/lib/vertical-slice";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { fullName, phone, email, service, note, utmSource, utmMedium, utmCampaign, workspaceId } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ success: false, error: "Vui lòng nhập Họ tên và Số điện thoại!" }, { status: 400 });
    }

    const result = await processFormSubmission({
      workspaceId: workspaceId || "ws_default_001",
      fullName,
      phone,
      email,
      service,
      note,
      utmSource: utmSource || "landing_page_direct",
      utmMedium,
      utmCampaign,
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Form submit processing error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
