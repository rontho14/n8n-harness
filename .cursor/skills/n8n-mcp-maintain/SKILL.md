---
name: n8n-mcp-maintain
description: >-
  Edit the vendored MCP server under mcp/ (TypeScript, MCP SDK, tools, database).
  Use for fork phases 2–4, upstream merges, and MCP bugs — not for harness workflow
  JSON in workflows/.
---

# Maintain vendored `mcp/`

Implementation phases: [`plan/README.md`](../../../plan/README.md).

Architecture and improvement guide: [mcp/docs/ARCHITECTURE.md](../../../mcp/docs/ARCHITECTURE.md). Short map: [ARCHITECTURE.md](ARCHITECTURE.md).

## Scope

| In scope | Out of scope |
|----------|----------------|
| `mcp/src/**`, `mcp/scripts/**`, `mcp/package.json` | `workflows/`, `specs/` (use `n8n-build` / `n8n-verify`) |
| MCP tools, SQLite `data/nodes.db` rebuild | n8n Cloud deploy (`n8n-deploy`) |
| Telemetry removal (phase 3) | Adding secrets to git |

## MCP layout (entrypoints)

- `mcp/src/mcp/server.ts` — MCP server
- `mcp/src/mcp/tools.ts` — tool definitions
- `mcp/src/mcp/index.ts` — stdio entry (`node dist/mcp/index.js`)
- `mcp/src/database/` — SQLite + repositories
- `mcp/src/services/` — validators, property filter, workflow validation

## Commands (from repo root)

```powershell
npm run mcp:install             # npm ci --prefix mcp
npm run mcp:build               # compile to mcp/dist/
npm run rebuild --prefix mcp    # maintainer; slow
npm run validate --prefix mcp
npm run typecheck --prefix mcp
```

CI: `.github/workflows/mcp-build.yml` runs install + build on `mcp/**` changes.

After code changes: build → ask user to **reload Cursor MCP** → optional checks via [`n8n-mcp-local`](../n8n-mcp-local/SKILL.md).

## Implementation rules

1. Follow [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) patterns already in `mcp/src/mcp/`.
2. Preserve backward compatibility for tool names harness agents rely on.
3. No outbound telemetry (phase 3); no secrets in logs or committed JSON.
4. Run `typecheck` after edits; upstream unit tests live in `mcp/tests/` (excluded from vendor tree until re-added).

## Upstream sync

Vendored fork — cherry-pick or manual merge from [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp), then re-run phases 3–4 and reload MCP.

Do **not** copy upstream commit trailers or attribution requirements into this harness repo.

## Claude artifacts (migrated)

Upstream `.claude/agents/` and `CLAUDE.md` were reviewed; harness-relevant parts live under `.cursor/skills/` — see [`docs/mcp-cursor-import.md`](../../../docs/mcp-cursor-import.md).
