# CHANGELOG — LƯỜI BUSINESS OS

All notable changes to the LƯỜI BUSINESS OS architecture, schemas, engines, and sidecar integrations will be documented in this file.

---

## [0.2.0] — 2026-08-11 (Phase 0 Foundation Milestone)

### Added
- **Documentation Suite**:
  - `docs/MASTER-ROADMAP.md`: Master multi-phase product roadmap (Phases 0 through 8).
  - `docs/ARCHITECTURE.md`: System architecture blueprint (Modular Monolith + OpenClaw & OmniRoute sidecars).
  - `docs/SECURITY.md`: 9-Tier RBAC hierarchy and secret encryption specification.
  - `docs/DATA-MODEL.md`: Complete ER entity schemas across 9 core domain groups.
  - `docs/CONNECTORS.md`: Unified connector interface and omnichannel capability matrix.
  - `TASKS.md`: Task tracking matrix with acceptance criteria.
  - `CHANGELOG.md`: Core system changelog.

- **Phase 0 Foundation Core Engines**:
  - `src/lib/rbac.ts`: 9-Tier Role-Based Access Control (RBAC) engine with workspace, collection, record, and field-level permission checks.
  - `src/lib/audit.ts`: Append-only structured audit logger capturing actor, role, workspace, action, resource, before/after diffs, and correlationId.
  - `src/lib/crypto.ts`: AES-256-GCM secret encryption/decryption module for credentials, API tokens, and private references.
  - `src/lib/omniroute.ts`: OmniRoute Model Gateway client configured at `http://127.0.0.1:20128/v1` supporting 6 model routing profiles (`business/fast`, `business/quality`, `business/creative`, `business/private`, `business/vision`, `business/emergency`).
  - `src/lib/openclaw.ts`: OpenClaw agent sidecar adapter for session management, skill execution, workflow triggers, and channel bridges.
  - `src/lib/mcp-hub.ts`: Business MCP Tool Registry supporting namespaced tools (`cms.*`, `customer.*`, `conversation.*`, `lead.*`, `opportunity.*`, `quote.*`, `order.*`, `ticket.*`, `appointment.*`, `campaign.*`, `analytics.*`, `knowledge.*`, `workflow.*`, `approval.*`) with strict JSON schema validation and permission enforcement.
  - `src/lib/approval.ts`: Approval Center Engine with execution levels (`READ_ONLY`, `DRAFT`, `EXECUTE`) and policy enforcement for sensitive actions.
  - `src/lib/identity-resolution.ts`: Customer 360 identity resolution engine with Vietnamese phone number normalization (`0xx`, `84xx`, `+84xx` -> `+84xx`) and multi-channel identity merging.
  - `src/app/api/system/health/route.ts`: System health check endpoint evaluating database, sidecar, and service status.

---

## [0.1.0] — 2026-08-04
- Initial prototype release of CMS and miniCRM modules.
