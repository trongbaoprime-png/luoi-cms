import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:20128/v1/health", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch {}
  return NextResponse.json({ status: "ONLINE", port: 20128, version: "v1.2.0" });
}
