---
name: n8n-build
description: >-
  Implements one TASKS.md item at a time in workflows/<slug>.json after VALIDATION.md
  is approved. Reads spec file paths from disk; appends CHANGELOG.md per task.
  No credentials in git, no prod secret calls, no auto-import to n8n.
  Aliases: n8n-build.
  Use only after explicit VALIDATION.md approval.
---

# n8n Build

Implementation phase for a single approved workflow. Surgical edits only.

## Prerequisites (blocking)

1. `specs/<slug>/VALIDATION.md` has **Approval** checked and dated.
2. User invoked **`n8n-build`** (not ambient context).
3. Read paths:
   - `specs/<slug>/TRUTH.md`
   - `specs/<slug>/ARCHITECTURE.md`
   - `specs/<slug>/INTEGRATION.md`
   - `specs/<slug>/DESIGN.md` (if present)
   - `specs/<slug>/TASKS.md`
   - `docs/best-practices.md`
   - `docs/conventions.md`
   - `.cursor/skills/n8n-cli/workflow-json.md`

If `VALIDATION.md` is not approved, **stop** and tell the user to approve or run `n8n-plan` / `refinar-specs`.

## Steps

### 1. Ensure TASKS.md exists

If missing, generate from specs: ordered tasks with Description, Dependencies, Target files (`workflows/<slug>.json`), Success criteria, Status `PENDING`, Review Rejections `0`.

### 2. Pick exactly one task

- First `PENDING` task whose dependencies are `COMPLETED`.
- If user passed a task id/number, only that task.
- If task is `BLOCKED_STRUCTURAL`, **stop** — require `STRUCTURAL_REEVAL.md` and new validation approval.

### 3. Implement

- Edit **`workflows/<slug>.json`** only as needed for this task.
- Match node names and graph to `ARCHITECTURE.md` (**story-style** names per `docs/best-practices.md`).
- Wire HTTP/Slack/etc. per `INTEGRATION.md` (credential **names** only).
- Set `settings.errorWorkflow` to the documented global error handler, **or** add local Error Trigger only if ARCHITECTURE marks `local-exceptional` with justification.
- **Execute Workflow** nodes: name by intent; pass only documented input fields; expect documented outputs.
- Explicit `={{ }}` expressions.
- Reject generic node labels in your own work (`If`, `Set`, `HTTP Request` without context).

### 4. Local validate

```bash
node scripts/validate-workflow.mjs workflows/<slug>.json
```

Fix errors before marking task complete.

### 5. Update task and changelog

- Set task **Status** to `READY_FOR_VERIFY` (or `COMPLETED` if your TASKS template uses that after verify — prefer `READY_FOR_VERIFY` until verify passes).
- Append `CHANGELOG.md` entry: date, task title, what changed (human-readable, no secret values).

### 6. Hand off

Tell the user to run **`n8n-verify`** for this task. Do not mark task `COMPLETED` until verify returns `[APPROVE]`.

## Forbidden

- Real API keys, tokens, or passwords in JSON or commits.
- Prod HTTP calls using secrets from env or files.
- `n8n-cli workflow create/update`, activate, or import.
- Implementing multiple tasks in one invocation unless user explicitly requests a batch and specs allow it.
- Subagents.

## On verify feedback

User returns with `[REJECT]` findings: fix only what verify listed, increment understanding in specs if spec was wrong (ask user before changing TRUTH), re-validate JSON, set task back to `READY_FOR_VERIFY`.
