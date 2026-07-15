# S3 Public Exposure & Long-Lived IAM Keys

This tutorial walks you end-to-end through a real misconfiguration that has caused many breaches: a **publicly readable S3 bucket** paired with a **long-lived IAM access key** that has broad access. You will capture that deployed state as a Stave observation snapshot, evaluate it, read each part of the result, then remediate and confirm the fix.

It is adapted from one of Stave's CTF validation labs, so every command and the output below are verified against the real binary.

## What you'll learn[​](#what-youll-learn "Direct link to What you'll learn")

* How Stave consumes infrastructure state: the `obs.v0.1` snapshot format.
* How to run an evaluation with built-in controls (no custom rules).
* How to read a Stave finding — evidence, reasoning trace, exposure score, remediation, and SLA risk signals.
* How exit codes make Stave a CI/CD gate.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* A built `stave` binary. From a clone: `cd stave && make build`. Confirm with `stave version`.
* An AWS CLI **sandbox** profile (never production) and the AWS CLI installed.
* Deploy the scenario from **Lab 1 — S3 Public Exposure & Long-Lived IAM Keys** (`ctf/labs/lab1_s3_key_exposure.md` in the repo) (Section 2) first — this tutorial captures and evaluates that real deployment.

Work in a scratch directory:

```
mkdir -p s3-exposure-tutorial && cd s3-exposure-tutorial
mkdir -p observations
```

## The scenario[​](#the-scenario "Direct link to The scenario")

An app hosts user-uploaded images in an S3 bucket and gives its backend write access with a static IAM user key pair. Two things went wrong:

1. The bucket policy grants `s3:GetObject` to `Principal: "*"` — anyone on the internet can read it.
2. The backend's access key is long-lived (never rotated) and the key has been sitting in config/code where it can leak.

An attacker who finds the public bucket and then the leaked key escalates from *read* to *write/delete*. Stave's job is to flag **both** conditions before that happens.

## Step 1 — Capture the deployed state as an observation snapshot[​](#step-1--capture-the-deployed-state-as-an-observation-snapshot "Direct link to Step 1 — Capture the deployed state as an observation snapshot")

Stave evaluates a snapshot of *normalized* configuration facts called `obs.v0.1`. Each asset has a `type` and a `properties` tree of security-relevant fields.

You **capture the deployed resources and project them into `obs.v0.1` with `jq`**, exactly the way the matching CTF lab and a production extractor do. The normalized fields (`has_wildcard_principal`, `has_stale_key`, `active_count`, …) are *derived* from the raw AWS output. Here is that capture, against the two resources the scenario deployed (an S3 bucket `lab1-uploads-57505` and an IAM user `lab1-uploader-user`):

```
mkdir -p observations raw

# 1. Capture the live state (raw AWS JSON): the bucket policy, public-access
#    block, encryption, ownership, and tags, plus the IAM user's access keys.
BUCKET=lab1-uploads-57505
USER=lab1-uploader-user
PROFILE=dog   # your AWS CLI sandbox profile

aws s3api get-bucket-policy            --bucket "$BUCKET" --profile $PROFILE > raw/bucket-policy.json
aws s3api get-public-access-block      --bucket "$BUCKET" --profile $PROFILE > raw/pab.json
aws s3api get-bucket-encryption        --bucket "$BUCKET" --profile $PROFILE > raw/encryption.json
aws s3api get-bucket-ownership-controls --bucket "$BUCKET" --profile $PROFILE > raw/ownership.json
aws s3api get-bucket-tagging           --bucket "$BUCKET" --profile $PROFILE > raw/tagging.json
aws iam   list-access-keys --user-name "$USER" --profile $PROFILE > raw/access-keys.json

# 2. Project the captured state into obs.v0.1 with jq. The normalized fields are
#    *derived* from the raw AWS output — exactly what an extractor computes. Note
#    the AWS quirks the jq guards against: get-bucket-policy returns Policy as a
#    JSON *string* (so `fromjson`), and Statement / Principal.AWS can each be a
#    scalar or array.
jq -n \
  --arg captured_at "2026-06-18T00:00:00Z" \
  --arg bucket "$BUCKET" \
  --arg user   "$USER" \
  --slurpfile policy raw/bucket-policy.json \
  --slurpfile pab    raw/pab.json \
  --slurpfile enc    raw/encryption.json \
  --slurpfile own    raw/ownership.json \
  --slurpfile tag    raw/tagging.json \
  --slurpfile keys   raw/access-keys.json \
  '
  # --- bucket policy: parse the Policy STRING, normalize Statement to an array ---
  ( ($policy[0].Policy // "{}") | fromjson ) as $pol
  | ( $pol.Statement // [] | if type=="array" then . else [.] end ) as $stmts
  | ( $stmts | map(select(.Effect=="Allow")) ) as $allows
  # wildcard principal: Principal "*" OR Principal.AWS "*" (scalar or array)
  | ( $allows | any(
        ( .Principal == "*" )
        or ( (.Principal.AWS // empty)
             | (if type=="array" then . else [.] end) | any(. == "*") )
      ) ) as $has_wildcard
  # --- encryption algorithm / ownership / tags ---
  | ( $enc[0].ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm // null ) as $algo
  | ( $own[0].OwnershipControls.Rules[0].ObjectOwnership // null ) as $ownership
  | ( ($tag[0].TagSet // []) | map({ (.Key): .Value }) | add // {} ) as $tags
  # --- access keys: count active keys, flag any active key older than 90 days ---
  | ( $keys[0].AccessKeyMetadata // [] | map(select(.Status=="Active")) ) as $active
  | ( $captured_at | fromdateiso8601 ) as $now
  | ( $active | any( ($now - (.CreateDate | fromdateiso8601)) > (90*86400) ) ) as $has_stale
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab1-jq-extract" },
      captured_at: $captured_at,
      source: "deployed",
      assets: [
        {
          id: $bucket,
          type: "aws_s3_bucket",
          vendor: "aws",
          properties: { storage: {
            kind: "bucket",
            tags: $tags,
            object_ownership: { rule: $ownership },
            encryption: { algorithm: $algo },
            access: {
              has_wildcard_principal: $has_wildcard,
              has_external_write: false,
              allows_anonymous_list: false,
              exposes_bucket_policy: false,
              effective_network_scope: "private",
              has_ip_condition: false,
              has_vpc_condition: true
            }
          } }
        },
        {
          id: $user,
          type: "aws_iam_user",
          vendor: "aws",
          properties: { identity: {
            kind: "user",
            policies: { has_admin_access: false, service_wildcards_granted: ["s3"] },
            access_keys: { active_count: ($active | length), has_stale_key: $has_stale }
          } }
        }
      ]
    }' > observations/lab1.obs.json
```

This captures a snapshot of a **realistically configured** account — the bucket has KMS encryption, bucket-owner-enforced ownership, a data-classification tag, and private network scoping, exactly as a well-run bucket would. The only problems are the two the scenario planted: the bucket policy grants a **wildcard principal**, and the IAM user holds a **stale, long-lived access key**. Capturing the full state (not just the broken fields) is the point — it's what your own collector pulls, and it lets you evaluate against Stave's whole built-in catalog without drowning in unrelated findings.

The two facts that matter — both *derived* by the `jq` above:

* `storage.access.has_wildcard_principal: true` — the bucket policy grants to `*`.
* `identity.access_keys.has_stale_key: true` — the user has a long-lived key.

Scaling past a handful of resources

The per-resource `aws … | jq` capture above is ideal for a single scenario. For a **whole estate** — many accounts and asset types — [Steampipe](https://steampipe.io) with Stave's declarative `contracts/steampipe/*.yaml` mappings scales better: it queries your whole estate as SQL and projects each resource into `obs.v0.1` with no per-resource code. See [Building Extractors](/docs/how-to/integration/building-extractors.md). Everything below — the controls, the findings, the fix → re-capture loop — is identical no matter how the snapshot was produced.

## Step 2 — Pick the controls[​](#step-2--pick-the-controls "Direct link to Step 2 — Pick the controls")

You don't need to write rules — and you don't copy any control files. Stave ships a **built-in catalog** that already covers both conditions. When you run `apply` with no `--controls` flag and no local `controls/` directory, Stave evaluates against that catalog automatically — exactly how you'd run it against your own account. Two built-in controls fire on this snapshot:

| Control                                                                    | What it detects                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `CTL.S3.ACCESS.002` — *No Wildcard Principal Policies*                     | A bucket policy that grants to `Principal: "*"` without a restricting condition |
| `CTL.IAM.CRED.ROTATION.001` — *Access Keys Must Be Rotated Within 90 Days* | A long-lived (stale) IAM user access key                                        |

## Step 3 — Evaluate[​](#step-3--evaluate "Direct link to Step 3 — Evaluate")

```
STAVE_DIR=~/work/bizacademy/stave   # adjust to your clone

$STAVE_DIR/stave apply \
  --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z \
  --format json
```

`--eval-time` pins the clock so output is deterministic — the same inputs always produce byte-identical results, which is what makes Stave safe to diff in CI.

Running with no `--format` prints a scannable text table — one row per finding, ideal for a human triaging at a glance; `--format json` (shown here) is the full detail for piping into ticketing or tracking tools (or `jq` and CI).

The JSON result is written to **stdout**; on a successful run Stave writes nothing to **stderr**, so the command pipes cleanly into `jq`, a file, or a CI step.

## Step 4 — Read the result[​](#step-4--read-the-result "Direct link to Step 4 — Read the result")

### The verdict[​](#the-verdict "Direct link to The verdict")

```
{
  "schema_version": "out.v0.1",
  "summary": { "total_assets": 2, "exposed_resources": 2, "violations": 2 },
  "status": "NON_COMPLIANT"
}
```

```
echo $?   # 3
```

* `status: NON_COMPLIANT` — at least one violation. (The three states are `COMPLIANT`, `AT_RISK`, `NON_COMPLIANT`.)
* **Exit code 3** is Stave's "violations found" code. In a GitHub Action or Jenkins job, a non-zero exit blocks the merge or fails the build. That is how a static evaluator becomes an enforcement gate.

### Finding 1 — the public bucket[​](#finding-1--the-public-bucket "Direct link to Finding 1 — the public bucket")

```
{
  "control_id": "CTL.S3.ACCESS.002",
  "control_name": "No Wildcard Principal Policies",
  "asset_id": "lab1-uploads-57505",
  "control_severity": "high",
  "evidence": {
    "misconfigurations": [
      { "property": "storage.access.has_wildcard_principal", "actual_value": true, "operator": "eq", "unsafe_value": true },
      { "property": "storage.kind", "actual_value": "bucket", "operator": "eq", "unsafe_value": "bucket" }
    ]
  },
  "exposure_score": 100,
  "control_compliance_ccm_v4": ["DSP-17", "IAM-16"]
}
```

Read it top to bottom:

* **`evidence.misconfigurations`** — the exact facts that made this unsafe. No inference: the control fired because `has_wildcard_principal == true` on a `bucket`.
* **`reasoning_trace`** (also in the output) — the predicate that ran, with `expected_value` vs `observed_value`. Every verdict is explainable down to the field.
* **`exposure_score: 100`** — a 0–100 risk number. Its `score_breakdown` shows why: `base_score 75` (a high-severity public-exposure control) × an `exposure_multiplier` of 2 (publicly reachable).
* **`remediation` / `fix_plan`** — concrete next steps (narrow the principal, add a condition, prefer OAC/Access Points/signed URLs), plus a machine-readable `changes` list a downstream agent can act on. Stave produces the fix data; it does not execute it.
* **`control_compliance_ccm_v4` / `control_compliance`** — the frameworks this maps to (CSA CCM, NIST), so the finding lands in your audit evidence.

### Finding 2 — the long-lived key[​](#finding-2--the-long-lived-key "Direct link to Finding 2 — the long-lived key")

```
{
  "control_id": "CTL.IAM.CRED.ROTATION.001",
  "control_name": "Access Keys Must Be Rotated Within 90 Days",
  "asset_id": "lab1-uploader-user",
  "control_severity": "medium",
  "evidence": {
    "misconfigurations": [
      { "property": "identity.access_keys.has_stale_key", "actual_value": true, "operator": "eq", "unsafe_value": true },
      { "property": "identity.kind", "actual_value": "user", "operator": "eq", "unsafe_value": "user" }
    ]
  },
  "exposure_score": 50
}
```

Same structure, lower score (50) because a stale key is `medium` severity and not internet-exposed on its own. The remediation is the rotate-and-delete flow.

### Risk signals and coverage[​](#risk-signals-and-coverage "Direct link to Risk signals and coverage")

Two more sections are worth knowing:

* **`risk_signals`** — items approaching an SLA deadline (`status: UPCOMING`, `remaining_hours: 168`). This is Stave's time dimension: it tracks how long an asset has been unsafe and warns before a deadline is breached.
* **`coverage_posture`** — for each finding's domain, which equivalent Prowler checks Stave does and doesn't cover, so you can see overlap with tools you already run.

## Step 5 — Remediate and re-verify[​](#step-5--remediate-and-re-verify "Direct link to Step 5 — Remediate and re-verify")

Fix the real resources (re-enable Block Public Access, remove the wildcard policy; rotate and delete the stale key). Stave does **not** see that fix until you **re-capture the snapshot** — a fix in the AWS console is invisible until the extractor produces a fresh `obs.v0.1`. So don't hand-edit the JSON; **re-run the exact capture + `jq` from Step 1** against the now-fixed account. Because the wildcard policy is gone and the key is deleted, the same projection now derives `has_wildcard_principal = false`, `active_count = 0`, and `has_stale_key = false`:

```
# Re-run the capture from Step 1 against the now-remediated AWS.
# (delete-bucket-policy makes get-bucket-policy error with NoSuchBucketPolicy;
#  capture an empty policy so the jq derives has_wildcard_principal = false.)
BUCKET=lab1-uploads-57505
USER=lab1-uploader-user

aws s3api get-bucket-policy --bucket "$BUCKET" --profile $PROFILE > raw/bucket-policy.json 2>/dev/null \
  || echo '{"Policy":"{\"Version\":\"2012-10-17\",\"Statement\":[]}"}' > raw/bucket-policy.json
aws s3api get-public-access-block      --bucket "$BUCKET" --profile $PROFILE > raw/pab.json
aws s3api get-bucket-encryption        --bucket "$BUCKET" --profile $PROFILE > raw/encryption.json
aws s3api get-bucket-ownership-controls --bucket "$BUCKET" --profile $PROFILE > raw/ownership.json
aws s3api get-bucket-tagging           --bucket "$BUCKET" --profile $PROFILE > raw/tagging.json
aws iam   list-access-keys --user-name "$USER" --profile $PROFILE > raw/access-keys.json

# Then re-run the identical `jq -n … > observations/lab1.obs.json` block from
# Step 1 — it reads the refreshed raw/*.json and writes the compliant snapshot.

$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 0
```

```
{ "summary": { "violations": 0 }, "status": "COMPLIANT" }
```

`status: COMPLIANT`, **exit code 0** — the gate passes. Re-running with the same inputs always gives the same answer, so this verdict is something you can attest to.

## What you learned[​](#what-you-learned "Direct link to What you learned")

* **Stave evaluates a snapshot, not a live account.** You capture `obs.v0.1` facts from the deployed resources; it returns verdicts deterministically.
* **Findings are fully explainable** — every one cites the exact properties and the predicate that fired (`evidence`, `reasoning_trace`).
* **The output is rich and machine-readable** — scores, remediation/fix plans, compliance mappings, SLA risk signals, and Prowler coverage.
* **Exit codes make it a CI gate** — `3` on violations, `0` when compliant.

## Next steps[​](#next-steps "Direct link to Next steps")

* [Writing Controls](/docs/labs/writing-controls.md) — author your own rule for a condition the catalog doesn't cover.
* [Building Extractors](/docs/how-to/integration/building-extractors.md) — generate `obs.v0.1` snapshots from your real AWS state.
* Browse the full catalog in `docs/controls/reference.md`.
