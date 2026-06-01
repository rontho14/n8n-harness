# TRUTH — Generate Alvará reports from SharePoint base documents

## Narrative

An operator runs a batch job (AcelerAI n8n challenge) to turn 20 **Alvarás de Funcionamento** PDFs stored in SharePoint into 20 individual filled report PDFs. Each output PDF must contain only the fields defined in a shared report template, also stored in SharePoint. **Results stay in the n8n execution** so the operator downloads the 20 PDFs from the n8n UI — no SharePoint upload of outputs.

## User stories

1. **As** a challenge participant, **I want** to click one button in n8n and process all 20 base documents, **so that** I do not repeat the same steps manually for each Alvará.
2. **As** a reviewer, **I want** each generated PDF to follow the same report template layout and field set, **so that** outputs are comparable across documents.
3. **As** an operator, **I want** one ZIP with all 20 report PDFs after the run, **so that** I can download everything from the n8n execution in a single file.

## Acceptance criteria (Given / When / Then)

| ID | Given | When | Then |
|----|-------|------|------|
| AC-1 | Exactly 20 Alvará PDFs exist under `02 - Documentos Base` and the report template exists under `03 - Template` | The operator starts the workflow manually | The workflow lists, filters, validates count = 20, and processes all documents without further human steps |
| AC-1b | Fewer or more than 20 PDFs in base folder after filter | Validation runs | Workflow **stops** with explicit error; no ZIP produced |
| AC-2 | The report template defines a fixed set of fields | Each base PDF is processed | Fields parsed **verbatim** from Alvará text (deterministic parser); only template keys appear in output PDF |
| AC-3 | Processing completes (with or without per-item failures) | The run finishes | One ZIP on execution output containing **all successfully generated** report PDFs (up to 20) |
| AC-4 | One base document fails extraction or PDF generation | That item errors | Loop **continues** with remaining documents; failed items logged in execution; ZIP excludes failed items |
| AC-5 | The workflow is re-run | A prior execution already exists | Each run creates a **new execution** with its own ZIP; prior executions remain per n8n retention policy |

## In scope

- Manual (on-demand) batch run over the 20 base Alvará PDFs
- SharePoint read: base documents folder + report template folder
- Field extraction scoped to the report template
- Per-document report PDF generation
- Output: **one ZIP** with 20 report PDFs on the n8n execution (single download)

## Out of scope (non-goals)

- Scheduled or webhook-triggered runs
- Editing or versioning the report template inside the workflow
- Human-in-the-loop approval between documents
- LLM / OpenAI / Information Extractor for field extraction (deterministic PDF text parser instead)
- Email/Slack notifications (unless added later via global error workflow)
- Storing extracted data in a database or spreadsheet
- SharePoint **write/upload** of generated report PDFs
- Community nodes (HTML/PDF); conversion via built-in **HTTP Request** only
- Direct fill / overlay on `template_licenciamento.pdf` (PDF.co-style); outputs are **layout-equivalent** HTML→PDF reports instead
- Processing SharePoint folders other than `02 - Documentos Base` and `03 - Template` for input

## Failure and operations expectations

- Operator monitors progress in the n8n execution UI.
- Partial batch failure: **continue loop** on per-item errors; ZIP contains only successful PDFs (may be fewer than 20); failures visible in execution log per item.
- SharePoint or API rate limits may require retries on download/PDF nodes (counts in ARCHITECTURE).
- No SLA / quiet-hours requirements for this challenge workflow.

## Glossary

| Term | Meaning |
|------|---------|
| Alvará de Funcionamento | Brazilian business operating license document (source PDF) |
| Documento base | One of the 20 source Alvará PDFs in `02 - Documentos Base` |
| Template de relatório | Report layout/field definition stored in `03 - Template` |
| Pasta resposta | *(removed)* — outputs live in n8n execution, not SharePoint |
