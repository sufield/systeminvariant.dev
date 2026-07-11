# How to Test Controls

Run embedded test cases to verify control behavior.

***

## Test a Single Control[​](#test-a-single-control "Direct link to Test a Single Control")

```
stave test --control controls/s3/access/CTL.S3.PUBLIC.001.yaml
```

## Test All Controls[​](#test-all-controls "Direct link to Test All Controls")

```
stave test --controls ./controls
```

## Filter by Pattern[​](#filter-by-pattern "Direct link to Filter by Pattern")

```
stave test --controls ./controls --filter "CTL.S3.*"
```

## Stop on First Failure[​](#stop-on-first-failure "Direct link to Stop on First Failure")

```
stave test --controls ./controls --fail-fast
```

## Show Passing Tests[​](#show-passing-tests "Direct link to Show Passing Tests")

```
stave test --controls ./controls --verbose
```

## TAP Output for CI[​](#tap-output-for-ci "Direct link to TAP Output for CI")

```
stave test --controls ./controls --format tap
```

## Adding Test Cases to a Control[​](#adding-test-cases-to-a-control "Direct link to Adding Test Cases to a Control")

Add a `tests:` block at the end of the control YAML:

```
tests:
  - name: "compliant resource passes"
    verdict: PASS
    asset:
      asset_id: "test-resource"
      asset_type: s3_bucket
      vendor: aws
      properties:
        storage:
          kind: bucket
          controls:
            block_public_acls: true

  - name: "non-compliant resource fails"
    verdict: VIOLATION
    asset:
      asset_id: "test-resource"
      asset_type: s3_bucket
      vendor: aws
      properties:
        storage:
          kind: bucket
          controls:
            block_public_acls: false
```

## Verdicts[​](#verdicts "Direct link to Verdicts")

| Verdict        | Meaning                                         |
| -------------- | ----------------------------------------------- |
| `PASS`         | Predicate evaluates to safe — no violation      |
| `VIOLATION`    | Predicate evaluates to unsafe — violation found |
| `INCONCLUSIVE` | Required field missing or CEL error             |
