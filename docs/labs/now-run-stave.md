# Now Run Stave

Same input. One command. Compare to your answers.

## Install[​](#install "Direct link to Install")

```
go install github.com/sufield/stave/cmd/stave@latest
```

## Run[​](#run "Direct link to Run")

```
stave apply --observations ./challenge/ --format text
```

## What to look for[​](#what-to-look-for "Direct link to What to look for")

Compare Stave's output to your answers:

| Your question                  | Stave's answer                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- |
| Q1: Which buckets are public?  | `CTL.S3.PUBLIC.*` findings — each names the bucket and the exposure mechanism                        |
| Q2: Which could become public? | `CTL.S3.POLICY.SHADOW.ALLOW.001` and `CTL.S3.POLICY.DENY.BYPASS.001` — latent exposure paths         |
| Q3: Redundant paths?           | Multiple findings on the same bucket, each from a different exposure source                          |
| Q4: What breaks?               | The remediation text on each finding tells you what changes and what it affects                      |
| Q5: Prevention rule?           | The control's `unsafe_predicate` IS the prevention rule — it fires before the dangerous state exists |

## The compound chain[​](#the-compound-chain "Direct link to The compound chain")

Look at the "Compound Chains" section of the output. If a chain assembled, it means multiple findings on the same asset compose into an attack path that's more dangerous than the sum of its parts.

This is what Question 2 was about: the latent exposure that becomes real when one setting changes. The chain captures the composition.

## Is this what you expected?[​](#is-this-what-you-expected "Direct link to Is this what you expected?")

The findings should match — or exceed — what you found manually. The compound chain should capture the latent exposure you identified in Question 2. The control's predicate should resemble the prevention rule you wrote in Question 5.

If Stave found something you missed, look at the reasoning trace (`--verbose`) to see why. If you found something Stave missed, that's a control gap — and an opportunity to [write your own control](/docs/labs/writing-controls.md).

## What's next[​](#whats-next "Direct link to What's next")

* [Quickstart: First Finding](/docs/getting-started/first-finding.md) — the 10-minute version
* [Tutorial 01: Is this bucket public?](/docs/getting-started/first-evaluation.md) — start the tutorial series
* [Concepts: Controls](/docs/explanation/controls-as-code.md) — how controls work under the hood
