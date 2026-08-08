import { NextResponse } from "next/server";
import { generateContentWithAI } from "@/lib/ai-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, prompt, type, apiKey, model } = body;

    if (!topic) {
      return NextResponse.json({ success: false, error: "Thiếu topic" }, { status: 400 });
    }

    const content = await generateContentWithAI({
      topic,
      prompt: prompt || "Viết bài tạp chí kỹ thuật chuyên sâu về Google Ads & Attribution.",
      type: type || "FULL_DRAFT",
      apiKey,
      model,
    });

    return NextResponse.json({ success: true, content });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
