# Invoke cheat sheet (skills)

Ask in chat using the skill name (e.g. “use **n8n-plan** to …”) or `@` the skill if your Cursor setup supports it.

## When to use what

| You want to… | Skill | Prerequisites |
|--------------|-------|----------------|
| Start a new workflow from an idea | **n8n-plan** | Narrative or ticket text |
| Clarify ambiguous requirements | **refinar-specs** | `specs/<slug>/` exists |
| Approve specs for implementation | *(you)* edit **VALIDATION.md** | Plan phase complete |
| Implement all pending tasks (build → verify → next) | **n8n-build** | `VALIDATION.md` approved — **default: autonomous loop**; no manual verify between tasks |
| Check JSON vs specs only (no build) | **n8n-verify** | Optional; normally run inside **n8n-build** |
| Fix after verify reject | **n8n-build** | Prior iteration `[REJECT]` |
| One task only | **n8n-build** + say “task N only” or “stop after one task” | Same prerequisites |
| Unblock after 4 rejects | **STRUCTURAL_REEVAL.md** + re-approve VALIDATION → **n8n-build** | Structural reeval written |
| Lint workflow JSON only | **n8n-validate-json** | `workflows/<slug>.json` exists |
| Fix or write `{{ }}` / `$json` / `$node` expressions | **n8n-expression-syntax** | Field references prior nodes or webhook body |
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
```

See [STRUCTURE.md](../STRUCTURE.md) for the pipeline diagram.
