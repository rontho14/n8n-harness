# n8n node catalog (team reference)

Curated `type` / `typeVersion` / connection patterns for nodes used in this org. Derived from production exports (e.g. pharmacy pricing / RAG workflows). **Do not invent versions** — confirm on your n8n Cloud instance or copy from a fresh export.

When a node is missing here: build it in the n8n UI, export JSON, and add a catalog entry.

JSON shape and ports: [n8n-workflow-json.md](n8n-workflow-json.md).

---

## How to read entries

| Column | Meaning |
|--------|---------|
| **type** | Exact `nodes[].type` string |
| **typeVersion** | Observed in exports; bump if Cloud warns on import |
| **Credentials key** | Key under `node.credentials` |
| **Inputs** | Connection ports **into** this node (from other nodes) |
| **Outputs** | Connection ports **out of** this node (in `connections`) |

---

## Triggers

### Manual Trigger

| | |
|--|--|
| **type** | `n8n-nodes-base.manualTrigger` |
| **typeVersion** | `1` |
| **parameters** | `{}` |
| **Outputs** | `main` → first step |

Used for batch/ops flows started by a human in the editor.

### Chat Trigger

| | |
|--|--|
| **type** | `@n8n/n8n-nodes-langchain.chatTrigger` |
| **typeVersion** | `1.3` |
| **parameters** | `public` (boolean), `options` |
| **Outputs** | `main` → agent or processing chain |
| **Notes** | Export includes `webhookId`. `public: true` exposes chat without extra auth — document risk in ARCHITECTURE / TRUTH. |

```json
"parameters": {
  "public": false,
  "options": {}
}
```

---

## Microsoft SharePoint

| | |
|--|--|
| **type** | `n8n-nodes-base.microsoftSharePoint` |
| **typeVersion** | `1` |
| **Credentials key** | `microsoftSharePointOAuth2Api` |

### Supported resources (builtin node)

**Resource** dropdown is only: **File**, **Item**, **List** — there is **no `folder` resource**. Do not use `resource: "folder"` or `getChildren` in workflow JSON.

| Resource | Operations (typical) |
|----------|-------------------|
| **File** | download, upload, update — uses `folder` + `file` **parameters** (not a Resource type) |
| **Item** | get, getAll (Get Many), create, update, delete, upsert — list/document-library entries |
| **List** | get, getAll — SharePoint lists metadata |

### List files in a document-library folder

There is no “list folder children” operation. Pattern:

1. **Item** → **Get All** / Get Many on the document library (e.g. `Documents`).
2. Set **`simplify`: `false`** so `id`, `webUrl`, `@odata.etag`, and `fields.FileLeafRef` are available.
3. **Filter** or **If** on `webUrl` **contains** the **URL-encoded** folder segment (e.g. display name `02 - Documentos Base` → filter value `02%20-%20Documentos%20Base`). Paths also include `Shared%20Documents`. See [exemplos-patterns.md](exemplos-patterns.md#exo-1--list--filter-by-weburl--loop--download) and [rd-cloud-patterns.example.md](rd-cloud-patterns.example.md) (optional local `rd-cloud-patterns.md`, gitignored). `Exemplos.json` uses **If** with `contentType.name` + `webUrl`; specs may use **Filter** — equivalent.

```json
"parameters": {
  "resource": "item",
  "operation": "getAll",
  "site": { "__rl": true, "value": "...", "mode": "list", "cachedResultName": "AcelerAI_06_2026" },
  "list": { "__rl": true, "value": "...", "mode": "list", "cachedResultName": "Documents" },
  "returnAll": true,
  "simplify": false,
  "options": {}
}
```

**Outputs:** `main` → filter → loop.

### Download file (resource `file`)

Use **Resource = File**, operation **download**. Pick `folder` + `file` locators, or **file** with `mode: "id"` and id/etag from Item output.

```json
"parameters": {
  "site": { "__rl": true, "value": "...", "mode": "list" },
  "folder": { "__rl": true, "value": "...", "mode": "list", "cachedResultName": "Imagens Não Analisadas" },
  "file": { "__rl": true, "value": "={{ $json['@odata.etag'].replace(/\\\"/g, '').split(',')[0] }}", "mode": "id" }
}
```

`@odata.etag` is often `"<guid>,1"` — strip quotes, split on `,`, use index `0` as file id. Bracket notation `['@odata.etag']` is required.

**Outputs:** `main` (binary + json metadata) → extract / code / agent.

### Upload file

```json
"parameters": {
  "operation": "upload",
  "site": { "__rl": true, "value": "...", "mode": "list" },
  "folder": { "__rl": true, "value": "...", "mode": "list", "cachedResultName": "upload" },
  "fileName": "pesquisa_preco.xlsx",
  "fileContents": "data"
}
```

`fileContents` names the **binary property** on the item (often `data`).

### Upload in a loop (dynamic file name)

Reference the **exact** `splitInBatches` node name with `$('…')`:

```json
"fileName": "={{ decodeURIComponent($('Loop over base documents').item.json.webUrl.split('/').pop()) }}"
```

Example If filter (folder in `webUrl`):

```json
{
  "leftValue": "={{ $json.webUrl }}",
  "rightValue": "02%20-%20Documentos%20Base",
  "operator": { "type": "string", "operation": "contains" }
}
```

---

## Files and binary

### Extract from File

| | |
|--|--|
| **type** | `n8n-nodes-base.extractFromFile` |
| **typeVersion** | `1.1` (PDF); `1` for csv/xlsx |
| **parameters** | `operation`: `pdf`, `csv`, `xlsx`, … |
| **Inputs** | `main` with binary from SharePoint/other download |
| **Outputs** | `main` with extracted text on `json` |

**PDF text (exo-4):** After SharePoint File download, set `operation` to **`pdf`**. No external “PDF read” HTTP API — see [exemplos-patterns.md](exemplos-patterns.md#exo-4--extract-pdf-text-built-in-no-read-api) and `Exemplos.json` node `Extract from File - Doc_x1`.

```json
"parameters": { "operation": "pdf", "options": {} }
```

Pair with **Code** for deterministic label→field parsing. MCP lookup may miss this type; still use `n8n-nodes-base.extractFromFile` in ARCHITECTURE.

### Convert to File

| | |
|--|--|
| **type** | `n8n-nodes-base.convertToFile` |
| **typeVersion** | `1.1` |
| **parameters** | `operation`: `xlsx`, `json`, …; `binaryPropertyName` if not default |
| **Inputs** | `main` (json rows) |
| **Outputs** | `main` with binary → upload |

---

## Flow control

### Filter

| | |
|--|--|
| **type** | `n8n-nodes-base.filter` |
| **typeVersion** | `2.2` |
| **parameters** | `conditions` with operators (e.g. string `contains` on `$json.webUrl`) |
| **Outputs** | `main` (matching items only) |

### Split in Batches (Loop)

| | |
|--|--|
| **type** | `n8n-nodes-base.splitInBatches` |
| **typeVersion** | `3` |
| **parameters** | `batchSize`: `"=1"` or number |
| **Outputs** | `main[0]` = done, `main[1]` = each batch iteration |

Wire done branch to aggregate/upload; loop branch to per-item processing, then back into the loop node per n8n loop pattern.

### Set (Edit Fields)

| | |
|--|--|
| **type** | `n8n-nodes-base.set` |
| **typeVersion** | `3.4` |
| **parameters** | `assignments.assignments[]` with `name`, `value`, `type` |
| **Example** | Normalize eTag: `$json.eTag.replace(/\"/g, '').split(",")[0]` |

---

## Code

| | |
|--|--|
| **type** | `n8n-nodes-base.code` |
| **typeVersion** | `2` |
| **parameters** | `jsCode`: string (JavaScript) |
| **Inputs** | `main` |
| **Outputs** | `main` |

Use for deterministic transforms (parse agent JSON, numeric price diff). Prefer story name e.g. `Parse agent output into product rows`. Document logic in ARCHITECTURE — agents should not be the only place for business math.

Return shape: `return [{ json: { ... } }];` or one item per product: `return items.map(...)`.

---

## Execute Workflow

| | |
|--|--|
| **type** | `n8n-nodes-base.executeWorkflow` |
| **typeVersion** | `1.2` |
| **parameters** | `workflowId` (`__rl`), `workflowInputs`, `options.waitForSubWorkflow` |
| **Inputs** | `main` |
| **Outputs** | `main` (child result) |

```json
"parameters": {
  "workflowId": {
    "__rl": true,
    "value": "CHILD_WORKFLOW_ID",
    "mode": "list",
    "cachedResultName": "Child workflow display name"
  },
  "workflowInputs": {
    "mappingMode": "defineBelow",
    "value": {
      "nome_arquivo": "Pesquisa_Preco.xlsx",
      "arquivo": "file"
    },
    "schema": [ { "id": "nome_arquivo", "type": "string", ... }, { "id": "arquivo", ... } ]
  },
  "options": { "waitForSubWorkflow": true }
}
```

Map binary fields to input names documented in child `ARCHITECTURE.md`.

---

## LangChain — models

### AWS Bedrock Chat Model

| | |
|--|--|
| **type** | `@n8n/n8n-nodes-langchain.lmChatAwsBedrock` |
| **typeVersion** | `1.1` |
| **Credentials key** | `aws` |
| **parameters** | `model`: expression ARN or inference profile ARN |
| **Outputs** | `ai_languageModel` → **Agent** |

```json
"parameters": {
  "model": "=arn:aws:bedrock:us-east-1:139154210092:application-inference-profile/xxxxx",
  "options": {}
}
```

### AWS Bedrock Embeddings

| | |
|--|--|
| **type** | `@n8n/n8n-nodes-langchain.embeddingsAwsBedrock` |
| **typeVersion** | `1` |
| **Credentials key** | `aws` |
| **parameters** | `model`: foundation model ARN |
| **Outputs** | `ai_embedding` → **PGVector** (insert or tool) |

---

## LangChain — agent and safety

### AI Agent

| | |
|--|--|
| **type** | `@n8n/n8n-nodes-langchain.agent` |
| **typeVersion** | `2.2` |
| **Inputs** | `main` (user message / prior data), `ai_languageModel`, optional `ai_tool` |
| **Outputs** | `main` → next step |

Two prompt styles:

**Chat / system message** (assistant):

```json
"parameters": {
  "options": {
    "systemMessage": "=Long prompt in markdown..."
  }
}
```

**Defined prompt** (batch / structured task):

```json
"parameters": {
  "promptType": "define",
  "text": "=Instructions referencing $json fields...",
  "hasOutputParser": true,
  "options": {}
}
```

Document prompts in `DESIGN.md` or `INTEGRATION.md` (business copy), not only inside JSON.

### Guardrails

| | |
|--|--|
| **type** | `@n8n/n8n-nodes-langchain.guardrails` |
| **typeVersion** | `2` |
| **Inputs** | `main`, `ai_languageModel` (classifier model) |
| **Outputs** | `main` → downstream if pass |
| **parameters** | `text` (often `={{ $json.output }}`), `guardrails` (jailbreak, pii, secretKeys, urls), `systemMessage` for classifier |

Place after untrusted LLM output (e.g. vision agent) before pricing or external actions.

---

## LangChain — vector store (Postgres PGVector)

| | |
|--|--|
| **type** | `@n8n/n8n-nodes-langchain.vectorStorePGVector` |
| **typeVersion** | `1.3` |
| **Credentials key** | `postgres` |

### Mode: `insert` (ingestion)

```json
"parameters": {
  "mode": "insert",
  "tableName": "schema.table_name",
  "embeddingBatchSize": 500,
  "options": {}
}
```

**Inputs:**

- `main` — documents / rows to embed
- `ai_embedding` ← embeddings node
- `ai_document` ← document loader (when used)

### Mode: `retrieve-as-tool` (agent tool)

```json
"parameters": {
  "mode": "retrieve-as-tool",
  "toolDescription": "Use this tool to search internal product prices",
  "tableName": "schema.table_name",
  "options": {}
}
```

**Inputs:** `ai_embedding` ← embeddings node  
**Outputs:** `ai_tool` → **Agent**

Same physical table can back multiple agents; use separate node instances per agent if needed.

---

## LangChain — document loader

| | |
|--|--|
| **type** | `@n8n/n8n-nodes-langchain.documentDefaultDataLoader` |
| **typeVersion** | `1.1` |
| **parameters** | `dataType`: `binary`, `loader`: `csvLoader`, etc. |
| **Outputs** | `ai_document` → PGVector **insert** |

Used in ingest pipelines after file → binary conversion.

---

## Canvas / non-executable

### Sticky Note

| | |
|--|--|
| **type** | `n8n-nodes-base.stickyNote` |
| **typeVersion** | `1` |
| **parameters** | `content`, `height`, `width` |
| **Connections** | none |

---

## Common patterns (this org)

### A. Chat RAG assistant

1. `chatTrigger` → `agent` (`main`)
2. `lmChatAwsBedrock` → `agent` (`ai_languageModel`)
3. `vectorStorePGVector` (`retrieve-as-tool`) → `agent` (`ai_tool`)
4. `embeddingsAwsBedrock` → vector store (`ai_embedding`)

### B. PGVector ingest from file

1. SharePoint download → extract → convert to file (if needed)
2. `documentDefaultDataLoader` → vector store (`ai_document`)
3. `embeddingsAwsBedrock` → vector store (`ai_embedding`)
4. `vectorStorePGVector` (`insert`) ← `main` from file pipeline

Entry point must be documented (manual trigger or schedule) — ingest subgraph alone is not runnable.

### C. Batch price research (images)

1. `manualTrigger` → SharePoint list → filter → set (eTag) → `splitInBatches`
2. Loop: download image → code (attach binary) → vision `agent` → **guardrails** → code (parse) → pricing `agent` + vector tool → code (math) → loop back
3. Done: `convertToFile` (xlsx) → SharePoint upload

Consider splitting into orchestrator + reusable child workflows per [best-practices.md](best-practices.md).

### D. SharePoint batch download / upload

1. **Item** → Get All on `Documents`, `simplify: false`
2. **If** — `contentType.name` = `Document` AND `webUrl` contains encoded folder segment
3. **splitInBatches** → loop branch: **File** download — static **Parent Folder** + dynamic **File** id from `@odata.etag` → process
4. Optional done branch or second loop: **File** upload with dynamic `fileName` from `webUrl`

Expressions: [n8n-expression-syntax EXAMPLES ex16–ex18](../.cursor/skills/n8n-expression-syntax/EXAMPLES.md).

### E. HTML → PDF via HTTP API

1. Agent or Set (HTML/text) → **convertToFile** (`operation`: `html`)
2. **httpRequest** POST, `contentType`: `multipart-form-data`, binary field mapped to PDF service
3. Document API base URL and auth in `INTEGRATION.md` only (no secrets in git)

Pair with **extractFromFile** (`pdf`) when ingesting existing SharePoint PDFs.

---

## Nodes not yet cataloged

Add when you use them in production:

| type | Use case |
|------|----------|
| `n8n-nodes-base.webhook` | HTTP ingress |
| `n8n-nodes-base.scheduleTrigger` | Scheduled runs |
| `n8n-nodes-base.httpRequest` | REST calls |
| `n8n-nodes-base.if` | Branching |
| `n8n-nodes-base.slack` | Notifications |

---

## Maintenance

1. After n8n Cloud upgrade, re-export one workflow per pattern and diff `typeVersion`.
2. New node → one minimal JSON snippet + port diagram in this file.
3. Keep credential **names** in catalog examples generic (`My Postgres (prod)`).

## Related

- [n8n-workflow-json.md](n8n-workflow-json.md)
- [best-practices.md](best-practices.md)
- [validation-rubric.md](validation-rubric.md)
