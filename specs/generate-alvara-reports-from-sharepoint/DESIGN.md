# DESIGN — Generate Alvará reports from SharePoint base documents

Pattern references: [docs/exemplos-patterns.md](../../docs/exemplos-patterns.md) **exo-4** (read PDF), **exo-5** (generate PDF). Sample base doc: `doc_01.pdf` (all 20 Alvarás share this layout).

## Field extraction — deterministic parser (no LLM)

After **Extract from File** (`pdf`, typeVersion `1.1` per exo-4):

1. Read raw text from the PDF (as n8n returns it).
2. For each template key, match the **Alvará label line** below and capture the value after `:` (trim only).
3. Copy **verbatim** — do not reformat dates, CNPJ, or names unless template merge requires spacing (e.g. `São Paulo/SP` → `São Paulo / SP` for `MUNICIPIO_UF` display only).
4. Missing label → `""`.

### Label anchors (from `doc_01.pdf` — same for all 20)

| Alvará line prefix (case-sensitive in text) | JSON key | Example from `doc_01.pdf` |
|---------------------------------------------|----------|---------------------------|
| `Razão Social:` | `RAZAO_SOCIAL` | `Farmácia Nova Vida LTDA` |
| `Nome Fantasia:` | `NOME_FANTASIA` | `Nova Vida` |
| `CNPJ:` | `CNPJ` | `91.214.125/0001-45` |
| `Endereço:` → parse `…, Cidade/UF` before `– CEP` | `MUNICIPIO_UF` | `São Paulo / SP` (from `… São Paulo/SP – CEP`) |
| `Número do Alvará:` | `NUMERO_ALVARA` | `ALV-2026-38893` |
| `Data de Validade:` | `DATA_VALIDADE` | `7 de setembro de 2027` |
| `RESPONSÁVEL TÉCNICO:` | `RESP_TECNICO_NOME` | `Ana Paula de Souza` |
| `Registro Profissional:` | `RESP_TECNICO_CRF` | `CRF-SP 65392` |
| `Classificação de Risco Sanitário:` | `CLASSIFICACAO_RISCO` | `Médio` |
| `Horário de Funcionamento:` | `HORARIO_FUNCIONAMENTO` | `07:00 às 22:00` |

**Not mapped to report template:** Inscrição Estadual/Municipal, Endereço full line, Data de Emissão, Órgão Emissor, Responsável Legal, CNAE blocks, etc.

Implementation: **Parse Alvará fields from PDF text** Code node — line-based `label: value` split; special case for `MUNICIPIO_UF` regex on `Endereço:` line.

## Report HTML layout

Mirror `template_licenciamento.pdf` structure:

- Header: `RD Saúde - CUIDAR DE PERTO DOS NOSSOS CLIENTES`
- Title: `FICHA RESUMO DE LICENCIAMENTO`
- Subtitle: `Consolidação de Dados de Alvará de Funcionamento`
- Body: same label order as template; values = parsed verbatim from Alvará
- `DATA_GERACAO`: workflow run date (`dd/MM/yyyy`) — only generated field
- Footer: `Classificação: Interna | RD Saúde – Data Analytics & IA |`

## Output file naming

- Inside ZIP per PDF: `relatorio_<source-stem>.pdf` (e.g. `relatorio_doc_01.pdf`)
- ZIP: `relatorios_alvaras_{{ $now.format('yyyy-MM-dd_HHmm') }}.zip`
