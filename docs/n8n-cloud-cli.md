# n8n Cloud CLI reference (`n8n-cli`)

This harness targets **n8n Cloud** only. All remote operations use the **API CLI** (`n8n-cli`), not the self-hosted Server CLI (`n8n export:workflow`, `n8n publish:workflow`, etc.).

Official docs: https://docs.n8n.io/api/n8n-cli/

**Beta:** n8n documents the CLI for development and agents — use extra review before production changes.

## Connection

Resolution order: flags → `N8N_URL` / `N8N_API_KEY` → `~/.n8n-cli/config.json`.

```bash
n8n-cli config show                    # report URL only — never echo API keys
n8n-cli --url="$N8N_URL" --api-key="$N8N_API_KEY" workflow list
```

PowerShell deploy:

```powershell
Get-Content workflows/<slug>.json -Raw | n8n-cli workflow create --stdin
```

## Output formats

| Format | Flag | Use |
|--------|------|-----|
| Table | default | Human reading |
| JSON | `--format=json` | Scripts, drift diff, jq |
| ID only | `--format=id-only` | Piping to xargs |

## Agent permissions

What harness agents may run without asking vs what needs explicit user approval.

| Command | Agent | Notes |
|---------|-------|-------|
| `config show` | yes | URL only in output |
| `workflow list` / `get` | yes | Read-only |
| `workflow create` / `update` | yes | Via **n8n-deploy** after user confirms plan |
| `workflow activate` | yes | After user confirms **Go live** in deploy plan |
| `workflow deactivate` | ask first | |
| `workflow delete` | ask first | |
| `workflow transfer` | yes | If user confirmed project in deploy plan |
| `execution list` / `get` | yes | Post-deploy / inspect |
| `execution retry` / `stop` / `delete` | ask first | |
| `credential list` / `schema` | yes | Names/types only — never print secret values |
| `credential create` | ask first | Never commit credential payload files |
| `credential get` / `delete` / `transfer` | ask first | |
| `project list` / `get` | yes | |
| `project create` / `update` / `delete` / members | ask first | |
| `variable list` | yes | Non-secret config names |
| `variable create` / `update` / `delete` | ask first | |
| `audit` | yes | Read-only security scan; report findings to user |
| `user list` / `get` | yes | |
| `data-table` * | ask first | |
| `source-control pull` | ask first | |
| `login` / `logout` | ask first | Prefer API key in env |

## Commands by topic

Run `n8n-cli <topic> <command> --help` before unfamiliar flags.

### workflow

```bash
n8n-cli workflow list [--format=json]
n8n-cli workflow get <id> [--format=json]
n8n-cli workflow create --file=workflows/<slug>.json
n8n-cli workflow create --stdin          # pipe JSON
n8n-cli workflow update <id> --file=workflows/<slug>.json
n8n-cli workflow activate <id>
n8n-cli workflow deactivate <id>
n8n-cli workflow transfer <id> --project=<projectId>
n8n-cli workflow delete <id>
```

### execution

```bash
n8n-cli execution list [--limit=10] [--status=error] [--workflow=<id>]
n8n-cli execution get <id>
n8n-cli execution retry <id>             # ask user first
n8n-cli execution stop <id>             # ask user first
n8n-cli execution delete <id>            # ask user first
```

### credential

```bash
n8n-cli credential list
n8n-cli credential schema <type> [--format=json]
n8n-cli credential create --type=<type> --name="<name>" --file=<file>   # ask user first
n8n-cli credential get <id>              # ask user first — may expose metadata
n8n-cli credential delete <id>           # ask user first
n8n-cli credential transfer <id> --project=<projectId>   # ask user first
```

### project

```bash
n8n-cli project list
n8n-cli project get <id>
n8n-cli project create --name="..."      # ask user first
```

### variable (Cloud instance variables — not git secrets)

```bash
n8n-cli variable list
n8n-cli variable create --name="..." --value="..."   # ask user first
n8n-cli variable update <id> ...
n8n-cli variable delete <id>                         # ask user first
```

Document variable **names** in `INTEGRATION.md`; values stay in n8n Cloud.

### audit

```bash
n8n-cli audit
```

Optional before deploy: run and summarize findings; do not auto-fix.

### config

```bash
n8n-cli config set-url https://<instance>.app.n8n.cloud
n8n-cli config set-api-key <key>
n8n-cli config show
```

## Go live on Cloud

Until validated (see [REMINDERS.md](../REMINDERS.md) P0.2), treat **`workflow activate <id>`** as “go live” and **`workflow deactivate <id>`** as “stop receiving triggers.”

Deploy plan must ask: **Go live after deploy?** (yes/no). Confirm with `workflow get` after activate (check `active` or equivalent field).

## Not in scope (self-hosted Server CLI)

Do not use for this harness:

- `n8n export:workflow` / `import:workflow`
- `n8n publish:workflow` / `unpublish:workflow`
- `n8n execute --id`
- `n8n export:credentials --decrypted`
- `n8n import:entities`

## Related

- Agent runtime: `.cursor/skills/n8n-cli/SKILL.md`
- Deploy: **n8n-deploy** skill
- Drift check: **n8n-pull** skill
- Local JSON lint: `node scripts/validate-workflow.mjs`
