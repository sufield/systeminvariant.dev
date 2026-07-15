# Shadow Admin Compute Role Privilege Drift

A compute role is the quietest way to lose an AWS account. An EC2 instance in a public subnet gets popped through an SSRF or RCE bug; the attacker queries the Instance Metadata Service (IMDS), lifts the instance profile's temporary credentials, and inherits **every permission that role holds** — including the ones nobody remembers granting. This tutorial captures two versions of that problem from a real deployment and detects both with Stave:

1. **`lab3-ec2-backend-role`** — granted `kms:*` and `cloudtrail:*` on `Resource: "*"`. Service-wildcard "admin of one service" grants that let a compromised instance tamper with keys and audit trails.
2. **`lab3-ec2-backend-role-drift`** — live for over a year and quietly accumulating access to services it no longer uses. The hidden blast radius an attacker inherits the moment the role is compromised.

Adapted from a Stave CTF validation lab; every command and result below is verified against the real binary.

## What you'll learn[​](#what-youll-learn "Direct link to What you'll learn")

* How to capture an IAM role's permissions and permission *drift* into an `obs.v0.1` snapshot — deriving the computed fields with `jq`.
* How Stave catches two different IAM failure modes — explicit over-permission and silent drift — in one pass.
* **Why exit code 3 is a success, not a failure** — the single most common point of confusion for new users.
* The snapshot model: why you re-capture after a fix.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* A built `stave` binary (`cd stave && make build`; check with `stave version`).
* An AWS CLI **sandbox** profile (never production) with `iam:GetRole`, `iam:ListRolePolicies`, `iam:GetRolePolicy`, and `iam:GenerateServiceLastAccessedDetails` / `iam:GetServiceLastAccessedDetails` permissions, plus `jq`.
* Deploy the scenario from **Lab 3 — Shadow Admin Compute Role Privilege Drift** (`ctf/labs/lab3_shadow_admin_drift.md` in the repo) (Section 2) first — this tutorial captures and evaluates that real deployment.

```
mkdir -p shadow-admin-drift && cd shadow-admin-drift
mkdir -p observations
STAVE_DIR=~/work/bizacademy/stave   # adjust to your clone
```

## The scenario[​](#the-scenario "Direct link to The scenario")

A backend service runs on EC2. To "just make it work," someone attached a role with `kms:*` and `cloudtrail:*` — full authority over two of the highest-blast-radius services in the account. KMS wildcard lets an attacker schedule key deletion, re-encrypt, or disable keys. CloudTrail wildcard lets them `StopLogging` and `DeleteTrail` — turning off the very audit trail that would catch them.

Next to it sits a sibling role that has been alive for a year. It was scoped reasonably once, but services came and went, and now it carries access to a long tail of namespaces it hasn't touched in months. AWS Access Advisor knows exactly which — and Stave reads that as an operational fact, not a guess.

The bucket policy, the security group, the WAF — none of them see either problem. The exposure lives entirely inside IAM.

## Step 1 — Capture the two roles into a snapshot[​](#step-1--capture-the-two-roles-into-a-snapshot "Direct link to Step 1 — Capture the two roles into a snapshot")

You don't hand-write `obs.v0.1`. In a real project you **capture the two roles — their inline policies, trust relationship, and age — plus their Access Advisor data, and derive the snapshot with `jq`** (exactly what the matching CTF lab does, and what a production extractor does). Three of the fields are **computed, not read from a single AWS field**:

* `service_wildcards_granted` — a *policy walk*: the services granted `<svc>:*` on `Resource: "*"`.
* `role_age_days` — *date math* on the role's `CreateDate`.
* `permission_drift.threshold_exceeded` — an *Access Advisor unused-service ratio*: services the role can reach but no longer uses (no `LastAuthenticated` timestamp = never used) over total, compared against a drift threshold.

Capture the live state of both roles into `raw/`:

```
PROFILE=dog
ROLE=lab3-ec2-backend-role
DRIFT_ROLE=lab3-ec2-backend-role-drift
DRIFT_THRESHOLD=0.5   # unused-service ratio above which permission drift fires

mkdir -p observations raw

# Role A (lab3-ec2-backend-role): the role (compute trust) + its inline policy.
aws iam get-role --role-name "$ROLE" --profile $PROFILE > raw/role1-get-role.json
aws iam list-role-policies --role-name "$ROLE" --profile $PROFILE > raw/role1-policies.json
R1_POLICY=$(jq -r '.PolicyNames[0]' raw/role1-policies.json)
aws iam get-role-policy --role-name "$ROLE" --policy-name "$R1_POLICY" \
  --profile $PROFILE > raw/role1-policy.json

# Role B (the drift sibling): the role (CreateDate + tags) + its Access Advisor
# service-last-accessed report. The report is async — poll until COMPLETED.
aws iam get-role --role-name "$DRIFT_ROLE" --profile $PROFILE > raw/role2-get-role.json
JOB_ID=$(aws iam generate-service-last-accessed-details \
  --arn "$(jq -r '.Role.Arn' raw/role2-get-role.json)" \
  --query JobId --output text --profile $PROFILE)
until aws iam get-service-last-accessed-details --job-id "$JOB_ID" --profile $PROFILE \
        > raw/role2-access-advisor.json \
      && [ "$(jq -r '.JobStatus' raw/role2-access-advisor.json)" = "COMPLETED" ]; do
  sleep 2
done
```

Then project the captured state into `obs.v0.1` with `jq`. Every normalized field below is *derived* from the raw AWS output — the policy walk, the `CreateDate` math, and the Access Advisor ratio are all done here, exactly as an extractor computes them:

```
jq -n \
  --slurpfile r1role raw/role1-get-role.json \
  --slurpfile r1pol  raw/role1-policy.json \
  --slurpfile r2role raw/role2-get-role.json \
  --slurpfile r2aa   raw/role2-access-advisor.json \
  --arg now "2026-06-18T00:00:00Z" \
  --argjson drift_threshold "$DRIFT_THRESHOLD" \
  '
  # Normalize AWS array-or-scalar quirks (Action/Resource/Statement/Service).
  def arr: if type=="array" then . else [.] end;

  # Role A: service wildcards = services with "<svc>:*" Action on Resource "*".
  ($r1pol[0].PolicyDocument.Statement | arr | map(select(.Effect=="Allow"))) as $r1st
  | ([ $r1st[]
        | (.Resource | arr) as $res
        | select(any($res[]; . == "*"))
        | (.Action | arr)[]
        | select(endswith(":*"))
        | sub(":\\*$";"")
     ] | unique) as $r1_wildcards
  # Role A trust: compute trust if any Principal.Service is a compute service.
  | ([ $r1role[0].Role.AssumeRolePolicyDocument.Statement | arr | .[]
        | (.Principal.Service // empty) | arr | .[] ]) as $r1_trust_svcs
  | ($r1_trust_svcs
      | any(. as $s
            | ["ec2.amazonaws.com","lambda.amazonaws.com","ecs-tasks.amazonaws.com","ecs.amazonaws.com"]
            | index($s))) as $r1_compute_trust

  # Role B: role_age_days from CreateDate vs the pinned capture date.
  | (($now | fromdateiso8601) - ($r2role[0].Role.CreateDate | fromdateiso8601)) as $r2_age_secs
  | (($r2_age_secs / 86400) | floor) as $r2_age_days
  # Role B tags: AWS [{Key,Value}] list -> {key: value} object.
  | ([ $r2role[0].Role.Tags[]? | { (.Key): .Value } ] | add // {}) as $r2_tags
  # Role B drift: unused = service with no LastAuthenticated; ratio = unused/total.
  | ($r2aa[0].ServicesLastAccessed) as $r2_svcs
  | ($r2_svcs | length) as $r2_total
  | ([ $r2_svcs[] | select((.LastAuthenticated // null) == null) ] | length) as $r2_unused
  | (if $r2_total > 0 then ($r2_unused / $r2_total) else 0 end) as $r2_ratio
  | (($r2_ratio > $drift_threshold) and ($r2aa[0].JobStatus == "COMPLETED")) as $r2_exceeded

  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab3-jq-extract" },
      captured_at: $now,
      source: "deployed",
      assets: [
        {
          id: $r1role[0].Role.Arn,
          type: "aws_iam_role",
          vendor: "aws",
          properties: { identity: {
            kind: "role",
            policies: { service_wildcards_granted: $r1_wildcards },
            trust_policy: { has_compute_trust: $r1_compute_trust }
          } }
        },
        {
          id: $r2role[0].Role.Arn,
          type: "aws_iam_role",
          vendor: "aws",
          properties: { identity: {
            kind: "iam_role",
            role_age_days: $r2_age_days,
            tags: $r2_tags,
            access_advisor: { available: ($r2aa[0].JobStatus == "COMPLETED") },
            permission_drift: {
              unused_service_ratio: (($r2_ratio * 100 | round) / 100),
              threshold_override: null,
              threshold_exceeded: $r2_exceeded
            }
          } }
        }
      ]
    }' > observations/lab3.obs.json
```

That capture writes `observations/lab3.obs.json` straight from the deployed account — nothing is hand-authored. The two facts that matter for the first role: `policies.service_wildcards_granted` lists the services granted `<service>:*` on `Resource: "*"` (the policy walk surfaces `cloudtrail` and `kms` from the deployed wildcard policy). For the second: `role_age_days` is the `CreateDate` math and `permission_drift.threshold_exceeded` is the Access Advisor unused-service ratio compared against the 0.5 threshold — the role is old *and* has drifted past its unused-permission threshold, the combination that makes drift actionable rather than noise.

Producing this snapshot in the real world

For a whole estate — many accounts and asset types — [Steampipe](https://steampipe.io) with Stave's declarative `contracts/steampipe/*.yaml` mappings scales better than per-resource `jq`. See [Building Extractors](/docs/how-to/integration/building-extractors.md). Note, though, that IAM permission drift and service-wildcards are `derived_properties` in the `iam_role` mapping — Access Advisor polling and policy analysis are the collector's job, not something a SQL projection expresses — so the capture + `jq` shown above is the right tool for *this* resource. The controls, findings, and fix → re-capture loop below are identical no matter how the snapshot was produced.

## Step 2 — The controls[​](#step-2--the-controls "Direct link to Step 2 — The controls")

You don't manage control files. Stave ships a **built-in catalog**, and when you run `apply` with no `--controls` flag and no local `controls/` directory, it evaluates against that catalog automatically — exactly how you'd run it against your own account every day. Two built-in controls catch this scenario:

| Control                                         | Detects                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `CTL.IAM.POLICY.SERVICEWILDCARD.001` (**high**) | A principal with `<service>:*` on `Resource: "*"` for a denied-list service (kms, cloudtrail, aws-marketplace) |
| `CTL.IAM.ROLE.PERMISSIONDRIFT.001` (**high**)   | A role active >90 days that has accumulated access to services it never uses, past the drift threshold         |

## Step 3 — Evaluate[​](#step-3--evaluate "Direct link to Step 3 — Evaluate")

```
$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 3
```

Running without `--format` gives a scannable table — one row per finding, sorted for triage at a glance — while `--format json` (used here) emits the full detail for piping into `jq` or a ticketing/tracking-tool integration.

```
{
  "summary": { "total_assets": 2, "exposed_resources": 2, "violations": 2 },
  "status": "NON_COMPLIANT"
}
```

Exit code 3 means success, not failure

`stave apply` returns **exit 3** when it runs to completion and finds violations. That is the tool doing its job — it evaluated the snapshot and reported what it found. The exit codes are: **0** = compliant, **2** = input error, **3** = violations found, **4** = internal error. A `3` is a *result*, not a crash. In CI you gate on it (`stave apply ... || handle-violations`); in the lab it's your signal that Stave caught the misconfiguration you planted.

This snapshot is deliberately partial — it omits some `aws_iam_role` fields that *other* IAM controls read (e.g. `trust_policy.has_cross_account_trust`). That doesn't affect this verdict; a missing field can never silently hide a finding. (Run with `-v` to see which fields Stave noted as absent.)

### Read the findings[​](#read-the-findings "Direct link to Read the findings")

Stave returns two findings, scored independently.

**Permission drift — `CTL.IAM.ROLE.PERMISSIONDRIFT.001`** (severity high, `exposure_score: 100`) on `lab3-ec2-backend-role-drift`. The `reasoning_trace` shows all four predicates that fired — `access_advisor.available eq true`, `kind eq "iam_role"`, `permission_drift.threshold_exceeded eq true`, and `role_age_days gt 90` (observed 365). The score reaches 100 from a base of 75 times a 1.5× blast multiplier: a drifted compute role is a wide lateral-movement surface. The remediation is concrete — review the unused namespaces Access Advisor flagged, remove what's no longer needed, or tag a justified exception with `stave/permission-drift-threshold`.

**Service wildcard — `CTL.IAM.POLICY.SERVICEWILDCARD.001`** (severity high, `exposure_score: 75`) on `lab3-ec2-backend-role`. Its `reasoning_trace` fired on `kind in [user role]` and `service_wildcards_granted` being present with `["kms", "cloudtrail"]`. The remediation tells you exactly what to do: replace `<service>:*` with the minimum actions needed (e.g. `cloudtrail:LookupEvents`, or `kms:Decrypt` + `kms:GenerateDataKey`) and narrow `Resource` from `"*"` to specific ARNs.

Each finding is grouped into its own **issue** (they live on different roles and share no root cause), and the `coverage_posture` block shows how these map to Prowler's IAM checks — the wildcard finding is `covered`, the drift finding is `partial` (Prowler has generic staleness checks but no exact drift threshold).

## Step 4 — Fix it, then re-capture[​](#step-4--fix-it-then-re-capture "Direct link to Step 4 — Fix it, then re-capture")

This is the step that surprises newcomers. **Stave evaluates the snapshot file, not live AWS.** Fixing the real role changes nothing in Stave until you re-capture, because the verdict is a deterministic function of the snapshot — the same property that makes a Stave result reproducible and safe to attest to.

Fix both roles (in a real account): replace the wildcard grant with least-privilege, scoped actions, and trim the drifted role's unused service permissions so Access Advisor's unused-service ratio falls back under threshold.

```
# Role A: swap the service-wildcard policy for a scoped one
aws iam delete-role-policy --role-name lab3-ec2-backend-role \
  --policy-name ServiceWildcard --profile $PROFILE
aws iam put-role-policy --role-name lab3-ec2-backend-role \
  --policy-name ScopedAccess --policy-document file://scoped-policy.json --profile $PROFILE
# Role B (drift): remove permissions for the services Access Advisor flags as
# never/long-unused. (IAM Access Analyzer can generate a least-privilege policy.)
```

Then **re-capture the snapshot** so it reflects the new state — you don't hand-edit the JSON. The loop is **fix → re-run your collector/extractor → re-evaluate**, so just re-run the same capture + `jq` from Step 1 against the now-fixed roles. With the wildcard policy replaced, the policy walk derives `service_wildcards_granted` to `[]`; once Access Advisor reflects the trimmed permissions, the unused-service ratio drops below `DRIFT_THRESHOLD` and `threshold_exceeded` derives to `false`:

```
# Re-capture role A's policy (now ScopedAccess) and role B's Access Advisor report.
aws iam list-role-policies --role-name "$ROLE" --profile $PROFILE > raw/role1-policies.json
R1_POLICY=$(jq -r '.PolicyNames[0]' raw/role1-policies.json)
aws iam get-role-policy --role-name "$ROLE" --policy-name "$R1_POLICY" \
  --profile $PROFILE > raw/role1-policy.json

JOB_ID=$(aws iam generate-service-last-accessed-details \
  --arn "$(jq -r '.Role.Arn' raw/role2-get-role.json)" \
  --query JobId --output text --profile $PROFILE)
until aws iam get-service-last-accessed-details --job-id "$JOB_ID" --profile $PROFILE \
        > raw/role2-access-advisor.json \
      && [ "$(jq -r '.JobStatus' raw/role2-access-advisor.json)" = "COMPLETED" ]; do
  sleep 2
done

# Re-run the exact Step 1 jq extraction over the fresh raw/ — same command, new state.
jq -n \
  --slurpfile r1role raw/role1-get-role.json \
  --slurpfile r1pol  raw/role1-policy.json \
  --slurpfile r2role raw/role2-get-role.json \
  --slurpfile r2aa   raw/role2-access-advisor.json \
  --arg now "2026-06-18T00:00:00Z" \
  --argjson drift_threshold "$DRIFT_THRESHOLD" \
  '
  def arr: if type=="array" then . else [.] end;
  ($r1pol[0].PolicyDocument.Statement | arr | map(select(.Effect=="Allow"))) as $r1st
  | ([ $r1st[]
        | (.Resource | arr) as $res
        | select(any($res[]; . == "*"))
        | (.Action | arr)[]
        | select(endswith(":*"))
        | sub(":\\*$";"")
     ] | unique) as $r1_wildcards
  | ([ $r1role[0].Role.AssumeRolePolicyDocument.Statement | arr | .[]
        | (.Principal.Service // empty) | arr | .[] ]) as $r1_trust_svcs
  | ($r1_trust_svcs
      | any(. as $s
            | ["ec2.amazonaws.com","lambda.amazonaws.com","ecs-tasks.amazonaws.com","ecs.amazonaws.com"]
            | index($s))) as $r1_compute_trust
  | (($now | fromdateiso8601) - ($r2role[0].Role.CreateDate | fromdateiso8601)) as $r2_age_secs
  | (($r2_age_secs / 86400) | floor) as $r2_age_days
  | ([ $r2role[0].Role.Tags[]? | { (.Key): .Value } ] | add // {}) as $r2_tags
  | ($r2aa[0].ServicesLastAccessed) as $r2_svcs
  | ($r2_svcs | length) as $r2_total
  | ([ $r2_svcs[] | select((.LastAuthenticated // null) == null) ] | length) as $r2_unused
  | (if $r2_total > 0 then ($r2_unused / $r2_total) else 0 end) as $r2_ratio
  | (($r2_ratio > $drift_threshold) and ($r2aa[0].JobStatus == "COMPLETED")) as $r2_exceeded
  | {
      schema_version: "obs.v0.1",
      generated_by: { source_type: "lab3-jq-extract" },
      captured_at: $now,
      source: "deployed",
      assets: [
        { id: $r1role[0].Role.Arn, type: "aws_iam_role", vendor: "aws",
          properties: { identity: {
            kind: "role",
            policies: { service_wildcards_granted: $r1_wildcards },
            trust_policy: { has_compute_trust: $r1_compute_trust } } } },
        { id: $r2role[0].Role.Arn, type: "aws_iam_role", vendor: "aws",
          properties: { identity: {
            kind: "iam_role",
            role_age_days: $r2_age_days,
            tags: $r2_tags,
            access_advisor: { available: ($r2aa[0].JobStatus == "COMPLETED") },
            permission_drift: {
              unused_service_ratio: (($r2_ratio * 100 | round) / 100),
              threshold_override: null,
              threshold_exceeded: $r2_exceeded } } } }
      ]
    }' > observations/lab3.obs.json

$STAVE_DIR/stave apply --observations ./observations \
  --eval-time 2026-06-18T00:00:00Z --format json
echo $?   # 0
```

The re-captured snapshot now derives `service_wildcards_granted` to `[]` and `permission_drift.threshold_exceeded` to `false`, so `stave apply` returns exit 0:

```
{
  "summary": { "total_assets": 2, "exposed_resources": 0, "violations": 0 },
  "status": "COMPLIANT",
  "findings": []
}
```

`status: COMPLIANT`, **exit 0**. The `input_hashes` value for `lab3.obs.json` is now different from the first run — proof Stave evaluated the new state, not the old snapshot. If you re-run *without* re-capturing, you'll get exit 3 again and an identical `input_hash`: the tell that nothing was re-captured.

## What you learned[​](#what-you-learned "Direct link to What you learned")

* **A compute role's blast radius is two problems, not one.** Explicit over-permission (service wildcards) and silent drift (accumulated unused access) are different failure modes; Stave models and scores them separately.
* **Exit 3 is the success signal.** `stave apply` finishing with violations is the tool working — `0`/`2`/`3`/`4` are outcomes, not pass/fail. Gate on it in CI; read it as "caught it" in a lab.
* **Stave evaluates a captured snapshot deterministically.** A live fix is invisible until you re-capture; the `input_hashes` value tells you whether you did. The loop is always **fix → re-capture → re-evaluate**.

## Next steps[​](#next-steps "Direct link to Next steps")

* [Cognito Unauthenticated S3 Takeover](/docs/labs/cognito-unauthenticated-s3-takeover.md) — the snapshot model, end to end.
* [S3 Public Exposure & Long-Lived IAM Keys](/docs/labs/s3-public-exposure-long-lived-iam-keys.md) — the S3 + IAM walkthrough.
* [Building Extractors](/docs/how-to/integration/building-extractors.md) — automate the re-capture step by generating `obs.v0.1` from live AWS.
