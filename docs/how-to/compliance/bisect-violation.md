# How to Bisect a Violation

Find the exact snapshot when a control first failed.

***

## Run Bisect[​](#run-bisect "Direct link to Run Bisect")

```
stave bisect \
  --history ./snapshots \
  --control CTL.S3.PUBLIC.001
```

Bisect evaluates each snapshot and finds the transition from PASS to VIOLATION.

## Read the Result[​](#read-the-result "Direct link to Read the Result")

```
Bisect result: CTL.S3.PUBLIC.001
  First violation: 2026-01-14.json
  Last pass:       2026-01-13.json
  Transition window: 24 hours
```

## See What Changed[​](#see-what-changed "Direct link to See What Changed")

```
diff snapshots/2026-01-13.json snapshots/2026-01-14.json
```

The diff shows the exact property that changed between the two snapshots.

## Correlate with Deployment History[​](#correlate-with-deployment-history "Direct link to Correlate with Deployment History")

```
git log --since="2026-01-13" --until="2026-01-14" --oneline
```
