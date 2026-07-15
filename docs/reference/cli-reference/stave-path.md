# stave path

Export attack path graph data from active chain findings

## Usage[​](#usage "Direct link to Usage")

```
stave path [flags]
```

## Description[​](#description "Direct link to Description")

Produce a structured data export describing active chain findings, directed edges between chains (postcondition of A satisfies precondition of B), and control remediation actions per chain.

An external program performs path finding — BFS, DFS, shortest path, centrality analysis, or any other graph algorithm. Stave does not implement graph algorithms.

Inputs: --output PATH Path to stave apply JSON output (required) --chains PATH Path to chains directory (default: chains) --format STRING Output format: json (default) | dot | csv-edges

Outputs: stdout Attack path graph in selected format

Exit Codes: 0 Graph produced 2 Invalid input 4 Internal error

## Flags[​](#flags "Direct link to Flags")

| Flag           | Type   | Description                                               |
| -------------- | ------ | --------------------------------------------------------- |
| `--chains`     | string | path to chains directory (default: `chains`)              |
| `-f, --format` | string | output format: json \| dot \| csv-edges (default: `json`) |
| `--output`     | string | path to stave apply JSON output (required)                |

## Examples[​](#examples "Direct link to Examples")

```
# Produce graph data for external analysis
  stave path --output findings.json > attack-graph.json

  # Graphviz visualization
  stave path --output findings.json --format dot | dot -Tsvg > paths.svg

  # CSV edges for Python NetworkX
  stave path --output findings.json --format csv-edges > edges.csv
```
