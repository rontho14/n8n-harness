# RD n8n Cloud patterns (template)

**Do not put company-specific values in this file.** Copy to `docs/rd-cloud-patterns.md` (gitignored) and fill in from your n8n Cloud export or UI.

```powershell
cp docs/rd-cloud-patterns.example.md docs/rd-cloud-patterns.md
```

## Reference exports

| File | In git? | Use |
|------|---------|-----|
| **`Exemplos.json`** (repo root) | No | Full n8n export — sticky notes + node JSON for all five patterns |
| **[exemplos-patterns.md](exemplos-patterns.md)** | Yes | Sanitized pattern catalog (exo-1 … exo-5); **read first** |
| **`docs/rd-cloud-patterns.md`** | No | Your site GUIDs, credential names, PDF API URL |

Agents: if `docs/rd-cloud-patterns.md` is missing, read **[exemplos-patterns.md](exemplos-patterns.md)** and, if present, **`Exemplos.json`**. Then [n8n-node-catalog.md](n8n-node-catalog.md) and expression EXAMPLES ex16–ex23.

---

## SharePoint — display name vs URL-encoded path

| Context | Example format |
|---------|----------------|
| UI picker / `cachedResultName` | `<folder display name>` e.g. `02 - Documentos Base` |
| If/Filter `webUrl` **contains** | URL-encoded segment e.g. `02%20-%20Documentos%20Base` |
| Full `webUrl` shape | `.../Shared%20Documents/.../<encoded-folder>/file.pdf` |

Document in `INTEGRATION.md`: display name + encoded segment for filters.

---

## Pattern exo-1: list → filter → loop → download

See [exemplos-patterns.md § exo-1](exemplos-patterns.md#exo-1--list--filter-by-weburl--loop--download).

1. **Item → Get All** on library `Documents`, `simplify: false`, `returnAll: true`
2. **If** or **Filter**: `contentType.name` equals `Document` AND `webUrl` contains `<encoded-folder-segment>`
3. **Split in Batches** (`batchSize` 1)
4. **File → download**, `file.mode`: `id`, value from `@odata.etag` (see ex17)

---

## Pattern exo-2: loop → upload

See [exemplos-patterns.md § exo-2](exemplos-patterns.md#exo-2--loop--upload-with-dynamic-filename).

- **File → upload** to folder `<your folder>`
- `fileName`: dynamic from loop item `webUrl` (see ex18)
- `$('Loop node name')` must match exact `nodes[].name`

---

## Pattern exo-3: static template download

See [exemplos-patterns.md § exo-3](exemplos-patterns.md#exo-3--download-template-static-file-pick).

- Site `AcelerAI_06_2026`, folder `03 - Template`, file `template_licenciamento.pdf`
- Copy node from `Exemplos.json` or Cloud UI into dev workflow

---

## Pattern exo-4: extract PDF text (built-in)

See [exemplos-patterns.md § exo-4](exemplos-patterns.md#exo-4--extract-pdf-text-built-in-no-read-api).

1. SharePoint download → binary on `main`
2. **Extract from File**, operation **`pdf`** (`n8n-nodes-base.extractFromFile`, typeVersion `1.1`)
3. Code node for deterministic field parse — **not** an external PDF read API

---

## Pattern exo-5: HTML → PDF (HTTP)

See [exemplos-patterns.md § exo-5](exemplos-patterns.md#exo-5--generate-pdf-html--http-convert-api).

1. HTML from Code / Set / (optional) AI Agent
2. **Convert to File** (`html`)
3. **HTTP Request** POST `multipart-form-data`, binary field → PDF API (URL in INTEGRATION.md only)

---

## Expression snippets (copy into local `rd-cloud-patterns.md` with real node names)

### File id from Get Many item (ex17)

```json
"file": {
  "__rl": true,
  "value": "={{ $json['@odata.etag'].replace(/\"/g, '').split(',')[0] }}",
  "mode": "id"
}
```

### If/Filter on folder in webUrl (ex16 / ex19)

```json
{
  "leftValue": "={{ $json.webUrl }}",
  "rightValue": "02%20-%20Documentos%20Base",
  "operator": { "type": "string", "operation": "contains" }
}
```

### Upload fileName in loop (ex18)

```json
"fileName": "={{ decodeURIComponent($('<Exact loop node name>').item.json.webUrl.split('/').pop()) }}"
```

---

## Site / credential placeholders (local file only)

| Field | Dev value |
|-------|-----------|
| SharePoint site | `<site cachedResultName>` |
| Credential name | `<microsoftSharePointOAuth2Api name in Cloud>` |
| PDF convert API URL | `<from INTEGRATION.md — generation only, not PDF read>` |
