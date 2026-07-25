# Integrating with Security Workflows

Stave fits into existing security workflows as a pre-deployment gate, continuous monitoring check, or incident response tool.

## Pre-Deployment Gate[​](#pre-deployment-gate "Direct link to Pre-Deployment Gate")

Run Stave in your deployment pipeline to block changes that introduce violations:

```
# In your deploy script or CI pipeline:
stave validate --controls ./controls --observations ./observations --strict
stave apply --controls ./controls --observations ./observations --max-unsafe 0s --quiet

if [ $? -eq 3 ]; then
  echo "Deploy blocked: safety violations detected"
  stave apply --controls ./controls --observations ./observations --format text
  exit 1
fi
```

Using `--max-unsafe 0s` blocks any currently unsafe resource, regardless of how recently the misconfiguration was introduced.

## Continuous Monitoring[​](#continuous-monitoring "Direct link to Continuous Monitoring")

Export S3 configurations on a schedule and evaluate them to track safety posture over time:

```
#!/bin/bash
# Run daily via cron
set -euo pipefail
DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
SNAPSHOT_DIR="./observations"

# Export current state
stave transform --in ./aws-snapshot --out "$SNAPSHOT_DIR/$(date -u +%Y-%m-%d).json" --eval-time "$DATE"

# Evaluate all historical snapshots
rc=0
stave apply \
  --controls controls/s3 \
  --observations "$SNAPSHOT_DIR" \
  --max-unsafe 7d \
  --eval-time "$DATE" \
  --out ./results || rc=$?

# Exit code 3 means violations found; anything else is an error
if [ "$rc" -ne 0 ] && [ "$rc" -ne 3 ]; then
  echo "stave apply failed with exit code $rc" >&2
  exit "$rc"
fi

# Alert on new violations
violations=$(jq '.summary.violations' ./results/evaluation.json)
if [ "$violations" -gt 0 ]; then
  echo "Found $violations violations:"
  jq -r '.findings[] | "  \(.control_id): \(.resource_id)"' ./results/evaluation.json
  # Send to your alerting system (Slack, PagerDuty, etc.)
fi
```

## Verify Remediation[​](#verify-remediation "Direct link to Verify Remediation")

After fixing a finding, use `verify` to confirm the fix resolved the issue without introducing new violations:

```
# Capture the state after remediation
stave transform --in ./aws-snapshot-after --out ./observations-after/latest.json

# Compare before and after
stave check \
  --before ./observations-before \
  --after ./observations-after \
  --controls controls/s3
```

Output:

```
{
  "summary": {
    "before_violations": 5,
    "after_violations": 2,
    "resolved": 3,
    "remaining": 2,
    "introduced": 0
  }
}
```

## Incident Response: Breach-Type Scoping[​](#incident-response-breach-type-scoping "Direct link to Incident Response: Breach-Type Scoping")

For breach-type-specific evaluation, use the `--context` flag to focus on controls relevant to the incident type:

```
# context.yaml
breach_type: DISC
incident_id: INC-2026-001
```

```
stave apply \
  --controls ./controls \
  --observations ./observations \
  --context context.yaml \
  --max-unsafe 168h
```

With `breach_type: DISC` (disclosure), Stave evaluates only disclosure-relevant controls:

* `CTL.TP.PLATFORM.001` — Third-Party Platform Boundaries
* `CTL.TP.VENDOR.001` — Third-Party Vendor Data Boundaries
* `CTL.PROC.MAIL.001` — Process Audience Verification
* `CTL.ID.AUTHZ.001` — Least-Privilege Subject Access

## Generating Remediation Artifacts[​](#generating-remediation-artifacts "Direct link to Generating Remediation Artifacts")

Stave can produce ready-to-apply remediation from evaluation findings:

### Public Access Block (Terraform)[​](#public-access-block-terraform "Direct link to Public Access Block (Terraform)")

```
stave enforce --in ./results/evaluation.json --out ./results --mode pab
# Produces: ./results/enforcement/aws/pab.tf
```

### Service Control Policy (AWS SCP)[​](#service-control-policy-aws-scp "Direct link to Service Control Policy (AWS SCP)")

```
stave enforce --in ./results/evaluation.json --out ./results --mode scp
# Produces: ./results/enforcement/aws/scp.json
```

## Resource Ignore Lists[​](#resource-ignore-lists "Direct link to Resource Ignore Lists")

For resources that are intentionally configured a certain way (e.g., a public website bucket), use an ignore list to suppress findings:

```
# ignore.yaml
version: ignore.v0.1
resources:
  - pattern: "acme-public-website"
    reason: "Intentional public website bucket"
  - pattern: "k8s:ClusterRoleBinding/*"
    reason: "Default cluster role bindings"
```

```
stave apply \
  --controls ./controls \
  --observations ./observations \
  --ignore ignore.yaml
```

Ignored resources appear in the `skipped_resources` section of the output for audit purposes.
