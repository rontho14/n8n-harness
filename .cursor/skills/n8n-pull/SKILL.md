---
name: n8n-pull
description: >-
  Read-only drift check — compare n8n Cloud workflow JSON to workflows/<slug>.json
  via n8n-cli workflow get. Reports differences; never overwrites git without
  explicit user confirmation.
---

# n8n Pull (drift check)

Detects UI or manual Cloud edits that diverged from git. **Does not write files** unless user explicitly asks to update `workflows/<slug>.json`.

Commands: [docs/n8n-cloud-cli.md](../../../docs/n8n-cloud-cli.md).

## Inputs

- `workflows/<slug>.json` in repo
- Remote workflow **id** (from user, or latest **Remote ID** in `deployments/DEPLOYMENTS.md` for that slug)

## Steps

1. `n8n-cli workflow get <id> --format=json` — save/compare mentally or to temp; do not commit temp files with secrets.

2. Compare to `workflows/<slug>.json`:

   | Check | Drift if |
   |-------|----------|
   | `name` | differs |
   | Node count | differs |
   | Node **names** | set differs |
   | Connection sources/targets | graph differs |
   | `settings.errorWorkflow` | differs |

3. Report:

   ```
   Drift: yes | no

   1. <finding>
   2. ...
   ```

4. If drift and user wants to sync:
   - **Cloud → git:** user must confirm; then update git from get output (strip ids if create semantics matter).
   - **git → Cloud:** use **n8n-deploy**, not this skill.

## Forbidden

- Overwriting `workflows/<slug>.json` without explicit user confirmation
- Deploy, activate, or delete
