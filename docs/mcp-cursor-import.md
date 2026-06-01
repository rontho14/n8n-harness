# MCP → Cursor import log

Inventory after vendoring `mcp/` (phase 1). Source: upstream `CLAUDE.md`, `.claude/agents/`, and `mcp/data/skills/`.

## Imported to `.cursor/`

| Source | Destination | Notes |
|--------|-------------|--------|
| `mcp/data/skills/n8n-mcp-tools-expert/*` | `.cursor/skills/n8n-mcp-local/` | Guides + `SKILL.md` (harness-specific) |
| `mcp/data/skills/n8n-node-configuration` | `.cursor/skills/n8n-node-configuration/` | As-is + harness note in SKILL |
| `mcp/data/skills/n8n-validation-expert` | `.cursor/skills/n8n-validation-expert/` | |
| `mcp/data/skills/n8n-workflow-patterns` | `.cursor/skills/n8n-workflow-patterns/` | |
| `mcp/data/skills/n8n-code-javascript` | `.cursor/skills/n8n-code-javascript/` | |
| `mcp/data/skills/n8n-code-python` | `.cursor/skills/n8n-code-python/` | |
| `mcp/data/skills/n8n-expression-syntax` (extended) | `.cursor/skills/n8n-expression-syntax/*_FULL.md` | Harness compact refs kept primary |
| `CLAUDE.md` (architecture, commands, pitfalls) | `.cursor/skills/n8n-mcp-maintain/` | `SKILL.md` + `ARCHITECTURE.md` |
| `.claude/agents/n8n-mcp-tester.md` | `.cursor/skills/n8n-mcp-local/SKILL.md` | Test checklist section |
| `.claude/agents/mcp-backend-engineer.md` | `.cursor/skills/n8n-mcp-maintain/SKILL.md` | Maintainer scope |

| Rule | `.cursor/rules/n8n-mcp.mdc` | Assistive MCP; reload after `mcp/` changes |

## Not imported (by design)

| Source | Reason |
|--------|--------|
| `.claude/agents/code-reviewer.md` | Generic; Cursor review suffices |
| `.claude/agents/context-manager.md` | Sub-agent orchestration; harness forbids pipeline subagents |
| `.claude/agents/debugger.md` | Generic debugging |
| `.claude/agents/deployment-engineer.md` | Harness uses `n8n-deploy` + `plan/`, not Docker/Railway from upstream |
| `.claude/agents/technical-researcher.md` | Generic research |
| `.claude/agents/test-automator.md` | Upstream vitest suite excluded from vendor tree |
| `CLAUDE.md` attribution / GH CLI / sub-agent spawn rules | Not applicable to harness |
| `n8n-mcp-tester` tool list (Supabase, context7, etc.) | Upstream-only MCP servers |

## Safe to delete from `mcp/` after review

- `mcp/.claude/`
- `mcp/CLAUDE.md`

Keep `mcp/data/skills/` until phase 3+ confirms sync script does not require originals (or re-copy from upstream on sync).

## Vendor docs (phase 1)

Selective retention under `mcp/docs/` — see [mcp/docs/README.md](../mcp/docs/README.md). Removed: deploy/IDE marketing guides and `docs/img/`. Kept: `docs/local/` (e.g. `N8N_AI_WORKFLOW_BUILDER_ANALYSIS.md`), database/security/diff reference docs.
