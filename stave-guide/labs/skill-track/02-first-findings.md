---
title: "First Findings"
sidebar_label: "2. First Findings"
sidebar_position: 2
description: "Run Stave against a crafted observation and read your first findings."
---

# First Findings

Produce real findings from a one-asset observation so you see the output shape — finding, evidence, and remediation. **No AWS needed.**

**Time:** ~10 minutes.

## Steps

### 1. Confirm Stave is built

```bash
./stave version
```

### 2. Create a minimal observation

```bash
mkdir -p /tmp/stave-demo/obs
cat > /tmp/stave-demo/obs/2026-01-01T000000Z.json << 'EOF'
{
  "schema_version": "obs.v0.1",
  "source": "deployed",
  "generated_by": { "source_type": "manual" },
  "captured_at": "2026-01-01T00:00:00Z",
  "assets": [
    {
      "id": "arn:aws:iam::111111111111:user/demo-user",
      "type": "aws_iam_user",
      "vendor": "aws",
      "properties": {
        "identity": {
          "kind": "user",
          "name": "demo-user",
          "arn": "arn:aws:iam::111111111111:user/demo-user",
          "policies": { "has_admin_access": true, "service_wildcards_granted": true }
        }
      }
    }
  ]
}
EOF
jq . /tmp/stave-demo/obs/*.json > /dev/null && echo "valid JSON"
```

Key requirements:
- `source` must be `deployed`, `planned`, or `local`
- `schema_version` must be `obs.v0.1`

### 3. Run Stave

```bash
./stave apply --observations /tmp/stave-demo/obs/ --eval-time 2026-01-02T00:00:00Z
```

**Expected:** 2 violations on `demo-user`:
- `CTL.IAM.POLICY.ADMIN.001` — user has admin access
- `CTL.IAM.CROSSCLOUD.ADMIN.001`

Exit code **3** = violations found (0 = clean, 2 = input error, 3 = violations).

### 4. Read the output

Each finding shows: the control + asset, evidence (when the violation began), the root-cause property, and remediation guidance.

### 5. Try machine-readable formats

```bash
./stave apply --observations /tmp/stave-demo/obs/ --eval-time 2026-01-02T00:00:00Z --format json
./stave apply --observations /tmp/stave-demo/obs/ --eval-time 2026-01-02T00:00:00Z --format sarif
```

JSON follows the `out.v0.1` schema; SARIF carries a `runs` array for code-scanning tools.

## Done

You produced findings from an observation and understand the output shape and exit codes.

**Next:** [Lab Validation](03-lab-validation.md)
