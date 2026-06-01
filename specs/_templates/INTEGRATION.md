# INTEGRATION — <workflow title>

Credential **names** only — never values in git. Instance variables: **names** in git, values in n8n Cloud.

## n8n Cloud instance

Single org instance — no separate dev/prod n8n environments.

| Field | Value |
|-------|--------|
| Instance URL | `https://<subdomain>.app.n8n.cloud` |
| Project name | |
| Project ID | (after first deploy) |
| Webhook base URL | `https://<subdomain>.app.n8n.cloud/webhook/...` (if inbound webhooks) |

Webhooks are only valid after **go live** (activate) on that instance — see ARCHITECTURE **Go live on deploy**.

## Instance variables (non-secrets)

Document names referenced via n8n variables (values configured in Cloud UI / `n8n-cli variable` with user approval).

| Variable name | Purpose | Value (instance) |
|---------------|---------|------------------|
| | | |

## Systems

### SharePoint (document library)

| Field | Value |
|-------|--------|
| Auth credential name (n8n) | `microsoftSharePointOAuth2Api` — `<credential display name>` |
| Site display name | e.g. `<project site>` |
| Library | e.g. `Documents` |
| Folder display name(s) | e.g. `02 - Documentos Base` |
| `webUrl` filter segment (URL-encoded) | e.g. `02%20-%20Documentos%20Base` — required for If **contains** on `webUrl` |
| Upload target folder | |

Do not commit site/list/folder GUIDs unless already required for update deploy; prefer UI pick + re-export. Patterns: [exemplos-patterns.md](../../docs/exemplos-patterns.md) (exo-1…exo-5); optional `Exemplos.json` + `docs/rd-cloud-patterns.md` (gitignored).

### <System name>

| Field | Value |
|-------|--------|
| Auth credential name (n8n) | |
| API base URL | |
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
