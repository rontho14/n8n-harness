# n8n workflow conventions (this repo)

Repo layout and JSON mechanics. **n8n Cloud** remote ops: **[n8n-cloud-cli.md](n8n-cloud-cli.md)**. Team standards: **[best-practices.md](best-practices.md)**. Deferred: **[REMINDERS.md](../REMINDERS.md)**.

## File naming

| Artifact | Pattern | Example |
|----------|---------|---------|
| Spec folder | `specs/<kebab-slug>/` | `specs/resolve-user-by-email/` |
| Workflow JSON | `workflows/<kebab-slug>.json` | `workflows/resolve-user-by-email.json` |
| Workflow `name` field | Short plain English (see best practices) | `Resolve user profile by email` |

`<slug>` must be identical across spec folder and workflow file.

## Node naming

Follow the **story rule** in [best-practices.md](best-practices.md): names should read as plain English (e.g. `Does user have email?`, not `If`).

## JSON shape

- 2-space indent; stable key order: `name`, `nodes`, `connections`, `settings`, then optional keys.
- Run `node scripts/validate-workflow.mjs --fix workflows/<slug>.json` before commit.
- Omit top-level `id` on **create**; include when updating a known remote workflow if required by CLI.
- Expressions: explicit `={{ }}` syntax.

### Error workflow in settings (preferred)

```json
"settings": {
  "executionOrder": "v1",
  "errorWorkflow": "<error-handler-workflow-id>"
}
```

Document the handler workflow name in `ARCHITECTURE.md`. Local Error Trigger is exceptional — see best practices.

## Credentials

- Reference by **name** (and id only if already known in target instance).
- Never commit tokens, API keys, passwords, or webhook signing secrets.
- Document human setup in `INTEGRATION.md`.

## Sub-workflows

- **Execute Workflow** node names describe intent (`Resolve user profile by email`).
- Reusable workflows: own `specs/<slug>/` with strict I/O in ARCHITECTURE + INTEGRATION.
- Parents reference child by workflow **name** (and id after deploy).

## Triggers

| Type | When to use |
|------|-------------|
| Webhook | External systems push events |
| Schedule | Polling or batch windows |
| Manual | Ops/testing; optional on reusable utilities |

## English

Skills, specs, and commit messages in this repo are **English**.
