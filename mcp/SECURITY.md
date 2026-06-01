# Security — n8n-harness-mcp

Vendored MCP server used **locally** with the n8n-harness (stdio only). See [THIRD_PARTY.md](./THIRD_PARTY.md) for upstream lineage.

## Reporting vulnerabilities

Report security issues for **this harness repository** through your organization's normal channel for the n8n-harness project. Do not commit secrets or live credentials when reproducing issues.

For vulnerabilities in the **original upstream** project, use that project's security policy on GitHub (see THIRD_PARTY.md).

## Scope

- **In scope:** stdio MCP transport, local SQLite `data/nodes.db`, validation and documentation tools, optional n8n REST API client when configured via environment variables.
- **Out of scope:** n8n instance security beyond what the configured API key already allows; upstream hosted dashboard/SaaS features (removed or disabled in this fork).

## Hardening reference

Maintainers: [docs/SECURITY_HARDENING.md](./docs/SECURITY_HARDENING.md), [docs/THREAT_MODEL.md](./docs/THREAT_MODEL.md).
