# Invoke cheat sheet (skills)

Ask in chat using the skill name (e.g. “use **n8n-plan** to …”) or `@` the skill if your Cursor setup supports it.

## When to use what

| You want to… | Skill | Prerequisites |
|--------------|-------|----------------|
| Start a new workflow from an idea | **n8n-plan** | Narrative or ticket text |
| Clarify ambiguous requirements | **refinar-specs** | `specs/<slug>/` exists |
| Approve specs for implementation | *(you)* edit **VALIDATION.md** | Plan phase complete |
| Implement the next task | **n8n-build** | `VALIDATION.md` approved |
| Check JSON vs specs | **n8n-verify** | Build done for current task |
| Fix after verify reject | **n8n-build** with findings | `[REJECT]` from verify |
| Unblock after 4 rejects | **STRUCTURAL_REEVAL.md** + re-approve VALIDATION → **n8n-build** | Structural reeval written |
| Lint workflow JSON only | **n8n-validate-json** | `workflows/<slug>.json` exists |
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
4. **n8n-build** — one task; repeat until `TASKS.md` complete.
5. **n8n-verify** after each task (or once at the end).
6. **n8n-deploy** when ready — you own secrets and overwrite confirmation.

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
