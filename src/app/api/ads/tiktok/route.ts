import { NextResponse } from "next/server";
import { sendTikTokEvent } from "@/lib/ads-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pixelCode, accessToken, testCode, event } = body;

    const result = await sendTikTokEvent(pixelCode, accessToken, event, testCode);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
