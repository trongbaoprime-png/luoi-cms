import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:20180/api/health", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch {}
  return NextResponse.json({ status: "DEGRADED", port: 20180, mode: "agent-runtime-active" });
}
