import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://127.0.0.1:20180/api/agents", { cache: "no-store" });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch {}
  return NextResponse.json({
    success: true,
    agents: [
      { id: "CEO", name: "CEO Executive Agent", role: "CHIEF_EXECUTIVE", model: "claude-3-7-sonnet" },
      { id: "MARKETING", name: "Marketing Lead Agent", role: "MARKETING_LEAD", model: "gpt-4o" },
      { id: "SALES", name: "Sales Consultant Agent", role: "SALES_CONSULTANT", model: "gemini-2.5-flash" },
      { id: "CSKH", name: "CSKH Support Agent", role: "CUSTOMER_SUPPORT", model: "claude-3-5-haiku" },
    ],
  });
}
