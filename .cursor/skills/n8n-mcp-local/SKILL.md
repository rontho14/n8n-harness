---

name: n8n-mcp-local

description: >-

  Use the vendored stdio MCP server (mcp/) for node discovery, validation hints,

  and templates while building harness workflows. Required during plan, refine,

  build, and verify when available — never skip VALIDATION.md, n8n-verify, or

  n8n-deploy. Read this skill before calling MCP tools.

---



# n8n MCP (local, harness)



Vendored server under `mcp/`. Cursor config: [`.cursor/mcp.json`](../../mcp.json). Operator guide: [`docs/mcp-local.md`](../../../docs/mcp-local.md). Pipeline integration: [`docs/mcp-pipeline.md`](../../../docs/mcp-pipeline.md).



## Authority (blocking)



| Task | Use |

|------|-----|

| Specs / graph / deploy gates | `n8n-plan`, `n8n-build`, `n8n-verify`, `n8n-deploy` |

| Repo workflow JSON lint | `n8n-validate-json` |

| Node docs / config / MCP validation | **This MCP** (required in pipeline when available) |

| Push to n8n Cloud | **`n8n-deploy` + user confirmation** — never MCP-only deploy |



Harness pipeline: **no subagents** ([`n8n-harness.mdc`](../../rules/n8n-harness.mdc)).



## Before every MCP session



1. Read [SEARCH_GUIDE.md](SEARCH_GUIDE.md) for `search_nodes` / `get_node` formats.

2. Run `tools_documentation` to confirm the server is alive.

3. Prefer `get_node` with default/essentials detail over dumping full schemas when possible.

4. **Never put secrets** in tool arguments (tokens, passwords, API keys).



## MCP unavailable



If `tools_documentation` or a required call fails: follow [`docs/mcp-pipeline.md`](../../../docs/mcp-pipeline.md) **MCP unavailable protocol** — stop the current plan/build/verify step; add open item to `VALIDATION.md`; ask user to `npm run mcp:build` and reload MCP.



## Required flows by phase



| Phase | Required MCP calls |

|-------|-------------------|

| Plan (`n8n-plan`) | Per node family: `search_nodes` → `get_node`; optional `search_templates` / `get_template` |

| Refine (`refinar-specs`) | Same when node/integration choice changes |

| Build (`n8n-build`, per task) | `get_node` (new types) → edit JSON → `validate_node` (changed nodes) → `validate_workflow` |

| Verify (`n8n-verify`) | `validate_workflow` (`runtime` or `strict`) — findings feed verify output |

| Deploy | **None** |



## After changing `mcp/` source



1. Maintainer runs `npm run build --prefix mcp` (or root `mcp:build` when wired).

2. Ask the user to **reload MCP in Cursor** before functional tests.



## Tool guides (from upstream)



- [SEARCH_GUIDE.md](SEARCH_GUIDE.md) — discovery

- [VALIDATION_GUIDE.md](VALIDATION_GUIDE.md) — `validate_node`, `validate_workflow`

- [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) — workflow tools (Cloud deploy still via `n8n-deploy`)

- [TOOLS_CATALOG.md](TOOLS_CATALOG.md) — full tool reference



Hosted-only tools (`n8n_generate_workflow`, telemetry, etc.) may be absent after fork phases 2–3; if a tool errors as disabled, fall back to harness skills and specs.



Story node names in JSON must match `$node["..."]` references ([`n8n-expression-syntax`](../n8n-expression-syntax/SKILL.md)).



## Functional test checklist



Use after MCP server changes (adapted from upstream `n8n-mcp-tester`):



1. `tools_documentation` — server alive

2. `search_nodes` — e.g. `slack`

3. `get_node` — `nodes-base.slack`

4. `validate_node` — sample config

5. Report ✅/❌ per scenario; do not commit from test-only runs



## Related harness skills



| Skill | When |

|-------|------|

| [n8n-node-configuration](../n8n-node-configuration/SKILL.md) | Operation/property patterns |

| [n8n-validation-expert](../n8n-validation-expert/SKILL.md) | Interpret validation errors |

| [n8n-workflow-patterns](../n8n-workflow-patterns/SKILL.md) | Pattern recipes |

| [n8n-expression-syntax](../n8n-expression-syntax/SKILL.md) | `{{}}` in repo JSON |



## Pitfalls (from upstream CLAUDE.md)



- DB rebuild (`npm run rebuild --prefix mcp`) can take minutes — maintainer only.

- Prefer essentials/summary node detail when the tool supports it — faster, fewer tokens.

- Validate before suggesting deploy to a live n8n instance.


