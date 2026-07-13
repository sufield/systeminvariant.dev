---
title: "stave graph export"
sidebar_label: "graph export"
sidebar_position: 115
description: "Export assessment as JSON, STIX 2.1, JSON-LD, or GraphML"
---

# stave graph export

Export assessment as JSON, STIX 2.1, JSON-LD, or GraphML

## Usage

```
stave graph export [flags]
```

## Description

Export reads assessment JSON (from stave apply) and produces a
standards-based graph document. Every node and edge maps to
OCSF, STIX 2.1, ATT&CK, or OSCAL per docs/ontology/README.md.

Formats:
  json         Native graph JSON (default)
  stix         STIX 2.1 Bundle JSON
  jsonld       JSON-LD against the Stave ontology — universal RDF
               format consumable by Neo4j GDS, igraph, NetworkX,
               Spark GraphX, Gephi, and any RDF-aware library.
  graphml      GraphML XML — native to igraph, NetworkX, Gephi,
               Cytoscape; carries node/edge attributes typed for
               graph data science (severity weights, partition
               labels).

Exit Codes:
  0   Export complete
  2   Input error

## Flags

| Flag | Type | Description |
|---|---|---|
| `-f, --format` | string | Output format: json \| stix \| jsonld \| graphml (default: `json`) |
| `--output` | string | Path to out.v0.1 assessment JSON |

## Examples

```bash
stave graph export --output assessment.json
  stave graph export --output assessment.json --format stix
  stave graph export --output assessment.json --format jsonld > graph.jsonld
  stave graph export --output assessment.json --format graphml > graph.graphml
```
