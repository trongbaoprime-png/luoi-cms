import { NextRequest, NextResponse } from "next/server";
import { retryFailedJob } from "@/lib/sync-engine/sync-queue";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const newJob = retryFailedJob(id);

    if (!newJob) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Job hoặc không thể chạy lại" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt chạy lại Job ${newJob.jobName}`,
      data: newJob,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi retry Job" },
      { status: 500 }
    );
  }
}
