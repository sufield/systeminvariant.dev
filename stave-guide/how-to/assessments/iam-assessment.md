---
sidebar_position: 2
---
# How to Run an IAM Security Assessment

Evaluate AWS IAM configuration against 38 controls covering identity,
credential lifecycle, privilege escalation, and monitoring.

## Prerequisites

- Stave binary built (`cd stave && make build`)
- IAM observations in `obs.v0.1` format (see observation shapes below)

## 1) Extract IAM observations

Use an extractor to produce `obs.v0.1` JSON from AWS IAM APIs.
The extractor must call:

| AWS API | What it produces | Controls that need it |
|---------|-----------------|----------------------|
| `iam list-users` + `get-credential-report` | User metadata, last activity | CRED.UNUSED, CRED.ROTATION, ACCOUNT.INACTIVE |
| `iam list-attached-user-policies` + `get-policy-version` | Policy documents | POLICY.ADMIN, POLICY.ESCALATION, PASSROLE, COMPLEXITY |
| `iam list-mfa-devices` + `list-virtual-mfa-devices` | MFA device types | ROOT.MFA, CONSOLE.MFA, MFA.HWKEY |
| `iam list-roles` | Role metadata + boundary | BOUNDARY |
| `iam get-account-password-policy` | Password policy | PASSWORD.LENGTH, PASSWORD.REUSE, PASSWORD.COMPLEXITY |
| `accessanalyzer list-analyzers` | Analyzer status per region | ANALYZER |
| `organizations list-policies` | SCP listing | SCP.FULLACCESS |
| `logs describe-metric-filters` | CloudWatch metric filters | CLOUDWATCH.MONITOR.MFADEVICE |

## 2) Evaluate observations against the IAM control pack

```bash
stave apply \
  --controls controls/iam \
  --observations ./iam-obs/ \
  --max-unsafe 168h \
  --eval-time 2026-01-15T00:00:00Z \
  --format json > iam-findings.json
```

Exit code `3` means violations found.

## 3) What the IAM pack covers

The `iam` pack evaluates 38 controls across these categories:

| Category | Controls | What they detect |
|----------|----------|-----------------|
| Root account | ROOT.MFA, ROOT.ACCESSKEY, ROOT.HWMFA, ROOT.USAGE | Root MFA, access keys, hardware MFA, usage monitoring |
| Console access | CONSOLE.MFA, MFA.HWKEY | Console MFA, hardware MFA for admin users |
| Credentials | CRED.ROTATION, CRED.UNUSED, CRED.UNUSED45, CRED.SETUPKEY, CRED.SINGLEKEY, CRED.EXPIRY, ACCOUNT.INACTIVE | Key rotation, unused credentials, credential TTL, inactive accounts |
| Policies | POLICY.ADMIN, POLICY.INLINE, POLICY.DIRECT, POLICY.CLOUDSHELL, POLICY.ESCALATION, POLICY.PASSROLE, POLICY.COMPLEXITY, POLICY.ASSUMEROLE, POLICY.SOD | Full admin, inline policies, self-modification, PassRole/AssumeRole scoping, complexity, separation of duties |
| Permissions | BOUNDARY, SCP.FULLACCESS, ROLE.BREAKGLASS, CROSS.ENV, TRUST.EXTERNALID | Permissions boundaries, org guardrails, break-glass, cross-env, external ID |
| Zero Trust | ZT.PERIMETER, ZT.SHORTLIVED | Identity-based access required, short-lived credentials |
| Cross-cloud | CROSSCLOUD.ADMIN, CROSSCLOUD.MFA | No admin access across any cloud, MFA enforced everywhere |
| Password | PASSWORD.LENGTH, PASSWORD.REUSE, PASSWORD.COMPLEXITY | Password policy requirements |
| Infrastructure | ANALYZER, SUPPORT, CERT.EXPIRED | Access Analyzer, support role, certificate expiry |
| Monitoring | CLOUDWATCH.MONITOR.MFADEVICE | MFA device enrollment monitoring |

## 4) New controls added for IAM failure requirements

Ten controls address gaps identified in IAM failure analysis and CSA Top Threats 2025:

| Control | Requirement | What it detects |
|---------|-------------|-----------------|
| CTL.IAM.POLICY.ESCALATION.001 | Privilege escalation | Policies granting iam:CreatePolicyVersion, iam:AttachRolePolicy on self |
| CTL.IAM.POLICY.PASSROLE.001 | Privilege escalation | iam:PassRole with wildcard Resource * |
| CTL.IAM.BOUNDARY.001 | Excessive permissions | IAM roles without permissions boundary |
| CTL.IAM.POLICY.COMPLEXITY.001 | Poor policies | Policy documents with >25 statements |
| CTL.IAM.MFA.HWKEY.001 | SMS 2FA insufficient | Admin users without hardware MFA |
| CTL.CLOUDWATCH.MONITOR.MFADEVICE.001 | Unauthorized MFA | No metric filter for MFA device changes |
| CTL.IAM.ACCOUNT.INACTIVE.001 | Legacy accounts | Accounts inactive for 90+ days |
| CTL.IAM.CRED.EXPIRY.001 | CSA TT2 (Snowflake) | Credentials without defined TTL |
| CTL.IAM.ROLE.BREAKGLASS.001 | CSA TT1 (drift) | Break-glass elevated roles persisting >7 days |
| CTL.IAM.CROSS.ENV.001 | CSA TT1 (Microsoft) | Non-production roles with production resource access |
| CTL.IAM.POLICY.SOD.001 | CSA P2-01 (CCM IAM-09) | Roles with both data access and IAM management |

## 5) Shadow Admin detection — the entropy family

Five controls under `controls/iam/entropy/` plus two compound chains
detect the pattern where a role accumulates permissions far beyond
its declared scope:

| Control | Detects | Reads (collector pre-computes) |
|---|---|---|
| `CTL.IAM.ROLE.PERMISSIONDRIFT.001` | Drift past threshold over a role active >90 days | `permission_drift.threshold_exceeded` (accounts for `stave/permission-drift-threshold` tag override) |
| `CTL.IAM.ROLE.CATEGORYMIX.001` | Incompatible permission category pair (e.g. `data_read + secrets_access`) | `permission_categories.has_incompatible_categories` |
| `CTL.IAM.ROLE.INTENTTAG.001` | Role missing the `role-type` tag | `tags.role-type` absent |
| `CTL.IAM.ROLE.INTENTMISMATCH.001` | Actual permissions contradict declared `role-type` | `intent_match.has_intent_mismatch` |
| `CTL.IAM.ROLE.ENTROPY.INCOMPLETE.001` | Access Advisor data absent | `access_advisor.available == false` |

Compound chains compose them:

- `shadow_admin_by_accumulation` — drift + categorymix + intent mismatch, threshold 2 of 3, CRITICAL.
- `privilege_creep_lateral_movement` — categorymix + drift, threshold 2 of 2, CRITICAL.

The collector consults two taxonomy files when stamping the
pre-computed booleans:

- `internal/controldata/taxonomy/permission_categories.yaml` — 11 categories + the incompatible-pair matrix.
- `internal/controldata/taxonomy/role_type_matrix.yaml` — 8 role types with allowed/forbidden category lists.

Worked demo: `examples/shadow-admin-detection/run.sh` walks a
2-year-old `S3-ReadOnly`-tagged role that has accumulated
secrets-access and compute-invoke permissions. See
`examples/shadow-admin-detection/multi-engine-results.md`
for the CEL + chain + Clingo + Soufflé output.

## 6) Observation shapes

### User with privilege escalation risk

```json
{
  "id": "iam-user-dev",
  "type": "aws_iam_user",
  "vendor": "aws",
  "properties": {
    "identity": {
      "kind": "user",
      "policies": {
        "has_admin_access": false,
        "has_self_modify": true,
        "passrole_unrestricted": true,
        "statement_count": 30
      },
      "mfa": { "hardware_mfa": false },
      "credentials": { "inactive_days": 5 }
    }
  }
}
```

Triggers: ESCALATION.001 (self-modify), PASSROLE.001 (wildcard), COMPLEXITY.001 (30 > 25).

### Role without permissions boundary

```json
{
  "id": "iam-role-app-service",
  "type": "aws_iam_role",
  "vendor": "aws",
  "properties": {
    "identity": {
      "kind": "role",
      "role": { "has_permissions_boundary": false }
    }
  }
}
```

Triggers: BOUNDARY.001.

### MFA monitoring observation

```json
{
  "id": "cloudwatch-us-east-1",
  "type": "aws_cloudwatch_account",
  "vendor": "aws",
  "properties": {
    "monitoring": {
      "kind": "account",
      "metric_filters": {
        "mfa_device_changes": { "exists": false }
      }
    }
  }
}
```

Triggers: CLOUDWATCH.MONITOR.MFADEVICE.001.

## Notes

- IAM and S3 controls coexist without conflict when evaluated together.
- For HIPAA compliance, use `--profile hipaa` which includes IAM controls
  for MFA (§164.312(d)) and inactive accounts (§164.312(a)(2)(i)).
