# LƯỜI BUSINESS OS — Security & Access Control Architecture

## 1. Role-Based Access Control (RBAC) Matrix

**LƯỜI BUSINESS OS** implements a strict 9-Tier Role Hierarchy enforced server-side on every request, tool call, and database operation.

| Role | Description | Core Capabilities |
| :--- | :--- | :--- |
| **OWNER** | Workspace Owner | Unrestricted control over billing, team, settings, and workspace data |
| **ADMIN** | System Administrator | Full operational access across all collections, models, and connectors |
| **MANAGER** | Team Manager | Manage team leads, assign tickets, approve actions, view analytics |
| **MARKETING** | Marketing Lead | Manage landing pages, forms, campaigns, content library, and ads analytics |
| **SALES** | Sales Specialist | Manage assigned leads, create quotes, record orders, book appointments |
| **CSKH** | Support Agent | Respond to customer messages, resolve tickets, view knowledge base |
| **EDITOR** | Content Editor | Edit articles, landing page drafts, and brand assets (no publish/delete) |
| **VIEWER** | Read-Only User | View dashboards and non-sensitive reporting metrics |
| **AGENT_SERVICE_ACCOUNT** | Autonomous AI Agent | Restricted to explicit tool allowlist and execution permissions |

---

## 2. Server-Side Action Permission Scope Matrix

| Action | Allowed Roles | Approval Required? |
| :--- | :--- | :--- |
| `read` | OWNER, ADMIN, MANAGER, MARKETING, SALES, CSKH, EDITOR, VIEWER | No |
| `create` | OWNER, ADMIN, MANAGER, MARKETING, SALES, CSKH, EDITOR | No |
| `update` | OWNER, ADMIN, MANAGER, MARKETING, SALES, CSKH, EDITOR | No |
| `delete` | OWNER, ADMIN, MANAGER | Mandatory |
| `publish` | OWNER, ADMIN, MANAGER, MARKETING | No |
| `export` | OWNER, ADMIN, MANAGER | Mandatory for PII |
| `assign` | OWNER, ADMIN, MANAGER, SALES | No |
| `approve` | OWNER, ADMIN, MANAGER | No |
| `send_message` | OWNER, ADMIN, MANAGER, SALES, CSKH | No (Manual) |
| `execute_workflow` | OWNER, ADMIN, MANAGER | No |
| `manage_connector` | OWNER, ADMIN | Mandatory |
| `view_sensitive_data`| OWNER, ADMIN, MANAGER | No |
| `manage_billing` | OWNER | Mandatory |
| `manage_users` | OWNER, ADMIN | Mandatory |

---

## 3. Secret & Credential Encryption Policy

1. **No Raw Secrets in DB**: Database columns storing tokens, OAuth secrets, or API keys must contain ciphertext or secret references.
2. **AES-256-GCM Encryption**: Secrets are encrypted using a master key loaded from environment (`LUOI_MASTER_ENCRYPTION_KEY`).
3. **Audit Log Append-Only**: Audit logs cannot be updated or deleted via API.
4. **PII Redaction**: Console logs and analytics payloads must redact passwords, tokens, full credit card numbers, and raw identity tokens.
