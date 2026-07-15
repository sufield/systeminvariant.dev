# Lab 3 — Trust Policy Missing sts:TagSession

`sts:TagSession` in a role's trust policy lets the assuming service attach **session tags** — the hook for attribute-based access control and per-session attribution. A MicroVM execution role without it is a future-proofing and governability gap: you can't scope or attribute the workload's sessions.

This lab isolates that one defect. Unlike [Lab 2](/docs/labs/lambda-microvm/overprivileged-execution-role.md), the inline policy here is least-privilege, so **only** `TAGSESSION` fires — a clean single-control test. Verified against the real `stave` binary.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

Same shared exports as [Lab 1](/docs/labs/lambda-microvm/baseline-compliant-microvm.md). Then:

```
mkdir -p lab3-tagsession && cd lab3-tagsession && mkdir -p snapshots
```

## Step 1 — Create a least-privilege role, trust policy WITHOUT TagSession[​](#step-1--create-a-least-privilege-role-trust-policy-without-tagsession "Direct link to Step 1 — Create a least-privilege role, trust policy WITHOUT TagSession")

```
aws iam create-role --role-name MicroVMLab-ExecRole-NoTagSession \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam put-role-policy --role-name MicroVMLab-ExecRole-NoTagSession --policy-name minimal-exec \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],"Resource":"arn:aws:logs:*:*:*"}]}'
```

The only defect is the missing `sts:TagSession` in the trust policy.

## Step 2 — Capture, transform, evaluate[​](#step-2--capture-transform-evaluate "Direct link to Step 2 — Capture, transform, evaluate")

```
aws iam get-role        --role-name MicroVMLab-ExecRole-NoTagSession > snapshots/exec-role-notagsession.json
aws iam get-role-policy --role-name MicroVMLab-ExecRole-NoTagSession --policy-name minimal-exec > snapshots/exec-role-notagsession-policy.json

EXEC_ROLE=snapshots/exec-role-notagsession.json EXEC_POL=snapshots/exec-role-notagsession-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" missing-tagsession

"$STAVE" apply -i "$CTRL" -o observations/missing-tagsession --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):", (.findings[] | "  [\(.control_severity)] \(.control_id) — \(.control_name)")'
```

```
1 finding(s):
  [medium] CTL.LAMBDA.MICROVM.TAGSESSION.MISSING.001 — MicroVM Execution Role Trust Policy Missing sts:TagSession
```

Because the inline policy is least-privilege, `role.over_privileged = false` and `EXECROLE` does **not** fire — exactly one control, `TAGSESSION.MISSING`, on the one defect. The over-broad case (an `sts:*` wildcard that grants `sts:TagSession` too loosely) is a **separate** control, `TAGSESSION.WILDCARD.001`, with [its own lab](/docs/labs/lambda-microvm/03b-overbroad-tagsession.md) — the two read distinct signals (`trust_tagsession_present` vs. `trust_tagsession_overbroad`) and never fire together.

## Step 3 — Remediate and re-verify[​](#step-3--remediate-and-re-verify "Direct link to Step 3 — Remediate and re-verify")

```
aws iam update-assume-role-policy --role-name MicroVMLab-ExecRole-NoTagSession \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":["sts:AssumeRole","sts:TagSession"]}]}'
aws iam get-role --role-name MicroVMLab-ExecRole-NoTagSession > snapshots/exec-role-notagsession-fixed.json
EXEC_ROLE=snapshots/exec-role-notagsession-fixed.json EXEC_POL=snapshots/exec-role-notagsession-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" missing-tagsession-fixed

"$STAVE" apply -i "$CTRL" -o observations/missing-tagsession-fixed --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):"'
```

```
0 finding(s):
```

## Step 4 — Cleanup[​](#step-4--cleanup "Direct link to Step 4 — Cleanup")

```
aws iam delete-role-policy --role-name MicroVMLab-ExecRole-NoTagSession --policy-name minimal-exec
aws iam delete-role --role-name MicroVMLab-ExecRole-NoTagSession
```

## What you learned[​](#what-you-learned "Direct link to What you learned")

* A control can fire on its own — least privilege and `TagSession` are orthogonal, and Stave reports exactly the one that's wrong.

## Next[​](#next "Direct link to Next")

* [Lab 4 — Compound path (graph reachability)](/docs/labs/lambda-microvm/compound-path.md)
