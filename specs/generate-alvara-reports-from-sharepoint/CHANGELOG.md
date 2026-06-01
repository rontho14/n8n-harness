# CHANGELOG — Generate Alvará reports from SharePoint base documents

## Unreleased

- Initial spec set from `n8n-plan`.
- Refinar-specs: Exemplos.json alignment — SharePoint credential `Microsoft SharePoint - svc_treinamentos_wide`, LibreOffice PDF API URL, exo-1…exo-5.
- **Task 1 (build):** Workflow scaffold — Manual Trigger → SharePoint Item getAll → Filter (`Document` + `02%20-%20Documentos%20Base`) → Code count guard (= 20); `settings.executionOrder` v1, no `errorWorkflow`.
- **Task 1 (sync):** Cloud export merged — credential id `cJYJl2MgBRS5Lzs4`, workflow id `JWWCxLcxFEorKpkG`; removed orphan connections from partial graph.
- **Task 2 (build):** exo-3 template download (`executeOnce`, retry ×2) → field schema Code (re-emits 20 items) → SplitInBatches `batchSize: 1`; loop/done outputs left open for Task 3/4.
- **Task 3 (build):** Loop branch — download by etag → Extract from File `pdf` → parse/merge HTML (DESIGN.md) → convertToFile `html` → HTTP LibreOffice convert (exo-5) → Set `relatorio_<stem>.pdf`; continueOnFail + `processingError` tagging; loop back to SplitInBatches.
- **Task 3 (fix):** **Download current base PDF** — added required SharePoint **Parent Folder** `02 - Documentos Base` (`01HA27FLUJLOJ2AROAVJCYISGGXIKHYKR3`); INTEGRATION + exemplos-patterns exo-1 updated (gap: plan/verify did not assert folder on File download).
- **Task 4 (build):** Loop **done** → **Keep only successful report PDFs** (no `processingError`, binary `data` exists) → **Compress report PDFs into one ZIP** (`relatorios_alvaras_{{ $now.format('yyyy-MM-dd_HHmm') }}.zip`). Full graph complete (16 nodes).
