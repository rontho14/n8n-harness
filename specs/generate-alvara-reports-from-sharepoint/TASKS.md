# TASKS — Generate Alvará reports from SharePoint base documents

## Task 1 — Discover and validate base documents

**Description:** Manual trigger, SharePoint list + filter (exo-1), fail if count ≠ 20.

**Dependencies:** none

**Target files:** `workflows/generate-alvara-reports-from-sharepoint.json`

**Success criteria:**
- Graph: Start → List → Filter → Count validate
- Filter uses URL-encoded `02%20-%20Documentos%20Base` and `Document` type
- Count node throws clear error when count ≠ 20
- SharePoint credential name `Microsoft SharePoint - svc_treinamentos_wide`
- `settings.executionOrder` v1, no `errorWorkflow`

**Status:** COMPLETED

**Review Rejections:** 0

---

## Task 2 — Template reference and loop entry

**Description:** Download template once, load field schema, wire SplitInBatches.

**Dependencies:** Task 1

**Success criteria:**
- Download `template_licenciamento.pdf` from `03 - Template` (executeOnce, retry 2)
- Load schema Code re-emits 20 items for loop
- SplitInBatches `batchSize: 1`

**Status:** COMPLETED

**Review Rejections:** 0

---

## Task 3 — Per-document processing loop

**Description:** Download base PDF, extract, parse, HTML merge, exo-5 PDF, name binary, loop back.

**Dependencies:** Task 2

**Success criteria:**
- Loop branch: download by etag id, Extract from File `pdf`, deterministic parse, HTML merge, convertToFile `html`, HTTP convert (Exemplos API), Set fileName `relatorio_<stem>.pdf`
- Continue on fail on extract/PDF nodes; `processingError` on failures
- Loop reconnects to SplitInBatches

**Status:** COMPLETED

**Review Rejections:** 0

---

## Task 4 — ZIP output

**Description:** Filter successes after loop done, compress to one ZIP.

**Dependencies:** Task 3

**Success criteria:**
- Done branch → filter (no `processingError`, has binary) → Compression zip
- ZIP name `relatorios_alvaras_{{ $now.format('yyyy-MM-dd_HHmm') }}.zip`

**Status:** COMPLETED

**Review Rejections:** 0

---

## Manual test checklist

| # | Steps | Expected |
|---|--------|----------|
| MT-1 | Exactly 20 PDFs in base folder; run workflow | Execution succeeds; ZIP with 20 PDFs |
| MT-1b | 19 or 21 PDFs in base folder; run workflow | Workflow fails before loop; clear error message |
| MT-2 | Open completed execution in n8n | One ZIP binary on output; contains 20 PDFs when extracted |
| MT-3 | Extract ZIP; open `relatorio_doc_01.pdf` | Fields match `doc_01.pdf` example in INTEGRATION.md |
| MT-4 | Simulate failure on 1 of 20 documents | Loop continues; ZIP has 19 PDFs |
| MT-5 | Re-run workflow | New execution with new ZIP |
