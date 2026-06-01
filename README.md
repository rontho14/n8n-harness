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
- Node.js (for `scripts/validate-workflow.mjs`)
- Cursor with rules and skills under `.cursor/`

**n8n Cloud only** — remote ops via `n8n-cli` ([docs/n8n-cloud-cli.md](docs/n8n-cloud-cli.md)). Auth: `N8N_URL` + `N8N_API_KEY`. Never commit secrets. Deferred items: [REMINDERS.md](REMINDERS.md).

## Repository layout

```
specs/<slug>/           # TRUTH, ARCHITECTURE, INTEGRATION, …
specs/_templates/       # Section templates → copy into specs/<slug>/
workflows/<slug>.json   # Your workflow JSON only (harness build output)
docs/                   # n8n-workflow-json, node-catalog, CLI, best-practices, …
deployments/            # DEPLOYMENTS.md (deploy log)
scripts/                # validate-workflow.mjs
.cursor/skills/         # n8n-plan, n8n-build, n8n-verify, n8n-deploy, …
```

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

## Technical reference

- **[docs/n8n-workflow-json.md](docs/n8n-workflow-json.md)** — export shape, connections, LangChain ports
- **[docs/n8n-node-catalog.md](docs/n8n-node-catalog.md)** — node types used in this org
- **Spec templates:** `specs/_templates/`

```bash
node scripts/validate-workflow.mjs workflows/<your-slug>.json
```

Optional reference exports from n8n UI may live **outside** `workflows/` (not canonical until you build into `workflows/<slug>.json`).

## Safety

- No secrets in git; credential names only in specs/JSON.
- `VALIDATION.md` approval required before build.
- Confirm before overwriting an existing remote workflow.
- Do not commit `.env` or credential payload files.
