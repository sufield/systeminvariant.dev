# Cognito Unauthenticated S3 Takeover

A Cognito **identity pool** with *unauthenticated (guest) access* enabled, whose guest IAM role grants S3 actions, is a quiet but serious exposure: any anonymous client can exchange a Cognito identity for real AWS credentials and read or write your buckets — **without the bucket ever being public**. In this tutorial you'll capture that state from a real deployment, evaluate it with Stave, read the findings, and then learn the one concept every Stave user must internalize: **Stave evaluates a snapshot, not your live account**, so a fix is invisible until you re-capture.

Adapted from a Stave CTF validation lab; every command and result below is verified against the real binary.

## What you'll learn[​](#what-youll-learn "Direct link to What you'll learn")

* How an "anonymous → AWS credentials → S3" path looks as an `obs.v0.1` snapshot.
* How to read a critical finding, including its blast-radius scoring and attack narrative.
* **The snapshot model**: why you must re-capture after a fix, and how `input_hashes` proves whether you did.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* A built `stave` binary (`cd stave && make build`; check with `stave version`).
* An AWS CLI **sandbox** profile (never production) and the `aws` CLI + `jq`.
* Deploy the scenario from **Lab 2 — Cognito Unauthenticated S3 Takeover** (`ctf/labs/lab2_cognito_unauth_s3.md` in the repo) (Section 2) first — this tutorial captures and evaluates that real deployment. That deploy sets `$IDENTITY_POOL_ID` and `$PROFILE` in your shell; keep them set.

```
mkdir -p cognito-tutorial && cd cognito-tutorial
mkdir -p observations
STAVE_DIR=~/work/bizacademy/stave   # adjust to your clone
```

## The scenario[​](#the-scenario "Direct link to The scenario")

A mobile app uses a Cognito identity pool to hand out AWS credentials. To let the app read images from a private bucket, a developer attached `s3:*` to the pool's **unauthenticated** role and left guest access on. The intent was "the app can read images." The reality is **anyone on the internet** can:

1. Call `GetCredentialsForIdentity` on the pool — no login required.
2. Receive credentials carrying `s3:*` on `lab2-private-data`.
3. Read, list, or overwrite every object in that bucket.

The bucket policy is irrelevant — the access flows through Cognito's session credentials.

## Step 1 — Capture the identity pool as a snapshot[​](#step-1--capture-the-identity-pool-as-a-snapshot "Direct link to Step 1 — Capture the identity pool as a snapshot")

In a real project you never hand-write `obs.v0.1`. You **capture the deployed pool and its unauthenticated role's policy, then project that raw AWS state into `obs.v0.1` with `jq`** — exactly what the matching CTF lab and a production extractor do. The normalized fields (`allow_unauthenticated`, `unauth_role_has_s3`, …) are *derived* from the captured API output, not typed from memory:

```
mkdir -p raw

# 1. Capture the live state (raw AWS JSON) — the identity pool, its role mapping,
#    and the unauthenticated role's inline policy.
aws cognito-identity describe-identity-pool \
  --identity-pool-id "$IDENTITY_POOL_ID" --profile $PROFILE > raw/pool.json
aws cognito-identity get-identity-pool-roles \
  --identity-pool-id "$IDENTITY_POOL_ID" --profile $PROFILE > raw/pool-roles.json
UNAUTH_ROLE=$(jq -r '.Roles.unauthenticated | split("/")[-1]' raw/pool-roles.json)
# (After remediation this policy is gone — fall back to {} so the same block
#  re-captures cleanly and the jq derives unauth_role_has_s3=false.)
aws iam get-role-policy --role-name "$UNAUTH_ROLE" \
  --policy-name S3GuestWildcard --profile $PROFILE > raw/unauth-policy.json 2>/dev/null \
  || echo '{}' > raw/unauth-policy.json

# 2. Project the captured state into obs.v0.1 with jq. The normalized fields
#    (allow_unauthenticated, unauth_role_has_s3, …) are *derived* from the raw
#    AWS output — exactly what an extractor computes.
jq -n \
  --slurpfile pool raw/pool.json \
  --slurpfile pol  raw/unauth-policy.json \
  '
  ($pol[0].PolicyDocument.Statement | (if type=="array" then . else [.] end)
     | map(select(.Effect=="Allow"))) as $st
  | ([ $st[].Action   | if type=="array" then .[] else . end ]) as $actions
  | ([ $st[].Resource | if type=="array" then .[] else . end ]) as $resources
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab2-jq-extract" },
      captured_at: "2026-06-18T00:00:00Z",
      source: "deployed",
      assets: [ {
        id: ("us-east-1:" + $pool[0].IdentityPoolName),
        type: "aws_cognito_identity_pool",
        vendor: "aws",
        properties: { identity: {
          kind: "cognito_identity_pool",
          access: { allow_unauthenticated: $pool[0].AllowUnauthenticatedIdentities },
          cognito: {
            unauth_role_s3_actions: [ $actions[] | select(startswith("s3:")) ],
            unauth_role_s3_buckets: ([ $resources[] | select(startswith("arn:aws:s3:::")) | sub("/\\*$";"") ] | unique),
            unauth_role_has_s3:     ($actions | any(startswith("s3:")))
          }
        } }
      } ]
    }' > observations/snapshot.obs.json
```

The two facts that matter: `identity.access.allow_unauthenticated: true` (guest access on) and `identity.cognito.unauth_role_has_s3: true` (the guest role can touch S3). Note the asset id `us-east-1:lab2_identity_pool` is *derived* from the captured pool name (`IdentityPoolName`), not invented.

Scaling beyond one resource

The capture + `jq` above is the right tool for *this* correlation: `unauth_role_has_s3` is a **cross-resource fact** (pool → role → policy), so it needs a collector/join to compute — it lives in the Steampipe mapping's `derived_properties`, not in a single SQL row. For a whole estate with many asset types, [Steampipe](https://steampipe.io) with Stave's declarative `contracts/steampipe/*.yaml` mappings scales better than per-resource `jq` — see [Building Extractors](/docs/how-to/integration/building-extractors.md). Everything below — the controls, the findings, the fix → re-capture loop — is identical no matter how the snapshot was produced.

## Step 2 — The built-in catalog[​](#step-2--the-built-in-catalog "Direct link to Step 2 — The built-in catalog")

You don't manage control files. Stave ships a **built-in catalog**, and when you run `apply` with no `--controls` flag and no local `controls/` directory, it evaluates against that catalog automatically — exactly how you'd run it against your own account every day. Two built-in Cognito controls match this snapshot:

| Control                                           | Detects                                                  |
| ------------------------------------------------- | -------------------------------------------------------- |
| `CTL.COGNITO.IDPOOL.UNAUTH.S3.001` (**critical**) | Guest access on **and** the guest role grants S3 actions |
| `CTL.COGNITO.IDENTITY.GUEST.001` (**high**)       | Guest (unauthenticated) access enabled at all            |

## Step 3 — Evaluate[​](#step-3--evaluate "Direct link to Step 3 — Evaluate")

```
$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 3
```

Run with no `--format` and Stave prints a scannable text table — one row per finding, sorted so a human can triage at a glance; `--format json` (shown here) is the full detail you pipe into a tracking tool, `jq`, or CI.

```
{
  "summary": { "total_assets": 1, "exposed_resources": 1, "violations": 2 },
  "status": "NON_COMPLIANT"
}
```

This snapshot is deliberately partial — it omits a few `aws_cognito_identity_pool` fields that *other* Cognito controls read. That doesn't affect this verdict; a missing field can never silently hide a finding. (Run with `-v` to see which fields Stave noted as absent.)

### Read the critical finding[​](#read-the-critical-finding "Direct link to Read the critical finding")

```
{
  "control_id": "CTL.COGNITO.IDPOOL.UNAUTH.S3.001",
  "control_name": "Cognito Identity Pool Unauthenticated Role Has S3 Access",
  "asset_id": "us-east-1:lab2_identity_pool",
  "control_severity": "critical",
  "exposure_score": 100,
  "score_breakdown": { "base_score": 100, "blast_multiplier": 5, "exposure_multiplier": 1, "chain_bonus": 1, "blind_multiplier": 1 }
}
```

* **`reasoning_trace`** shows all three predicates that fired: `allow_unauthenticated eq true`, `unauth_role_has_s3 eq true`, `kind eq "cognito_identity_pool"` — fully explainable, no inference.
* **`exposure_score: 100`** — `base_score 100 × blast_multiplier 5`. The 5× blast multiplier reflects that anonymous credentials with S3 access reach an unbounded set of callers.
* **`defect` / `infection` / `failure`** — a plain-English attack narrative: an anonymous client calls `GetCredentialsForIdentity`, gets `s3:GetObject` creds, and reads the data; `PutObject` lets anyone upload (storage abuse, malware staging). This is the *why* behind the score.

The second finding, `CTL.COGNITO.IDENTITY.GUEST.001` (high, score 75), fires on just the guest-access flag.

### One root cause, grouped[​](#one-root-cause-grouped "Direct link to One root cause, grouped")

```
"issues": [{
  "member_finding_ids": ["…unauth_s3…", "…guest…"],
  "consolidated_score": 100,
  "consolidated_blast_radius": 5
}]
```

Stave recognizes both findings share `allow_unauthenticated` and merges them into a single **issue** — you have one thing to fix, not two unrelated problems.

## Step 4 — Fix it, and learn the snapshot model[​](#step-4--fix-it-and-learn-the-snapshot-model "Direct link to Step 4 — Fix it, and learn the snapshot model")

This is the part that surprises every newcomer. Fix the AWS resources:

```
aws cognito-identity update-identity-pool --identity-pool-id "$IDENTITY_POOL_ID" \
  --identity-pool-name "lab2_identity_pool" --no-allow-unauthenticated-identities --profile $PROFILE
aws iam delete-role-policy --role-name "lab2-unauth-role" --policy-name "S3GuestWildcard" --profile $PROFILE
```

Now **re-run Stave without touching the snapshot** and you'll still see 2 violations. That is not a bug. **Stave evaluates the snapshot file, not live AWS.** It is deterministic — same file in, same verdict out — which is exactly what makes a verdict reproducible and safe to attest to. The proof is in the output's `input_hashes`:

```
# run.input_hashes.files — before, and after a live fix WITHOUT re-capture — identical:
"snapshot.obs.json": "1e1153fec6de091e7c56f45e3a2ef791209d9f4611903730b692f1dfae5220d0"
```

**An unchanged `input_hash` is the tell**: nothing was re-captured, so nothing can change. You fixed AWS, but Stave is still looking at the old photo.

The fix is to **re-capture the snapshot**. In production this is your collector re-running (`fix → re-run collector → re-evaluate`). Here that just means **re-running the exact capture + `jq` block from Step 1** against the now-fixed account — `describe-identity-pool` reports `AllowUnauthenticatedIdentities: false`, and the deleted `S3GuestWildcard` policy falls back to `{}`, so the jq derives `allow_unauthenticated` and `unauth_role_has_s3` to `false` on its own. Nothing is hand-edited:

```
# Re-capture the live (now-remediated) state — identical to Step 1.
aws cognito-identity describe-identity-pool \
  --identity-pool-id "$IDENTITY_POOL_ID" --profile $PROFILE > raw/pool.json
aws cognito-identity get-identity-pool-roles \
  --identity-pool-id "$IDENTITY_POOL_ID" --profile $PROFILE > raw/pool-roles.json
UNAUTH_ROLE=$(jq -r '.Roles.unauthenticated | split("/")[-1]' raw/pool-roles.json)
aws iam get-role-policy --role-name "$UNAUTH_ROLE" \
  --policy-name S3GuestWildcard --profile $PROFILE > raw/unauth-policy.json 2>/dev/null \
  || echo '{}' > raw/unauth-policy.json

# Re-run the identical jq projection from Step 1.
jq -n \
  --slurpfile pool raw/pool.json \
  --slurpfile pol  raw/unauth-policy.json \
  '
  ($pol[0].PolicyDocument.Statement | (if type=="array" then . else [.] end)
     | map(select(.Effect=="Allow"))) as $st
  | ([ $st[].Action   | if type=="array" then .[] else . end ]) as $actions
  | ([ $st[].Resource | if type=="array" then .[] else . end ]) as $resources
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab2-jq-extract" },
      captured_at: "2026-06-18T00:00:00Z",
      source: "deployed",
      assets: [ {
        id: ("us-east-1:" + $pool[0].IdentityPoolName),
        type: "aws_cognito_identity_pool",
        vendor: "aws",
        properties: { identity: {
          kind: "cognito_identity_pool",
          access: { allow_unauthenticated: $pool[0].AllowUnauthenticatedIdentities },
          cognito: {
            unauth_role_s3_actions: [ $actions[] | select(startswith("s3:")) ],
            unauth_role_s3_buckets: ([ $resources[] | select(startswith("arn:aws:s3:::")) | sub("/\\*$";"") ] | unique),
            unauth_role_has_s3:     ($actions | any(startswith("s3:")))
          }
        } }
      } ]
    }' > observations/snapshot.obs.json

$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 0
```

```
{
  "summary": { "total_assets": 1, "exposed_resources": 0, "violations": 0 },
  "status": "COMPLIANT",
  "findings": []
}
```

And the `input_hash` is now **different** — proof Stave evaluated the new state:

```
# after re-capture:
"snapshot.obs.json": "55866ddeb2d22ff6609edb8fa2af8d8a632058b8bf0c99d191329be85b99dd45"
```

`status: COMPLIANT`, **exit 0**. Green.

## What you learned[​](#what-you-learned "Direct link to What you learned")

* **Anonymous → AWS-credentials → S3 is invisible to bucket-policy scanners** but obvious to Stave, because it models the Cognito pool's guest role directly.
* **Findings are explainable and scored** — predicates, blast radius, and an attack narrative, grouped by root cause.
* **Stave evaluates a captured snapshot deterministically.** A live fix changes nothing until you re-capture; the `input_hashes` value tells you whether you did. The loop is always **fix → re-capture → re-evaluate**.

## Next steps[​](#next-steps "Direct link to Next steps")

* [S3 Public Exposure & Long-Lived IAM Keys](/docs/labs/s3-public-exposure-long-lived-iam-keys.md) — the S3 + IAM walkthrough.
* [Building Extractors](/docs/how-to/integration/building-extractors.md) — automate the re-capture step by generating `obs.v0.1` from live AWS.
* [Writing Controls](/docs/labs/writing-controls.md) — author your own rule.
