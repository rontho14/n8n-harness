---
name: n8n-inspect
description: >-
  Read-only n8n Cloud inventory via n8n-cli — workflows, projects, credentials,
  executions, optional audit. Use before deploy or to debug. Commands in
  docs/n8n-cloud-cli.md.
---

# n8n Inspect

Read-only. Commands: [docs/n8n-cloud-cli.md](../../../docs/n8n-cloud-cli.md).

## Steps

1. `n8n-cli config show` — URL only; never echo API keys.

2. Run (prefer JSON when summarizing):

   ```bash
   n8n-cli workflow list --format=json
   n8n-cli project list
   n8n-cli credential list
   n8n-cli execution list --limit=10
   n8n-cli execution list --status=error --limit=10
   n8n-cli variable list
   ```

3. Optional security scan (report findings; do not auto-fix):

   ```bash
   n8n-cli audit
   ```

4. If user named a workflow or slug:
   - Resolve id from list or `deployments/DEPLOYMENTS.md` recent Remote ID
   - `n8n-cli workflow get <id> --format=json` — trigger, node count, active/live state
   - `n8n-cli execution list --workflow=<id> --limit=5 --status=error`

5. Present summary table:

   | id | name | active/live | project (if visible) | last error (if any) |

   Flag credential names in repo JSON that are **missing** from `credential list`.

## Forbidden

- create, update, delete, activate, deactivate, credential mutations
