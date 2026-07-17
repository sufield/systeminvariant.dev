# AMPLIFY controls (1)

### CTL.AMPLIFY.APP.ACTIVE.001[​](#ctlamplifyappactive001 "Direct link to CTL.AMPLIFY.APP.ACTIVE.001")

**Amplify Apps Are Active in Account**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-8; soc2: CC6.1;

The account has active Amplify apps. Amplify provisions CloudFront distributions, S3 buckets, Lambda\@Edge functions, and IAM roles behind a separate API surface — invisible to the standard CloudFront, S3, and Lambda management APIs and outside the organization's network security monitoring.

**Remediation:** Evaluate intent; if unwanted, delete apps and SCP deny amplify:\*.

***
