import { NextRequest, NextResponse } from "next/server";
import { crmDb } from "@/lib/db";
import { normalizeVnPhone } from "@/lib/identity-resolution";

/**
 * Automated Lead Deduplication & Merge Engine
 * Identifies leads sharing identical normalized phone numbers,
 * aggregates their revenue, consolidates interaction notes, and links history.
 */

export async function GET(req: NextRequest) {
  try {
    if (!crmDb) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    // Find duplicates by phone
    const duplicateGroups = await (crmDb as any).$queryRaw`
      SELECT phone, COUNT(*) as count, ARRAY_AGG(id) as ids, SUM(COALESCE("actualRevenue", 0)) as total_revenue
      FROM "CRMLead"
      WHERE phone IS NOT NULL AND phone != ''
      GROUP BY phone
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 100;
    `;

    return NextResponse.json({
      success: true,
      totalDuplicateGroups: duplicateGroups.length,
      duplicateGroups,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to scan duplicates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!crmDb) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    const body = await req.json().catch(() => ({}));
    const targetPhone = body.phone ? normalizeVnPhone(body.phone) : null;

    let mergedCount = 0;

    if (targetPhone) {
      // Merge specific phone number
      const leads = await (crmDb as any).cRMLead.findMany({
        where: { phone: targetPhone },
        orderBy: { createdAt: "asc" },
      });

      if (leads.length > 1) {
        const primaryLead = leads[0];
        const duplicateLeads = leads.slice(1);

        const totalRevenue = leads.reduce((sum: number, l: any) => sum + (l.actualRevenue || l.revenue || 0), 0);
        const combinedNotes = leads
          .map((l: any) => `[${new Date(l.createdAt).toLocaleDateString("vi-VN")} - ${l.source || "Unknown"}]: ${l.note || l.status || ""}`)
          .filter(Boolean)
          .join("\n");

        // Update primary
        await (crmDb as any).cRMLead.update({
          where: { id: primaryLead.id },
          data: {
            actualRevenue: totalRevenue,
            note: combinedNotes,
            updatedAt: new Date(),
          },
        });

        // Delete duplicates
        await (crmDb as any).cRMLead.deleteMany({
          where: {
            id: { in: duplicateLeads.map((l: any) => l.id) },
          },
        });

        mergedCount = duplicateLeads.length;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã gộp thành công ${mergedCount} hồ sơ trùng lặp.`,
      mergedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to merge leads" }, { status: 500 });
  }
}
