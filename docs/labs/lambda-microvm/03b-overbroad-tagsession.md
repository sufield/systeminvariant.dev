# Lab 3B — Trust Policy Over-Broad sts:TagSession (sts:\* wildcard)

[Lab 3](/docs/labs/lambda-microvm/missing-tagsession.md) covered a trust policy that **lacks** `sts:TagSession`. This is its mirror: the trust policy **does** grant `sts:TagSession`, but over-broadly — through an `sts:*` wildcard that also hands the assuming service every other STS action (`AssumeRoleWithWebIdentity`, `GetFederationToken`, …). Session tagging works, but the grant is far wider than the workload needs.

The two defects are **mutually exclusive** and read distinct signals (`trust_tagsession_present` vs. `trust_tagsession_overbroad`), so they never fire together — the wildcard makes `sts:TagSession` present, so `TAGSESSION.MISSING` stays silent and only `TAGSESSION.WILDCARD` fires. As in Lab 3, the inline policy is least-privilege, so `EXECROLE` does not fire either — a clean single-control test. Verified against the real `stave` binary.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

Same shared exports as [Lab 1](/docs/labs/lambda-microvm/baseline-compliant-microvm.md). Then:

```
mkdir -p lab3b-tagsession && cd lab3b-tagsession && mkdir -p snapshots
```

## Step 1 — Create a least-privilege role, trust policy granting `sts:*`[​](#step-1--create-a-least-privilege-role-trust-policy-granting-sts "Direct link to step-1--create-a-least-privilege-role-trust-policy-granting-sts")

```
aws iam create-role --role-name MicroVMLab-ExecRole-WildcardSts \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:*"}]}'
aws iam put-role-policy --role-name MicroVMLab-ExecRole-WildcardSts --policy-name minimal-exec \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],"Resource":"arn:aws:logs:*:*:*"}]}'
```

The only defect is the `sts:*` wildcard in the trust policy.

## Step 2 — Capture, transform, evaluate[​](#step-2--capture-transform-evaluate "Direct link to Step 2 — Capture, transform, evaluate")

```
aws iam get-role        --role-name MicroVMLab-ExecRole-WildcardSts > snapshots/exec-role-overbroad.json
aws iam get-role-policy --role-name MicroVMLab-ExecRole-WildcardSts --policy-name minimal-exec > snapshots/exec-role-overbroad-policy.json

EXEC_ROLE=snapshots/exec-role-overbroad.json EXEC_POL=snapshots/exec-role-overbroad-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" overbroad-tagsession

"$STAVE" apply -i "$CTRL" -o observations/overbroad-tagsession --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):", (.findings[] | "  [\(.control_severity)] \(.control_id) — \(.control_name)")'
```

```
1 finding(s):
  [high] CTL.LAMBDA.MICROVM.TAGSESSION.WILDCARD.001 — MicroVM Execution Role Trust Policy Grants sts:TagSession via Over-Broad sts:* Wildcard
```

The wildcard makes `sts:TagSession` present, so `TAGSESSION.MISSING` does **not** fire — exactly one control, `TAGSESSION.WILDCARD`, on the one defect.

## Step 3 — Remediate and re-verify[​](#step-3--remediate-and-re-verify "Direct link to Step 3 — Remediate and re-verify")

Replace `sts:*` with the explicit scoped actions:

```
aws iam update-assume-role-policy --role-name MicroVMLab-ExecRole-WildcardSts \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":["sts:AssumeRole","sts:TagSession"]}]}'
aws iam get-role --role-name MicroVMLab-ExecRole-WildcardSts > snapshots/exec-role-overbroad-fixed.json
EXEC_ROLE=snapshots/exec-role-overbroad-fixed.json EXEC_POL=snapshots/exec-role-overbroad-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" overbroad-tagsession-fixed

"$STAVE" apply -i "$CTRL" -o observations/overbroad-tagsession-fixed --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):"'
```

```
0 finding(s):
```

## Step 4 — Cleanup[​](#step-4--cleanup "Direct link to Step 4 — Cleanup")

```
aws iam delete-role-policy --role-name MicroVMLab-ExecRole-WildcardSts --policy-name minimal-exec
aws iam delete-role --role-name MicroVMLab-ExecRole-WildcardSts
```

## What you learned[​](#what-you-learned "Direct link to What you learned")

* "Has `sts:TagSession`" is not the whole story — *how* it's granted matters. An `sts:*` wildcard satisfies the presence check but violates least privilege, and Stave separates the two concerns into two controls so each fires only on its own signal.

## Next[​](#next "Direct link to Next")

* [Lab 4 — Compound path (graph reachability)](/docs/labs/lambda-microvm/compound-path.md)
