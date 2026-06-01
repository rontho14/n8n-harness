# n8n workflow JSON (skill pointer)

Full reference: **[docs/n8n-workflow-json.md](../../../docs/n8n-workflow-json.md)**

Per-node types and parameters: **[docs/n8n-node-catalog.md](../../../docs/n8n-node-catalog.md)**

## Quick rules

- Canonical JSON: `workflows/<slug>.json` — **your** workflows only (no harness examples in that folder).
- `name`, `nodes`, `connections`, `settings` required; prefer `settings.errorWorkflow`.
- Connection source keys = node **names**; validate with `node scripts/validate-workflow.mjs workflows/<slug>.json`.
- LangChain uses `ai_languageModel`, `ai_embedding`, `ai_document`, `ai_tool` ports — not only `main`.
- Never commit secrets; credential `{ id, name }` only.
- Do not invent `type` / `typeVersion` / `parameters` — use catalog, specs, or a reference export.

## Related

- [docs/conventions.md](../../../docs/conventions.md)
- [docs/best-practices.md](../../../docs/best-practices.md)
