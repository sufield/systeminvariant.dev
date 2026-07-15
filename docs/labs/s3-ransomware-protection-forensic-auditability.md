# S3 Ransomware Protection & Forensic Auditability

A backup bucket is only a backup if an attacker can't delete it and you can prove what happened. The classic ransomware pattern: a leaked `.env` file hands over an over-privileged key, the attacker enumerates buckets, finds your `sensitive-backups` bucket, **deletes every object and every version**, and drops a ransom note. Whether that's a bad afternoon or a company-ending event comes down to three bucket settings:

* **Versioning** — recover objects an attacker deleted or overwrote.
* **Object Lock (WORM)** — make objects un-deletable for a retention period, so even valid credentials can't destroy them.
* **Access logging** — a forensic trail to trace the source of the breach.

This bucket is tagged `compliance=soc2` and has **none** of the three. This tutorial detects all three gaps with Stave in one pass.

Adapted from a Stave CTF validation lab; every command and result below is verified against the real binary.

## What you'll learn[​](#what-youll-learn "Direct link to What you'll learn")

* How to capture an S3 bucket's data-protection posture into an `obs.v0.1` snapshot.
* How Stave catches the recover-and-investigate trio — versioning, Object Lock, logging — and why a compliance tag raises the bar.
* **Why exit code 3 is a success, not a failure.**
* The snapshot model: why you re-capture after a fix.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* A built `stave` binary (`cd stave && make build`; check with `stave version`).
* An AWS CLI **sandbox** profile (never production) with permission to read S3 bucket configuration.
* Deploy the scenario from **Lab 4 — S3 Ransomware Protection** (`ctf/labs/lab4_s3_ransomware_protection.md` in the repo) (Section 2) first — this tutorial captures and evaluates that real deployment.

```
mkdir -p ransomware-protection && cd ransomware-protection
mkdir -p observations
STAVE_DIR=~/work/bizacademy/stave   # adjust to your clone
```

You don't copy or author any control files. Stave ships a **built-in catalog**, and when you run `apply` with no `--controls` flag and no local `controls/` directory, it evaluates against that catalog automatically — exactly how you'd run it against your own account every day.

## The scenario[​](#the-scenario "Direct link to The scenario")

`lab4-sensitive-backups-57505` holds the only copies of production backups and carries a `compliance=soc2` tag — so regulators expect immutable, auditable storage. But it was created with the defaults: no versioning, no Object Lock, no server access logging. An attacker with a leaked backup-runner key can delete everything, and there is **no version history to restore from and no log to investigate with**. The bucket isn't public and the credentials are "valid" — nothing a perimeter scanner flags. The exposure is entirely in the bucket's data-protection settings.

## Step 1 — Capture the bucket as a snapshot[​](#step-1--capture-the-bucket-as-a-snapshot "Direct link to Step 1 — Capture the bucket as a snapshot")

You **capture the bucket's live data-protection posture and project it into `obs.v0.1` with `jq`** — exactly the method the matching CTF lab uses. Capturing the full state (not just the broken fields) lets you evaluate against Stave's whole built-in catalog without drowning in unrelated findings: the deployed bucket is realistically configured, with KMS encryption, bucket-owner-enforced ownership, and a data-classification tag, and its only gaps are the three the scenario planted — versioning, Object Lock, and access logging all off.

Each `aws s3api get-*` call writes the bucket's actual configuration to a `raw/*.json` file; sub-resources that were never configured (Object Lock, and on a fresh bucket versioning/logging) *error*, so fall back to an empty object `{}` and let the `jq` projection derive `false` rather than aborting (`PROFILE` is your AWS CLI **sandbox** profile):

```
mkdir -p observations raw

BUCKET=lab4-sensitive-backups-57505   # the bucket from the scenario

# 1. Capture the live data-protection posture (raw AWS JSON).
aws s3api get-bucket-tagging            --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/tags.json       || echo '{}' > raw/tags.json
aws s3api get-bucket-ownership-controls --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/ownership.json || echo '{}' > raw/ownership.json
aws s3api get-bucket-encryption         --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/encryption.json || echo '{}' > raw/encryption.json
aws s3api get-bucket-versioning         --bucket "$BUCKET" --profile $PROFILE > raw/versioning.json
aws s3api get-object-lock-configuration --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/objectlock.json || echo '{}' > raw/objectlock.json
aws s3api get-bucket-logging            --bucket "$BUCKET" --profile $PROFILE > raw/logging.json

# 2. Project the captured state into obs.v0.1 with jq. The normalized fields
#    (versioning.enabled, object_lock.enabled, logging.enabled, …) are *derived*
#    from the raw AWS output — exactly what an extractor computes. The TagSet
#    array is reshaped into a {key: value} object; missing/empty sub-resources
#    fall back to safe defaults via `//`.
jq -n \
  --arg bucket "$BUCKET" \
  --slurpfile tags raw/tags.json \
  --slurpfile own  raw/ownership.json \
  --slurpfile enc  raw/encryption.json \
  --slurpfile ver  raw/versioning.json \
  --slurpfile lock raw/objectlock.json \
  --slurpfile log  raw/logging.json \
  '
  ($tags[0].TagSet // []) as $tagset
  | (reduce $tagset[] as $t ({}; .[$t.Key] = $t.Value)) as $tagmap
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab4-jq-extract" },
      captured_at: "2026-06-18T00:00:00Z",
      source: "deployed",
      assets: [ {
        id: $bucket,
        type: "aws_s3_bucket",
        vendor: "aws",
        properties: { storage: {
          kind: "bucket",
          tags: $tagmap,
          object_ownership: { rule: ($own[0].OwnershipControls.Rules[0].ObjectOwnership // null) },
          encryption:       { algorithm: ($enc[0].ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm // null) },
          versioning:  { enabled: (($ver[0].Status // "") == "Enabled") },
          object_lock: { enabled: (($lock[0].ObjectLockConfiguration.ObjectLockEnabled // "") == "Enabled") },
          logging:     { enabled: ($log[0].LoggingEnabled != null) }
        } }
      } ]
    }' > observations/lab4.obs.json
```

The facts that matter for this scenario: the bucket is `compliance`-tagged (`soc2`), and the three protections — `versioning`, `object_lock`, `logging` — are all `enabled: false`. The rest (KMS encryption, `BucketOwnerEnforced` ownership) is already compliant, so it produces no findings.

Scaling past one bucket

The per-resource `jq` projection above is right for one bucket. For a whole estate with many accounts and asset types, [Steampipe](https://steampipe.io) with Stave's declarative `contracts/steampipe/*.yaml` mappings scales better than per-resource `jq` — it queries your whole estate as SQL and projects each resource into `obs.v0.1` with no per-resource code. See [Building Extractors](/docs/how-to/integration/building-extractors.md).

## Step 2 — The controls[​](#step-2--the-controls "Direct link to Step 2 — The controls")

You don't manage control files. Stave's built-in catalog already contains the three controls this scenario needs — they fire automatically against any `aws_s3_bucket` asset:

| Control                           | Detects                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| `CTL.S3.LOG.001` (**medium**)     | Bucket without server access logging — no audit trail                 |
| `CTL.S3.LOCK.001` (**medium**)    | A *compliance-tagged* bucket without Object Lock (WORM)               |
| `CTL.S3.VERSION.001` (**medium**) | Bucket without versioning — deleted/overwritten objects unrecoverable |

## Step 3 — Evaluate[​](#step-3--evaluate "Direct link to Step 3 — Evaluate")

Run `apply` against the built-in catalog — no `--controls` flag, no local `controls/` directory:

```
$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 3
```

Without `--format`, `apply` prints a **scannable table** — one row per finding, sorted so a human can triage at a glance; `--format json` (used here) emits the full detail that pipes cleanly into `jq`, CI gates, or a ticket-tracking tool.

```
{
  "summary": { "total_assets": 1, "exposed_resources": 1, "violations": 3 },
  "status": "NON_COMPLIANT"
}
```

Exit code 3 means success, not failure

`stave apply` returns **exit 3** when it runs to completion and finds violations. That is the tool doing its job. The exit codes are: **0** = compliant, **2** = input error, **3** = violations found, **4** = internal error. A `3` is a *result*, not a crash — in CI you gate on it; in the lab it's your signal that Stave caught the misconfiguration you planted.

This snapshot models only the data-protection fields, so the access-control fields that *other* S3 controls read are absent — deliberately partial. That doesn't affect this verdict; a missing field can never silently hide a finding. (Run with `-v` to see which fields Stave noted as absent.)

### Read the findings[​](#read-the-findings "Direct link to Read the findings")

Three findings, all on the one bucket, scored independently:

* **`CTL.S3.LOG.001` — Access Logging Required** (medium, `exposure_score: 75`). Fired on `storage.kind eq "bucket"` and `storage.logging.enabled eq false`. The score is the highest of the three — base 50 × a 1.5× blast multiplier — because losing the audit trail blinds every later investigation.
* **`CTL.S3.LOCK.001` — Compliance-Tagged Buckets Must Have Object Lock Enabled** (medium, `exposure_score: 50`). Fired on `storage.object_lock.enabled eq false` **and** `storage.tags.compliance present` (`soc2`). Note the dependency: the compliance tag is what makes Object Lock mandatory — an untagged scratch bucket wouldn't trip this control.
* **`CTL.S3.VERSION.001` — Versioning Required** (medium, `exposure_score: 50`). Fired on `storage.versioning.enabled eq false`. Without versioning, an attacker's `DeleteObject` is permanent.

Each `reasoning_trace` shows the exact predicates; each `remediation` gives the concrete fix; and the `coverage_posture` block shows all three map to `covered` Prowler S3 checks.

## Step 4 — Fix it, then re-capture[​](#step-4--fix-it-then-re-capture "Direct link to Step 4 — Fix it, then re-capture")

**Stave evaluates the snapshot file, not live AWS.** Fixing the real bucket changes nothing in Stave until you re-capture, because the verdict is a deterministic function of the snapshot.

Fix the bucket (in a real account):

```
# Object Lock can only be enabled at bucket creation — re-create the bucket
# with --object-lock-enabled-for-bucket, re-apply both tags, and migrate the
# objects. (The data-classification tag must survive the re-creation, or a
# tag-governance control fires.)
aws s3api put-bucket-versioning --bucket lab4-sensitive-backups-57505 \
  --versioning-configuration Status=Enabled --profile $PROFILE
aws s3api put-bucket-logging --bucket lab4-sensitive-backups-57505 \
  --bucket-logging-status file://logging.json --profile $PROFILE
```

Then **re-capture the snapshot** so it reflects the new state — don't hand-edit the JSON. In production the loop is `fix → re-run your collector/extractor → re-evaluate`, so re-run the *same* capture + `jq` projection from Step 1 against the now-fixed bucket. Object Lock was set at re-creation, so the `get-object-lock-configuration` call now succeeds instead of erroring:

```
BUCKET=lab4-sensitive-backups-57505

aws s3api get-bucket-tagging            --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/tags.json       || echo '{}' > raw/tags.json
aws s3api get-bucket-ownership-controls --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/ownership.json || echo '{}' > raw/ownership.json
aws s3api get-bucket-encryption         --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/encryption.json || echo '{}' > raw/encryption.json
aws s3api get-bucket-versioning         --bucket "$BUCKET" --profile $PROFILE > raw/versioning.json
aws s3api get-object-lock-configuration --bucket "$BUCKET" --profile $PROFILE 2>/dev/null > raw/objectlock.json || echo '{}' > raw/objectlock.json
aws s3api get-bucket-logging            --bucket "$BUCKET" --profile $PROFILE > raw/logging.json

jq -n \
  --arg bucket "$BUCKET" \
  --slurpfile tags raw/tags.json \
  --slurpfile own  raw/ownership.json \
  --slurpfile enc  raw/encryption.json \
  --slurpfile ver  raw/versioning.json \
  --slurpfile lock raw/objectlock.json \
  --slurpfile log  raw/logging.json \
  '
  ($tags[0].TagSet // []) as $tagset
  | (reduce $tagset[] as $t ({}; .[$t.Key] = $t.Value)) as $tagmap
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab4-jq-extract" },
      captured_at: "2026-06-18T00:00:00Z",
      source: "deployed",
      assets: [ {
        id: $bucket,
        type: "aws_s3_bucket",
        vendor: "aws",
        properties: { storage: {
          kind: "bucket",
          tags: $tagmap,
          object_ownership: { rule: ($own[0].OwnershipControls.Rules[0].ObjectOwnership // null) },
          encryption:       { algorithm: ($enc[0].ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm // null) },
          versioning:  { enabled: (($ver[0].Status // "") == "Enabled") },
          object_lock: { enabled: (($lock[0].ObjectLockConfiguration.ObjectLockEnabled // "") == "Enabled") },
          logging:     { enabled: ($log[0].LoggingEnabled != null) }
        } }
      } ]
    }' > observations/lab4.obs.json
```

```
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

`status: COMPLIANT`, **exit 0**. The `input_hashes` value for `lab4.obs.json` is now different from the first run — proof Stave evaluated the new state. Re-run *without* re-capturing and you'll get exit 3 again with an identical `input_hash`: the tell that nothing was re-captured.

## What you learned[​](#what-you-learned "Direct link to What you learned")

* **"Backed up" is three settings, not one.** Versioning (recover), Object Lock (prevent deletion), and logging (investigate) are the difference between a ransomware nuisance and total loss. Stave checks all three, and a compliance tag makes Object Lock mandatory.
* **Exit 3 is the success signal.** `stave apply` finishing with violations is the tool working — `0`/`2`/`3`/`4` are outcomes, not pass/fail.
* **Stave evaluates a captured snapshot deterministically.** A live fix is invisible until you re-capture; the `input_hashes` value tells you whether you did. The loop is always **fix → re-capture → re-evaluate**.

## Next steps[​](#next-steps "Direct link to Next steps")

* [Shadow Admin Compute Role Privilege Drift](/docs/labs/shadow-admin-compute-role-privilege-drift.md) — IAM over-permission and drift.
* [Cognito Unauthenticated S3 Takeover](/docs/labs/cognito-unauthenticated-s3-takeover.md) — the snapshot model, end to end.
* [Building Extractors](/docs/how-to/integration/building-extractors.md) — automate the re-capture step by generating `obs.v0.1` from live AWS.
