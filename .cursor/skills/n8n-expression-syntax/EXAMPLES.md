# Expression examples (agent ref)

Story names per docs/best-practices.md. Mistakes: [COMMON_MISTAKES.md](COMMON_MISTAKES.md).

## ex1 webhook → slack

Flow: `Receive form webhook` → `Send form alert to #leads channel`

Webhook item: `{headers, params, query, body:{name, email, company, message}}`

```
Name: {{$json.body.name}}
Email: {{$json.body.email}}
```

Alt after Set: `{{$node["Receive form webhook"].json.body.name}}`

## ex2 http → postgres

Flow: `Run on daily schedule` → `Fetch users from directory API` → `Insert synced user into Postgres`

Response: `{data:{users:[{id,name,email,role}]}}`

```sql
VALUES ({{$json.data.users[0].id}}, '{{$json.data.users[0].name}}', '{{$now.toFormat('yyyy-MM-dd HH:mm:ss')}}')
```

## ex3 webhook → http → email

Nodes: `Receive order webhook` | `Fetch order details from API` | `Send order confirmation email`

```text
URL: https://api.example.com/orders/{{$json.body.order_id}}
Subject: Order {{$node["Receive order webhook"].json.body.order_id}} Confirmed
Body: {{$node["Fetch order details from API"].json.order.customer}} / total {{$node["Fetch order details from API"].json.order.total}}
Items: {{$node["Fetch order details from API"].json.order.items.join(', ')}}
```

## ex4 dates

```
{{$now.toISO()}}
{{$now.toFormat('yyyy-MM-dd')}}
{{$now.toFormat('HH:mm:ss')}}
{{$now.plus({days:7}).toFormat('yyyy-MM-dd')}}
{{$now.minus({hours:24}).toFormat('yyyy-MM-dd HH:mm')}}
```

## ex5 arrays

Data: `{users:[{name,email},...]}`

```
{{$json.users[0].name}}
{{$json.users[$json.users.length - 1].name}}
{{$json.users.map(u => u.email).join(', ')}}
{{$json.users.length}}
```

## ex6 conditionals

```
{{$json.order.status === 'completed' ? 'Order Complete' : 'Pending...'}}
{{$json.order.notes || 'No notes provided'}}
{{$json.order.total > 100 ? 'Premium Customer' : 'Standard Customer'}}
```

## ex7 strings

```
{{$json.user.email.toLowerCase()}}
{{$json.user.message.trim()}}
{{$json.user.email.substring(0,4)}}
{{$json.user.message.replace('World','n8n')}}
```

## ex8 spaced keys

```
{{$json['user data']['first name']}}
{{$json['user data']['phone number']}}
```

## ex9 code node

```javascript
const items = $json.body.items;
return [{ json: { transformed: items.map(i => i.toUpperCase()), count: items.length } }];
```

Downstream: `{{$json.count}}`

## ex10 auth (harness)

Prefer credential on HTTP node; git has `"name": "Directory API (header)"` only.

If instance allows: `Authorization: Bearer {{$env.API_KEY}}` — never commit secret values.

## ex11 set → downstream

`Normalize customer record`: `customerId` = `={{$json.body.customer_id}}`

URL: `https://api.example.com/customers/{{$json.customerId}}` or `={{$node["Normalize customer record"].json.customerId}}`

## ex12 if branch

`Does payload include customer email?`: `{{$json.body.email}}`

## ex13 execute workflow

```json
"workflowInputs": {"values": [{"name": "customerEmail", "value": "={{$json.body.email}}"}]}
```

## ex14 workflow json fragment

```json
{
  "name": "Post price lookup to pricing API",
  "parameters": {"url": "=https://pricing.example.com/v1/items/{{$json.body.sku}}"},
  "credentials": {"httpHeaderAuth": {"name": "Pricing API (header)"}}
}
```

## ex16 SharePoint webUrl folder filter

Flow: `List documents from library` → `Keep only base-folder PDFs?`

`webUrl` is URL-encoded. UI folder **02 - Documentos Base** → If **contains** literal:

```
02%20-%20Documentos%20Base
```

JSON:

```json
{
  "leftValue": "={{ $json.webUrl }}",
  "rightValue": "02%20-%20Documentos%20Base",
  "operator": { "type": "string", "operation": "contains" }
}
```

Also filter `contentType.name` equals `Document`. Picker `cachedResultName` stays human-readable; do not use spaces in `rightValue` for `webUrl` contains.

## ex17 SharePoint file id from @odata.etag

After Item Get All (`simplify: false`), File download `mode: id`:

```
={{ $json['@odata.etag'].replace(/\"/g, '').split(',')[0] }}
```

Etag shape `"<guid>,1"` → use GUID only.

## ex18 loop upload fileName from webUrl

Flow: `Loop over base documents` (splitInBatches) → `Upload final PDF to personal folder`

```
={{ decodeURIComponent($('Loop over base documents').item.json.webUrl.split('/').pop()) }}
```

`$('Loop over base documents')` must match `nodes[].name` exactly (story name in harness).

## ex20 Extract PDF text after SharePoint download (exo-4)

Flow: `Download current base PDF` → `Extract text from base PDF`

Built-in only — **no** external PDF read API. Source: `Exemplos.json` / [docs/exemplos-patterns.md](../../../docs/exemplos-patterns.md).

```json
{
  "type": "n8n-nodes-base.extractFromFile",
  "typeVersion": 1.1,
  "parameters": { "operation": "pdf", "options": {} }
}
```

Wire SharePoint File download `main` → Extract from File. Parsed fields: follow with Code node (deterministic regex), not a separate document API.

## ex21 Generate PDF from HTML (exo-5)

Flow: `Merge data into report HTML` (Code) → `Build HTML file for PDF` → `Convert HTML to PDF`

```json
{ "operation": "html" }
```

HTTP Request POST `multipart-form-data`, `formBinaryData` on binary `data` — URL and field names in INTEGRATION.md only. **Generation** API is allowed; **read** API is not (use ex20).

## ex22 Download template from SharePoint (exo-3)

Static File download — site `AcelerAI_06_2026`, folder `03 - Template`, file `template_licenciamento.pdf`. Copy node from `Exemplos.json`; re-pick GUIDs in UI on other tenants.

## ex23 SharePoint list + If filter (exo-1, matches Exemplos export)

Same as ex16–ex19 but documents the **If** node variant used in `Exemplos.json` (equivalent to Filter node in specs):

`Get many items` → `Filtrar arquivos` (If, and) → `Loop Over Items` → `Download Doc`.

## ex19 If node conditions in workflow JSON

Combine with `combinator: "and"`:

```json
"conditions": [
  {
    "leftValue": "={{ $json.contentType.name }}",
    "rightValue": "Document",
    "operator": { "type": "string", "operation": "equals" }
  },
  {
    "leftValue": "={{ $json.webUrl }}",
    "rightValue": "02%20-%20Documentos%20Base",
    "operator": { "type": "string", "operation": "contains" }
  }
]
```

## ex15 weather chain (template #2947)

`Receive weather slash command` → `Resolve city to coordinates` → `Fetch forecast from weather API` → `Post weather summary to Slack`

```
URL nominatim: .../search?q={{$json.body.text}}&format=json
URL forecast: .../points/{{$node["Resolve city to coordinates"].json[0].lat}},{{$node["Resolve city to coordinates"].json[0].lon}}
Slack: {{$node["Fetch forecast from weather API"].json.properties.temperature.value}}
```

## patterns

| need | expr |
|------|------|
| webhook field | `{{$json.body.field}}` |
| other node | `{{$node["Story Name"].json.path}}` |
| now | `{{$now.toFormat('yyyy-MM-dd')}}` |
| array | `{{$json.arr[0].x}}` |
| default | `{{$json.x \|\| 'n/a'}}` |
| SharePoint folder in webUrl | encoded segment e.g. `02%20-%20Documentos%20Base` |
| loop item from other node | `$('Exact Node Name').item.json.path` |
| decode filename from webUrl | `decodeURIComponent(...split('/').pop())` |
| PDF text extraction | Extract from File `pdf` after download — ex20; not HTTP read API |
| PDF generation | Convert to File `html` + HTTP multipart — ex21 |

## pre-verify

- webhook → `.body` per INTEGRATION
- every `$node["..."]` ∈ `nodes[].name`
- no `{{}}` in Code `jsCode`
- no secrets in expressions in git
- `node scripts/validate-workflow.mjs workflows/<slug>.json`
