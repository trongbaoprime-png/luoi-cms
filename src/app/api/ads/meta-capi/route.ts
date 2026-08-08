import { NextResponse } from "next/server";
import { sendMetaCAPIEvent } from "@/lib/ads-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pixelId, accessToken, testCode, event } = body;

    const result = await sendMetaCAPIEvent(pixelId, accessToken, event, testCode);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
