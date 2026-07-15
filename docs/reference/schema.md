# Unified Security Record Schema

Version: `schema_version: "1"` — increment on breaking changes.

## Top-Level Fields[​](#top-level-fields "Direct link to Top-Level Fields")

| Field            | Type     | Description                                       |
| ---------------- | -------- | ------------------------------------------------- |
| `schema_version` | string   | Always `"1"`                                      |
| `generated_at`   | ISO 8601 | When the unified record was produced              |
| `resource_arn`   | string   | AWS resource ARN — the join key                   |
| `resource_type`  | string   | Asset type (e.g., `lambda_function`, `s3_bucket`) |

## `stave` Section[​](#stave-section "Direct link to stave-section")

Populated directly from `out.v0.1` finding fields. No transformation.

| Field             | Type     | Source                                                              |
| ----------------- | -------- | ------------------------------------------------------------------- |
| `finding_id`      | string   | `finding.finding_id`                                                |
| `control_id`      | string   | `finding.control_id`                                                |
| `control_name`    | string   | `finding.control_name`                                              |
| `severity`        | string   | `finding.control_severity` (critical/high/medium/low)               |
| `attack_stage`    | string   | From control params (initial\_access, exfiltration, etc.)           |
| `verdict`         | string   | `fail` or `pass`                                                    |
| `finding_message` | string   | `finding.evidence.temporal_risk`                                    |
| `compliance`      | array    | `finding.control_compliance` mapped to `[{framework, requirement}]` |
| `remediation`     | object   | `finding.remediation` with action, confidence, changes              |
| `assessed_at`     | ISO 8601 | `run.now` from the assessment                                       |

## `vulnerabilities` Section[​](#vulnerabilities-section "Direct link to vulnerabilities-section")

Populated by the adapter from scanner tool output. Zero entries is valid.

| Field             | Type   | Source                            |
| ----------------- | ------ | --------------------------------- |
| `source`          | string | Scanner name (`grype`, `trivy`)   |
| `cve_id`          | string | CVE identifier                    |
| `package_name`    | string | Vulnerable package                |
| `package_version` | string | Installed version                 |
| `fixed_version`   | string | Version with fix (empty if none)  |
| `cvss_score`      | float  | CVSS v3 base score                |
| `cvss_vector`     | string | CVSS v3 vector string             |
| `severity`        | string | Scanner's severity classification |
| `description`     | string | CVE description                   |

## `combined_risk` Section[​](#combined_risk-section "Direct link to combined_risk-section")

Computed by the adapter from both inputs.

| Field                | Type   | Description                                                                                          |
| -------------------- | ------ | ---------------------------------------------------------------------------------------------------- |
| `stave_severity`     | string | From Stave finding                                                                                   |
| `max_vuln_cvss`      | float  | Highest CVSS score from vulnerabilities (0 if none)                                                  |
| `compound_risk_note` | string | Human-readable observation when Stave severity is critical/high AND max CVSS > 7.0. Empty otherwise. |

## Join Algorithm[​](#join-algorithm "Direct link to Join Algorithm")

1. Load all Stave findings from `out.v0.1` (`findings[]` array)
2. Load all scanner vulnerabilities from scanner JSON output
3. For each Stave finding, match scanner vulnerabilities where the scanned target corresponds to the finding's `resource_arn`
4. Emit one unified record per finding with matched vulnerabilities attached
5. Findings with no matching vulnerabilities get an empty `vulnerabilities: []`

## Valid Values[​](#valid-values "Direct link to Valid Values")

* **severity**: `critical`, `high`, `medium`, `low`, `info`
* **attack\_stage**: `initial_access`, `credential_access`, `persistence`, `privilege_escalation`, `lateral_movement`, `exfiltration`, `detection_evasion`, `resilience`
* **verdict**: `fail`, `pass`, `acknowledged`
