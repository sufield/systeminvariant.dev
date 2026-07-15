# Amazon Neptune Integration

Load Stave's security graph into Amazon Neptune for Gremlin-based graph traversal and attack path analysis.

## Two Modes[​](#two-modes "Direct link to Two Modes")

**Interactive:** Connects to Neptune via Gremlin WebSocket. Requires network access to the Neptune cluster.

**Bulk:** Produces Neptune bulk load CSV files (`vertices.csv`, `edges.csv`) for S3 upload and Neptune Loader API. Air-gapped compatible — no direct Neptune connection at export time.

## Interactive Mode[​](#interactive-mode "Direct link to Interactive Mode")

```
# Prerequisites: pip install gremlinpython

stave graph export --output assessment.json \
  | python3 docs/integrations/neptune/loader.py \
    --neptune-endpoint wss://your-cluster.amazonaws.com:8182/gremlin
```

## Bulk Mode (Air-Gapped)[​](#bulk-mode-air-gapped "Direct link to Bulk Mode (Air-Gapped)")

```
# 1. Export to bulk CSV
stave graph export --output assessment.json \
  | python3 docs/integrations/neptune/loader.py \
    --bulk --out ./neptune-bulk/

# 2. Upload to S3
aws s3 cp ./neptune-bulk/ s3://your-bucket/neptune-load/ --recursive

# 3. Trigger Neptune Loader API
curl -X POST https://your-cluster:8182/loader \
  -H 'Content-Type: application/json' \
  -d '{
    "source": "s3://your-bucket/neptune-load/",
    "format": "csv",
    "iamRoleArn": "arn:aws:iam::123:role/NeptuneLoadRole",
    "region": "us-east-1"
  }'
```

## Dry Run[​](#dry-run "Direct link to Dry Run")

```
stave graph export --output assessment.json \
  | python3 docs/integrations/neptune/loader.py --dry-run
```

## Query Library[​](#query-library "Direct link to Query Library")

`queries.groovy` contains Gremlin translations of the 5 most valuable queries: active chains, identity reach ranking, HIPAA violations, chain finding concentration, and SLA breaches.

## Air-Gapped Note[​](#air-gapped-note "Direct link to Air-Gapped Note")

Bulk mode produces local CSV files only. Neptune connectivity is required at import time, not at assessment time.
