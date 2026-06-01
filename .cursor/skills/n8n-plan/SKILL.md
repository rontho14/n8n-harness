---
name: n8n-plan
description: >-
  Document-driven planning for n8n workflows. Gathers context, creates or updates
  specs/<slug>/ (TRUTH, ARCHITECTURE, INTEGRATION, DESIGN), runs the validation
  scorecard into VALIDATION.md, and stops for human approval. Does not edit workflow JSON.
  Use only when the user explicitly invokes planning before build or deploy.
---

# n8n Plan

First phase of the n8n harness pipeline. Builds persistent specs on disk so later skills do not depend on chat history.

**Do not** edit `workflows/*.json` in this skill. **Do not** deploy or call n8n with secrets.

## When to use

User invokes **`n8n-plan`** or asks to plan/spec a new or changed workflow before implementation.

## Inputs to gather

1. User narrative (trigger, systems, success/failure expectations).
2. `docs/best-practices.md`, `docs/conventions.md`, `docs/validation-rubric.md`, `docs/n8n-cloud-cli.md`, `docs/n8n-workflow-json.md`, `docs/n8n-node-catalog.md`.
3. Existing `workflows/` and sibling `specs/*/` for patterns and naming collisions.
4. Optional `docs/` or README constraints.

If slug is unknown, propose a kebab-case `<slug>` and confirm once.

## Steps

### 1. Choose or create spec folder

`specs/<slug>/` — same slug as future `workflows/<slug>.json`.

### 2. Draft or update spec files

Copy section headings from `specs/_templates/` when creating new files.

| File | Content |
|------|---------|
| `TRUTH.md` | Business only: stories, Given/When/Then, scope, non-goals, ops expectations |
| `ARCHITECTURE.md` | Workflow kind (`orchestrator` \| `reusable`), trigger, mermaid graph, **story-style** node table, **global error workflow** (or justified local), sub-workflow I/O, retries |
| `INTEGRATION.md` | Per external system: URLs (dev/prod), auth **names**, methods, bodies, rate limits, idempotency, human credential steps |
| `DESIGN.md` | Only if messaging/UI copy matters (Slack blocks, email subject, etc.) |
| `VALIDATION.md` | Open items from rubric + empty approval block |
| `TASKS.md` | Optional skeleton only — full task list may wait until post-approval build prep |
| `CHANGELOG.md` | Create empty with heading if missing |

Keep **implementation detail out of TRUTH.md** (no node types, no JSON).

### 2b. Best practices during planning

Read `docs/best-practices.md`. Explicitly decide:

- **Error handling:** name the global error workflow (preferred) or document why local Error Trigger is exceptional.
- **Sub-workflows:** extract or reference reusables with strict inputs/outputs; note governance for shared utilities.
- **Node names:** draft ARCHITECTURE table with plain-English names (e.g. `Does user have email?`, not `If`).
- **Workflow title:** short descriptive English matching team style (e.g. `Report workflows using wildcard SQL selects`).

Propose a **new reusable** spec folder when logic is shared across workflows or scope is a single bounded capability (email → user profile).

### 2c. Go live on deploy (planning question)

Ask once and record in `ARCHITECTURE.md` → **Go live on deploy**:

| Answer | Meaning |
|--------|---------|
| `yes` | After deploy, run `workflow activate` (go live on Cloud) unless user says otherwise at deploy time |
| `no` | Leave draft/inactive until manual publish in UI or later deploy |
| `manual` | User will always decide at deploy time |

For **workflow kind: reusable**, default recommendation is **`no`** — see [REMINDERS.md](../../../REMINDERS.md) P1.3 (not enforced in deploy skill yet).

### 3. Run validation scorecard

Read `docs/validation-rubric.md`. For each rubric row not fully answered in specs, add a checkbox under `VALIDATION.md` → **Open items**.

### 4. Summarize and stop

Present the user:

- Slug and file paths (paths only — do not paste full specs).
- One-paragraph summary of trigger, systems, and error handling.
- List of open items still blocking build.
- Explicit ask: review specs and set **Approval** in `VALIDATION.md`.

### 5. Halt

**Stop here.** Tell the user next steps:

- Optional: `refinar-specs` for Q&A refinement.
- When ready: approve `VALIDATION.md`, then invoke **`n8n-build`**.

## Forbidden

- Subagents or Task tool for parallel spec writers.
- Writing or modifying `workflows/<slug>.json`.
- `n8n-cli workflow create/update`, credential create, or prod API calls.
- Pasting entire spec files into chat instead of writing to disk.

## Templates

Copy from `specs/_templates/` or author sections inline; see `specs/_templates/README.md`.
