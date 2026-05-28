# INTEGRATION — <workflow title>

Credential **names** only — never values in git. Instance variables: **names** in git, values in n8n Cloud.

## n8n Cloud environments

| Field | Dev | Prod |
|-------|-----|------|
| Instance URL | `https://<dev>.app.n8n.cloud` | `https://<prod>.app.n8n.cloud` |
| Project name | | |
| Project ID | | (after first deploy) |
| Webhook base URL | `https://<dev>.app.n8n.cloud/webhook/...` | `https://<prod>.app.n8n.cloud/webhook/...` |

Webhooks are only valid after **go live** (activate) on that instance — see ARCHITECTURE **Go live on deploy**.

## Instance variables (non-secrets)

Document names referenced via n8n variables (values configured in Cloud UI / `n8n-cli variable` with user approval).

| Variable name | Purpose | Dev | Prod |
|---------------|---------|-----|------|
| | | | |

## Systems

### <System name>

| Field | Value |
|-------|--------|
| Auth credential name (n8n) | |
| API base URL (dev) | |
| API base URL (prod) | |
| Method / path | |
| Rate limits | |
| Idempotency key | |

#### Example request

```http

```

#### Example response

```json
{}
```

#### Human credential setup (n8n Cloud UI)

1.
2.

## Sub-workflow contract (if this slug is reusable)

| Input | Type | Example |
|-------|------|---------|
| | | |

| Output | Type | Example |
|--------|------|---------|
| | | |

Parents call via Execute Workflow; document credential names they still need at orchestrator level.

## Webhooks (if inbound)

| Field | Value |
|-------|--------|
| Path | |
| Auth | |
| Payload example | |
