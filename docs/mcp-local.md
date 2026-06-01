# Local MCP operator guide

Vendored **n8n-harness-mcp** under `mcp/` provides node documentation, templates, and validation to Cursor agents over **stdio**. It is **required** in plan, refine, build, and verify when available — the harness pipeline (`VALIDATION.md`, `n8n-verify`, `n8n-deploy`) stays authoritative for gates and deploy.

Agents: read [`.cursor/skills/n8n-mcp-local/SKILL.md`](../.cursor/skills/n8n-mcp-local/SKILL.md) before calling tools. Pipeline integration (required calls per phase): [mcp-pipeline.md](mcp-pipeline.md).

Maintainers: [mcp/docs/ARCHITECTURE.md](../mcp/docs/ARCHITECTURE.md) (architecture and improvement index). Fork phases: `plan/README.md` (gitignored locally).

## Prerequisites

- **Node.js 22 LTS** — match `engines` in `mcp/package.json` (`>=22 <23`)
- **Cursor** with MCP enabled
- Repo cloned with `mcp/data/nodes.db` present (prebuilt, committed after phase 4)

## First-time setup

From repository root:

```powershell
npm run mcp:install
npm run mcp:build
```

- `mcp:install` — `npm ci` in `mcp/`
- `mcp:build` — TypeScript compile to `mcp/dist/mcp/index.js` (not committed; listed in `.gitignore`)

Reload the **Cursor window** after build or after changing [`.cursor/mcp.json`](../.cursor/mcp.json).

## Git (what to commit)

| Path | In git? |
|------|---------|
| Root `package.json` | Yes — `mcp:install`, `mcp:build` |
| `mcp/package.json`, `mcp/package-lock.json` | Yes |
| `mcp/data/nodes.db` | Yes (prebuilt; large) |
| `mcp/dist/` | No — build locally or in CI |
| `mcp/node_modules/` | No |

Fresh clone: `git pull` should include `nodes.db`; then `npm run mcp:build` only (skip install if lockfile unchanged).

CI: [`.github/workflows/mcp-build.yml`](../.github/workflows/mcp-build.yml) runs install + build on `mcp/**` changes.

## Cursor configuration

[`.cursor/mcp.json`](../.cursor/mcp.json) starts the server with:

| Setting | Purpose |
|---------|---------|
| `command` / `args` | `node` + `mcp/dist/mcp/index.js` (no `npx`) |
| `MCP_MODE=stdio` | Stdio transport for Cursor |
| `NODE_DB_PATH` | Path to `mcp/data/nodes.db` |
| `DISABLED_TOOLS` | Blocks remote n8n write/audit tools (see below) |
| `LOG_LEVEL=error` | Quiet logs in the IDE |

### Expected tools (default config)

With no `N8N_API_URL`, agents should see **documentation tools only**:

- `tools_documentation`
- `search_nodes`, `get_node`
- `validate_node`, `validate_workflow`
- `search_templates`, `get_template`

Remote workflow tools (`n8n_create_workflow`, `n8n_update_*`, `n8n_delete_workflow`, `n8n_test_workflow`, `n8n_manage_credentials`, `n8n_deploy_template`, `n8n_audit_instance`) are listed in `DISABLED_TOOLS` and must **not** appear in `tools/list`.

### Optional: internal n8n instance (hackathon only)

Only if you intentionally want remote MCP workflow tools against a **non-production** instance:

1. Copy [`.env.example`](../.env.example) → `.env` and set `N8N_API_URL`, `N8N_API_KEY` (same key as `n8n-cli` is fine).
2. [`.cursor/mcp.json`](../.cursor/mcp.json) loads `.env` via `envFile` — **do not** commit secrets in `mcp.json`.
3. Or set `N8N_API_URL` and `N8N_API_KEY` in `.env` only (recommended); restart Cursor after edits.
4. Optionally `WEBHOOK_SECURITY_MODE=moderate` in `.env` for localhost.
5. Remove or shorten `DISABLED_TOOLS` only after security review ([`plan/08-security-checklist.md`](../plan/08-security-checklist.md)).

Harness agents must still use **n8n-deploy** + user confirmation for production Cloud — do not rely on MCP for deploy gates.

## Environment variables

| Variable | Default in harness | Notes |
|----------|-------------------|--------|
| `NODE_DB_PATH` | `${workspaceFolder}/mcp/data/nodes.db` | Required; ~87 MB SQLite |
| `MCP_MODE` | `stdio` | Use `stdio` for Cursor |
| `DISABLED_TOOLS` | See `mcp.json` | Comma-separated tool names |
| `LOG_LEVEL` | `error` | `debug` for maintainer troubleshooting |
| `DISABLE_CONSOLE_OUTPUT` | `true` | Reduces noise on stdio |
| `N8N_API_URL` / `N8N_API_KEY` | unset | Enables remote n8n tools when configured |

Never put API keys or tokens in committed files — use gitignored `.env` or OS environment variables only.

## Rebuild database (maintainer only)

Normal clones use the committed `nodes.db`. Rebuild only when refreshing node metadata from upstream:

```powershell
cd mcp
npm run rebuild
```

Can take several minutes and requires network. Re-run `npm run validate` in `mcp/` afterward.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| MCP red / no tools | Run `npm run mcp:build`; confirm `mcp/dist/mcp/index.js` exists |
| Wrong or empty tool list | Reload Cursor; check `DISABLED_TOOLS` and `N8N_API_URL` |
| `nodes.db` missing | Pull latest `mcp/data/nodes.db` or maintainer `npm run rebuild` |
| Stale after `mcp/` edits | `npm run mcp:build` + reload MCP / window |
| Tool disabled error | Expected for `n8n_*` names in `DISABLED_TOOLS` — use `n8n-deploy` |

### Smoke test (stdio)

```powershell
$env:MCP_MODE="stdio"
$env:NODE_DB_PATH="C:\path\to\n8n-harness\mcp\data\nodes.db"
node mcp/dist/mcp/index.js
```

Process should stay running; use Cursor MCP UI or an MCP client for `initialize` / `tools/list`.

## Security notes

- **No secrets in git** — credential names in specs/JSON only
- **Disabled remote tools** by default — prevents accidental Cloud writes from MCP
- **Telemetry removed** in fork (phase 3) — no outbound analytics to Supabase
- Full sign-off checklist: `plan/08-security-checklist.md` (maintainer-local). Automated config/source checks passed 2026-06-01; IT still needs network capture (10+ min MCP use) and org policy sign-off before production-adjacent hackathon work.

## Related docs

- [STRUCTURE.md](../STRUCTURE.md) — pipeline and repo layout
- [docs/invoke-cheatsheet.md](invoke-cheatsheet.md) — skill vs shell commands
- [docs/mcp-cursor-import.md](mcp-cursor-import.md) — what was imported from upstream
- [mcp/README.md](../mcp/README.md) — vendored package stub
- [mcp/docs/SECURITY_HARDENING.md](../mcp/docs/SECURITY_HARDENING.md) — upstream `DISABLED_TOOLS` reference
