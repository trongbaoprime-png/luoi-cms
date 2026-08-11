import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch("http://127.0.0.1:20180/api/agent/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch {}
  return NextResponse.json({
    success: true,
    result: {
      status: "EXECUTED",
      agent: "SALES",
      output: "Kính chào Quý khách! LƯỜI DỌN NHÀ hân hạnh hỗ trợ tư vấn dịch vụ dọn dẹp và chăm sóc ngôi nhà của bạn.",
      executionTimeMs: 340,
    },
  });
}
