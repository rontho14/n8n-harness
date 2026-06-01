---
name: n8n-cli
description: >-
  Run n8n-cli against n8n Cloud. Read docs/n8n-cloud-cli.md for the full command
  reference and agent permissions; use this skill at runtime for connection,
  formats, and which skill owns deploy vs inspect.
---

# n8n-cli (runtime)

**n8n Cloud + API CLI only.** Full command list and allowlist: **[docs/n8n-cloud-cli.md](../../../docs/n8n-cloud-cli.md)**.

Before any unfamiliar command: `n8n-cli <topic> <command> --help`

## At runtime

1. **Confirm connection** — `n8n-cli config show` (report URL only; never echo API keys).
2. **Pick the right skill** — do not improvise full deploy flows here:
   | Task | Skill |
   |------|--------|
   | Deploy / go live | **n8n-deploy** |
   | Read-only inventory | **n8n-inspect** |
   | Git vs Cloud drift | **n8n-pull** |
   | JSON lint (local file) | **n8n-validate-json** |
3. **Output** — use `--format=json` when parsing; default table for humans.
4. **Permissions** — if a command is “ask first” in the doc, stop and get user confirmation.
5. **Secrets** — never commit credential payloads; `credential list` / `schema` only unless user explicitly requests create.

## Quick patterns

```bash
n8n-cli workflow list --format=json
n8n-cli workflow get <id> --format=json
n8n-cli execution list --workflow=<id> --limit=5
n8n-cli credential list
n8n-cli project list
```

PowerShell create/update:

```powershell
Get-Content workflows/<slug>.json -Raw | n8n-cli workflow create --stdin
n8n-cli workflow update <id> --file=workflows/<slug>.json
```

## Workflow JSON in repo

Shape and lint: [docs/n8n-workflow-json.md](../../../docs/n8n-workflow-json.md) · Nodes: [docs/n8n-node-catalog.md](../../../docs/n8n-node-catalog.md)

Pipeline: [STRUCTURE.md](../../../STRUCTURE.md)

## Troubleshooting

See **Common troubleshooting** in [docs/n8n-cloud-cli.md](../../../docs/n8n-cloud-cli.md).
