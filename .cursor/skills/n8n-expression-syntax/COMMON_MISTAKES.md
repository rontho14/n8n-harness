# Expression mistakes (agent ref)

Scope: `workflows/<slug>.json` node params unless noted. Harness: `$node["..."]` must match story `nodes[].name` + ARCHITECTURE.md; no secrets in git.

See [EXAMPLES.md](EXAMPLES.md) for correct patterns.

## Quick table

| id | wrong | right | symptom |
|----|-------|-------|---------|
| missing-braces | `$json.email` | `{{$json.email}}` | literal `$json.email` |
| webhook-body | `{{$json.name}}` | `{{$json.body.name}}` | undefined on webhook |
| field-spaces | `{{$json.first name}}` | `{{$json['first name']}}` | syntax / undefined |
| node-spaces | `{{$node.HTTP Request.json}}` | `{{$node["HTTP Request"].json}}` | Cannot read property 'Request' |
| node-case | `{{$node["http request"]}}` | exact `nodes[].name` | undefined, node exists |
| double-wrap | `{{{$json.x}}}` | `{{$json.x}}` | output `{{value}}` |
| array-dot | `{{$json.items.0.name}}` | `{{$json.items[0].name}}` | syntax error |
| code-braces | `'{{$json.email}}'` in Code | `$input.item.json.email` | literal `{{...}}` in output |
| node-no-quotes | `{{$node[HTTP Request]}}` | `{{$node["HTTP Request"]}}` | Unexpected identifier |
| wrong-path | `{{$json.data.items.name}}` | `{{$json.data.items[0].name}}` | undefined |
| eq-in-text | `Email: ={{$json.email}}` | `Email: {{$json.email}}` | literal `=` prefix |
| webhook-path-expr | `path: "{{$json.id}}"` | static path; use `:param` | path invalid / static |
| node-no-json | `{{$node["X"].data}}` | `{{$node["X"].json.data}}` | undefined |
| template-literal | `` `Hi ${$json.name}` `` | `Hi {{$json.name}}` | literal backticks/+ |
| empty-braces | `{{}}` | `{{$json.field}}` | literal `{{}}` |

## Harness-only

| id | wrong | right |
|----|-------|-------|
| generic-node-ref | `{{$node["HTTP Request"]}}` | story name from ARCHITECTURE |
| secret-in-json | `Bearer {{$env.KEY}}` in git | credential name in INTEGRATION; bind in Cloud |
| path-not-in-spec | ad-hoc `$json` path | document in INTEGRATION.md |
| branch-not-run | `$node["unused branch"]` | merge graph or `??` default |
| sp-folder-resource | `"resource": "folder"` on `microsoftSharePoint` | **Item** `getAll` + Filter; **File** only for download/upload — see `docs/n8n-node-catalog.md` |

## 1 missing-braces

- wrong: `$json.email`
- right: `{{$json.email}}` | JSON: `"email": "={{$json.body.email}}"`
- why: no `{{}}` = literal string

## 2 webhook-body

- wrong: `{{$json.name}}` `{{$json.email}}`
- right: `{{$json.body.name}}` `{{$json.body.email}}`
- shape: `{headers, params, query, body:{user fields}}`
- downstream after transform: `{{$node["Receive form webhook"].json.body.name}}`

## 3 field-spaces

- wrong: `{{$json.first name}}` `{{$json.user data.email}}`
- right: `{{$json['first name']}}` `{{$json['user data'].email}}`

## 4 node-spaces

- wrong: `{{$node.HTTP Request.json.data}}`
- right: `{{$node["HTTP Request"].json.data}}` (harness: use story name, still quoted if spaces)

## 5 node-case

- wrong: `{{$node["http request"]}}` `{{$node["Http Request"]}}`
- right: exact match to `nodes[].name`

## 6 double-wrap

- wrong: `{{{$json.field}}}`
- right: `{{$json.field}}`

## 7 array-dot

- wrong: `{{$json.items.0.name}}`
- right: `{{$json.items[0].name}}`

## 8 code-braces

- wrong: `const x = '{{$json.email}}'` or `'={{$json.body.name}}'`
- right: `const x = $json.body.name` or `$input.item.json.email` / `$input.all()`

## 9 node-no-quotes

- wrong: `{{$node[HTTP Request].json.data}}`
- right: `{{$node["HTTP Request"].json.data}}`

## 10 wrong-path

- wrong: `{{$json.data.items.name}}` (items is array); `{{$json.user.email}}` (prop is `userData`)
- right: `{{$json.data.items[0].name}}` `{{$json.userData.email}}`
- fix: preview in fx editor; align INTEGRATION payload

## 11 eq-prefix

- text field: `Hello {{$json.body.name}}` (no leading `=`)
- JSON whole-field expression: `"email": "={{$json.body.email}}"`

## 12 webhook-path

- wrong: dynamic `path` with `{{}}` or `={{$env.TENANT}}`
- right: static `my-webhook` or `users/:userId`

## 13 node-no-json

- wrong: `{{$node["HTTP Request"].data}}` `{{$node["Webhook"].body.email}}`
- right: `{{$node["HTTP Request"].json.data}}` `{{$node["Webhook"].json.body.email}}`

## 14 string-concat

- wrong: JS template literals or `"Hi " + $json.name` inside expression fields
- right: `Hello {{$json.name}}!` (auto-concat in n8n text)

## 15 empty-braces

- wrong: `{{}}` `{{ }}`
- right: `{{$json.field}}`

## Type errors

- `X is not a function`: `.map()` on non-array; method on undefined — fix path or `{{($json.body.name ?? '').trim()}}`
- `Cannot read property X of undefined`: missing `.body`, bad index, empty HTTP body

## JSON export

- expression params often start with `=`
- escape quotes carefully in `workflows/<slug>.json`; prefer UI then n8n-pull if complex

## Debug order

1. `{{}}` present? 2. webhook → `.body`? 3. spaces → `['']` / `["Node"]`? 4. case match `nodes[].name`? 5. path + `[i]`? 6. Code node → no `{{}}`? 7. `$node` includes `.json`? 8. fx preview

## Escalate

- verify rejects on paths → INTEGRATION contract
- 4th reject same task → STRUCTURAL_REEVAL.md
