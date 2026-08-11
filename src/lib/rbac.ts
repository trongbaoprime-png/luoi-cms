/**
 * LƯỜI BUSINESS OS — 9-Tier Role-Based Access Control (RBAC) Engine
 * Validates permissions server-side per workspace, resource, record, and action.
 */

export type UserRole =
  | "OWNER"
  | "ADMIN"
  | "MANAGER"
  | "MARKETING"
  | "SALES"
  | "CSKH"
  | "EDITOR"
  | "VIEWER"
  | "AGENT_SERVICE_ACCOUNT";

export type PermissionAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "export"
  | "assign"
  | "approve"
  | "send_message"
  | "execute_workflow"
  | "manage_connector"
  | "view_sensitive_data"
  | "manage_billing"
  | "manage_users";

export type ResourceDomain =
  | "cms"
  | "sites"
  | "customer"
  | "lead"
  | "opportunity"
  | "quote"
  | "order"
  | "ticket"
  | "appointment"
  | "conversation"
  | "message"
  | "campaign"
  | "analytics"
  | "knowledge"
  | "agent"
  | "workflow"
  | "approval"
  | "connector"
  | "workspace"
  | "audit";

export interface SecurityContext {
  userId: string;
  role: UserRole;
  workspaceId: string;
  permissions?: string[];
}

export interface PermissionCheckRequest {
  action: PermissionAction;
  resource: ResourceDomain;
  workspaceId: string;
  recordOwnerId?: string;
  isSensitive?: boolean;
}

/**
 * Role Permission Defaults Matrix
 */
const ROLE_PERMISSIONS: Record<UserRole, { actions: PermissionAction[]; resources: ResourceDomain[] }> = {
  OWNER: {
    actions: [
      "read",
      "create",
      "update",
      "delete",
      "publish",
      "export",
      "assign",
      "approve",
      "send_message",
      "execute_workflow",
      "manage_connector",
      "view_sensitive_data",
      "manage_billing",
      "manage_users",
    ],
    resources: [
      "cms",
      "sites",
      "customer",
      "lead",
      "opportunity",
      "quote",
      "order",
      "ticket",
      "appointment",
      "conversation",
      "message",
      "campaign",
      "analytics",
      "knowledge",
      "agent",
      "workflow",
      "approval",
      "connector",
      "workspace",
      "audit",
    ],
  },
  ADMIN: {
    actions: [
      "read",
      "create",
      "update",
      "delete",
      "publish",
      "export",
      "assign",
      "approve",
      "send_message",
      "execute_workflow",
      "manage_connector",
      "view_sensitive_data",
      "manage_users",
    ],
    resources: [
      "cms",
      "sites",
      "customer",
      "lead",
      "opportunity",
      "quote",
      "order",
      "ticket",
      "appointment",
      "conversation",
      "message",
      "campaign",
      "analytics",
      "knowledge",
      "agent",
      "workflow",
      "approval",
      "connector",
      "workspace",
      "audit",
    ],
  },
  MANAGER: {
    actions: [
      "read",
      "create",
      "update",
      "delete",
      "publish",
      "export",
      "assign",
      "approve",
      "send_message",
      "execute_workflow",
      "view_sensitive_data",
    ],
    resources: [
      "cms",
      "sites",
      "customer",
      "lead",
      "opportunity",
      "quote",
      "order",
      "ticket",
      "appointment",
      "conversation",
      "message",
      "campaign",
      "analytics",
      "knowledge",
      "workflow",
      "approval",
    ],
  },
  MARKETING: {
    actions: ["read", "create", "update", "publish", "execute_workflow"],
    resources: ["cms", "sites", "campaign", "analytics", "knowledge"],
  },
  SALES: {
    actions: ["read", "create", "update", "assign", "send_message"],
    resources: ["customer", "lead", "opportunity", "quote", "order", "appointment", "conversation", "message"],
  },
  CSKH: {
    actions: ["read", "create", "update", "send_message"],
    resources: ["customer", "ticket", "conversation", "message", "knowledge"],
  },
  EDITOR: {
    actions: ["read", "create", "update"],
    resources: ["cms", "sites", "knowledge"],
  },
  VIEWER: {
    actions: ["read"],
    resources: [
      "cms",
      "sites",
      "customer",
      "lead",
      "opportunity",
      "quote",
      "order",
      "ticket",
      "appointment",
      "conversation",
      "campaign",
      "analytics",
      "knowledge",
    ],
  },
  AGENT_SERVICE_ACCOUNT: {
    actions: ["read", "create", "update", "send_message", "execute_workflow"],
    resources: [
      "cms",
      "sites",
      "customer",
      "lead",
      "opportunity",
      "quote",
      "order",
      "ticket",
      "appointment",
      "conversation",
      "message",
      "campaign",
      "analytics",
      "knowledge",
      "workflow",
    ],
  },
};

/**
 * Check whether a user context is authorized to perform an action on a resource within a workspace.
 */
export function checkPermission(context: SecurityContext, request: PermissionCheckRequest): { allowed: boolean; reason?: string } {
  // 1. Enforce Workspace Scoping
  if (!context.workspaceId || context.workspaceId !== request.workspaceId) {
    return { allowed: false, reason: "Forbidden: Access denied to requested workspace." };
  }

  // 2. OWNER and ADMIN roles bypass granular checks
  if (context.role === "OWNER" || context.role === "ADMIN") {
    return { allowed: true };
  }

  const roleDef = ROLE_PERMISSIONS[context.role];
  if (!roleDef) {
    return { allowed: false, reason: `Forbidden: Unknown role ${context.role}` };
  }

  // 3. Resource Check
  if (!roleDef.resources.includes(request.resource)) {
    return { allowed: false, reason: `Forbidden: Role ${context.role} cannot access resource ${request.resource}` };
  }

  // 4. Action Check
  if (!roleDef.actions.includes(request.action)) {
    return { allowed: false, reason: `Forbidden: Role ${context.role} cannot perform action ${request.action}` };
  }

  // 5. Sensitive Operation Guard
  if (request.isSensitive && context.role !== "MANAGER") {
    return { allowed: false, reason: `Forbidden: Sensitive actions require Manager or Admin approval.` };
  }

  // 6. Record Ownership Guard for Sales & CSKH
  if (request.recordOwnerId && (context.role === "SALES" || context.role === "CSKH")) {
    if (request.recordOwnerId !== context.userId) {
      return { allowed: false, reason: "Forbidden: You may only modify records assigned to you." };
    }
  }

  return { allowed: true };
}
