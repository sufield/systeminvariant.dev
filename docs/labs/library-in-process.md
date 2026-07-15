# Using Stave as a Go Library

This tutorial shows how to import `pkg/stave` and run validate → evaluate → score entirely in-process. Your program gets typed Go values — no shell exec, no JSON parsing, no Cobra dependency.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* Go 1.26+
* The `github.com/sufield/stave` module (add with `go get`)

## The full pipeline in 20 lines[​](#the-full-pipeline-in-20-lines "Direct link to The full pipeline in 20 lines")

```
package main

import (
    "context"
    "fmt"
    "github.com/sufield/stave/pkg/stave"
)

func main() {
    ctx := context.Background()

    // 1. Validate — structural check before evaluation
    vr, _ := stave.Validate(ctx, stave.ValidateConfig{
        SnapshotsDir: "./observations",
    })
    fmt.Printf("Valid: %v (%d controls, %d snapshots)\n",
        vr.Valid, vr.ControlsChecked, vr.SnapshotsChecked)

    // 2. Evaluate — run the full control catalog
    assessment, _ := stave.Apply(ctx, stave.Config{
        SnapshotsDir: "./observations",
    })
    fmt.Printf("Status: %s, Findings: %d, Chains: %d\n",
        assessment.Status, len(assessment.Findings), len(assessment.ChainFindings))

    // 3. Score — compute posture score
    score, _ := stave.Score(ctx, stave.ScoreConfig{Assessment: assessment})
    fmt.Printf("Posture: %.0f/100 (%s)\n", score.Score, score.RubricBand)
}
```

## Available functions[​](#available-functions "Direct link to Available functions")

| Function                | What it does                                | Returns             |
| ----------------------- | ------------------------------------------- | ------------------- |
| `stave.Validate`        | Structural check on snapshots + controls    | `*ValidationResult` |
| `stave.Apply`           | Full evaluation against the control catalog | `*Assessment`       |
| `stave.Score`           | Posture score from an assessment            | `*ScoreResult`      |
| `stave.Gate`            | CI pass/fail policy check                   | `*GateResult`       |
| `stave.Compliance`      | Per-framework compliance posture            | `*ComplianceReport` |
| `stave.LoadAssessment`  | Load a saved evaluation from JSON           | `*Assessment`       |
| `stave.DiffAssessments` | Compare two assessments                     | `*AssessmentDiff`   |

## Working with findings[​](#working-with-findings "Direct link to Working with findings")

Every finding is a typed struct with full field access:

```
for _, f := range assessment.Findings {
    fmt.Printf("[%s] %s on %s\n", f.Severity, f.ControlID, f.AssetID)

    // MITRE mapping
    if f.CorpusReference != "" {
        fmt.Printf("  MITRE: %s\n", f.CorpusReference)
    }

    // Temporal evidence
    if f.HasTemporalEvidence() {
        fmt.Printf("  Unsafe since: %s (%.0f hours)\n",
            f.FirstUnsafeAt.Format("2006-01-02"), f.UnsafeDurationHours)
    }

    // Chain membership
    for _, cm := range f.ChainMembership {
        fmt.Printf("  Chain: %s [%s]\n", cm.ChainID, cm.ChainSeverity)
    }

    // Remediation
    fmt.Printf("  Fix: %s\n", f.Remediation.Action)
}
```

## Comparing two evaluations[​](#comparing-two-evaluations "Direct link to Comparing two evaluations")

Load a previous result and diff it against a fresh evaluation:

```
prev, _ := stave.LoadAssessment(ctx, "last-week.json")
curr, _ := stave.Apply(ctx, stave.Config{SnapshotsDir: "./observations"})

diff := stave.DiffAssessments(prev, curr)
fmt.Printf("Added: %d, Removed: %d, Unchanged: %d\n",
    len(diff.Added), len(diff.Removed), len(diff.Unchanged))

for _, f := range diff.Added {
    fmt.Printf("  NEW: [%s] %s on %s\n", f.Severity, f.ControlID, f.AssetID)
}
for _, f := range diff.Removed {
    fmt.Printf("  FIXED: [%s] %s on %s\n", f.Severity, f.ControlID, f.AssetID)
}
```

## Using your own controls[​](#using-your-own-controls "Direct link to Using your own controls")

Pass a controls directory to use custom controls instead of the builtin catalog:

```
assessment, _ := stave.Apply(ctx, stave.Config{
    SnapshotsDir: "./observations",
    ControlsDir:  "./my-controls",
})
```

## CI gating[​](#ci-gating "Direct link to CI gating")

Check whether an evaluation passes a policy:

```
gate, _ := stave.Gate(ctx, stave.GateConfig{
    Policy:         stave.GateFailOnAnyViolation,
    EvaluationPath: "out/evaluation.json",
})
if !gate.Passed {
    os.Exit(3)
}
```

## Running examples[​](#running-examples "Direct link to Running examples")

Two complete examples ship with the repo:

```
# Full pipeline: validate → evaluate → score
go run ./examples/lib/in-process ./observations

# Load findings and display metrics + diff
go run ./examples/lib/lab-metrics ./ctf/cloudgoat/lambda_privesc/findings.json
go run ./examples/lib/lab-metrics --prev prev.json current.json
```

## What the library does NOT do[​](#what-the-library-does-not-do "Direct link to What the library does NOT do")

The library exposes data. It does not:

* Render human-readable text output (that's the CLI's job)
* Send notifications (Slack, email, PagerDuty)
* Write dashboards or reports
* Manage remediation workflows

Your program receives typed `Finding`, `ChainFinding`, `Assessment`, and `ScoreResult` values. What you do with them is up to you.
