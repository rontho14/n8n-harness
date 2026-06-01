# INTEGRATION — Generate Alvará reports from SharePoint base documents

Credential **names** only — never values in git.

## n8n Cloud instance

| Field | Value |
|-------|--------|
| Instance URL | `https://<challenge>.app.n8n.cloud` (same as **Exemplos** workflow) |
| Project name | TBD |
| Project ID | (after first deploy) |
| Webhook base URL | N/A (Manual Trigger) |

## Instance variables (non-secrets)

| Variable name | Purpose | Value |
|---------------|---------|--------|
| `SHAREPOINT_SITE_NAME` | Site display name | `AcelerAI_06_2026` |
| `SHAREPOINT_BASE_FOLDER` | Base documents folder display name | `02 - Documentos Base` |
| `SHAREPOINT_TEMPLATE_FOLDER` | Template folder display name | `03 - Template` |
| `HTML_TO_PDF_API_URL` | HTML→PDF convert endpoint | `https://api-pdf.gowide-qa.raiadrogasil.io/forms/libreoffice/convert` |

## Systems

### SharePoint (Microsoft 365)

| Field | Value |
|-------|--------|
| Auth credential name (n8n) | `microsoftSharePointOAuth2Api` — **`Microsoft SharePoint - svc_treinamentos_wide`** |
| Auth credential id (challenge instance) | `cJYJl2MgBRS5Lzs4` — same Cloud instance as **Exemplos**; re-pick in UI if import on another tenant |
| Credential type (UI label) | Microsoft SharePoint OAuth2 API |
| Site display name | `AcelerAI_06_2026` |
| Library | `Documents` |
| Site path prefix | `Desafio_n8n/` |
| Base folder display name | `02 - Documentos Base` |
| Base folder n8n **Parent Folder** id (File download picker) | `01HA27FLUJLOJ2AROAVJCYISGGXIKHYKR3` — from **Exemplos** `Download Doc_x1`; re-pick in UI if missing |
| Base folder `webUrl` filter segment (URL-encoded) | `02%20-%20Documentos%20Base` |
| Template folder display name | `03 - Template` |
| Template folder n8n **Parent Folder** id (File download picker) | `01HA27FLTNC6SV3VXJHRFJ3KFYEBRSFYCZ` — from **Exemplos** `Download file - Template1` |
| Template folder `webUrl` filter segment | `03%20-%20Template` |
| Expected base document count | **Exactly 20** — workflow fails if count ≠ 20 after filter |
| Base document layout | **Uniform** — same structure as `doc_01.pdf` (calibrated parser) |
| SharePoint write scope | **Read only** — download base PDFs + template; no upload of outputs |

#### Operations used

| Step | Resource | Operation |
|------|----------|-----------|
| List base PDFs | Item | Get Many (`simplify: false`, `returnAll: true`) |
| Download template / base PDF | File | download — **Parent Folder** required in n8n UI (static picker per folder above) **and** `file.mode: id` from `@odata.etag` on loop download (`Download Doc_x1` in Exemplos) |

**SharePoint File download (n8n UI):** Even when **File** is dynamic (`id` from `@odata.etag`), the node still requires **Parent Folder** (e.g. `02 - Documentos Base`). Omitting `folder` in JSON leaves the picker empty and blocks execution. Copy folder + file block from `Exemplos.json` for each download node.

### n8n execution output (ZIP bundle)

| Field | Value |
|-------|--------|
| Storage | Single ZIP binary on the completed execution output (1 item) |
| Operator access | n8n UI → **Executions** → open run → download ZIP from output binary |
| ZIP file name | `relatorios_alvaras_{{ $now.format('yyyy-MM-dd_HHmm') }}.zip` (proposed) |
| PDF names inside ZIP | `relatorio_<source-stem>.pdf` (one per successful Alvará) |
| Idempotency | Each manual run = new execution with new ZIP |
| Retention | Per n8n Cloud instance execution history settings |

No SharePoint upload, Data Table, or disk write for outputs in v1.

#### Human credential setup (n8n Cloud UI)

1. Reuse existing credential **`Microsoft SharePoint - svc_treinamentos_wide`** (type: Microsoft SharePoint OAuth2 API) — same as workflow **Exemplos**.
2. Grant **read** access to library `Documents` on site `AcelerAI_06_2026`.
3. Re-pick site / folders in SharePoint nodes (or copy nodes from `Exemplos.json` — GUIDs are instance-specific).
4. Reference nodes in export: `Get many items - Listar itens da pasta1`, `Download Doc_x1`, `Download file - Template1`.

**Git vs Cloud:** Workflow JSON in git stores the credential **name** only (no `id`). n8n matches credentials by **id** on import; if the node shows unlinked, open the credential dropdown once and select `Microsoft SharePoint - svc_treinamentos_wide`. After a working run, you may export from Cloud and share the `credentials` block if you want the harness copy to include your instance `id` (optional; ids differ per tenant).

### Field extraction (deterministic — no LLM)

| Field | Value |
|-------|--------|
| Approach | **exo-4** — SharePoint download → **Extract from File** (`pdf`) → Code parser. No external PDF read API. See [exemplos-patterns.md](../../docs/exemplos-patterns.md#exo-4--extract-pdf-text-built-in-no-read-api). |
| Input | Raw text from **Extract from File** (`pdf`) on each base Alvará |
| Logic | Line-based label anchors from `doc_01.pdf` — see DESIGN.md; all 20 Alvarás share layout |
| Missing field | Empty string; do not infer or rewrite values |

### PDF generation strategy

| Field | Value |
|-------|--------|
| Approach | **HTML intermediate → PDF** (confirmed) |
| Template PDF role | Field list + layout reference only; **not** filled in place |
| Output fidelity | Content and field order match template; visual styling approximated in HTML/CSS |

### HTML → PDF conversion (HTTP Request — Exemplos API)

| Field | Value |
|-------|--------|
| Node | `nodes-base.httpRequest` (built-in) |
| Source workflow | **Exemplos** — node `API de conversão para HTML para PDF1` |
| Auth credential name (n8n) | **None in export** (internal QA API); clone auth from Exemplos if present after import |
| API base URL (challenge / QA) | `https://api-pdf.gowide-qa.raiadrogasil.io/forms/libreoffice/convert` |
| Method | POST |
| Content type | `multipart-form-data` |
| Multipart field | `files` → binary property `data` |
| Options | `timeout`: 1200000 ms; `retryOnFail`: true (per Exemplos export) |
| `typeVersion` (observed) | `4.2` in Exemplos — confirm on target instance |

#### Human credential setup

1. Open workflow **Exemplos** in n8n Cloud.
2. Copy **URL + authentication** from node `API de conversão para HTML para PDF1` into this workflow’s **Convert HTML to PDF** node (or reuse same credential by name).
3. Confirm multipart body uses `formBinaryData` field `files` / input `data` — see [exemplos-patterns.md § exo-5](../../docs/exemplos-patterns.md#exo-5--generate-pdf-html--http-convert-api).
4. Optional local reference: `Exemplos.json` at repo root (gitignored export).

## Report template contract (business)

| Field | Value |
|-------|--------|
| Template file name | `template_licenciamento.pdf` |
| Template file format | **PDF** — fixed fields/sections (visual layout reference, not DOCX/HTML placeholders) |
| Field list | Fixed — see table below (from `template_licenciamento.pdf`) |
| Output PDF naming | `relatorio_<source-stem>.pdf` inside ZIP |
| Output bundle | Single ZIP on n8n execution output |

### Template fields (extraction schema)

| Label (template) | JSON key | Source |
|------------------|----------|--------|
| Data de Geração | `DATA_GERACAO` | **Generated** at run time (not from Alvará) |
| Razão Social | `RAZAO_SOCIAL` | Extracted from base Alvará PDF |
| Nome | `NOME_FANTASIA` | Extracted from base Alvará PDF |
| CNPJ | `CNPJ` | Extracted from base Alvará PDF |
| Município / UF | `MUNICIPIO_UF` | Extracted from base Alvará PDF |
| Nº do Alvará | `NUMERO_ALVARA` | Extracted from base Alvará PDF |
| Data de Validade | `DATA_VALIDADE` | Extracted from base Alvará PDF |
| Responsável Técnico | `RESP_TECNICO_NOME` | Extracted from base Alvará PDF |
| CRF | `RESP_TECNICO_CRF` | Extracted from base Alvará PDF |
| Classificação de Risco | `CLASSIFICACAO_RISCO` | Extracted from base Alvará PDF |
| Horário de Funcionamento | `HORARIO_FUNCIONAMENTO` | Extracted from base Alvará PDF |

Template PDF is downloaded once per run (layout reference). **Parser** uses the 10 Alvará-sourced keys only; `DATA_GERACAO` is set at merge time. Output PDFs via HTML→PDF.

#### Example parsed JSON (`doc_01.pdf`)

```json
{
  "RAZAO_SOCIAL": "Farmácia Nova Vida LTDA",
  "NOME_FANTASIA": "Nova Vida",
  "CNPJ": "91.214.125/0001-45",
  "MUNICIPIO_UF": "São Paulo / SP",
  "NUMERO_ALVARA": "ALV-2026-38893",
  "DATA_VALIDADE": "7 de setembro de 2027",
  "RESP_TECNICO_NOME": "Ana Paula de Souza",
  "RESP_TECNICO_CRF": "CRF-SP 65392",
  "CLASSIFICACAO_RISCO": "Médio",
  "HORARIO_FUNCIONAMENTO": "07:00 às 22:00"
}
```

## Webhooks

N/A — Manual Trigger only.
