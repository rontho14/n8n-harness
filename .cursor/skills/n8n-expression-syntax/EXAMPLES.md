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

## pre-verify

- webhook → `.body` per INTEGRATION
- every `$node["..."]` ∈ `nodes[].name`
- no `{{}}` in Code `jsCode`
- no secrets in expressions in git
- `node scripts/validate-workflow.mjs workflows/<slug>.json`
