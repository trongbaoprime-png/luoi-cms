import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const logs = await db.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: logs });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Database error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
