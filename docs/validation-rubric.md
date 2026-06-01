# Spec validation rubric

Used by **`n8n-plan`** when scoring specs and writing `VALIDATION.md` open items. A spec set is **not build-ready** until every item below is answered in the spec files (not in chat).

Standards: [best-practices.md](best-practices.md).

## Scorecard

| # | Topic | Must appear in | Pass criteria |
|---|--------|----------------|---------------|
| 1 | Trigger & event schema | ARCHITECTURE, INTEGRATION | What starts the workflow; payload fields with types; example JSON |
| 2 | Idempotency / duplicates | TRUTH or ARCHITECTURE | How duplicate events are detected and skipped or merged |
| 3 | Failure, retries, alerting | TRUTH, ARCHITECTURE | Retry counts; terminal failure behavior; who gets notified |
| 4 | **Error workflow** | ARCHITECTURE | Global `errorWorkflow` name/id **or** local Error Trigger with documented exception |
| 5 | **Workflow kind** | ARCHITECTURE | `orchestrator` or `reusable`; sub-workflows listed with strict I/O if any |
| 6 | **Naming (story)** | ARCHITECTURE | Planned node names are plain English (no bare `If` / `Set` / `HTTP Request`) |
| 6b | **Node types verified** | ARCHITECTURE | Each planned node has **Type (verified)** from MCP `get_node` during plan (`n8n-plan` step 2d); not guessed |
| 6c | **RD exemplos patterns** (when SharePoint/PDF) | ARCHITECTURE, INTEGRATION | Plan followed [exemplos-patterns.md](exemplos-patterns.md) (exo-1…exo-5); no external API for **reading** PDF; `webUrl` filter uses encoded folder segment; HTML→PDF URL/credential names only in INTEGRATION |
| 7 | Input / output | ARCHITECTURE, INTEGRATION | Inbound/outbound shapes with examples; sub-workflow contracts if used |
| 8 | Credentials | INTEGRATION | **Names** only; step-by-step human setup in n8n UI |
| 9 | n8n Cloud instance | INTEGRATION | Instance URL, project, webhook base (if any); external API base URLs; no secrets in git |
| 10 | Acceptance → tests | TRUTH | Given/When/Then table maps to numbered manual test steps |
| 11 | Non-goals | TRUTH | Explicit out-of-scope list |
| 12 | **Reusable governance** | ARCHITECTURE (if reusable) | Limited scope; note shared visibility / restricted write |

## Planning output

`n8n-plan` copies gaps into `VALIDATION.md` under **Open items** with checkbox lines. When you approve:

```markdown
## Approval

- [x] Specs reviewed and approved for build
- Approved by: <name or "user">
- Date: YYYY-MM-DD
```

Until the approval block is checked and dated, **`n8n-build` must not run**.

## Build-time spot checks

`n8n-verify` additionally confirms:

- `node scripts/validate-workflow.mjs workflows/<slug>.json` passes
- Node graph and **names** match `ARCHITECTURE.md` (story naming)
- `settings.errorWorkflow` set per spec **or** justified local Error Trigger
- Execute Workflow nodes match documented sub-workflow contracts
- HTTP/Slack/etc. nodes match `INTEGRATION.md`
- No secret values in committed JSON

## Structural re-evaluation

After **four** consecutive `[REJECT]` on the same `TASKS.md` item:

1. Set task status to `BLOCKED_STRUCTURAL`
2. Create `STRUCTURAL_REEVAL.md` with root cause and revised approach
3. Update affected spec files and `TASKS.md`
4. Reset `VALIDATION.md` approval — human must re-approve before build
