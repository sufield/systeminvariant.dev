These controls were specified in the original HIPAA profile design (tutorials/prompts.md, Prompts 5-6) but were never implemented because the observation schema doesn't yet capture the data they need to evaluate:                          

  - AUDIT.002 (object-level logging) — requires CloudTrail data event configuration, which isn't in the current S3
  snapshot schema. Server access logging (AUDIT.001) uses logging.target_bucket from the bucket config; object-level logging comes from a separate CloudTrail service.               
  - ACCESS.003 (VPC endpoint) — requires VPC endpoint configuration data. The snapshot schema has a S3VPCEndpointPolicy
  struct defined but no extractor populates it yet. The observation pipeline currently captures bucket-level config only, not VPC-level networking.
  - ACCESS.006 (VPC endpoint policy) — same dependency as ACCESS.003. Both need VPC endpoint data that the extractor doesn't produce.
  - ACCESS.009 (presigned URL restriction) — requires bucket policy analysis for presigned URL conditions
  (s3:signatureAge, s3:authType). The policy parser (policy_helper.go) handles basic Allow/Deny/TLS conditions but doesn't parse S3-specific condition keys yet.

  COMPOUND.003 is implemented and tested but will never fire because both its triggers (ACCESS.003 + ACCESS.006) need the VPC data above.

  The blocker for all four is the same: the extractor needs to capture additional AWS configuration (CloudTrail
  settings, VPC endpoints) and the observation schema needs corresponding fields. The controls themselves are
  straightforward to implement once the data is available — the pending-items.md checklist shows it's a 5-step process with no changes to the profile system needed.

---

When mapping HIPAA to AWS S3, the vast majority of your focus will be on 45 CFR Part 164 (The Security Rule). While AWS manages the "Physical Safeguards" (the data center), you are responsible for the "Technical Safeguards" (how you configure the bucket).

Here are the specific sections relevant to an S3-based architecture:

1. Technical Safeguards (The Most Relevant)

These sections dictate exactly how you must configure S3 buckets, encryption, and IAM policies.

§ 164.312(a)(1) – Access Control:

S3 Implementation: IAM Roles, Bucket Policies, and Access Control Lists (ACLs). You must ensure only authorized "entities" (users or applications) can touch the data.

Specifics: Using MFA Delete and Least Privilege IAM policies to prevent unauthorized access.

§ 164.312(b) – Audit Controls:

S3 Implementation: CloudTrail and S3 Server Access Logging.

Requirement: You must record every time an object is read, written, or deleted. If an auditor asks "Who looked at patient X's record on Tuesday?", S3 logs are your only proof.

§ 164.312(c)(1) – Integrity:

S3 Implementation: S3 Versioning and S3 Object Lock.

Requirement: Protecting PHI from improper alteration or destruction. Versioning ensures you can roll back an accidental overwrite; Object Lock (WORM) ensures data cannot be deleted for a fixed period.

§ 164.312(e)(1) – Transmission Security:

S3 Implementation: Enforcing HTTPS/TLS.

Requirement: You must protect PHI against unauthorized access while being transmitted. In S3, this means a Bucket Policy that uses a Condition to Deny any request where "aws:SecureTransport": "false".

§ 164.312(a)(2)(iv) – Encryption and Decryption:

S3 Implementation: Default Encryption (AES-256 / SSE-KMS).

Requirement: While the rule says encryption is "addressable" (optional if you have a good reason not to), in the cloud, it is essentially mandatory. You should use AWS KMS for managing keys to maintain an audit trail of who decrypted what.

2. Administrative Safeguards

These govern the "Review" and "Maintenance" of your S3 environment.

§ 164.308(a)(1)(ii)(D) – Information System Activity Review:

S3 Implementation: Regular review of S3 Access Logs and CloudTrail events.

Requirement: You must have a process to regularly look at the logs you are collecting to spot suspicious patterns.

§ 164.308(a)(5)(ii)(B) – Protection from Malicious Software:

S3 Implementation: S3 Malware Scanning (e.g., using GuardDuty or Lambda).

Requirement: If users upload files to your S3 bucket, you are responsible for ensuring those files don't contain malware that could spread PHI.

3. Privacy Rule (The "Minimum Necessary" Rule)

§ 164.502(b) – Minimum Necessary:

S3 Implementation: IAM Policy Scoping.

Requirement: When an application accesses an S3 bucket, it should only have access to the specific prefix (folder) it needs. Granting s3:* to a whole bucket when the app only needs one file is a HIPAA Privacy Rule violation.

4. Breach Notification Rule

§ 164.400–414:

S3 Implementation: Amazon GuardDuty and AWS Config.

Requirement: If you accidentally make an S3 bucket public (a common HIPAA disaster), these services detect the misconfiguration immediately. This helps determine if a "Breach" actually occurred (did a 3rd party IP download the data?) or if it was just a "Security Incident."

Summary Checklist for your "S3 HIPAA Pack":

If you are building the internal/core/s3 logic for your HIPAA pack, your "evaluators" should be checking these five things:

Encryption: Is ServerSideEncryptionConfiguration active?

Public Access: Are PublicAccessBlock settings all set to true?

Transport: Does the Bucket Policy deny non-SSL requests?

Logging: Is LoggingConfiguration or a CloudTrail Data Event tracker enabled?

Integrity: Is VersioningConfiguration enabled?

Note on the BAA: None of these technical steps matter unless your organization has signed a Business Associate Agreement (BAA) with AWS. This is the legal foundation (Part 160) that allows you to put PHI on their servers in the first place.
