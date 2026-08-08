import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const subscribers = await db.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: subscribers });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
