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
- Read `specs/<slug>/` specs and `workflows/<slug>.json`.

## Checks

1. **JSON** — run `node scripts/validate-workflow.mjs workflows/<slug>.json` (report failures).
2. **Graph** — nodes and connections match `ARCHITECTURE.md` (order, branches).
3. **Story naming** — `[REJECT]` if any node name is generic (`If`, `Set`, `Switch`, `HTTP Request`, `Code`, `Webhook` alone). Names should read as plain English per `docs/best-practices.md`.
4. **Error handling** — `settings.errorWorkflow` matches ARCHITECTURE **or** local Error Trigger present only with documented `local-exceptional` justification. `[REJECT]` if neither.
5. **Sub-workflows** — each Execute Workflow node matches ARCHITECTURE table (child workflow, inputs/outputs). Reusable workflows: I/O contract complete in specs.
6. **Integration** — HTTP/Slack/webhook nodes use URLs, methods, and credential **names** from `INTEGRATION.md`.
7. **Secrets** — no literal tokens/keys/passwords; credential refs by name/id only.
8. **Acceptance** — map TRUTH Given/When/Then rows to **Manual test steps** (numbered); flag gaps.
9. **DESIGN** — if present, message copy matches DESIGN (labels only; no deploy test).

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

## Forbidden

- Fixing JSON in this skill (user runs **`n8n-build`** with findings).
- Deploying or activating workflows.
- `[APPROVE]` with outstanding spec contradictions or failing validate script.

## Subagents

Do not use subagents or Task tool.
