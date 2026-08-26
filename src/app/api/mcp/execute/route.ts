import { NextResponse } from "next/server";
import { mcpHub } from "@/lib/mcp-hub";
import { SecurityContext, UserRole } from "@/lib/rbac";
import { requireAuth } from "@/lib/auth-guard";

function toBusinessRole(role?: string): UserRole {
  switch (String(role || "").toUpperCase()) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "ADMIN";
    case "MANAGER":
      return "MANAGER";
    case "MARKETING":
      return "MARKETING";
    case "TELESALE":
      return "SALES";
    case "VIEWER":
      return "VIEWER";
    default:
      return "VIEWER";
  }
}

async function getSecurityContext(req: Request): Promise<SecurityContext | NextResponse> {
  const auth = await requireAuth(req);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse || NextResponse.json({ success: false, error: "401 Unauthorized" }, { status: 401 });
  }

  return {
    userId: auth.user.userId,
    role: toBusinessRole(auth.user.role),
    workspaceId: process.env.MCP_WORKSPACE_ID || "ws_default_001",
  };
}

/**
 * Legacy internal MCP execution endpoint.
 * This is NOT the remote MCP transport used by ChatGPT. New external MCP traffic goes to the isolated luoi-mcp service.
 * Client-supplied userId/userRole/workspaceId are intentionally ignored.
 */
export async function POST(req: Request) {
  try {
    const context = await getSecurityContext(req);
    if (context instanceof NextResponse) return context;

    if (process.env.ENABLE_LEGACY_MCP_EXECUTE !== "true") {
      return NextResponse.json(
        { success: false, error: "Legacy MCP execution is disabled. Use the dedicated MCP server." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { toolName, params, dryRun } = body;

    if (!toolName || typeof toolName !== "string") {
      return NextResponse.json({ success: false, error: "Missing required parameter 'toolName'" }, { status: 400 });
    }

    const result = await mcpHub.invokeTool(toolName, params || {}, context, { dryRun: Boolean(dryRun) });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "MCP Execution Error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const context = await getSecurityContext(req);
  if (context instanceof NextResponse) return context;

  const tools = mcpHub.listTools();
  return NextResponse.json({
    success: true,
    legacyExecutionEnabled: process.env.ENABLE_LEGACY_MCP_EXECUTE === "true",
    totalTools: tools.length,
    tools,
  });
}
