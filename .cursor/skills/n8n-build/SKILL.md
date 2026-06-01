---
name: n8n-build
description: >-
  Implements TASKS.md items in workflows/<slug>.json after VALIDATION.md approval.
  Default: autonomous loop — build task → verify → next task until done or [REJECT].
  Aliases: n8n-build. No credentials in git, no auto-import to n8n.
---
# n8n Build

Implementation phase for an approved workflow. Surgical edits per task.

## Prerequisites (blocking)

1. `specs/<slug>/VALIDATION.md` has **Approval** checked and dated.
2. User invoked **`n8n-build`** (or continues an autonomous run).
3. Read from disk: `TRUTH.md`, `ARCHITECTURE.md`, `INTEGRATION.md`, `DESIGN.md` (if present), `TASKS.md`, `docs/best-practices.md`, `docs/conventions.md`, `docs/n8n-workflow-json.md`, `docs/n8n-node-catalog.md`, `.cursor/skills/n8n-expression-syntax/SKILL.md` when wiring expressions.

If `VALIDATION.md` is not approved, **stop**.

## Autonomous pipeline (default)

**Do not** ask the user to run **`n8n-verify`** between tasks. One **`n8n-build`** invocation runs this loop:

```
WHILE there is a runnable task:
  1. Pick next task (see below)
  2. Implement that task only in workflows/<slug>.json
  3. node scripts/validate-workflow.mjs workflows/<slug>.json — fix until OK
  4. Run the full checklist from .cursor/skills/n8n-verify/SKILL.md for THIS task
  5. If [REJECT]: apply verify rules (increment rejections, set PENDING), STOP, report findings
  6. If [APPROVE]: set task COMPLETED, append CHANGELOG.md, continue loop
END
Report summary: tasks completed, current task, or stop reason
```

**Runnable task:** first `PENDING` whose dependencies are `COMPLETED`. Skip tasks marked **out of MVP scope** / optional unless the user explicitly includes them.

**Single-task mode:** user says “task N only” or “stop after one task” → run one build + verify iteration, then stop.

**Stop without shame:** `[REJECT]`, `BLOCKED_STRUCTURAL`, no runnable tasks, or user interrupt.

## Steps (each iteration)

### 1. Ensure TASKS.md exists

If missing, generate from specs (Description, Dependencies, Target files, Success criteria, Status `PENDING`, Review Rejections `0`).

### 2. Pick exactly one task

- First runnable `PENDING` (autonomous loop) **or** user-specified task only.
- `BLOCKED_STRUCTURAL` → **stop**; require `STRUCTURAL_REEVAL.md` and new validation approval.

### 3. Implement

- Edit **`workflows/<slug>.json`** for this task only.
- Match node names and graph to `ARCHITECTURE.md` (story-style names).
- Wire integrations per `INTEGRATION.md` (credential **names** only).
- **Microsoft SharePoint (builtin):** Resource is only **File**, **Item**, or **List** — never `folder`. To list files in a path use **Item → getAll** + Filter on `webUrl`/filename; see `docs/n8n-node-catalog.md`.
- `settings.errorWorkflow` only if ARCHITECTURE requires global handler; local Error Trigger only if `local-exceptional`; if ARCHITECTURE documents **`none (exceptional)`** with justification, omit both.
- Explicit `={{ }}` where required; no generic node labels.

### 4. Local validate

```bash
node scripts/validate-workflow.mjs workflows/<slug>.json
```

Fix errors before verify.

### 5. Verify (inline — same invocation)

Follow **n8n-verify** through the checklist. Emit exactly `[APPROVE]` or `[REJECT]` in your work log. On `[APPROVE]`, update `TASKS.md` to **COMPLETED** and append `CHANGELOG.md`. On `[REJECT]`, follow verify’s TASKS.md rules and **stop the loop**.

### 6. Continue or finish

- **`[APPROVE]`** and more runnable tasks → next iteration (no user prompt).
- **`[REJECT]`** or no tasks left → summarize for the user.

## Forbidden

- Secrets in JSON or commits; prod API calls with secrets from files.
- `n8n-cli workflow create/update`, activate, or import.
- Subagents.
- Stopping after one task when autonomous mode is active and more runnable tasks exist — unless verify rejected or user asked for single-task mode.

## On verify feedback

`[REJECT]` on a later user message: fix only listed findings, re-validate, set task `READY_FOR_VERIFY` or `PENDING`, re-run build+verify for that task. After **4** rejections on the same task → `BLOCKED_STRUCTURAL` path per n8n-verify.
