---
name: n8n-verify
description: >-
  Verifies workflows/<slug>.json against approved specs: JSON lint, graph vs
  ARCHITECTURE, INTEGRATION alignment, error path, no secrets. Outputs exactly
  [APPROVE] or [REJECT] with numbered findings. Updates TASKS.md rejections;
  on 4th reject triggers STRUCTURAL_REEVAL.md path.
  Aliases: n8n-verify.
---

# n8n Verify

Strict reviewer for workflow JSON against on-disk specs. Read-only toward n8n remote (no deploy).

## Prerequisites

- Build completed for the current task or full workflow.
- Often invoked **inline by n8n-build** after each task — same checklist; user does not need a separate chat turn.
- Read `specs/<slug>/` specs and `workflows/<slug>.json`.
- For JSON/port semantics: `docs/n8n-workflow-json.md`, `docs/n8n-node-catalog.md`.
- **MCP (required):** read `.cursor/skills/n8n-mcp-local/SKILL.md` and `docs/mcp-pipeline.md` before `validate_workflow`.

## Checks

1. **JSON** — run `node scripts/validate-workflow.mjs workflows/<slug>.json` (report failures).
2. **Graph** — nodes and connections match `ARCHITECTURE.md` (order, branches).
3. **Story naming** — `[REJECT]` if any node name is generic (`If`, `Set`, `Switch`, `HTTP Request`, `Code`, `Webhook` alone). Names should read as plain English per `docs/best-practices.md`.
4. **Error handling** — JSON must match ARCHITECTURE: (a) `settings.errorWorkflow` set to documented global handler, **or** (b) local Error Trigger with `local-exceptional` justification, **or** (c) **`none (exceptional)`** documented in ARCHITECTURE with neither handler nor Error Trigger. `[REJECT]` only if JSON contradicts the spec (e.g. missing required global handler, or handlers present when spec says none).
5. **Sub-workflows** — each Execute Workflow node matches ARCHITECTURE table (child workflow, inputs/outputs). Reusable workflows: I/O contract complete in specs.
6. **Integration** — HTTP/Slack/webhook nodes use URLs, methods, and credential **names** from `INTEGRATION.md`.
7. **Secrets** — no literal tokens/keys/passwords; credential refs by name/id only.
8. **Acceptance** — map TRUTH Given/When/Then rows to **Manual test steps** (numbered); flag gaps.
9. **DESIGN** — if present, message copy matches DESIGN (labels only; no deploy test).
10. **Expressions** — `[REJECT]` on obvious syntax issues: missing `{{ }}` in dynamic fields, webhook fields at `$json` root instead of `.body` when INTEGRATION documents webhook body, `$node["..."]` names that do not match workflow JSON, or `{{ }}` inside Code node `jsCode`. SharePoint: `[REJECT]` if If/Filter uses plain-text folder name in `webUrl` **contains** when INTEGRATION documents a display name with spaces (must use URL-encoded segment per EXAMPLES ex16). PDF: `[REJECT]` if workflow uses HTTP/API to **read** PDF text when ARCHITECTURE/INTEGRATION specify **Extract from File** `pdf` ([exemplos-patterns.md](../../../docs/exemplos-patterns.md) exo-4). See `COMMON_MISTAKES.md` (`sp-weburl-plain-text`, `sp-etag-path`, `loop-node-name`, `pdf-read-http-api`).
11. **MCP validation** — run `validate_workflow` on `workflows/<slug>.json` (profile `runtime` or `strict` per `.cursor/skills/n8n-mcp-local/VALIDATION_GUIDE.md`). Map MCP **errors** to numbered findings; `[REJECT]` if structural/config errors remain unfixed. MCP **warnings** → numbered findings; may still `[APPROVE]` if specs pass and warnings are acceptable. If MCP unavailable, **stop** per `docs/mcp-pipeline.md` — do not emit `[APPROVE]`. When **n8n-build** already ran `validate_workflow` this iteration, reuse those results if still current; otherwise call again.

### Optional Cloud checks (read-only, when user may deploy soon)

If `n8n-cli` is configured, run before `[APPROVE]` when practical — report as findings, do not mutate:

```bash
n8n-cli credential list
n8n-cli workflow list --format=json
```

- **Credentials** — every credential **name** referenced in workflow JSON appears in `credential list` (warn if missing; do not fail solely if CLI unavailable).
- **Sub-workflows** — each child workflow **name** in ARCHITECTURE Execute Workflow table exists in `workflow list` (warn if missing).

Do not activate, deploy, or create credentials in this skill.

## Output format (exact)

First line must be either `[APPROVE]` or `[REJECT]`.

### If approve

```
[APPROVE]

Manual test steps:
1. ...
2. ...
```

Then update `TASKS.md`: set task **Status** to `COMPLETED`, leave Review Rejections unchanged.

### If reject

```
[REJECT]

1. <finding>
2. <finding>
```

Then:

1. Increment **Review Rejections** on the current task.
2. Set task **Status** to `PENDING` (or `IN_PROGRESS`).
3. If Review Rejections **≥ 4** on the **same** task:
   - Set status `BLOCKED_STRUCTURAL`
   - Create or update `STRUCTURAL_REEVAL.md` (root cause, revised graph/integration plan)
   - Uncheck **Approval** in `VALIDATION.md` and add open item: structural reeval required
   - Tell user: revise specs, re-approve VALIDATION, then `n8n-build` — do not loop build blindly

## Task-scoped verify

When **`n8n-build`** runs autonomously, judge **only the current task’s** success criteria in `TASKS.md` plus global blockers (secrets, JSON validity, story naming, error-handling mode, graph nodes for this task must exist). Do not `[REJECT]` optional/future tasks not yet built.

## Forbidden

- Fixing JSON in this skill ( **`n8n-build`** fixes after `[REJECT]`).
- Deploying or activating workflows.
- `[APPROVE]` with outstanding spec contradictions, failing validate script, or blocked MCP.
- Skipping required `validate_workflow` because MCP ran earlier in the same turn without recording results.

## Subagents

Do not use subagents or Task tool.
