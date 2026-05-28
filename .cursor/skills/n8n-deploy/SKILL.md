---
name: n8n-deploy
description: >-
  Validate workflow JSON, present deploy plan (create/update, go live, credentials),
  deploy to n8n Cloud via n8n-cli, verify remote and executions, log to
  deployments/DEPLOYMENTS.md. Use when the user asks to deploy.
---

# n8n Deploy

**n8n Cloud only.** Commands: [docs/n8n-cloud-cli.md](../../../docs/n8n-cloud-cli.md). Runtime: **n8n-cli** skill. Follow `.cursor/rules/n8n-harness.mdc`.

Deploy after build/verify unless user explicitly requests a hotfix deploy.

## Inputs

- `workflows/<slug>.json`
- `specs/<slug>/ARCHITECTURE.md` (workflow kind, go-live intent)
- `specs/<slug>/INTEGRATION.md` (credential names)
- Optional: remote workflow id, project id

## Steps

### 1. Validate local JSON

```bash
node scripts/validate-workflow.mjs workflows/<slug>.json
```

Stop if validation fails.

### 2. Inspect remote (read-only)

```bash
n8n-cli config show
n8n-cli workflow list --format=json
n8n-cli credential list
```

If updating: `n8n-cli workflow get <id> --format=json`

Check credential **names** referenced in JSON against `credential list` — list gaps in deploy plan (no secret values).

### 3. Deploy plan — present and wait for user OK

| Item | Value |
|------|--------|
| Action | create \| update |
| Remote ID | required for update |
| Slug / file | `workflows/<slug>.json` |
| Project transfer | if needed |
| **Go live** | yes \| no (`workflow activate` after deploy — see REMINDERS.md P0.2) |
| Credential gaps | names missing on Cloud |
| Overwrite risk | stop if same name exists and user did not confirm |

Read **Go live on deploy** from `ARCHITECTURE.md` if set during planning.

**Stop** if overwrite not confirmed.

### 4. Deploy

```bash
n8n-cli workflow create --file=workflows/<slug>.json
n8n-cli workflow update <id> --file=workflows/<slug>.json
```

Capture returned `id` on create.

### 5. Post-deploy

```bash
n8n-cli workflow transfer <id> --project=<projectId>   # if requested
n8n-cli workflow activate <id>                         # only if Go live = yes
n8n-cli workflow get <id> --format=json
n8n-cli execution list --workflow=<id> --limit=5
n8n-cli execution list --workflow=<id> --status=error --limit=5
```

Report: remote id, active/live state from JSON, recent errors if any.

### 6. Log

Append to `deployments/DEPLOYMENTS.md`:

```markdown
## YYYY-MM-DD — <workflow name>

- **Action**: create | update
- **Remote ID**: `<id>`
- **File**: `workflows/<slug>.json`
- **Project**: `<projectId or n/a>`
- **Go live**: yes | no
- **Verified**: yes (`workflow get` + execution list)
- **Notes**: credential setup, errors observed
```

## Forbidden

- Deploy without user-approved plan when overwriting
- `workflow delete`, `deactivate`, `credential create/delete` without explicit user request
- Server CLI (`n8n import:workflow`, etc.)
