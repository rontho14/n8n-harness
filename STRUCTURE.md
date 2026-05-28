# n8n Harness — Document-Driven Workflow Pipeline

This repository builds and maintains n8n workflows with **persistent specifications on disk**. Long chats do not carry requirements; files in `specs/<slug>/` do. One agent runs the pipeline; separate **skills** control each phase. **You** approve scope, credentials, and deploy/import.

## Core philosophy

1. **Specs are source of truth** — `specs/<workflow-slug>/` holds TRUTH, ARCHITECTURE, INTEGRATION, and related files.
2. **Skills read paths, not pasted specs** — agents open files from disk; they do not rely on chat history alone.
3. **Plan → human approve → build → verify → handoff** — explicit stops at validation and deploy.
4. **One task at a time** — `TASKS.md` drives surgical edits to `workflows/<slug>.json`.
5. **No subagents** — one agent; invoke `n8n-plan`, `refinar-specs`, `n8n-build`, or `n8n-verify` as separate skills.

## Specification documents

| File | Role |
|------|------|
| `TRUTH.md` | User stories, Given/When/Then acceptance, in/out of scope, failure/ops expectations — **business only** |
| `ARCHITECTURE.md` | Trigger, node graph (text + mermaid), error workflow, retries, concurrency, sub-workflows, node name → responsibility |
| `INTEGRATION.md` | Per system: auth placeholder names, URLs, methods, bodies, rate limits, idempotency, **human credential setup steps** |
| `DESIGN.md` | Optional: Slack/email copy, templates, labels |
| `TASKS.md` | Tasks: Description, Dependencies, Target files, Success criteria, Status, Review Rejections |
| `VALIDATION.md` | Approval block + open items; must be cleared and approved before build |
| `CHANGELOG.md` | Short human-readable notes per completed task |
| `STRUCTURAL_REEVAL.md` | Only after 4 verify rejects on the same task — revised plan before resuming build |

Canonical workflow JSON: `workflows/<slug>.json`.

## Phases and skills

| Phase | Skill / command | Output | Human gate |
|-------|-----------------|--------|------------|
| Plan | `n8n-plan` | Draft specs + `VALIDATION.md` open items | Approve `VALIDATION.md`; no workflow JSON |
| Refine | `refinar-specs` | Updated spec files, one Q at a time | Answer each question |
| Build | `n8n-build` | One task → `workflows/<slug>.json` + `CHANGELOG.md` | Only after `VALIDATION.md` approved |
| Verify | `n8n-verify` | `[APPROVE]` or `[REJECT]` + findings | On reject, re-run build with feedback |
| Deploy (optional) | `n8n-deploy` (+ `n8n-cli` for syntax) | Remote workflow + `deployments/DEPLOYMENTS.md` | You confirm overwrite/activate |

Build forbids: real credentials in git, prod API calls with secrets, auto-import to n8n.

Verify on 4th consecutive `[REJECT]` for the same task: set `BLOCKED_STRUCTURAL`, write `STRUCTURAL_REEVAL.md`, revise specs/TASKS, require new `VALIDATION.md` approval before build resumes.

## Repository layout

```
specs/<slug>/          # Spec set (source of truth)
specs/_templates/      # Section templates (copy into specs/<slug>/)
workflows/<slug>.json  # Canonical workflow JSON
docs/                  # conventions.md, validation-rubric.md
scripts/               # validate-workflow.mjs
deployments/           # DEPLOYMENTS.md (deploy log)
.cursor/
  skills/              # n8n-plan, refinar-specs, n8n-build, n8n-verify, n8n-deploy, …
  rules/               # Always-on blocking rules
```

## Diagram

```mermaid
sequenceDiagram
    actor User
    participant Plan as n8n-plan
    participant Specs as specs/slug/
    participant Refine as refinar-specs
    participant Build as n8n-build
    participant Verify as n8n-verify
    participant Deploy as n8n-deploy

    Note over User,Specs: Phase 1 — Plan
    User->>Plan: Narrative / change request
    Plan->>Specs: TRUTH, ARCHITECTURE, INTEGRATION, DESIGN, VALIDATION
    Plan->>User: Summary + open items
    User->>Specs: Sets VALIDATION.md approved

    opt Optional refinement
        User->>Refine: Challenge plan
        Refine->>Specs: Updates specs one decision at a time
    end

    Note over User,Build: Phase 2 — Build (one task)
    User->>Build: After VALIDATION approved
    Build->>Specs: Read paths; ensure TASKS.md
    Build->>Build: Edit workflows/slug.json
    Build->>Specs: CHANGELOG.md append

    Note over User,Verify: Phase 3 — Verify
    User->>Verify: Task or full workflow
    Verify->>Verify: JSON, graph, integration, secrets scan
    alt APPROVE
        Verify->>User: [APPROVE]
    else REJECT (1-3)
        Verify->>Specs: Increment Review Rejections
        User->>Build: Fix with feedback
    else REJECT (4th same task)
        Verify->>Specs: STRUCTURAL_REEVAL.md, BLOCKED_STRUCTURAL
        User->>Specs: Re-approve VALIDATION.md
    end

    Note over User,Deploy: Phase 4 — Handoff (optional)
    User->>Deploy: Confirm deploy plan
    Deploy->>Deploy: validate → n8n-cli → verify → log
```

## Related docs

- [docs/n8n-cloud-cli.md](docs/n8n-cloud-cli.md) — n8n Cloud API CLI commands
- [docs/best-practices.md](docs/best-practices.md) — naming, global error workflow, reusable sub-workflows
- [REMINDERS.md](REMINDERS.md) — deferred follow-ups
- [docs/conventions.md](docs/conventions.md) — repo paths and JSON shape
- [docs/validation-rubric.md](docs/validation-rubric.md) — build-ready checklist
- [docs/invoke-cheatsheet.md](docs/invoke-cheatsheet.md) — which skill when
