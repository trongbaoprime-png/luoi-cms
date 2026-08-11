import { NextResponse } from "next/server";
import { createApprovalRequest, processApprovalDecision, requiresApprovalCheck } from "@/lib/approval";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, actionType, requestId, decision, comment, workspaceId, userId, userRole, payload, description, resource } = body;

    // 1. Process Approval Decision
    if (action === "decide") {
      if (!requestId || !decision) {
        return NextResponse.json({ success: false, error: "Missing requestId or decision" }, { status: 400 });
      }

      const result = await processApprovalDecision(
        requestId,
        decision,
        userId || "user_admin_01",
        userRole || "MANAGER",
        workspaceId || "ws_default_001",
        comment
      );

      return NextResponse.json(result);
    }

    // 2. Create Approval Request
    if (!actionType || !description) {
      return NextResponse.json({ success: false, error: "Missing required fields actionType or description" }, { status: 400 });
    }

    const needsApproval = requiresApprovalCheck(actionType);
    const result = await createApprovalRequest({
      workspaceId: workspaceId || "ws_default_001",
      requesterId: userId || "user_agent_01",
      requesterRole: userRole || "AGENT_SERVICE_ACCOUNT",
      actionType,
      resource: resource || "system",
      payload: payload || {},
      description,
    });

    return NextResponse.json({
      success: true,
      requiresApproval: needsApproval,
      approvalRequest: result,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Approval processing error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
