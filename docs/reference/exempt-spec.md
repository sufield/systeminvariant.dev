# Exceptions Specification

Stave's exception mechanism lets organizations formally accept, suppress, or exclude findings without disabling controls. The acceptance file is version-controlled, auditable, and automatically enforces expiry dates.

## File format[​](#file-format "Direct link to File format")

Default path: `./stave-acknowledgments.yaml`

```
schema_version: "1.0"
last_modified: "2026-07-10T14:30:00Z"
last_modified_by: "jane@example.com"

acknowledgments:
  - id: "ACK-2026-001"
    control_id: CTL.S3.BUCKET.VERSIONING.001
    asset_id: "arn:aws:s3:::legacy-static-assets"
    rationale: "Accepted risk — bucket contains only public static assets, versioning adds cost with no security value"
    acknowledged_by: "security-lead@example.com"
    acknowledged_date: "2026-03-15"
    expiry_date: "2026-12-31"
    compensating_controls:
      - "CloudFront origin access control restricts direct access"
    status: active
    audit_trail:
      - timestamp: "2026-03-15T10:00:00Z"
        action: "created"
        actor: "stave exempt acknowledge"

exceptions:
  - id: "EXC-2026-001"
    control_id: CTL.IAM.KEY.ROTATION.001
    asset_id: "arn:aws:iam::123456789012:user/legacy-service"
    rationale: "Service account migration in progress — ENG-1234"
    acknowledged_by: "platform-team@example.com"
    expiry_date: "2026-09-30"
    status: active

exemptions:
  - id: "EXM-2026-001"
    asset_pattern: "arn:aws:s3:::test-*"
    rationale: "Test buckets excluded from production controls"
    acknowledged_by: "security-lead@example.com"
    expiry_date: "2027-01-01"
    status: active
```

## Three categories[​](#three-categories "Direct link to Three categories")

| Category           | Use                                               | Scope                   |
| ------------------ | ------------------------------------------------- | ----------------------- |
| **Acknowledgment** | Formal risk acceptance with compensating controls | One control + one asset |
| **Exception**      | Operational suppression (temporary)               | One control + one asset |
| **Exemption**      | Scope exclusion by pattern                        | Asset pattern (glob)    |

## Commands[​](#commands "Direct link to Commands")

```
# Add a formal risk acceptance
stave exempt acknowledge \
  --control-id CTL.S3.BUCKET.VERSIONING.001 \
  --asset-id "arn:aws:s3:::legacy-bucket" \
  --reason "Accepted risk — public static assets" \
  --approver "security-lead@example.com" \
  --expires 2026-12-31

# Add an operational suppression
stave exempt except \
  --control-id CTL.IAM.KEY.ROTATION.001 \
  --asset-id "arn:aws:iam::123456789012:user/legacy-service" \
  --reason "Migration in progress — ENG-1234" \
  --approver "platform-team@example.com" \
  --expires 2026-09-30

# List all active entries
stave exempt list

# Show entries expiring within 30 days
stave exempt upcoming

# Revoke an acknowledgment
stave exempt remove --id ACK-2026-001

# Validate the file format
stave exempt validate

# Export for external systems
stave exempt export --format json
```

## Behavior during evaluation[​](#behavior-during-evaluation "Direct link to Behavior during evaluation")

When `stave apply` runs with an acknowledgments file present:

1. Findings matching an active acknowledgment are **suppressed** from the primary findings list
2. Suppressed findings are reported separately (visible in `--format json` under `suppressed_findings`)
3. The suppression reason and expiry are included in the output
4. The total finding count reflects suppression — a clean run with exemptions is still a valid compliance artifact

## Expiry enforcement[​](#expiry-enforcement "Direct link to Expiry enforcement")

* When an entry's `expiry_date` passes, its status changes to `expired` on the next evaluation
* Expired entries stop suppressing — the finding re-surfaces automatically
* `stave exempt upcoming` shows entries expiring within 30 days (default) or a custom window (`--days 60`)
* Expired entries remain in the file for audit trail — they are never silently deleted

## Why this exists[​](#why-this-exists "Direct link to Why this exists")

Organizations route around tools that don't have an exception path. A CI gate without exceptions gets bypassed within a month — someone adds `|| true` to the pipeline, and the tool is dead.

The acceptance file makes the bypass formal, visible, and time-bounded. An auditor can see exactly what was accepted, by whom, with what rationale, and when it expires.
