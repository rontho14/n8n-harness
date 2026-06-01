# n8n workflow best practices (team standards)

Apply when planning, building, and reviewing workflows in this harness. Repo mechanics (file paths, git) live in [conventions.md](conventions.md).

## Naming — read a story

Workflow and node names are **short, descriptive plain English**. Someone opening the canvas should follow the flow like a sentence.

| Bad | Good |
|-----|------|
| `If` | `Does user have email?` |
| `HTTP Request` | `Fetch user profile from directory` |
| `Set` | `Build Slack message blocks` |
| `Report` | `Report workflows using wildcard SQL selects` |

**Workflow `name` field:** full plain-English title (not kebab-case). **Repo slug** stays kebab-case (`workflows/<slug>.json`).

**Nodes:**

- Unique within the workflow (connection keys use **names**).
- Questions for IF/Switch: phrase as a yes/no question.
- Actions: verb + object (`Send alert to Slack`, `Look up user by email`).
- Avoid type names as labels: not `Webhook`, prefer `Receive Datadog monitor webhook`.

## Error handling (required)

Every workflow **must** use one of:

### 1. Global error workflow (preferred)

Set in workflow settings (`settings.errorWorkflow`) to a dedicated **Error handling** workflow that centralizes alerting and logging.

Document in `ARCHITECTURE.md`:

- Error workflow **name** and remote **id** (if known)
- What context is passed (failed workflow name, execution id, last node, error message)

Parent workflows do not re-implement alert logic on every branch unless spec requires it.

### 2. Local Error Trigger (exceptional)

A workflow-local **Error Trigger** node is allowed only when:

- The spec documents **why** a global handler is insufficient, and
- `ARCHITECTURE.md` marks `Error handling: local (exceptional)` with justification.

Misconfigured workflows (neither global nor approved local) are flagged by existing ops workflows — new work must not rely on that gap.

## Reusable workflows (sub-workflows)

Use sub-workflows in two cases:

1. **Decompose** a complex orchestrator into smaller, manageable pieces.
2. **Share** frequent logic (e.g. email → full user profile with Slack ID, Jira ID) across many parent workflows.

### Engineering rules for reusable workflows

| Rule | Spec / implementation |
|------|------------------------|
| Strict inputs | Document in `ARCHITECTURE.md` + `INTEGRATION.md`; map to Execute Workflow input fields |
| Strict outputs | Document return shape; parents must not assume extra fields |
| Limited scope | One clear capability per reusable workflow |
| Governance | Viewable by everyone; **write access limited** — large blast radius on failure |
| Naming | Same plain-English rules; name states the capability (`Resolve user profile by email`) |

### Orchestrator vs reusable

In `ARCHITECTURE.md`, set **Workflow kind:**

- `orchestrator` — composes sub-workflows and external calls
- `reusable` — called only via **Execute Workflow**; no standalone business trigger unless needed for manual test

Reusable workflows get their own `specs/<slug>/` and `workflows/<slug>.json`. Parents link by **workflow name** (and id after deploy) in ARCHITECTURE.

### When to extract during planning

`n8n-plan` should propose a sub-workflow when:

- Logic appears in multiple existing workflows
- A block has a stable contract (inputs/outputs) and single responsibility
- The parent graph exceeds ~10–12 nodes or mixes unrelated concerns

## Planning and review checklist

**Plan (`n8n-plan`):** error workflow named; sub-workflow boundaries and I/O; workflow kind; story-style node names in ARCHITECTURE table.

**Build (`n8n-build`):** implement `settings.errorWorkflow` or justified local Error Trigger; Execute Workflow nodes named for intent (`Resolve user profile by email`).

**Verify (`n8n-verify`):** reject generic node names; reject missing error handling; reject reusable workflows without documented I/O.

## Related docs

- [conventions.md](conventions.md) — repo paths, JSON shape, credentials
- [n8n-workflow-json.md](n8n-workflow-json.md) — workflow JSON and connection ports
- [n8n-node-catalog.md](n8n-node-catalog.md) — node types and parameters
- [validation-rubric.md](validation-rubric.md) — build-ready scorecard
