# n8n-harness

Agent-oriented repository for **document-driven** n8n workflows: persistent specs on disk, validated JSON in git, optional deploy to n8n Cloud via **n8n-cli**.

## Philosophy

1. Specs in `specs/<slug>/` are the source of truth.
2. Skills read **file paths**, not pasted requirements from chat.
3. **Plan → approve → build → verify → deploy** with explicit human gates.
4. One `TASKS.md` item at a time; surgical edits to `workflows/<slug>.json`.
5. One agent, separate **skills** — no subagents, no slash commands.

See [STRUCTURE.md](STRUCTURE.md) for the pipeline diagram.

## Prerequisites

- [n8n-cli](https://docs.n8n.io/api/n8n-cli/) installed and configured (`n8n-cli config show`)
- Node.js 22 LTS (for `scripts/validate-workflow.mjs` and optional local MCP — see below)
- Cursor with rules and skills under `.cursor/`

**n8n Cloud only** — remote ops via `n8n-cli` ([docs/n8n-cloud-cli.md](docs/n8n-cloud-cli.md)). Auth: `N8N_URL` + `N8N_API_KEY`. Never commit secrets. Deferred items: [REMINDERS.md](REMINDERS.md).

## Repository layout

```
specs/<slug>/           # TRUTH, ARCHITECTURE, INTEGRATION, …
specs/_templates/       # Section templates → copy into specs/<slug>/
workflows/<slug>.json   # Your workflow JSON only (harness build output)
docs/                   # exemplos-patterns, n8n-workflow-json, node-catalog, rd-cloud-patterns.example, …
deployments/            # DEPLOYMENTS.md (deploy log)
scripts/                # validate-workflow.mjs
package.json            # Root scripts: mcp:install, mcp:build
mcp/                    # Vendored node-documentation MCP (stdio)
.cursor/mcp.json        # Cursor MCP wiring
.cursor/skills/         # n8n-plan, n8n-build, n8n-verify, n8n-deploy, n8n-mcp-local, …
```

## Local MCP (required in pipeline)

Vendored **n8n-harness-mcp** under `mcp/` is **required** during plan, refine, build, and verify when the server is available. Agents use it for node discovery and validation before editing specs or workflow JSON. It does **not** replace harness gates: approve `VALIDATION.md`, run **n8n-verify**, deploy only via **n8n-deploy** with your confirmation.

| Resource | Purpose |
|----------|---------|
| [docs/mcp-pipeline.md](docs/mcp-pipeline.md) | Phase → MCP tools, build loop, unavailable protocol |
| [docs/mcp-local.md](docs/mcp-local.md) | Install, build, env vars, disabled tools |
| [`.cursor/skills/n8n-mcp-local/SKILL.md`](.cursor/skills/n8n-mcp-local/SKILL.md) | Tool usage; read before any MCP call |
| Maintainer fork phases | `plan/README.md` (local, gitignored) |

```powershell
npm run mcp:install
npm run mcp:build
```

Reload the Cursor window after first enable or after changing `mcp/` or `.cursor/mcp.json`.

## Skills cheat sheet

| When | Skill |
|------|--------|
| New workflow idea | **n8n-plan** |
| Clarify requirements | **refinar-specs** |
| Ready to implement | Approve `VALIDATION.md`, then **n8n-build** |
| Check implementation | **n8n-verify** |
| Fix after reject | **n8n-build** |
| Deploy to n8n Cloud | **n8n-deploy** |
| Lint JSON only (local) | **n8n-validate-json** |
| List remote / audit | **n8n-inspect** |
| Git vs Cloud drift | **n8n-pull** |
| Node discovery / validation (required in plan/build) | **n8n-mcp-local** + Cursor MCP — [mcp-pipeline.md](docs/mcp-pipeline.md) |
| Split work into logical git commits | **commit** |

Full table: [docs/invoke-cheatsheet.md](docs/invoke-cheatsheet.md).

## Quick start

1. Ask the agent to use **n8n-plan** for your automation.
2. Review `specs/<slug>/`; use **refinar-specs** if needed.
3. Approve `specs/<slug>/VALIDATION.md`.
4. **n8n-build** — one task at a time.
5. **n8n-verify** after each task.
6. **n8n-deploy** when ready.

```bash
node scripts/validate-workflow.mjs workflows/<slug>.json
n8n-cli workflow list
```

## Skills index

| Skill | Phase |
|-------|--------|
| `n8n-plan` | Plan specs only |
| `refinar-specs` | Refine specs |
| `n8n-build` | Implement one task |
| `n8n-verify` | Approve/reject JSON vs specs |
| `n8n-validate-json` | Structural JSON lint |
| `n8n-deploy` | Deploy + log |
| `n8n-inspect` | Read-only remote inventory (+ optional audit) |
| `n8n-pull` | Drift check vs Cloud |
| `n8n-cli` | Runtime CLI (full commands in [docs/n8n-cloud-cli.md](docs/n8n-cloud-cli.md)) |
| `commit` | Phase-ordered multi-commit split |
| `n8n-mcp-local` | Assistive MCP tool use during build |

## Technical reference

- **[docs/n8n-workflow-json.md](docs/n8n-workflow-json.md)** — export shape, connections, LangChain ports
- **[docs/n8n-node-catalog.md](docs/n8n-node-catalog.md)** — node types used in this org
- **[docs/exemplos-patterns.md](docs/exemplos-patterns.md)** — RD SharePoint/PDF patterns (exo-1…exo-5); optional export `Exemplos.json` at repo root (gitignored)
- **Spec templates:** `specs/_templates/`

```bash
node scripts/validate-workflow.mjs workflows/<your-slug>.json
```

Optional reference exports from n8n UI may live **outside** `workflows/` (not canonical until you build into `workflows/<slug>.json`). For the RD challenge, place **`Exemplos.json`** at repo root and read **[exemplos-patterns.md](docs/exemplos-patterns.md)** during plan/build.

## Safety

- No secrets in git; credential names only in specs/JSON.
- `VALIDATION.md` approval required before build.
- Confirm before overwriting an existing remote workflow.
- Do not commit `.env` or credential payload files.
