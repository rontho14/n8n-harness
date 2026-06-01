# n8n Harness — Document-Driven Workflow Pipeline

This repository builds and maintains n8n workflows with **persistent specifications on disk**. Long chats do not carry requirements; files in `specs/<slug>/` do. One agent runs the pipeline; separate **skills** control each phase. **You** approve scope, credentials, and deploy/import.

## Core philosophy

1. **Specs are source of truth** — `specs/<workflow-slug>/` holds TRUTH, ARCHITECTURE, INTEGRATION, and related files.
2. **Skills read paths, not pasted specs** — agents open files from disk; they do not rely on chat history alone.
3. **Plan → human approve → build → verify → handoff** — explicit stops at validation and deploy.
4. **One task per iteration** — `TASKS.md` drives surgical edits; **`n8n-build`** auto-verifies each task and continues to the next on `[APPROVE]` (no manual verify between tasks).
5. **No subagents** — one agent; invoke `n8n-plan`, `refinar-specs`, `n8n-build`, or `n8n-verify` as separate skills.
6. **Required MCP lane** — when available, agents call vendored `n8n-harness-mcp` during plan, refine (node changes), build, and verify for discovery and validation; specs and `n8n-verify` remain authoritative ([docs/mcp-pipeline.md](docs/mcp-pipeline.md)).

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
| Build | `n8n-build` | Per task: edit JSON → validate → verify inline → next task or stop | Only after `VALIDATION.md` approved |
| Verify | `n8n-verify` | `[APPROVE]` or `[REJECT]` + findings | Usually inside `n8n-build`; standalone optional |
| Deploy (optional) | `n8n-deploy` (+ `n8n-cli` for syntax) | Remote workflow + `deployments/DEPLOYMENTS.md` | You confirm overwrite/activate |

Build forbids: real credentials in git, prod API calls with secrets, auto-import to n8n.

Verify on 4th consecutive `[REJECT]` for the same task: set `BLOCKED_STRUCTURAL`, write `STRUCTURAL_REEVAL.md`, revise specs/TASKS, require new `VALIDATION.md` approval before build resumes.

## Repository layout

```
specs/<slug>/          # Spec set (source of truth)
specs/_templates/      # Section templates (copy into specs/<slug>/)
workflows/<slug>.json  # Canonical workflow JSON
docs/                  # exemplos-patterns.md, conventions, node-catalog, rd-cloud-patterns.example, mcp-pipeline
scripts/               # validate-workflow.mjs
deployments/           # DEPLOYMENTS.md (deploy log)
package.json           # mcp:install, mcp:build (repo root)
mcp/                   # Vendored local MCP server (stdio, node docs DB)
plan/                  # MCP fork implementation phases (maintainer-local, gitignored)
.cursor/
  mcp.json             # Cursor stdio config for n8n-harness-mcp
  skills/              # n8n-plan, refinar-specs, n8n-build, n8n-verify, n8n-deploy, n8n-mcp-local, …
  rules/               # Always-on blocking rules (n8n-harness, n8n-mcp)
```

**Local MCP** is required in the pipeline when available (node discovery, `validate_node` / `validate_workflow`). Specs, `n8n-verify`, and `n8n-deploy` remain authoritative. [docs/mcp-pipeline.md](docs/mcp-pipeline.md) · [docs/mcp-local.md](docs/mcp-local.md).

## Diagram

```mermaid
sequenceDiagram
    actor User
    participant Plan as n8n-plan
    participant MCP as n8n-harness-mcp
    participant Specs as specs/slug/
    participant Refine as refinar-specs
    participant Build as n8n-build
    participant Verify as n8n-verify
    participant Deploy as n8n-deploy

    Note over User,Specs: Phase 1 — Plan
    User->>Plan: Narrative / change request
    Plan->>MCP: search_nodes, get_node per node family
    Plan->>Specs: TRUTH, ARCHITECTURE, INTEGRATION, DESIGN, VALIDATION
    Plan->>User: Summary + open items
    User->>Specs: Sets VALIDATION.md approved

    opt Optional refinement
        User->>Refine: Challenge plan
        Refine->>MCP: get_node when node choice changes
        Refine->>Specs: Updates specs one decision at a time
    end

    Note over User,Build: Phase 2 — Build (one task)
    User->>Build: After VALIDATION approved
    Build->>Specs: Read paths; ensure TASKS.md
    Build->>MCP: get_node, validate_node, validate_workflow
    Build->>Build: Edit workflows/slug.json
    Build->>Specs: CHANGELOG.md append

    Note over User,Verify: Phase 3 — Verify
    User->>Verify: Task or full workflow
    Verify->>MCP: validate_workflow findings
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

- [docs/n8n-workflow-json.md](docs/n8n-workflow-json.md) — workflow JSON shape, connections, LangChain ports
- [docs/n8n-node-catalog.md](docs/n8n-node-catalog.md) — curated node types and parameters
- [docs/n8n-cloud-cli.md](docs/n8n-cloud-cli.md) — n8n Cloud API CLI commands
- [docs/best-practices.md](docs/best-practices.md) — naming, global error workflow, reusable sub-workflows
- [REMINDERS.md](REMINDERS.md) — deferred follow-ups
- [docs/conventions.md](docs/conventions.md) — repo paths and JSON shape
- [docs/validation-rubric.md](docs/validation-rubric.md) — build-ready checklist
- [docs/invoke-cheatsheet.md](docs/invoke-cheatsheet.md) — which skill when
- [docs/mcp-pipeline.md](docs/mcp-pipeline.md) — required MCP calls per pipeline phase
- [docs/mcp-local.md](docs/mcp-local.md) — vendored MCP install, build, env, disabled tools
- [mcp/docs/ARCHITECTURE.md](mcp/docs/ARCHITECTURE.md) — MCP server architecture and improvement guide (maintainers)
