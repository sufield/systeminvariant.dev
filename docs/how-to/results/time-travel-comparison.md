# How to Compare Infrastructure State Between Two Dates

Evaluate security posture at two points in time and see what changed.

***

## Evaluate a Past Snapshot[​](#evaluate-a-past-snapshot "Direct link to Evaluate a Past Snapshot")

```
stave apply \
  --snapshot snapshots/2026-01-01.json \
  --controls controls \
  --eval-time 2026-01-01T00:00:00Z \
  --format json \
  > assessment-jan-01.json
```

## Evaluate the Current Snapshot[​](#evaluate-the-current-snapshot "Direct link to Evaluate the Current Snapshot")

```
stave apply \
  --snapshot snapshots/2026-03-31.json \
  --controls controls \
  --eval-time 2026-03-31T00:00:00Z \
  --format json \
  > assessment-mar-31.json
```

## Compare Findings[​](#compare-findings "Direct link to Compare Findings")

```
diff <(jq '[.findings[].control_id] | sort' assessment-jan-01.json) \
     <(jq '[.findings[].control_id] | sort' assessment-mar-31.json)
```

## See Property Changes[​](#see-property-changes "Direct link to See Property Changes")

```
diff snapshots/2026-01-01.json snapshots/2026-03-31.json | head -50
```

## Scan Every Transition Across the Full Period[​](#scan-every-transition-across-the-full-period "Direct link to Scan Every Transition Across the Full Period")

```
stave bisect \
  --controls ./controls \
  --observations ./snapshots \
  --control-id CTL.S3.PUBLIC.001 \
  --mode scan
```

This shows every violation window (PASS → VIOLATION → PASS) across the full history for a specific control.

## Collect Evidence for an Investigation Period[​](#collect-evidence-for-an-investigation-period "Direct link to Collect Evidence for an Investigation Period")

```
stave verify \
  --archive ./evidence \
  --period 2026-01-01:2026-03-31 \
  --format json \
  --out investigation-evidence.json
```
