# VALIDATION — Generate Alvará reports from SharePoint base documents

Planning gate before **`n8n-build`**.

## Open items

- [x] **Trigger and event schema documented** — Manual Trigger; no payload
- [x] **Idempotency / duplicate handling defined** — Each run = new n8n execution; no SharePoint output overwrite
- [x] **Failure, retries, alerting defined** — Continue on per-item fail; ZIP = successes only; no global error workflow (v1)
- [x] **Error workflow (global) or justified local Error Trigger** — None for v1 (challenge)
- [x] **Workflow kind and sub-workflow I/O** — Orchestrator; no sub-workflows
- [x] **Node names are story-style plain English** — ARCHITECTURE table
- [x] **Report template file** — PDF `template_licenciamento.pdf`; 11 fields in INTEGRATION.md
- [x] **Alvará PDF layout consistency** — Uniform layout; parser calibrated to `doc_01.pdf`
- [x] **Input/output examples present** — Parsed JSON in INTEGRATION.md; ZIP naming in DESIGN.md
- [x] **HTML → PDF API vendor** — Same as workflow **Exemplos** (exo-5); URL/credential copied at build, not in git
- [x] **Credential names and human setup steps** — SharePoint: `Microsoft SharePoint - svc_treinamentos_wide`; PDF API: Exemplos URL (no auth in export)
- [x] **n8n Cloud instance + API URLs** — Single challenge instance (Exemplos); URLs in INTEGRATION.md
- [x] **Acceptance table maps to manual tests** — TASKS.md checklist
- [x] **Non-goals listed** — TRUTH.md
- [x] **Reusable governance** — N/A (orchestrator)
- [x] **MCP session verified during plan** — Alive; `extractFromFile` via catalog + exemplos-patterns exo-4
- [x] **Output destination** — Single ZIP on execution output; no SharePoint upload
- [x] **HTML → PDF mechanism** — Built-in HTTP Request (exo-5); Exemplos API
- [x] **Go live on deploy** — manual
- [x] **Base document count** — Exactly 20 required
- [x] **n8n Cloud version** — Same instance as **Exemplos**; compatible with MCP baseline (n8n 2.21.x)
- [x] **SharePoint File download Parent Folder** — (post Task 3 UI) loop/base File download nodes require static **Parent Folder** in JSON, not only `@odata.etag` file id; documented in INTEGRATION + exo-1

## Approval

- [x] Specs reviewed and approved for build
- **Approved by:** user
- **Date:** 2026-06-01
