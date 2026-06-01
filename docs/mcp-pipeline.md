# MCP ↔ harness pipeline integration

The vendored **n8n-harness-mcp** server (`mcp/`, Cursor: [`.cursor/mcp.json`](../.cursor/mcp.json)) is **required** during plan, refine, build, and verify when the server is available. Agents use it to discover node types, confirm parameters, and validate workflow JSON—not chat memory alone.

**Authority unchanged:** specs on disk, [`VALIDATION.md`](../specs/_templates/VALIDATION.md) approval, [`n8n-verify`](../.cursor/skills/n8n-verify/SKILL.md) `[APPROVE]`/`[REJECT]`, [`n8n-deploy`](../.cursor/skills/n8n-deploy/SKILL.md) + user confirmation via `n8n-cli`.

Operator setup: [mcp-local.md](mcp-local.md). Agent skill: [`.cursor/skills/n8n-mcp-local/SKILL.md`](../.cursor/skills/n8n-mcp-local/SKILL.md).

## What MCP does not replace

| Gate | Still required |
|------|----------------|
| Human build approval | Checked, dated **Approval** in `VALIDATION.md` |
| Spec alignment | `n8n-verify` graph, story names, INTEGRATION, secrets |
| Repo JSON lint | `node scripts/validate-workflow.mjs workflows/<slug>.json` |
| Cloud deploy | `n8n-deploy` + explicit user confirmation |
| Remote workflow writes | Disabled in `.cursor/mcp.json` (`DISABLED_TOOLS`) |

MCP `validate_workflow` feeds **findings** into verify; it does not auto-approve.

## Phase → required MCP tools

| Phase | Skill | Required MCP calls | Writes to disk |
|-------|--------|-------------------|----------------|
| Session start | Any pipeline skill | `tools_documentation` (confirm server alive) | — |
| Plan | `n8n-plan` | Read [exemplos-patterns.md](exemplos-patterns.md) when SharePoint/PDF; per distinct node family: `search_nodes` → `get_node`; optional `search_templates` / `get_template` | `ARCHITECTURE.md` verified types + exo-1…exo-5 refs where applicable |
| Refine | `refinar-specs` | When a decision changes node/integration choice: `search_nodes` + `get_node` before updating ARCHITECTURE | Same as plan |
| Build (per task) | `n8n-build` | Before JSON edits for new types: `get_node`; after task edit: `validate_node` per new/changed node, then `validate_workflow` | `workflows/<slug>.json` only |
| Verify | `n8n-verify` | `validate_workflow` (profile `runtime` or `strict` per [VALIDATION_GUIDE](../.cursor/skills/n8n-mcp-local/VALIDATION_GUIDE.md)) | `TASKS.md` rejections only |
| Deploy | `n8n-deploy` | **None** | `deployments/DEPLOYMENTS.md` |

**Before any MCP call:** read [n8n-mcp-local](../.cursor/skills/n8n-mcp-local/SKILL.md); use [SEARCH_GUIDE](../.cursor/skills/n8n-mcp-local/SEARCH_GUIDE.md) and [VALIDATION_GUIDE](../.cursor/skills/n8n-mcp-local/VALIDATION_GUIDE.md) as needed.

**Story names:** MCP validates types and parameters; `n8n-verify` enforces display names vs `ARCHITECTURE.md` and expression `$node["..."]` references ([n8n-expression-syntax](../.cursor/skills/n8n-expression-syntax/SKILL.md)).

## MCP unavailable protocol

When `tools_documentation` or a required call fails (server not listed, `mcp/dist` missing, tool disabled):

1. **Stop** the current pipeline step (plan, build iteration, or verify).
2. Add to `specs/<slug>/VALIDATION.md` → **Open items**: `- [ ] MCP available (run npm run mcp:build, reload Cursor MCP)`.
3. Tell the user: `npm run mcp:build` from repo root, reload MCP ([mcp-local.md](mcp-local.md)), retry.
4. Do **not** mark `TASKS.md` **COMPLETED** or emit `[APPROVE]` while MCP is blocked.

## Example: plan (Slack notify on webhook)

1. `tools_documentation` — session alive.
2. Draft ARCHITECTURE graph: Webhook → IF → Slack.
3. `search_nodes` query `webhook` → `get_node` for `nodes-base.webhook`.
4. `search_nodes` query `if` → `get_node` for `nodes-base.if`.
5. `search_nodes` query `slack` → `get_node` for `nodes-base.slack`.
6. Record verified types in ARCHITECTURE node table; story names in **Node name** column.
7. Optional: `search_templates` `slack webhook` → `get_template` if unsure of wiring.
8. Run validation scorecard → `VALIDATION.md` open items → stop for human approval.

## Example: build (one task — add HTTP Request node)

1. `tools_documentation` if new session.
2. Read ARCHITECTURE: task adds `Fetch user profile from directory` → type `nodes-base.httpRequest`.
3. `get_node` for `nodes-base.httpRequest` (essentials detail).
4. Edit `workflows/<slug>.json` for this task only.
5. `validate_node` on the new HTTP node config.
6. `validate_workflow` on full workflow JSON.
7. `node scripts/validate-workflow.mjs workflows/<slug>.json`.
8. `n8n-verify` checklist (including MCP findings) → `[APPROVE]` or `[REJECT]`.

## Build loop (canonical)

```
Pick task
→ get_node (each new type for task)
→ edit workflows/<slug>.json
→ validate_node (each changed node)
→ validate_workflow
→ validate-workflow.mjs
→ n8n-verify (incl. validate_workflow findings)
→ [APPROVE] → COMPLETED + CHANGELOG
```

## Related docs

- [STRUCTURE.md](../STRUCTURE.md) — pipeline diagram
- [invoke-cheatsheet.md](invoke-cheatsheet.md) — which skill when
- [validation-rubric.md](validation-rubric.md) — plan scorecard including node types verified
