import { NextResponse } from "next/server";
import {
  processFormSubmission,
  approveDraftAndDispatch,
  convertLeadToOrder,
  getVerticalSliceFunnelMetrics,
} from "@/lib/vertical-slice";

export async function GET() {
  const metrics = getVerticalSliceFunnelMetrics();
  return NextResponse.json({
    success: true,
    system: "LƯỜI BUSINESS OS",
    flow: "Vertical Slice MVP (Landing Page -> Customer 360 -> AI Draft -> Approval -> Order -> Analytics)",
    metrics,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, requestId, leadId, orderAmount, fullName, phone, service, note } = body;

    // Step 1: Simulate Landing Page Form Submit
    if (action === "submit_form") {
      const res = await processFormSubmission({
        fullName: fullName || "Phạm Minh Quốc",
        phone: phone || "0987654321",
        service: service || "Trồng Răng Implant",
        note: note || "Tư vấn ưu đãi tháng này",
        utmSource: "facebook_ads",
        utmCampaign: "Campaign_Implant_Q3",
      });
      return NextResponse.json(res);
    }

    // Step 2: Approve AI Draft in Approval Center
    if (action === "approve_draft") {
      if (!requestId) return NextResponse.json({ success: false, error: "Missing requestId" }, { status: 400 });
      const res = await approveDraftAndDispatch(requestId, "manager_01");
      return NextResponse.json(res);
    }

    // Step 3: Convert Lead to Order
    if (action === "convert_order") {
      const amount = orderAmount ? Number(orderAmount) : 18500000;
      const res = await convertLeadToOrder(leadId || "lead_demo", amount, "Gói Trồng Răng Implant High-End");
      return NextResponse.json(res);
    }

    return NextResponse.json({ success: false, error: `Unknown action '${action}'` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Vertical slice execution error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
