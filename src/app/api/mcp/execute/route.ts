import { NextResponse } from "next/server";
import { mcpHub } from "@/lib/mcp-hub";
import { SecurityContext, UserRole } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { toolName, params, dryRun, workspaceId, userId, userRole } = body;

    if (!toolName) {
      return NextResponse.json({ success: false, error: "Missing required parameter 'toolName'" }, { status: 400 });
    }

    const context: SecurityContext = {
      userId: userId || "user_admin_default",
      role: (userRole as UserRole) || "ADMIN",
      workspaceId: workspaceId || "ws_default_001",
    };

    const result = await mcpHub.invokeTool(toolName, params || {}, context, { dryRun: Boolean(dryRun) });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "MCP Execution Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET() {
  const tools = mcpHub.listTools();
  return NextResponse.json({
    success: true,
    totalTools: tools.length,
    tools,
  });
}
