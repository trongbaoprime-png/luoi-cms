import { NextRequest, NextResponse } from "next/server";
import { getAllJobs, triggerSyncJob } from "@/lib/sync-engine/sync-queue";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = getAllJobs();
    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi lấy danh sách Sync Jobs",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module = "OMNICHANNEL", jobName, deltaOnly = true, excludeConflicts = true, selectedResources = [] } = body;

    const job = await triggerSyncJob({
      module,
      jobName,
      deltaOnly,
      excludeConflicts,
      selectedResources,
    });

    return NextResponse.json({
      success: true,
      message: `Đã kích hoạt Job đồng bộ ${job.jobName}`,
      data: job,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi kích hoạt Sync Job",
      },
      { status: 500 }
    );
  }
}
