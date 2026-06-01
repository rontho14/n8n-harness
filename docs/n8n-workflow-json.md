# n8n workflow JSON reference

Technical reference for editing workflow export JSON in this harness. Team process and naming live in [best-practices.md](best-practices.md) and [conventions.md](conventions.md). Per-node `type` / `parameters` details: [n8n-node-catalog.md](n8n-node-catalog.md).

Official n8n docs (verify against your Cloud version):

- [Export and import](https://docs.n8n.io/workflows/export-import/)
- [Expressions](https://docs.n8n.io/code/expressions/)
- [LangChain in n8n](https://docs.n8n.io/advanced-ai/)

## Where JSON lives in this repo

| Path | Purpose |
|------|---------|
| `workflows/<slug>.json` | **Your** canonical workflow JSON — created and updated by you via `n8n-build` only. No harness templates or examples here. |
| `specs/<slug>/` | Source of truth for behavior; JSON must match approved specs. |
| Elsewhere (e.g. repo root) | Optional **reference exports** from n8n UI for study or adopt flows — not canonical until copied into `workflows/` after plan/verify. |

`<slug>` is kebab-case and matches `specs/<slug>/`.

## Top-level object

### Required for a valid export

| Key | Type | Notes |
|-----|------|--------|
| `name` | string | Workflow title in n8n UI. Plain English per team style (not kebab-case). |
| `nodes` | array | At least one node. |
| `connections` | object | Keys = **source node names**. Values = output ports (see below). |

### Settings (strongly recommended)

```json
"settings": {
  "executionOrder": "v1",
  "errorWorkflow": "<remote-workflow-id-of-global-error-handler>"
}
```

Document the error handler **name** in `specs/<slug>/ARCHITECTURE.md`. Local Error Trigger is exceptional — see [best-practices.md](best-practices.md).

Other settings seen in exports: `binaryMode` (e.g. `"separate"`).

### Common optional keys (Cloud exports)

| Key | When to commit | Notes |
|-----|----------------|-------|
| `id` | **Update** only | Remote workflow id. Omit on **create** via CLI; add after first deploy. |
| `active` | Optional | Instance state; deploy skill may activate separately. |
| `pinData` | Usually omit | Editor test data; bloats git. |
| `meta` | Optional | e.g. `templateCredsSetupCompleted`, `instanceId` — safe but not required for logic. |
| `tags` | Optional | Array of tag objects. |
| `staticData` | Optional | Workflow static data. |
| `versionId` | Optional | Editor version tracking from export. |

### Git-friendly ordering

Normalize with:

```bash
node scripts/validate-workflow.mjs --fix workflows/<slug>.json
```

Preferred key order: `name`, `nodes`, `connections`, `settings`, then optional keys (`pinData`, `meta`, `tags`, `staticData`, `versionId`, `id`).

## Node object

Each element of `nodes`:

| Field | Required | Notes |
|-------|----------|--------|
| `id` | yes | Unique string (UUID in exports). |
| `name` | yes | Unique in workflow; used as connection key. **Story-style** English — see best practices. |
| `type` | yes | Full type id, e.g. `n8n-nodes-base.webhook`, `@n8n/n8n-nodes-langchain.agent`. |
| `typeVersion` | yes* | Number; must match node pack on target instance. *Validator warns if missing. |
| `position` | yes | `[x, y]` canvas coordinates. |
| `parameters` | yes | Node-specific; see [n8n-node-catalog.md](n8n-node-catalog.md). |
| `credentials` | if needed | Credential **type** → `{ "id", "name" }` only — never secrets. |
| `webhookId` | some triggers | Set by n8n for webhooks/chat; preserve on update if re-importing. |
| `disabled` | optional | `true` to skip node. |
| `retryOnFail` | optional | Node-level retry flag. |
| `alwaysOutputData` | optional | Continue on empty output. |
| `executeOnce` | optional | Run once per execution. |

### Credentials block

```json
"credentials": {
  "postgres": {
    "id": "CREDENTIAL_ID_IN_N8N",
    "name": "Human-readable credential name in n8n"
  }
}
```

The key under `credentials` is the **credential type** expected by the node (e.g. `postgres`, `aws`, `microsoftSharePointOAuth2Api`). Names and setup steps belong in `INTEGRATION.md`.

### Expressions

Use explicit expression syntax in string fields:

```json
"value": "={{ $json.email }}"
"batchSize": "=1"
"model": "=arn:aws:bedrock:us-east-1::foundation-model/..."
```

Leading `=` marks an expression. Prefer `={{ }}` for clarity in new JSON.

### Resource locator (`__rl`)

Many nodes store picks from dropdowns (workflows, SharePoint sites, files) as:

```json
"site": {
  "__rl": true,
  "value": "tenant.sharepoint.com,<site-id>,<web-id>",
  "mode": "list",
  "cachedResultName": "Site display name"
}
```

- **`mode`**: often `list` (picked in UI) or `id` (raw id / expression).
- **`value`**: id or expression — do not invent; copy from export or set in UI and re-export.
- Prefer documenting **logical** location in `INTEGRATION.md` (site name, folder path) and refreshing JSON after UI selection.

## Connections object

Structure:

```json
"connections": {
  "<Source node name>": {
    "<outputPort>": [
      [ { "node": "<Target node name>", "type": "<same as port>", "index": 0 } ] ],
      [ /* branch 1 for multi-output nodes */ ]
  }
}
```

- **Source key** must exactly match a node `name`.
- **Target `node`** must exactly match another node `name`.
- **`index`**: output/input index on that port (usually `0`).

### Output ports

| Port | Typical source | Target |
|------|----------------|--------|
| `main` | Most base nodes, triggers, agents (main flow) | Next step in pipeline |
| `ai_languageModel` | Chat model nodes (Bedrock, OpenAI, etc.) | `@n8n/n8n-nodes-langchain.agent` |
| `ai_embedding` | Embeddings nodes | Vector store (insert or tool) |
| `ai_document` | Document loader | Vector store (insert pipeline) |
| `ai_tool` | Vector store in `retrieve-as-tool` mode | Agent |

LangChain subgraphs often have **no `main` wire** between model and agent — only `ai_*` ports. That is normal.

### `main` branch indices

For nodes with multiple outputs (IF, Switch, Split in Batches):

```json
"Loop Over Items": {
  "main": [
    [ { "node": "Done branch", "type": "main", "index": 0 } ],
    [ { "node": "Loop body", "type": "main", "index": 0 } ]
  ]
}
```

- Index `0` = first output (e.g. “done” on Split in Batches).
- Index `1` = second output (e.g. “loop”).

Always mirror the branch semantics documented in `ARCHITECTURE.md`.

### Minimal `main` chain

```json
"connections": {
  "When clicking 'Execute workflow'": {
    "main": [ [ { "node": "Fetch items from SharePoint", "type": "main", "index": 0 } ] ]
  },
  "Fetch items from SharePoint": {
    "main": [ [ { "node": "Filter target folder URLs", "type": "main", "index": 0 } ] ]
  }
}
```

### Minimal LangChain agent wiring

```json
"connections": {
  "When chat message received": {
    "main": [ [ { "node": "Answer product questions", "type": "main", "index": 0 } ] ]
  },
  "Bedrock chat model": {
    "ai_languageModel": [ [ { "node": "Answer product questions", "type": "ai_languageModel", "index": 0 } ] ]
  },
  "Product vector store": {
    "ai_tool": [ [ { "node": "Answer product questions", "type": "ai_tool", "index": 0 } ] ]
  },
  "Bedrock embeddings": {
    "ai_embedding": [ [ { "node": "Product vector store", "type": "ai_embedding", "index": 0 } ] ]
  }
}
```

## Sub-workflows

Parent uses `n8n-nodes-base.executeWorkflow` (see catalog). Document in `ARCHITECTURE.md`:

- Execute Workflow **node name** (story style)
- Child workflow name / id
- Input field mapping (`workflowInputs`)
- Expected outputs

Child reusable workflows have their own `specs/<child-slug>/` and `workflows/<child-slug>.json`.

## Triggers and entry points

Every orchestrator should have a clear entry:

| type | Typical use |
|------|-------------|
| `n8n-nodes-base.manualTrigger` | Manual / ops |
| `n8n-nodes-base.webhook` | HTTP callbacks |
| `n8n-nodes-base.scheduleTrigger` | Cron / interval |
| `@n8n/n8n-nodes-langchain.chatTrigger` | Chat UI |

A workflow may have **multiple triggers** only if the spec documents each path; otherwise split workflows.

**Do not invent** `webhookId` or public URLs — export from n8n or create in UI.

## Agent rules (this harness)

1. **Do not invent** `type`, `typeVersion`, or large `parameters` blobs — use [n8n-node-catalog.md](n8n-node-catalog.md), an approved reference export, or `n8n-cli workflow get <id>`.
2. **Do not** put secrets in JSON — credential names only.
3. **Match** node names and graph to `specs/<slug>/ARCHITECTURE.md`.
4. **Validate** before handoff: `node scripts/validate-workflow.mjs workflows/<slug>.json`.
5. **LangChain**: wire `ai_*` ports explicitly; verify targets exist on both `main` and AI ports.

## Self-check before verify / deploy

- [ ] File path is `workflows/<slug>.json` (your workflow, not a reference copy)
- [ ] `name`, `nodes`, `connections` present; all connection targets exist
- [ ] `settings.errorWorkflow` set or local Error Trigger justified in ARCHITECTURE
- [ ] Node names unique and story-style
- [ ] Expressions use `={{ }}` where needed
- [ ] Credentials referenced by name (and id if known on target instance)
- [ ] LangChain subgraph complete (model + agent + tools/embeddings as required)
- [ ] `INTEGRATION.md` lists every external system and credential setup step

## Related

- [n8n-node-catalog.md](n8n-node-catalog.md) — node types used in this org
- [conventions.md](conventions.md) — repo paths
- [n8n-cloud-cli.md](n8n-cloud-cli.md) — create/update on Cloud
- `.cursor/skills/n8n-cli/workflow-json.md` — short pointer for skills
