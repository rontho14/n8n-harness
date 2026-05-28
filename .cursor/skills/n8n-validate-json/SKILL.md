---
name: n8n-validate-json
description: >-
  Local structural lint only — scripts/validate-workflow.mjs on workflows/<slug>.json.
  Does not check specs, Cloud credentials, or live/published state. Use n8n-verify
  for spec review; n8n-deploy for Cloud.
---

# n8n Validate JSON

**Scope:** local file structure only.

| Checks | Does not check |
|--------|----------------|
| Valid JSON, `name`, `nodes`, `connections` | TRUTH / ARCHITECTURE alignment |
| Duplicate node names/ids | Credentials exist on Cloud |
| Obvious secret patterns (warn) | Workflow active/published |
| Trigger presence (warn) | Sub-workflow exists remotely |

For full review use **`n8n-verify`**. For Cloud deploy use **`n8n-deploy`**.

## Steps

1. Identify `workflows/<slug>.json` (ask if unclear).
2. Run:
   ```bash
   node scripts/validate-workflow.mjs workflows/<slug>.json
   ```
3. On formatting issues, offer:
   ```bash
   node scripts/validate-workflow.mjs --fix workflows/<slug>.json
   ```
4. Optional cross-check: [workflow-json.md](../n8n-cli/workflow-json.md) (naming, `errorWorkflow` in settings).
5. Report pass/fail and whether the file is ready for **deploy planning** (not “ready for production”).

Do not deploy. Do not call `n8n-cli` unless user separately asks for Cloud checks (**n8n-inspect** / **n8n-verify**).
