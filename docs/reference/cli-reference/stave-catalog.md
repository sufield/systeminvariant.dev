# stave catalog

Print the user-facing capability catalog

## Usage[​](#usage "Direct link to Usage")

```
stave catalog [flags]
```

## Description[​](#description "Direct link to Description")

Catalog emits the grouped view of what Stave can check: control groups by (service, category), compound chains, and operational features (readiness, gaps, drift, validate, export-sir). Pair with `stave search <query>` to look up by intent.

Use --service to filter to one service (s3, iam, lambda, …) or --category to filter within a service. --kind narrows to one of control\_group | chain | operational.

Output is paged through $PAGER (then 'less -R', then 'more') when stdout is a terminal, and written plain and unpaged when stdout is a pipe, a redirect, or CI — so '... | grep' and '... > file' are unaffected. JSON is never paged. Use --no-pager to force plain output on a terminal.

Drill-down mirrors 'man ': catalog summary: one line per service catalog that service's capabilities, one line each catalog --leaf the leaf controls (individual control IDs) catalog --severity CRITICAL only the matching leaf controls, any level

\--severity matches an EXACT level and lists control-group controls only; chains and operational features carry no severity and are excluded (stated in the output, not silently dropped). --leaf is the leaf drill-down: --controls/-i is already the catalog directory, so the leaf toggle is a distinct flag.

Inputs: --service SVC Filter to one service (e.g. s3); also accepted positionally --category CAT Filter to one category within --service (e.g. public) --kind K control\_group | chain | operational --severity SEV critical | high | medium | low | info (leaf controls) --leaf Drill to individual leaf controls --format F auto (default; paged on a TTY) | text | wide | json --no-pager Never page, even on a terminal --controls DIR Control catalog directory (default: controls) --chains DIR Chain catalog directory (default: chains)

Exit codes: 0 Success 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag             | Type   | Description                                                                         |
| ---------------- | ------ | ----------------------------------------------------------------------------------- |
| `--category`     | string | filter to one category (requires --service)                                         |
| `--chains`       | string | chain catalog directory (default: `chains`)                                         |
| `-i, --controls` | string | control catalog directory (default: `controls`)                                     |
| `-f, --format`   | string | output format: auto \| text \| wide \| json (default: `auto`)                       |
| `--kind`         | string | filter to one kind: control\_group \| chain \| operational                          |
| `--leaf`         | bool   | drill to leaf controls (the individual control IDs); pairs with a service           |
| `--no-pager`     | bool   | never page output, even on a terminal                                               |
| `--service`      | string | filter to one service                                                               |
| `--severity`     | string | show only leaf controls of this severity: critical \| high \| medium \| low \| info |
| `--taxonomy`     | string | filter by taxonomy category (comma-separated, OR-joined)                            |

## Subcommands[​](#subcommands "Direct link to Subcommands")

| Command                                                                             | Description                                          |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [`stave catalog coverage`](/docs/reference/cli-reference/stave-catalog-coverage.md) | Show per-service control coverage                    |
| [`stave catalog gaps`](/docs/reference/cli-reference/stave-catalog-gaps.md)         | Compare catalog against an external checklist        |
| [`stave catalog inspect`](/docs/reference/cli-reference/stave-catalog-inspect.md)   | Show full metadata for a single control              |
| [`stave catalog matrix`](/docs/reference/cli-reference/stave-catalog-matrix.md)     | Show taxonomy × service cross-product with gap cells |
| [`stave catalog stats`](/docs/reference/cli-reference/stave-catalog-stats.md)       | Print aggregate catalog statistics                   |
| [`stave catalog taxonomy`](/docs/reference/cli-reference/stave-catalog-taxonomy.md) | List taxonomy categories with control counts         |

## Examples[​](#examples "Direct link to Examples")

```
stave catalog
  stave catalog s3
  stave catalog --service s3 --leaf
  stave catalog --kind chain
  stave catalog --format json | jq '.capabilities | length'
  stave catalog stats
  stave catalog inspect CTL.S3.PUBLIC.001
  stave catalog coverage
  stave catalog gaps checklist.yaml
```
