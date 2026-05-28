# n8n workflow JSON reference

## Minimal export shape

A deployable workflow JSON typically includes:

```json
{
  "name": "Resolve user profile by email",
  "nodes": [],
  "connections": {},
  "settings": {
    "executionOrder": "v1",
    "errorWorkflow": "<global-error-handler-workflow-id>"
  }
}
```

`name` is **plain English** (team style). Prefer global `errorWorkflow` per [docs/best-practices.md](../../../docs/best-practices.md). Local Error Trigger is exceptional.

Optional fields often present in exports: `pinData`, `meta`, `tags`, `staticData`, `versionId`. Omit `id` when **creating**; include it when **updating** if the CLI/API requires it.

## Node conventions

Each node should have at minimum:

- `id` — unique string (UUID common)
- `name` — unique in workflow; **story-style** plain English (`Does user have email?`, not `If`)
- `type` — full node type, e.g. `n8n-nodes-base.webhook`
- `typeVersion` — number matching n8n version
- `position` — `[x, y]` for editor layout
- `parameters` — node-specific config

Credential usage on a node:

```json
"credentials": {
  "slackApi": {
    "id": "CREDENTIAL_ID",
    "name": "Slack account"
  }
}
```

Reference credentials by **id/name only** in tracked files — never paste tokens or passwords.

## Connections format

```json
"connections": {
  "Webhook": {
    "main": [
      [
        {
          "node": "Set Fields",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

Source key is the **source node name**. Verify every connection target exists in `nodes`.

## Git-friendly JSON

- 2-space indentation
- Stable key order: `name`, `nodes`, `connections`, `settings`, then other keys
- One workflow per file under `workflows/<kebab-slug>.json`
- Run `node scripts/validate-workflow.mjs --fix workflows/<slug>.json` to normalize formatting

## Execute Workflow (sub-workflows)

Parent calls reusable workflows via `n8n-nodes-base.executeWorkflow`. Node **name** describes intent (`Resolve user profile by email`). Document inputs/outputs in parent `ARCHITECTURE.md`; reusable workflow has its own spec slug.

## Self-check before deploy

- [ ] Trigger node present and configured (or reusable is call-only)
- [ ] Node names unique and story-style (see `docs/best-practices.md`)
- [ ] `settings.errorWorkflow` set **or** justified local Error Trigger in spec
- [ ] Sub-workflow I/O matches ARCHITECTURE
- [ ] All connection targets exist
- [ ] Expressions use explicit `={{ }}` syntax
- [ ] No secret values in parameters or headers
- [ ] Credential references point to existing n8n credentials
