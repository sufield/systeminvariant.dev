# Lab 2 — Over-privileged Execution Role

A MicroVM's **execution role** is the identity its code runs as. If a coding agent runs in the MicroVM and that role has `s3:*`, `secretsmanager:*`, and `iam:PassRole` on `*`, a prompt injection or a bug becomes account-wide compromise. This lab plants that role, detects it, and fixes it.

Self-contained: you create one IAM role; every other MicroVM resource defaults to compliant in the snapshot. Verified against the real `stave` binary.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

Same as [Lab 1](/docs/labs/lambda-microvm/baseline-compliant-microvm.md) — a built `stave`, an AWS sandbox profile, and the shared exports (`STAVE`, `CTRL`, `TRANSFORM`, `TS`, `AWS_ACCOUNT_ID`). Then:

```
mkdir -p lab2-overprivileged && cd lab2-overprivileged && mkdir -p snapshots
```

## Step 1 — Create the over-privileged role[​](#step-1--create-the-over-privileged-role "Direct link to Step 1 — Create the over-privileged role")

```
aws iam create-role --role-name MicroVMLab-ExecRole-Overprivileged \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam put-role-policy --role-name MicroVMLab-ExecRole-Overprivileged --policy-name overprivileged \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:*","secretsmanager:*","iam:PassRole"],"Resource":"*"}]}'
```

Two defects: the inline policy is wildly over-privileged, **and** the trust policy has only `sts:AssumeRole` (no `sts:TagSession`).

## Step 2 — Capture, transform, evaluate[​](#step-2--capture-transform-evaluate "Direct link to Step 2 — Capture, transform, evaluate")

```
aws iam get-role        --role-name MicroVMLab-ExecRole-Overprivileged > snapshots/exec-role-overprivileged.json
aws iam get-role-policy --role-name MicroVMLab-ExecRole-Overprivileged --policy-name overprivileged > snapshots/exec-role-overprivileged-policy.json

EXEC_ROLE=snapshots/exec-role-overprivileged.json EXEC_POL=snapshots/exec-role-overprivileged-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" overprivileged

"$STAVE" apply -i "$CTRL" -o observations/overprivileged --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):", (.findings[] | "  [\(.control_severity)] \(.control_id) — \(.control_name)")'
```

```
2 finding(s):
  [critical] CTL.LAMBDA.MICROVM.EXECROLE.001 — MicroVM Execution Role Is Over-Privileged
  [medium] CTL.LAMBDA.MICROVM.TAGSESSION.MISSING.001 — MicroVM Execution Role Trust Policy Missing sts:TagSession
```

The transform *derived* both signals from the raw IAM JSON: `role.over_privileged = true` (the policy has `:*`/wildcard/`iam:PassRole`) fires **EXECROLE** (critical), and `role.trust_tagsession_present = false` (no `sts:TagSession`) fires **TAGSESSION.MISSING**. Each finding cites the exact property and predicate in its `evidence` and `reasoning_trace`.

> The compound path (this role → AssumeRole → a secret) is the separate graph check in [Lab 4](/docs/labs/lambda-microvm/compound-path.md) — per-resource controls are blind to it by design.

## Step 3 — Remediate and re-verify[​](#step-3--remediate-and-re-verify "Direct link to Step 3 — Remediate and re-verify")

Scope the policy to least privilege and add `sts:TagSession` to the trust policy, then **re-capture** (Stave only sees the fix once the snapshot is refreshed):

```
aws iam put-role-policy --role-name MicroVMLab-ExecRole-Overprivileged --policy-name overprivileged \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],"Resource":"arn:aws:logs:*:*:*"}]}'
aws iam update-assume-role-policy --role-name MicroVMLab-ExecRole-Overprivileged \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":["sts:AssumeRole","sts:TagSession"]}]}'

aws iam get-role        --role-name MicroVMLab-ExecRole-Overprivileged > snapshots/exec-role-fixed.json
aws iam get-role-policy --role-name MicroVMLab-ExecRole-Overprivileged --policy-name overprivileged > snapshots/exec-role-fixed-policy.json
EXEC_ROLE=snapshots/exec-role-fixed.json EXEC_POL=snapshots/exec-role-fixed-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" overprivileged-fixed

"$STAVE" apply -i "$CTRL" -o observations/overprivileged-fixed --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):"'
```

```
0 finding(s):
```

Exit code 0 — remediation verified.

## Step 4 — Cleanup[​](#step-4--cleanup "Direct link to Step 4 — Cleanup")

```
aws iam delete-role-policy --role-name MicroVMLab-ExecRole-Overprivileged --policy-name overprivileged
aws iam delete-role --role-name MicroVMLab-ExecRole-Overprivileged
```

## What you learned[​](#what-you-learned "Direct link to What you learned")

* A MicroVM execution role's least-privilege and `sts:TagSession` are independent invariants — Stave checks both (`EXECROLE`, `TAGSESSION`).
* Findings are explainable down to the derived property; remediation is verified by re-capturing, not by editing the snapshot.

## Next[​](#next "Direct link to Next")

* [Lab 3 — Missing sts:TagSession](/docs/labs/lambda-microvm/missing-tagsession.md)
