# Vendored MCP — architecture (maintainer)

**Full guide:** [mcp/docs/ARCHITECTURE.md](../../../mcp/docs/ARCHITECTURE.md) (canonical — runtime layout, improvement index, maintainer workflow).

## Quick map (`mcp/src/`)

```
loaders/node-loader.ts
parsers/ + mappers/docs-mapper.ts
database/                 # SQLite nodes.db
services/                 # validators, property-filter, workflow-validator, …
mcp/server.ts             # MCP server
mcp/tools.ts              # tool definitions
mcp/index.ts              # stdio entry → dist/mcp/index.js
```

## Tool categories

1. **Discovery** — `search_nodes`, `get_node`
2. **Validation** — `validate_node`, `validate_workflow`
3. **Templates** — `search_templates`, `get_template`
4. **Workflow (remote)** — optional; harness disables via `DISABLED_TOOLS`

## Improvement pointers

- P0/P1 analysis: `mcp/docs/local/`
- Security: `mcp/docs/SECURITY_HARDENING.md`, `THREAT_MODEL.md`
- Fork phases: `plan/README.md` (local)

See [mcp/docs/ARCHITECTURE.md](../../../mcp/docs/ARCHITECTURE.md) for details.
