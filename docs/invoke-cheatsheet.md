# Invoke cheat sheet (skills)

Ask in chat using the skill name (e.g. “use **n8n-plan** to …”) or `@` the skill if your Cursor setup supports it.

## When to use what

| You want to… | Skill | Prerequisites |
|--------------|-------|----------------|
| Start a new workflow from an idea | **n8n-plan** | Narrative or ticket text; **MCP required** — [mcp-pipeline.md](mcp-pipeline.md) |
| Clarify ambiguous requirements | **refinar-specs** | `specs/<slug>/` exists; MCP when node/integration choices change |
| Approve specs for implementation | *(you)* edit **VALIDATION.md** | Plan phase complete |
| Implement all pending tasks (build → verify → next) | **n8n-build** | `VALIDATION.md` approved; **MCP required** per task — [mcp-pipeline.md](mcp-pipeline.md) |
| Check JSON vs specs only (no build) | **n8n-verify** | Optional; normally inside **n8n-build**; MCP `validate_workflow` required |
| Fix after verify reject | **n8n-build** | Prior iteration `[REJECT]` |
| One task only | **n8n-build** + say “task N only” or “stop after one task” | Same prerequisites |
| Unblock after 4 rejects | **STRUCTURAL_REEVAL.md** + re-approve VALIDATION → **n8n-build** | Structural reeval written |
| Lint workflow JSON only | **n8n-validate-json** | `workflows/<slug>.json` exists |
| MCP tool usage (plan/build/verify) | **n8n-mcp-local** | Read skill before calls; `mcp:build` + reload if down — [mcp-pipeline.md](mcp-pipeline.md) |
| Fix MCP server / vendor tree | **n8n-mcp-maintain** | Edits under `mcp/` |
| Fix or write `{{ }}` / `$json` / `$node` expressions | **n8n-expression-syntax** | [exemplos-patterns.md](exemplos-patterns.md) exo-1…exo-5; EXAMPLES ex16–ex23; optional `Exemplos.json` / `rd-cloud-patterns.md` |
| Deploy to n8n Cloud | **n8n-deploy** | Valid JSON + your confirmation |
| List remote / audit | **n8n-inspect** | `n8n-cli` configured |
| Git vs Cloud drift | **n8n-pull** | Remote workflow id |
| CLI commands (full list) | [docs/n8n-cloud-cli.md](n8n-cloud-cli.md) | — |
| CLI runtime / connection | **n8n-cli** | points to doc above |
| Split changes into logical git commits | **commit** | Pending changes; user asked to commit |

## Typical happy path

1. **n8n-plan** — describe the automation; review spec summary.
2. (Optional) **refinar-specs** — one question at a time until crisp.
3. Approve **`specs/<slug>/VALIDATION.md`**.
4. **n8n-build** — runs tasks in order; after each task it verifies inline; continues on `[APPROVE]` until `TASKS.md` done or `[REJECT]`.
5. **n8n-deploy** when ready — you own secrets and overwrite confirmation.

## What agents must not do without you

- Edit `workflows/*.json` during **n8n-plan**
- Run **n8n-build** before **VALIDATION.md** approval
- **n8n-deploy** during build or verify
- Store credential values in git
- Overwrite a remote workflow without your explicit yes

## Shell (not skills)

```bash
node scripts/validate-workflow.mjs workflows/<slug>.json
n8n-cli workflow list
npm run mcp:install   # first-time MCP deps (from repo root)
npm run mcp:build     # compile mcp/dist after mcp/ changes
```

MCP operator details: [mcp-local.md](mcp-local.md). Pipeline integration: [mcp-pipeline.md](mcp-pipeline.md).

## What MCP must not replace

- **n8n-verify** — spec/graph/secrets gate after each build task
- **n8n-deploy** — Cloud push with your confirmation
- **VALIDATION.md** — human approval before build

See [STRUCTURE.md](../STRUCTURE.md) for the pipeline diagram.
