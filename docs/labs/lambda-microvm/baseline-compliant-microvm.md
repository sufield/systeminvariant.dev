# Lab 1 — Baseline: A Compliant MicroVM

AWS Lambda MicroVMs run code — including **coding agents** — inside Firecracker microVMs. Before you deploy an agent into one, you want to know what *must be true* about its identity, network, supply chain, and runtime. Stave ships **16 built-in controls** for exactly that, under the `CTL.LAMBDA.MICROVM.*` family.

This first lab is orientation. You will build a **compliant** MicroVM execution role, capture it, project it into a Stave observation snapshot, and confirm all 16 controls pass — **zero findings**. The next six labs each plant one misconfiguration and walk it through detect → remediate → re-verify.

Every command and result below is verified against the real `stave` binary.

## What you'll learn[​](#what-youll-learn "Direct link to What you'll learn")

* The `CTL.LAMBDA.MICROVM.*` control family and what each group checks.
* How a capture (`aws … > snapshots/*.json`) becomes an `obs.v0.1` snapshot via `transform.sh`, and how **un-captured resources default to compliant** — which is what makes each lab self-contained.
* The capture → transform → `stave apply` loop you'll reuse in every lab.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* A built `stave` binary. From a clone: `cd stave && make build`. Confirm with `stave version` — the catalog should report **2,891 controls**.
* The AWS CLI with a **sandbox** profile (never production), Lambda MicroVM access (GA: `us-east-1`, `us-east-2`, `us-west-2`, `eu-west-1`, `ap-northeast-1`), and `jq`.
* The lab's `transform.sh` (ships in the repo at `ctf/labs/microvm/transform.sh`).

Set the shared variables once, then work in a per-lab folder:

```
export STAVE=~/work/bizacademy/stave/stave
export CTRL=~/work/bizacademy/stave/controls/lambda/microvm
export TRANSFORM=~/work/bizacademy/ctf/labs/microvm/transform.sh
export TS=2026-06-23T00:00:00Z
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

mkdir -p lab1-baseline && cd lab1-baseline && mkdir -p snapshots
```

## The 16 controls[​](#the-16-controls "Direct link to The 16 controls")

| Group        | Controls                                      | Checks                                                                              |
| ------------ | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Network      | SUBNET, SG, CONNROLE                          | approved subnets, restricted SG ingress, connector role least-privilege             |
| Identity     | INGRESSAUTH, TAGSESSION, CONNORIGIN, IDENTITY | ingress auth, trust-policy `TagSession`, connector origin, workload identity claims |
| IAM roles    | EXECROLE, BUILDROLE                           | execution / build role least-privilege                                              |
| Supply chain | BASEIMAGE, S3PUBLIC, S3VERSION                | approved base image, artifact bucket not public, versioning                         |
| Runtime      | ENTROPY, IDLE, RUNTIME                        | entropy reinit, idle-policy + total-runtime limits                                  |
| Snapshot     | SNAPSHOTSECRET                                | no secrets baked into the memory snapshot at init                                   |

A seventeenth invariant — the **compound path** (assume-role chain to a secret) — is graph reachability, covered in [Lab 4](/docs/labs/lambda-microvm/compound-path.md).

## Step 1 — Create a compliant execution role[​](#step-1--create-a-compliant-execution-role "Direct link to Step 1 — Create a compliant execution role")

A MicroVM execution role should carry `sts:TagSession` in its trust policy and a least-privilege inline policy (no wildcards, no `iam:PassRole`):

```
aws iam create-role --role-name MicroVMLab-ExecRole-Compliant \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":["sts:AssumeRole","sts:TagSession"]}]}'
aws iam put-role-policy --role-name MicroVMLab-ExecRole-Compliant --policy-name minimal-exec \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents"],"Resource":"arn:aws:logs:*:*:*"}]}'
```

## Step 2 — Capture and transform[​](#step-2--capture-and-transform "Direct link to Step 2 — Capture and transform")

Capture the role, then project it into `obs.v0.1`. Every other resource you don't capture (build role, S3 bucket, MicroVM runtime, image) **defaults to compliant** in the snapshot — so this one role is all you need:

```
aws iam get-role        --role-name MicroVMLab-ExecRole-Compliant > snapshots/exec-role-compliant.json
aws iam get-role-policy --role-name MicroVMLab-ExecRole-Compliant --policy-name minimal-exec > snapshots/exec-role-compliant-policy.json

EXEC_ROLE=snapshots/exec-role-compliant.json EXEC_POL=snapshots/exec-role-compliant-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" compliant
```

`transform.sh` *derives* the security signals from the raw IAM JSON — for this role, `role.over_privileged = false` (least-privilege), `role.trust_tagsession_present = true` (has `sts:TagSession`), and `role.trust_tagsession_overbroad = false` (granted as the scoped action, not via `sts:*`).

## Step 3 — Evaluate[​](#step-3--evaluate "Direct link to Step 3 — Evaluate")

```
"$STAVE" apply -i "$CTRL" -o observations/compliant --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):", (.findings[] | "  [\(.control_severity)] \(.control_id) — \(.control_name)")'
```

```
0 finding(s):
```

```
echo $?   # 0
```

**Zero findings, exit code 0** — the compliant baseline passes. `--eval-time` pins the clock so the output is deterministic, which is what makes Stave safe to diff in CI: a non-zero exit (3 = violations) blocks a merge; 0 lets it through.

## Step 4 — Cleanup[​](#step-4--cleanup "Direct link to Step 4 — Cleanup")

```
aws iam delete-role-policy --role-name MicroVMLab-ExecRole-Compliant --policy-name minimal-exec
aws iam delete-role --role-name MicroVMLab-ExecRole-Compliant
```

## What you learned[​](#what-you-learned "Direct link to What you learned")

* Stave evaluates a **snapshot** (`obs.v0.1`), not a live account. You capture, transform, and evaluate.
* The transform **defaults un-captured resources to compliant**, so each lab captures only the resource it is testing.
* A compliant MicroVM role passes all 16 controls — exit code 0.

## Next[​](#next "Direct link to Next")

* [Lab 2 — Over-privileged execution role](/docs/labs/lambda-microvm/overprivileged-execution-role.md) — plant the first misconfiguration and watch two controls fire.
