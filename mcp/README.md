# n8n-harness-mcp (vendored)

Local, stdio-only fork of the n8n node documentation MCP server for use with this harness. Package name: **`n8n-harness-mcp`** (private).

This project is a fork of the original open-source [n8n node documentation MCP server](https://github.com/czlonkowski/n8n-mcp). A huge thanks to the creator, **Romuald Czlonkowski** ([aiadvisors.pl](https://www.aiadvisors.pl/en)), for building and sharing such a valuable tool!

Implementation phases: see maintainer `plan/README.md` (local, gitignored). Legal: [LICENSE](./LICENSE), [THIRD_PARTY.md](./THIRD_PARTY.md).

Cursor agent guidance: [../.cursor/skills/n8n-mcp-local/](../.cursor/skills/n8n-mcp-local/). Operator guide: [../docs/mcp-local.md](../docs/mcp-local.md). **Maintainer architecture:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Other reference: [docs/README.md](docs/README.md).

After build (phase 4+), start via root `npm run mcp:build` and Cursor config in `.cursor/mcp.json`.
