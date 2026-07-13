---
title: "Cross-Account KMS Key Policy & CMK Isolation"
sidebar_label: "Cross-Account KMS"
sidebar_position: 12
description: "Detect a KMS key whose policy opens broad, unconditioned cross-account access — a wildcard principal and an excessive sharing blast radius. Read all three findings, learn why exit 3 means success, and fix-then-recapture to green."
---

# Cross-Account KMS Key Policy & CMK Isolation

For a KMS Customer Managed Key, the **key policy is the primary authorization
boundary** — not IAM. If the key encrypts PHI, financial records, or backups, its
policy is the last wall between an attacker and the plaintext. So when that policy
grants a wildcard principal, or unconditioned cross-account `Decrypt`, or sharing
across a long list of external accounts, a compromise of *any* of those accounts —
or of the local account — decrypts everything the key protects.

This tutorial models a CMK with all three defects at once and detects them with
Stave:

1. A **wildcard principal** (`Principal: "*"`) on a `kms:Decrypt` statement.
2. **Broad cross-account access** with no `kms:CallerAccount` / `aws:PrincipalOrgID`
   condition.
3. An **excessive sharing blast radius** — the key shared with too many external
   accounts.

Adapted from a Stave CTF validation lab; every command and result below is
verified against the real binary.

## What you'll learn

- How to model a KMS key's policy posture as an `obs.v0.1` snapshot.
- How Stave catches three distinct key-policy defects in one pass.
- **Why exit code 3 is a success, not a failure.**
- The snapshot model: why you re-capture after a fix — and the real-world KMS
  gotcha that bites the live fix.

## Prerequisites

- A built `stave` binary (`cd stave && make build`; check with `stave version`).
- An AWS CLI **sandbox** profile (never production).
- Deploy the scenario from **Lab 5 — Cross-Account KMS** (`ctf/labs/lab5_cross_account_kms.md` in the repo)
  (Section 2) first — this tutorial captures and evaluates that real deployment.

```bash
mkdir -p kms-isolation && cd kms-isolation
mkdir -p observations
STAVE_DIR=~/work/bizacademy/stave   # adjust to your clone

# The profile, region, and account id used for the live capture below (matching
# the deployed lab — see ctf/labs/lab5_cross_account_kms.md).
PROFILE=dog
REGION=us-east-1
ACCOUNT_A_ID=$(aws sts get-caller-identity --query Account --output text --profile $PROFILE)
```

## The scenario

`lab5-sensitive-cmk` encrypts the organization's most sensitive objects. To "make
sharing easy," its key policy was written with a `Principal: "*"` `Decrypt`
statement and no account or org condition, and the key was shared with a sprawl of
external accounts. The IAM policies on those accounts look tidy — but **IAM is not
the boundary for KMS.** The key policy is, and it's wide open. An attacker who
lands in any sharing account, or compromises an identity in the local account, can
call `kms:Decrypt` and read the plaintext. Nothing about the bucket, the network,
or the perimeter reveals this; the exposure lives entirely in the key policy.

## Step 1 — Capture the key and project it to a snapshot

In a real project you don't write `obs.v0.1` by hand. You **capture the live KMS
key plus its key policy and project them to `obs.v0.1` with `jq`** — exactly the
way the matching CTF lab (`ctf/labs/lab5_cross_account_kms.md`) and a production
extractor do. The key policy — not IAM — is the authorization boundary for KMS, so
it is the document the controls read, and the normalized flags
(`has_wildcard_principal`, `has_broad_cross_account`, `cross_account.excessive`)
are *derived* from its `Statement`s rather than typed from memory.

Capture the live state into `raw/*.json`, then derive `obs.v0.1` with `jq`.
`get-key-policy` returns the policy as a JSON **string**, so it is parsed with
`fromjson` before the statements are inspected; the asset id is built from the key
**alias** (`lab5-sensitive-cmk`) so it stays stable across redeploys:

```bash
mkdir -p observations raw

# 1. Capture the live state (raw AWS JSON) — key metadata, key (resource)
#    policy, and the alias that points at it.
aws kms describe-key --key-id alias/lab5-sensitive-cmk \
  --profile $PROFILE --region $REGION > raw/describe-key.json
aws kms get-key-policy --key-id alias/lab5-sensitive-cmk --policy-name default \
  --profile $PROFILE --region $REGION > raw/get-key-policy.json
aws kms list-aliases \
  --profile $PROFILE --region $REGION > raw/aliases.json

# 2. Project the captured state into obs.v0.1 with jq. The normalized policy
#    flags are *derived* from the key policy Statements — exactly what an
#    extractor computes.
jq -n \
  --slurpfile key   raw/describe-key.json \
  --slurpfile kp    raw/get-key-policy.json \
  --slurpfile alias raw/aliases.json \
  '
  # Flatten the AWS principals of a statement into a list of strings.
  # Robust to Principal "*" (string) and { "AWS": <arn|[arns]> } (scalar/array).
  def principals($s):
    ($s.Principal) as $p
    | if   $p == "*" then ["*"]
      elif ($p|type)=="object" and ($p.AWS != null) then ([$p.AWS] | flatten)
      else [] end;
  # A statement is "guarded" if it carries a cross-account-scoping condition.
  def guarded($s):
    (($s.Condition // {}) | tostring)
    | test("kms:CallerAccount|aws:PrincipalOrgID|kms:ViaService");
  # Pull the 12-digit account id out of an IAM principal ARN, else null.
  def acctOf($arn):
    ($arn | capture("arn:aws:iam::(?<a>[0-9]{12}):") | .a) // null;

  ($kp[0].Policy | fromjson)                            as $policy
  | $key[0].KeyMetadata                                 as $meta
  | $meta.AWSAccountId                                  as $local
  # Deterministic display id: the alias short name, not the random KeyId.
  | ([ $alias[0].Aliases[]
        | select(.TargetKeyId == $meta.KeyId)
        | .AliasName | sub("^alias/";"") ] | first // $meta.KeyId) as $shortid
  # Allow statements, with Statement robust to array-or-scalar.
  | ([ $policy.Statement | if type=="array" then .[] else . end ]
        | map(select(.Effect=="Allow")))                as $stmts
  # Wildcard principal: any Allow statement with Principal "*" (or {AWS:"*"}).
  | ([ $stmts[] | select( principals(.) | any(. == "*") ) ] | length > 0) as $wildcard
  # Broad cross-account: an unguarded Allow statement granting to a wildcard or
  # an external account (an account id other than the local account).
  | ([ $stmts[]
        | select( guarded(.) | not )
        | select(
            principals(.) | any(
              . == "*"
              or ( (acctOf(.)) as $a | ($a != null and $a != $local) )
            )
          )
     ] | length > 0)                                    as $broad
  # Named external accounts in the policy (excludes the local root).
  | ([ $stmts[] | principals(.)[] | acctOf(.)
        | select(. != null and . != $local) ] | unique) as $extAccounts
  # Excessive blast radius: >5 named external accounts, OR a wildcard principal
  # (a wildcard shares the key with effectively unbounded accounts).
  | (($extAccounts | length) > 5 or $wildcard)          as $excessive
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab5-jq-extract" },
      captured_at: "2026-06-18T00:00:00Z",
      source: "deployed",
      assets: [ {
        id: ("arn:aws:kms:" + ($meta.Arn | split(":")[3]) + ":" + $local + ":key/" + $shortid),
        type: "aws_kms_key",
        vendor: "aws",
        properties: { cryptography: {
          kind: "key",
          origin: $meta.Origin,
          policy: {
            has_broad_cross_account: $broad,
            has_wildcard_principal:  $wildcard
          },
          cross_account: {
            account_ids:   $extAccounts,
            account_count: ($extAccounts | length),
            excessive:     $excessive
          }
        } }
      } ]
    }' > observations/lab5.obs.json
```

The three facts that matter: `policy.has_wildcard_principal`,
`policy.has_broad_cross_account`, and `cross_account.excessive` — each one a
separate control's trigger. The `origin: AWS_KMS` field is read straight from the
key metadata and models the otherwise realistic key (backed by AWS-managed HSMs)
so the built-in catalog returns exactly the three planted findings, not an
unrelated key-material one. `account_ids` is empty here because the insecure policy
shares via a wildcard `Principal "*"` rather than naming accounts — the wildcard is
what drives `excessive`.

:::note Producing this snapshot at estate scale
For a whole estate — many accounts and asset types — [Steampipe](https://steampipe.io) with Stave's declarative `contracts/steampipe/*.yaml` mappings scales better than per-resource `jq`: it queries your whole estate as SQL and projects each resource into `obs.v0.1` with no per-resource code. See [Building Extractors](../how-to/integration/building-extractors.md). This single-resource KMS case is Steampipe-friendly too — the `kms_key` mapping populates the key's own policy directly — but the per-resource `jq` above shows the exact capture→derive step the mapping automates.
:::

## Step 2 — The controls

You don't copy or manage any control files. Stave ships a **built-in catalog**, and
when you run `apply` with no `--controls` flag and no local `controls/` directory,
it evaluates against that catalog automatically — exactly how you'd run it against
your own account every day. Three built-in controls catch this scenario:

| Control | Detects |
|---|---|
| `CTL.KMS.POLICY.001` | Key policy exposes a wildcard principal |
| `CTL.KMS.POLICY.CROSSACCOUNT.001` | Key policy grants broad, unconditioned cross-account access |
| `CTL.KMS.CROSSACCOUNT.BLASTRADIUS.001` | Key shared with an excessive number of external accounts |

## Step 3 — Evaluate

```bash
$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 3
```

Run without `--format` and you get a scannable table — one row per finding, sorted
for triage at a glance; `--format json` (used here) emits the full detail —
findings, reasoning traces, and `input_hashes` — to pipe into `jq` or a
tracking-tool integration.

```json
{
  "schema_version": "out.v0.1",
  "summary": { "total_assets": 1, "exposed_resources": 1, "violations": 3 },
  "status": "NON_COMPLIANT"
}
```

The findings are written to **stdout**; a successful run writes nothing to
**stderr**, so the command pipes cleanly into `jq` or a tracking-tool integration.

:::tip Exit code 3 means success, not failure
`stave apply` returns **exit 3** when it runs to completion and finds violations.
That is the tool doing its job. The exit codes are: **0** = compliant, **2** =
input error, **3** = violations found, **4** = internal error. A `3` is a
*result*, not a crash — in CI you gate on it; in the lab it's your signal that
Stave caught the misconfiguration you planted.
:::

### Read the findings

Three findings, all on the one key, each independent:

- **`CTL.KMS.POLICY.001` — wildcard principal.** Fired on
  `cryptography.policy.has_wildcard_principal eq true`. A `Principal: "*"` on a
  decrypt statement means anyone the rest of the policy doesn't explicitly stop.
- **`CTL.KMS.POLICY.CROSSACCOUNT.001` — broad cross-account.** Fired on
  `cryptography.policy.has_broad_cross_account eq true`. Cross-account decrypt with
  no `kms:CallerAccount` / `aws:PrincipalOrgID` condition trusts the whole world,
  not a named account.
- **`CTL.KMS.CROSSACCOUNT.BLASTRADIUS.001` — excessive blast radius.** Fired on
  `cryptography.cross_account.excessive eq true`. The more external accounts that
  can use the key, the more accounts whose compromise reads your data.

Each `reasoning_trace` shows the exact predicate, and each carries remediation
guidance that maps to the secure key-policy shape.

## Step 4 — Fix it, then re-capture

**Stave evaluates the snapshot file, not live AWS.** Fixing the real key policy
changes nothing in Stave until you re-capture, because the verdict is a
deterministic function of the snapshot.

The secure key policy drops the wildcard, scopes cross-account access to your
dedicated security account, and adds a `kms:CallerAccount` condition:

```bash
ACCOUNT_B_ID=<your-security-account-id>
KEY_ID=$(aws kms describe-key --key-id alias/lab5-sensitive-cmk \
  --profile $PROFILE --region $REGION --query KeyMetadata.KeyId --output text)

cat <<EOF > kms-policy-fixed.json
{ "Version": "2012-10-17", "Statement": [
  { "Sid": "EnableRoot", "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::$ACCOUNT_A_ID:root" }, "Action": "kms:*", "Resource": "*" },
  { "Sid": "ScopedCrossAccountDecrypt", "Effect": "Allow",
    "Principal": { "AWS": "arn:aws:iam::$ACCOUNT_B_ID:root" },
    "Action": ["kms:Decrypt","kms:DescribeKey","kms:GenerateDataKey"], "Resource": "*",
    "Condition": { "StringEquals": { "kms:CallerAccount": "$ACCOUNT_B_ID" } } } ] }
EOF
aws kms put-key-policy --key-id "$KEY_ID" --policy-name default \
  --policy file://kms-policy-fixed.json --profile $PROFILE --region $REGION
```

:::warning KMS validates principals — grant to the account root, not a named role
KMS **checks that the principals in a key policy exist.** Reference a specific role
that doesn't exist yet (`…:role/app-role`) and `put-key-policy` fails with
`MalformedPolicyDocumentException: invalid principals`. Grant to the account root
(`arn:aws:iam::$ACCOUNT_B_ID:root`) — which always validates — and let **Account
B's own IAM** narrow access to specific roles. That is the standard, secure
cross-account KMS pattern, and it applies from a single account's credentials.
:::

Then **re-capture the snapshot** so it reflects the new state — don't hand-edit the
flags. In production this is your collector re-running (`fix → re-run collector →
re-evaluate`). Re-run the **exact same capture + `jq`** from Step 1 against the
now-fixed key: `put-key-policy` replaced the policy in place, so `get-key-policy`
returns the scoped document and the same `jq` derives the safe flags:

```bash
# Re-capture the live key policy (now scoped) and re-derive obs.v0.1.
aws kms describe-key --key-id alias/lab5-sensitive-cmk \
  --profile $PROFILE --region $REGION > raw/describe-key.json
aws kms get-key-policy --key-id alias/lab5-sensitive-cmk --policy-name default \
  --profile $PROFILE --region $REGION > raw/get-key-policy.json
aws kms list-aliases \
  --profile $PROFILE --region $REGION > raw/aliases.json

# Same jq projection as Step 1 — re-run it verbatim against the new raw/*.json.
# (Reproduced here so this step is copy-paste runnable.)
jq -n \
  --slurpfile key   raw/describe-key.json \
  --slurpfile kp    raw/get-key-policy.json \
  --slurpfile alias raw/aliases.json \
  '
  def principals($s):
    ($s.Principal) as $p
    | if   $p == "*" then ["*"]
      elif ($p|type)=="object" and ($p.AWS != null) then ([$p.AWS] | flatten)
      else [] end;
  def guarded($s):
    (($s.Condition // {}) | tostring)
    | test("kms:CallerAccount|aws:PrincipalOrgID|kms:ViaService");
  def acctOf($arn):
    ($arn | capture("arn:aws:iam::(?<a>[0-9]{12}):") | .a) // null;

  ($kp[0].Policy | fromjson)                            as $policy
  | $key[0].KeyMetadata                                 as $meta
  | $meta.AWSAccountId                                  as $local
  | ([ $alias[0].Aliases[]
        | select(.TargetKeyId == $meta.KeyId)
        | .AliasName | sub("^alias/";"") ] | first // $meta.KeyId) as $shortid
  | ([ $policy.Statement | if type=="array" then .[] else . end ]
        | map(select(.Effect=="Allow")))                as $stmts
  | ([ $stmts[] | select( principals(.) | any(. == "*") ) ] | length > 0) as $wildcard
  | ([ $stmts[]
        | select( guarded(.) | not )
        | select(
            principals(.) | any(
              . == "*"
              or ( (acctOf(.)) as $a | ($a != null and $a != $local) )
            )
          )
     ] | length > 0)                                    as $broad
  | ([ $stmts[] | principals(.)[] | acctOf(.)
        | select(. != null and . != $local) ] | unique) as $extAccounts
  | (($extAccounts | length) > 5 or $wildcard)          as $excessive
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab5-jq-extract" },
      captured_at: "2026-06-18T00:00:00Z",
      source: "deployed",
      assets: [ {
        id: ("arn:aws:kms:" + ($meta.Arn | split(":")[3]) + ":" + $local + ":key/" + $shortid),
        type: "aws_kms_key",
        vendor: "aws",
        properties: { cryptography: {
          kind: "key",
          origin: $meta.Origin,
          policy: {
            has_broad_cross_account: $broad,
            has_wildcard_principal:  $wildcard
          },
          cross_account: {
            account_ids:   $extAccounts,
            account_count: ($extAccounts | length),
            excessive:     $excessive
          }
        } }
      } ]
    }' > observations/lab5.obs.json
```

Re-evaluate against the re-captured snapshot:

```bash
$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 0
```

```json
{
  "summary": { "total_assets": 1, "exposed_resources": 0, "violations": 0 },
  "status": "COMPLIANT",
  "findings": []
}
```

`status: COMPLIANT`, **exit 0**. The `input_hashes` value for `lab5.obs.json` is
now different from the first run — proof Stave evaluated the new state. Re-run
*without* re-capturing and you'll get exit 3 again with an identical `input_hash`:
the tell that nothing was re-captured.

## What you learned

- **For KMS, the key policy is the boundary — not IAM.** Three independent defects
  (wildcard principal, unconditioned cross-account, excessive blast radius) each
  open the cryptographic wall; Stave models and scores them separately.
- **The secure shape is scoped + conditioned.** Grant cross-account access to a
  specific account (via its root) with a `kms:CallerAccount` condition, and let
  that account's IAM do the fine-grained narrowing.
- **Exit 3 is the success signal**, and **Stave evaluates a captured snapshot
  deterministically** — a live fix is invisible until you re-capture. The loop is
  always **fix → re-capture → re-evaluate**.

## Next steps

- [SadCloud — Multi-Service Misconfiguration Sweep](sadcloud-multi-service-validation.md) — evaluate a whole 22-service vulnerable estate at once and read the scorecard.
- [S3 Ransomware Protection & Forensic Auditability](s3-ransomware-protection-forensic-auditability.md) — the backup-integrity trio.
- [Shadow Admin Compute Role Privilege Drift](shadow-admin-compute-role-privilege-drift.md) — IAM over-permission and drift.
- [Building Extractors](../how-to/integration/building-extractors.md) — automate the re-capture step by generating `obs.v0.1` from live AWS.
