import { NextRequest, NextResponse } from "next/server";
import { getJobById } from "@/lib/sync-engine/sync-queue";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = getJobById(id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Job yêu cầu" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        jobName: job.jobName,
        status: job.status,
        logs: job.logs,
        summary: {
          total: job.totalItems,
          processed: job.processedItems,
          success: job.successItems,
          failed: job.failedItems,
          durationMs: job.durationMs,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi truy vấn Event Logs" },
      { status: 500 }
    );
  }
}
