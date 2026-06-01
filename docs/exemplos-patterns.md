# Exemplos workflow patterns (RD n8n Cloud)

Canonical reference for SharePoint + PDF patterns used in the RD challenge instance. Derived from the n8n Cloud export **`Exemplos.json`** (repo root, **gitignored** — copy from UI if missing).

**Agents — read order**

1. This file (committed patterns, no site GUIDs)
2. If present: `Exemplos.json` (full node JSON + sticky notes)
3. If present: `docs/rd-cloud-patterns.md` (your team’s filled-in copy of [rd-cloud-patterns.example.md](rd-cloud-patterns.example.md))
4. [n8n-node-catalog.md](n8n-node-catalog.md) pattern D (SharePoint list/loop)
5. [.cursor/skills/n8n-expression-syntax/EXAMPLES.md](../.cursor/skills/n8n-expression-syntax/EXAMPLES.md) ex16–ex23

**Skills that must consult this before planning SharePoint/PDF flows:** `n8n-plan`, `refinar-specs`, `n8n-build`, `n8n-expression-syntax`, `n8n-workflow-patterns`.

---

## Pattern index

| ID | What | Nodes | Expression skill |
|----|------|-------|------------------|
| **exo-1** | List library items → filter folder → loop → download | SharePoint Item getAll, If/Filter, SplitInBatches, SharePoint File download | ex16, ex17, ex19 |
| **exo-2** | Upload generated file in loop (dynamic name) | SplitInBatches, SharePoint File upload | ex18 |
| **exo-3** | Download project template (static pick) | SharePoint File download | — |
| **exo-4** | Extract text from PDF (no external API) | SharePoint File download → Extract from File `pdf` | ex20 |
| **exo-5** | Generate PDF from HTML (external convert API only) | Text/HTML source → Convert to File `html` → HTTP Request multipart | ex21 |

---

## exo-1 — List → filter by `webUrl` → loop → download

**Do not** use SharePoint `resource: "folder"` — it does not exist. List via **Item → Get Many** on the document library.

### Steps

1. **Microsoft SharePoint** — Resource **Item**, operation **Get Many** / getAll  
   - Site: e.g. `AcelerAI_06_2026` (`cachedResultName`)  
   - List: `Documents`  
   - `returnAll: true`, **`simplify: false`** (required for `@odata.etag`, `webUrl`, `contentType`)

2. **Filter** (or **If**) — two conditions, `combinator: and`  
   - `={{ $json.contentType.name }}` **equals** `Document`  
   - `={{ $json.webUrl }}` **contains** URL-encoded folder segment  

   | UI folder name | `webUrl` filter `rightValue` (literal, not expression) |
   |----------------|--------------------------------------------------------|
   | `02 - Documentos Base` | `02%20-%20Documentos%20Base` |
   | `03 - Template` | `03%20-%20Template` |

   Display names with spaces **must not** be used in the `contains` value — only the encoded segment. Full paths also include `Shared%20Documents`.

3. **Split In Batches** — `batchSize: 1` (loop branch = index `1`, done = index `0` in connections)

4. **Microsoft SharePoint** — Resource **File**, operation **download**  
   - **`folder`**: static Parent Folder picker (required in UI even when file is dynamic)  
   - `file.mode`: `id`  
   - `file.value`: etag → GUID (see ex17)

```json
"folder": {
  "__rl": true,
  "value": "01HA27FLUJLOJ2AROAVJCYISGGXIKHYKR3",
  "mode": "list",
  "cachedResultName": "02 - Documentos Base"
},
"file": {
  "__rl": true,
  "value": "={{ $json['@odata.etag'].replace(/\"/g, '').split(',')[0] }}",
  "mode": "id"
}
```

`@odata.etag` shape: `"65684433-cee2-4993-af65-71a2d9b9914d,1"` → use only the GUID before the comma.

**Exemplos.json nodes:** `Get many items - Listar itens da pasta1`, `Filtrar arquivos 'docs' da pasta1`, `Loop Over Items1`, `Download Doc_x1`.

---

## exo-2 — Loop → upload with dynamic `fileName`

After PDF (or any binary) is on the item (`data`):

1. **SharePoint File upload** — pick site + **Parent Folder** (e.g. personal challenge folder)
2. `fileContents`: `data` (binary property name)
3. `fileName` from loop item `webUrl`:

```
={{ decodeURIComponent($('<Exact SplitInBatches node name>').item.json.webUrl.split('/').pop()) }}
```

Example:  
`https://…/02%20-%20Documentos%20Base/doc_15.pdf` → `doc_15.pdf`

**Exemplos.json nodes:** `Loop Over Items2`, `Upload file - Documento_final_x1`.

Skip this pattern when the spec is **read-only** (outputs only on execution, no SharePoint write).

---

## exo-3 — Download template (static file pick)

One-time **File → download** with UI picker (no loop):

| Field | Example |
|-------|---------|
| Site | `AcelerAI_06_2026` |
| Parent folder | `03 - Template` |
| File | `template_licenciamento.pdf` |

Copy the configured node from `Exemplos.json` or Cloud UI into the dev workflow; GUIDs in export are instance-specific — re-pick in UI on another tenant if needed.

**Exemplos.json node:** `Download file - Template1`.

Use for **layout/field reference** or schema — not as “fill this PDF in place” unless the spec explicitly requires AcroForm fill.

---

## exo-4 — Extract PDF text (built-in, no read API)

**Never plan** a third-party “PDF read” or “document intelligence” HTTP API for text extraction when the source is already a PDF in n8n.

### Steps

1. SharePoint **File download** (exo-1 per item, or static pick for a sample)
2. **Extract from File** — `operation`: **`pdf`**, `typeVersion`: `1.1`  
   - Input: `main` with binary from download  
   - Output: text on `json` (raw extracted content)

```json
{
  "type": "n8n-nodes-base.extractFromFile",
  "typeVersion": 1.1,
  "parameters": {
    "operation": "pdf",
    "options": {}
  }
}
```

3. Optional **Code** node: deterministic parse (regex / label anchors) — no LLM required for fixed templates.

**Exemplos.json nodes:** `Download Doc_x2`, `Extract from File - Doc_x1`.

MCP may not list `extractFromFile`; type is `n8n-nodes-base.extractFromFile` — see [n8n-node-catalog.md](n8n-node-catalog.md).

---

## exo-5 — Generate PDF (HTML → HTTP convert API)

**Only for creating PDFs**, not reading them.

### Steps

1. **HTML source** — Code node (merge fields), Set, or AI Agent output (business choice per spec)
2. **Convert to File** — `operation`: `html` → binary `data`
3. **HTTP Request** — POST `multipart-form-data`, binary field (e.g. `files` / `data` per vendor)

Exemplos export uses team LibreOffice convert URL — put the real URL in **`INTEGRATION.md`** only; credential name in n8n, **no keys in git**.

```json
{
  "method": "POST",
  "contentType": "multipart-form-data",
  "bodyParameters": {
    "parameters": [
      {
        "parameterType": "formBinaryData",
        "name": "files",
        "inputDataFieldName": "data"
      }
    ]
  }
}
```

**Exemplos.json nodes:** `AI Agent` (example text only), `Converter saida para HTML1`, `API de conversão para HTML para PDF1`.

For Alvará-style reports: prefer **Code → HTML** over AI Agent when fields are deterministic (see active specs).

---

## Planning anti-patterns

| Wrong in ARCHITECTURE / INTEGRATION | Use instead |
|-------------------------------------|-------------|
| External API to **read** / OCR PDF text | **exo-4** — Extract from File `pdf` |
| SharePoint `resource: "folder"` or list children | **exo-1** — Item getAll + `webUrl` filter |
| Plain `02 - Documentos Base` in `webUrl` contains | Encoded `02%20-%20Documentos%20Base` (**exo-1**) |
| `$json['@odata'].etag` | `$json['@odata.etag']` + split (**ex17**) |
| Guessing loop name in `$('Loop Over Items')` | Exact `nodes[].name` from ARCHITECTURE (**ex18**) |
| HTML→PDF via community node | Built-in HTTP Request + INTEGRATION URL (**exo-5**) |

**Allowed external HTTP for PDF:** HTML→PDF **conversion** only (**exo-5**), documented in INTEGRATION with credential **name**.

---

## End-to-end compositions

| Business flow | Pattern chain |
|---------------|---------------|
| Batch reports from SharePoint PDFs | exo-1 → exo-4 → Code parse → Code HTML → exo-5 → (optional exo-2 or Compression ZIP) |
| Load template once | exo-3 (reference) + exo-4 on each base doc |
| Challenge: ZIP on execution only | exo-1 → … → exo-5 → Compression; **no** exo-2 |

---

## File locations

| File | In git? | Role |
|------|---------|------|
| `Exemplos.json` | No (`.gitignore`) | Full export; sticky notes in Portuguese |
| `docs/exemplos-patterns.md` | Yes | Sanitized catalog for agents |
| `docs/rd-cloud-patterns.md` | No | Team-specific site IDs, credential names, API URL |
| `docs/rd-cloud-patterns.example.md` | Yes | Template to copy locally |

Place `Exemplos.json` at repository root after exporting from n8n Cloud workflow **Exemplos**.
