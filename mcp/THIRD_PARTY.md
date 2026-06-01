# Third-party attribution

The code under `mcp/` is a **vendored fork** of the open-source [n8n node documentation MCP server](https://github.com/czlonkowski/n8n-mcp) (MIT). It is maintained inside the **n8n-harness** repository for local, stdio-only use with Cursor.

## Relationship to upstream

- This package is renamed **`n8n-harness-mcp`** and marked **`private`** — it is not published to npm.
- **No affiliation** with the upstream author, n8n GmbH, or the upstream hosted dashboard product.
- Upstream marketing, telemetry, and deploy paths are removed or disabled per the harness implementation plan in `plan/` (local to maintainers; not committed to git).

## License

See [LICENSE](./LICENSE) for the MIT license and upstream copyright notice. Modifications in this tree are part of the n8n-harness project; retain the MIT notice in distributions of substantial portions of the Software.

## Syncing upstream

Cherry-pick or manually merge fixes from upstream into `mcp/` on a branch, then re-run harness plan phases 3–4 (telemetry removal, build/database) and reload Cursor MCP. Do not auto-merge.
