---
name: n8n-expression-syntax
description: >-
  Validate/fix n8n {{}} expressions: $json, $node, $now, webhook .body, Code node
  rules. Use when wiring node fields between nodes or debugging undefined/literal
  expression output. Harness: $node names = story names in ARCHITECTURE + workflows/<slug>.json.
---

# n8n-expression-syntax

Target: `workflows/<slug>.json`. Use in **n8n-build**, **n8n-verify**, **n8n-pull** review.

Refs: [COMMON_MISTAKES.md](COMMON_MISTAKES.md) | [EXAMPLES.md](EXAMPLES.md)

## Syntax

- Dynamic: `{{expr}}` in UI text; JSON params often `"field": "={{expr}}"`
- Invalid: bare `$json.x`, single `{ }`, `{{{{$json.x}}}}`

## Variables

| var | use |
|-----|-----|
| `$json` | incoming item at current node |
| `$node["Exact Name"].json.path` | prior node; quoted; case-sensitive; story names in harness |
| `$now` | Luxon: `.toFormat('yyyy-MM-dd')`, `.plus({days:7})` |
| `$env.X` | may be blocked (`N8N_BLOCK_ENV_ACCESS_IN_NODE`); prefer credentials (name in git only) |

## Webhook (default)

Payload under `.body`, not root:

```
wrong: {{$json.email}}
right: {{$json.body.email}}
```

Shape: `{headers, params, query, body:{...}}`. Document paths in INTEGRATION.md.

## Rules

1. `{{}}` on expression fields (not Code)
2. `['field name']` for spaced keys; `["Node Name"]` for spaced node names
3. arrays: `[0]` not `.0`
4. `$node["N"].json.path` always include `.json`
5. webhook `path`: static only
6. no secrets / no `{{$env.SECRET}}` in committed JSON
7. Code: `$input.item.json` / `$json` — no `{{}}`

## Harness flow

1. ARCHITECTURE.md names + graph
2. INTEGRATION.md field paths
3. edit `workflows/<slug>.json` (n8n-build, one TASK)
4. `node scripts/validate-workflow.mjs workflows/<slug>.json`
5. n8n-verify check #10 (expression mistakes)

## Debug

| symptom | likely fix |
|---------|------------|
| literal `$json.x` | add `{{}}` |
| undefined webhook field | `.body` |
| undefined $node | name case/quotes/.json |
| literal `{{$json.x}}` in Code output | remove `{{}}` in jsCode |

## Ops on types

- string: `.toLowerCase()`, `.trim()`, `.replace()`, `.split()`
- array: `[i]`, `.length`, `.map()`, `.join()`
- cond: `{{$json.x ? 'a' : 'b'}}`, `{{$json.x \|\| 'default'}}`
- date: `{{$now.toFormat(...)}}`, `.plus()`, `.minus()`

## Links

- n8n-build, n8n-verify, n8n-plan/refinar-specs
- docs/n8n-workflow-json.md, docs/n8n-node-catalog.md, docs/best-practices.md
