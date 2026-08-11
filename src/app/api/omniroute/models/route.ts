import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:20128/v1/models", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch {}
  return NextResponse.json({
    profiles: [
      { id: "business/fast", model: "gemini-2.5-flash", costPer1k: 0.0001, latencyMs: 120 },
      { id: "business/quality", model: "claude-3-7-sonnet", costPer1k: 0.003, latencyMs: 450 },
      { id: "business/creative", model: "gpt-4o", costPer1k: 0.0025, latencyMs: 380 },
      { id: "business/private", model: "ollama-deepseek-r1-7b", costPer1k: 0.0, latencyMs: 850 },
    ],
  });
}
