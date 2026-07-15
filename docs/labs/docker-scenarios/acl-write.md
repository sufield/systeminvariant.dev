# ACL-Based Public Write

User upload bucket where ACL grants write to any authenticated AWS user. The bucket policy looks clean — policy-only scanners miss this entirely.

## Background[​](#background "Direct link to Background")

ACL-based access is a legacy S3 mechanism that many security tools overlook because they focus on bucket policies. When an ACL grants `WRITE` to `AuthenticatedUsers`, any AWS account holder can upload objects to the bucket, enabling data injection and content manipulation.

**Based on:** HackerOne reports #98819 (Shopify), #128088

## Bucket[​](#bucket "Direct link to Bucket")

`platform-user-uploads` — user upload bucket where ACL grants write access to all authenticated AWS users and read access to all authenticated AWS users, while the bucket policy appears clean.

## Triggered Controls[​](#triggered-controls "Direct link to Triggered Controls")

| Control                | Description                         |
| ---------------------- | ----------------------------------- |
| `CTL.S3.ACL.WRITE.001` | No Public Write via ACL             |
| `CTL.S3.AUTH.READ.001` | No Authenticated-Users Read Access  |
| `CTL.S3.CONTROLS.001`  | Public Access Block Must Be Enabled |

## Expected Findings[​](#expected-findings "Direct link to Expected Findings")

3 violations on 1 resource.
