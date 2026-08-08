import { NextResponse } from "next/server";
import { sendGoogleAdsEvent } from "@/lib/ads-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { conversionId, conversionLabel, event } = body;

    const result = await sendGoogleAdsEvent(conversionId, conversionLabel, event);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
