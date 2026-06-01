# Vendored MCP — retained reference docs

Upstream documentation kept for **maintainers** of `mcp/`. Harness operators should use [../../docs/mcp-local.md](../../docs/mcp-local.md) (and maintainer-local `plan/README.md`). Cursor agents use [../../.cursor/skills/n8n-mcp-local/](../../.cursor/skills/n8n-mcp-local/).

## Start here

| Doc | Audience |
|-----|----------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | **Maintainers** — runtime layout, tool categories, how to improve, workflow |
| [../../docs/mcp-pipeline.md](../../docs/mcp-pipeline.md) | Harness agents — when MCP is required in plan/build/verify |
| [../../docs/mcp-local.md](../../docs/mcp-local.md) | Operators — install, build, env |

## Technical reference

| Doc | Topic |
|-----|--------|
| [DATABASE_CONFIGURATION.md](./DATABASE_CONFIGURATION.md) | SQLite, adapters, `nodes.db` |
| [DEPENDENCY_UPDATES.md](./DEPENDENCY_UPDATES.md) | n8n package sync |
| [SECURITY_HARDENING.md](./SECURITY_HARDENING.md) | Trust model, hardening |
| [THREAT_MODEL.md](./THREAT_MODEL.md) | Security analysis |
| [workflow-diff-examples.md](./workflow-diff-examples.md) | Partial workflow updates |

## Deep dives (`local/`)

| Doc | Topic |
|-----|--------|
| [local/N8N_AI_WORKFLOW_BUILDER_ANALYSIS.md](./local/N8N_AI_WORKFLOW_BUILDER_ANALYSIS.md) | AI workflow builder analysis |
| [local/DEEP_DIVE_ANALYSIS_README.md](./local/DEEP_DIVE_ANALYSIS_README.md) | Index for telemetry deep-dive reports |
| [local/DEEP_DIVE_ANALYSIS_2025-10-02.md](./local/DEEP_DIVE_ANALYSIS_2025-10-02.md) | Usage / validation analysis |
| [local/Deep_dive_p1_p2.md](./local/Deep_dive_p1_p2.md) | P1/P2 recommendations |
| [local/P0_IMPLEMENTATION_PLAN.md](./local/P0_IMPLEMENTATION_PLAN.md) | P0 implementation plan |
| [local/TEMPLATE_MINING_ANALYSIS.md](./local/TEMPLATE_MINING_ANALYSIS.md) | Template mining |
| [local/integration-testing-plan.md](./local/integration-testing-plan.md) | Integration testing |
| [local/integration-tests-phase1-summary.md](./local/integration-tests-phase1-summary.md) | Integration test summary |

Removed during vendor cleanup: Railway/Docker/HTTP deploy guides, other IDE setup tutorials, and marketing screenshots under `docs/img/`.
