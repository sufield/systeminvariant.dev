# Lab 6 — Excessive Idle and Runtime

A coding agent that idles for 8 hours holding memory and disk state — or runs unsupervised for 8 hours — is a cost sink and a wide risk window. AWS caps MicroVM runtime at 8 hours; your org limit should be lower. This lab flags an `maxIdleDurationSeconds`/runtime at the ceiling and brings them within policy.

A note on capture: `list-microvms` does **not** echo the idle policy or runtime limit, so these are **asserted** signals — the transform takes them from how you ran the MicroVM (or you pass them explicitly). That makes this lab the cleanest to follow without standing up a full MicroVM: you assert the values directly. Verified against the real `stave` binary.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

Same shared exports as [Lab 1](/docs/labs/lambda-microvm/baseline-compliant-microvm.md). Then:

```
mkdir -p lab6-idle && cd lab6-idle && mkdir -p snapshots
```

## Step 1 — Detect the excessive idle/runtime[​](#step-1--detect-the-excessive-idleruntime "Direct link to Step 1 — Detect the excessive idle/runtime")

Nothing to capture — the idle and runtime values are asserted via the transform. Pass the at-ceiling values (`28800` seconds = 8 hours); every other resource defaults to compliant:

```
IDLE_SECS=28800 RUNTIME_SECS=28800 \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" excessive-idle

"$STAVE" apply -i "$CTRL" -o observations/excessive-idle --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):", (.findings[] | "  [\(.control_severity)] \(.control_id) — \(.control_name)")'
```

```
2 finding(s):
  [medium] CTL.LAMBDA.MICROVM.IDLE.001 — MicroVM Idle Duration Exceeds Organization Limit
  [medium] CTL.LAMBDA.MICROVM.RUNTIME.001 — MicroVM Maximum Runtime Exceeds Organization Limit
```

`microvm.idle_policy.max_idle_duration_seconds = 28800` exceeds the org limit (the control's threshold is `1800` s) and fires **IDLE**; the runtime at `28800` fires **RUNTIME**.

> Running it for real? Launch with `aws lambda-microvms run-microvm … --idle-policy '{"maxIdleDurationSeconds":28800,…}' --maximum-duration-in-seconds 28800`, then assert those captured values to the transform — the obs shape is the same.

## Step 2 — Remediate and re-verify[​](#step-2--remediate-and-re-verify "Direct link to Step 2 — Remediate and re-verify")

The real fix is to re-run the MicroVM within the org limit (≤ 1800 s). In the snapshot, that's the compliant asserted values:

```
# aws lambda-microvms run-microvm … --idle-policy '{"maxIdleDurationSeconds":900,…}' --maximum-duration-in-seconds 1800
IDLE_SECS=900 RUNTIME_SECS=1800 \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" excessive-idle-fixed

"$STAVE" apply -i "$CTRL" -o observations/excessive-idle-fixed --eval-time "$TS" --format json | jq -r '"\(.findings|length) finding(s):"'
```

```
0 finding(s):
```

## What you learned[​](#what-you-learned "Direct link to What you learned")

* Not every security signal is in an AWS API response. Idle/runtime limits are **asserted** from how the MicroVM was launched — the transform records them and the control evaluates them like any other property.
* The threshold is a policy value (`1800` s here): tune it to your org's limit.

## Next[​](#next "Direct link to Next")

* [Lab 7 — Secrets baked into the snapshot](/docs/labs/lambda-microvm/secrets-in-snapshot.md)
