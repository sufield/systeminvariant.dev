# TAGS controls (1)

### CTL.TAGS.CREDENTIAL.PATTERN.001[​](#ctltagscredentialpattern001 "Direct link to CTL.TAGS.CREDENTIAL.PATTERN.001")

**Resource Tags Must Not Contain Credential Patterns**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: IA-5(7); soc2: CC6.1;

No resource tag value should match common credential patterns (AWS access key IDs, connection strings, passwords, private keys). Developers store secrets in tags for convenience. An attacker with tag:GetResources — a low-privilege, commonly granted action — can scan all tags across all services and harvest embedded credentials. This is a heuristic control with false positive risk for tags containing example data. Technique: Wiz "Extract credentials from resource tags".

**Remediation:** Move the credential to AWS Secrets Manager or Systems Manager Parameter Store (SecureString). Remove the tag value. Rotate the exposed credential.

***
