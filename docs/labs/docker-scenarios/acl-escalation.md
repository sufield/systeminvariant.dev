# ACL Privilege Escalation

Buckets where ACL grants (WRITE\_ACP, READ\_ACP, FULL\_CONTROL) enable attackers to modify permissions, enumerate access, or gain complete control -- even when the bucket policy looks clean.

## Background[​](#background "Direct link to Background")

S3 ACL permission types beyond READ and WRITE are frequently overlooked. WRITE\_ACP allows modifying the ACL itself (privilege escalation), READ\_ACP reveals who has access (reconnaissance), and FULL\_CONTROL combines everything including ACL modification. Bug bounty researchers exploit these to convert limited access into full bucket takeover.

**Based on:** HackerOne ACL escalation patterns documented in Intigriti and YesWeHack S3 guides

## Buckets[​](#buckets "Direct link to Buckets")

**`dev-shared-workspace`** -- ACL grants WRITE\_ACP and READ\_ACP to AllUsers. An attacker can read the ACL to discover grants, then modify the ACL to give themselves FULL\_CONTROL.

**`legacy-partner-data`** -- ACL grants FULL\_CONTROL to AuthenticatedUsers. Any AWS account holder has complete control including read, write, delete, and ACL modification.

## Triggered Controls[​](#triggered-controls "Direct link to Triggered Controls")

| Control                      | Resource             | Description                             |
| ---------------------------- | -------------------- | --------------------------------------- |
| `CTL.S3.ACL.ESCALATION.001`  | dev-shared-workspace | No Public ACL Modification (WRITE\_ACP) |
| `CTL.S3.ACL.RECON.001`       | dev-shared-workspace | No Public ACL Readability (READ\_ACP)   |
| `CTL.S3.ACL.FULLCONTROL.001` | legacy-partner-data  | No FULL\_CONTROL ACL Grants to Public   |
| `CTL.S3.CONTROLS.001`        | dev-shared-workspace | Public Access Block Must Be Enabled     |
| `CTL.S3.CONTROLS.001`        | legacy-partner-data  | Public Access Block Must Be Enabled     |

## Expected Findings[​](#expected-findings "Direct link to Expected Findings")

5 violations across 2 resources.
