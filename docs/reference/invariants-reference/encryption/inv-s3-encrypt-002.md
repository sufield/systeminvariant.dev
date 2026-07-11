# Transport Encryption Required

**ID:** `CTL.S3.ENCRYPT.002` **Category:** Encryption **Severity:** High

## What This Checks[​](#what-this-checks "Direct link to What This Checks")

Every S3 bucket must enforce HTTPS for all API calls by including a bucket policy that denies requests when `aws:SecureTransport` is `false`. Stave flags any bucket where `in_transit_enforced` is `false`.

## Why It Matters[​](#why-it-matters "Direct link to Why It Matters")

Without a transport encryption policy, S3 accepts requests over plain HTTP. Data transferred in cleartext is vulnerable to interception, man-in-the-middle attacks, and passive eavesdropping on the network path. Enforcing HTTPS ensures that credentials, headers, and object data are encrypted during transit between clients and AWS.

## What A Violation Looks Like[​](#what-a-violation-looks-like "Direct link to What A Violation Looks Like")

```
$ stave apply --controls controls/s3 --observations ./observations --max-unsafe 0s --eval-time 2026-01-15T00:00:00Z
```

```
{
  "dsl_version": "out.v0.1",
  "summary": {
    "total_findings": 1,
    "unsafe_count": 1,
    "safe_count": 0
  },
  "findings": [
    {
      "control_id": "CTL.S3.ENCRYPT.002",
      "resource_id": "arn:aws:s3:::acme-healthcare-patient-records",
      "status": "unsafe",
      "severity": "high",
      "message": "Transport Encryption Required: S3 buckets must enforce HTTPS via a deny policy on aws:SecureTransport=false."
    }
  ]
}
```

## Correct Configuration[​](#correct-configuration "Direct link to Correct Configuration")

A safe observation has `in_transit_enforced` set to `true`:

```
{
  "storage": {
    "kind": "bucket",
    "encryption": {
      "in_transit_enforced": true
    }
  }
}
```

Add a bucket policy statement that denies all actions when `aws:SecureTransport` is `false`. This forces all API calls to use HTTPS.

## Related Controls[​](#related-controls "Direct link to Related Controls")

* [`CTL.S3.ENCRYPT.001`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-001.md) -- Encryption at Rest Required
* [`CTL.S3.ENCRYPT.003`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-003.md) -- PHI Buckets Must Use SSE-KMS with Customer-Managed Key
* [`CTL.S3.ENCRYPT.004`](/docs/reference/invariants-reference/encryption/inv-s3-encrypt-004.md) -- Sensitive Data Requires KMS Encryption
