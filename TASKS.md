# LƯỜI BUSINESS OS — Task Tracking Matrix

## Phase 0: System Architecture & Foundation Baseline

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P0-01` | P0 | P0 | `DONE` | Comprehensive Documentation Suite Setup | None | `docs/*`, `TASKS.md`, `CHANGELOG.md` created & synced | `docs/*`, `TASKS.md` |
| `TASK-P0-02` | P0 | P0 | `DONE` | Workspace & 9-Tier RBAC Engine | TASK-P0-01 | Scoped action check across 14 actions & 9 roles | `src/lib/rbac.ts` |
| `TASK-P0-03` | P0 | P0 | `DONE` | Append-Only Audit Logging Engine | TASK-P0-01 | Structured audit log with PII redaction | `src/lib/audit.ts` |
| `TASK-P0-04` | P0 | P0 | `DONE` | AES-256 Secret Encryption Engine | TASK-P0-01 | Encrypt/Decrypt secret tokens & API keys | `src/lib/crypto.ts` |
| `TASK-P0-05` | P0 | P0 | `DONE` | OmniRoute Model Gateway Client | TASK-P0-01 | Gateway client at `http://127.0.0.1:20128/v1` with 6 routing profiles | `src/lib/omniroute.ts` |
| `TASK-P0-06` | P0 | P0 | `DONE` | OpenClaw Agent Sidecar Adapter | TASK-P0-01 | Agent session, workflow execution & skill bindings | `src/lib/openclaw.ts` |
| `TASK-P0-07` | P0 | P0 | `DONE` | Business MCP Hub Namespace Registry | TASK-P0-01 | Namespaced tools (`customer.*`, `cms.*`, etc.) with RBAC gate | `src/lib/mcp-hub.ts` |
| `TASK-P0-08` | P0 | P0 | `DONE` | Approval Center Engine | TASK-P0-01 | Execution level policy check & approval decision pipeline | `src/lib/approval.ts` |
| `TASK-P0-09` | P0 | P0 | `DONE` | Customer 360 Identity Resolution Engine | TASK-P0-01 | VN phone normalization & multi-channel identity merge | `src/lib/identity-resolution.ts` |
| `TASK-P0-10` | P0 | P0 | `DONE` | System Diagnostics & Health Check API | TASK-P0-02 | `/api/system/health` returning system state | `src/app/api/system/health/route.ts` |

---

## Phase 1: Lười CMS & Brand Hub

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P1-01` | P1 | P1 | `PLANNED` | Brand Kit & Product Schema Definition | TASK-P0-02 | Brand voice, products, variants, services, offers models | `src/lib/cms-db.ts` |
| `TASK-P1-02` | P1 | P1 | `PLANNED` | Content Calendar & Campaign Manager | TASK-P1-01 | Campaign tracking, post scheduling & multi-channel draft | `src/app/admin/cms/` |

---

## Phase 2: Lười Sites & Web Tracking

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P2-01` | P2 | P1 | `PLANNED` | Block-based Landing Page Builder | TASK-P1-01 | Page drafting, publishing, SEO metadata & sitemap | `src/app/admin/sites/` |
| `TASK-P2-02` | P2 | P1 | `PLANNED` | Embedded Web Chat Widget SDK | TASK-P2-01 | Async, lightweight script with consent & visitor session | `public/sdk/chat.js` |

---

## Phase 3: Customer 360 & Unified CRM

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P3-01` | P3 | P0 | `PLANNED` | Customer 360 Full Profile View | TASK-P0-09 | Unified customer timeline, lifetime value, lead score, quotes | `src/app/admin/customers/` |
| `TASK-P3-02` | P3 | P1 | `PLANNED` | Pipeline & Opportunity Board | TASK-P3-01 | Custom stage definition, lead scoring, quote & order linkage | `src/app/admin/pipelines/` |

---

## Phase 4: Omnichannel Inbox & Connectors

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P4-01` | P4 | P0 | `PLANNED` | Unified Omnichannel Inbox UI | TASK-P0-09 | Realtime message feed, SLA indicator, customer sidebar | `src/app/admin/inbox/` |
| `TASK-P4-02` | P4 | P1 | `PLANNED` | Telegram, Zalo OA & Meta Adapters | TASK-P4-01 | Normalized message receive & outbound send handlers | `src/lib/connectors/` |

---

## Phase 5: OpenClaw, OmniRoute & Business MCP Hub Integration

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P5-01` | P5 | P0 | `PLANNED` | OmniRoute Circuit Breaker & Fallback | TASK-P0-05 | Auto-fallback when primary LLM provider fails | `src/lib/omniroute.ts` |
| `TASK-P5-02` | P5 | P1 | `PLANNED` | Agent Definition & Prompt Templates | TASK-P0-06 | CEO, Marketing, Sales, CSKH agent definitions & prompts | `src/lib/agents/` |

---

## Phase 6: Workflows & Approval Center

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P6-01` | P6 | P0 | `PLANNED` | Approval Center UI & Interceptors | TASK-P0-08 | Mandatory approval queue for sensitive actions | `src/app/admin/approvals/` |
| `TASK-P6-02` | P6 | P1 | `PLANNED` | Daily Executive Briefing Workflow | TASK-P5-02 | Automated revenue & lead summary delivered to Telegram | `src/lib/workflows/` |

---

## Phase 7: Lười Analytics & Attribution

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P7-01` | P7 | P1 | `PLANNED` | Full Funnel & Attribution Dashboard | TASK-P3-01 | Visitor to Order conversion rates & AI cost reporting | `src/app/admin/analytics/` |

---

## Phase 8: Production Release & Hardening

| Task ID | Phase | Priority | Status | Description | Dependencies | Acceptance Criteria | File / Module |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `TASK-P8-01` | P8 | P0 | `PLANNED` | Docker Compose Production Bundle | TASK-P0-10 | App, Postgres, Sidecar setup with pinned versions | `docker-compose.yml` |
