# Building Detection Metrics from Lab Results

This tutorial shows how to load evaluation results from the CloudGoat vulnerable labs and compute detection metrics programmatically. It demonstrates `LoadAssessment`, `Score`, and `DiffAssessments` — the building blocks for custom dashboards and reporting.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* Stave built: `cd stave && make build`
* At least one CloudGoat lab completed (see the vulnerable lab tutorials)

## Loading a lab result[​](#loading-a-lab-result "Direct link to Loading a lab result")

Every CloudGoat lab saves its findings as `findings.json`. Load it:

```
ctx := context.Background()
assessment, err := stave.LoadAssessment(ctx, "ctf/cloudgoat/lambda_privesc/findings.json")
if err != nil {
    log.Fatal(err)
}
fmt.Printf("Status: %s\n", assessment.Status)
fmt.Printf("Findings: %d\n", len(assessment.Findings))
fmt.Printf("Chains: %d\n", len(assessment.ChainFindings))
```

## Severity breakdown[​](#severity-breakdown "Direct link to Severity breakdown")

Count findings by severity to understand the risk profile:

```
counts := map[stave.Severity]int{}
for _, f := range assessment.Findings {
    counts[f.Severity]++
}
for _, sev := range []stave.Severity{"critical", "high", "medium", "low"} {
    fmt.Printf("  %-10s %d\n", sev, counts[sev])
}
```

Example output for `lambda_privesc`:

```
  critical   8
  high       2
```

## Attack surface[​](#attack-surface "Direct link to Attack surface")

Identify which assets have findings:

```
assets := map[stave.AssetID]int{}
for _, f := range assessment.Findings {
    assets[f.AssetID]++
}
fmt.Printf("Assets with findings: %d\n", len(assets))
for id, count := range assets {
    fmt.Printf("  %s: %d findings\n", id, count)
}
```

## Compound chain analysis[​](#compound-chain-analysis "Direct link to Compound chain analysis")

Inspect which escalation chains assembled and what controls participate:

```
for _, c := range assessment.ChainFindings {
    fmt.Printf("[%s] %s\n", c.Severity, c.ChainID)
    fmt.Printf("  Controls failing: %v\n", c.ControlsFailing)
    if len(c.MissingSafeguards) > 0 {
        fmt.Printf("  Missing safeguards: %v\n", c.MissingSafeguards)
    }
}
```

## Posture score[​](#posture-score "Direct link to Posture score")

Compute a 0–100 score from the assessment:

```
score, _ := stave.Score(ctx, stave.ScoreConfig{Assessment: assessment})
fmt.Printf("Score: %.0f/100 (%s)\n", score.Score, score.RubricBand)
```

## Comparing two labs[​](#comparing-two-labs "Direct link to Comparing two labs")

Diff two lab results to see what changed between scenarios:

```
rollback, _ := stave.LoadAssessment(ctx, "ctf/cloudgoat/iam_privesc_by_rollback/findings.json")
lambda, _ := stave.LoadAssessment(ctx, "ctf/cloudgoat/lambda_privesc/findings.json")

diff := stave.DiffAssessments(rollback, lambda)
fmt.Printf("Added: %d, Removed: %d, Unchanged: %d\n",
    len(diff.Added), len(diff.Removed), len(diff.Unchanged))
```

This shows which escalation paths are unique to each scenario and which controls fire in both.

## Running the example[​](#running-the-example "Direct link to Running the example")

A complete lab-metrics program ships with the repo:

```
# Single lab
go run ./examples/lib/lab-metrics ./ctf/cloudgoat/lambda_privesc/findings.json

# Diff two labs
go run ./examples/lib/lab-metrics \
    --prev ./ctf/cloudgoat/iam_privesc_by_rollback/findings.json \
    ./ctf/cloudgoat/lambda_privesc/findings.json
```

## Extending this pattern[​](#extending-this-pattern "Direct link to Extending this pattern")

The metrics shown here are starting points. With typed access to every finding field, you can build:

* **MITRE coverage heatmaps** — group findings by `CorpusReference`
* **Dwell time reports** — use `FirstUnsafeAt` and `UnsafeDurationHours`
* **Chain dependency graphs** — walk `ChainMembership` on each finding
* **Trend dashboards** — load a directory of assessments with `LoadAssessments` and track score over time
* **Compliance evidence** — filter by `ControlCompliance` framework keys

All of these are customer-side programs over typed data. Stave provides the data; you decide what it means.
