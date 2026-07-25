# EBS controls (3)

### CTL.EBS.AMI.DEREGPROTECTION.001[​](#ctlebsamideregprotection001 "Direct link to CTL.EBS.AMI.DEREGPROTECTION.001")

**AMI Deregistration Protection Not Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CP-9, SI-7; soc2: CC6.1;

AMI does not have deregistration protection enabled. Without deregistration protection, an attacker with ec2:DeregisterImage can remove the AMI, preventing new launches from the golden image and forcing fallback to potentially compromised or outdated alternatives. Deregistration protection is especially critical for AMIs used in Auto Scaling groups and launch templates where the AMI ID is a hard dependency.

**Remediation:** Enable deregistration protection on the AMI using ec2:EnableImageDeregistrationProtection. Combine with SCP restrictions on ec2:DisableImageDeregistrationProtection to prevent attackers from removing the protection.

***

### CTL.EBS.ENCRYPT.KEYORIGIN.001[​](#ctlebsencryptkeyorigin001 "Direct link to CTL.EBS.ENCRYPT.KEYORIGIN.001")

**EBS Volume Must Use AWS-Managed or CloudHSM Key Origin**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** resilience
* **Compliance:** nist\_800\_53\_r5: SC-12; soc2: CC6.1;

EBS volume is encrypted with a KMS key whose origin is EXTERNAL (imported key material). External key material can expire or be deleted outside AWS, causing the volume to become inaccessible. In a ransomware scenario, an attacker who compromises the external key management system can revoke key material and render all encrypted volumes unrecoverable. AWS\_KMS and AWS\_CLOUDHSM origins provide durable key material that cannot be externally revoked.

**Remediation:** Re-encrypt the volume using a KMS key with AWS\_KMS origin. Create a snapshot, copy it with the new key, and create a new volume from the copy.

***

### CTL.EBS.SNAPSHOT.DELETEPROTECTION.001[​](#ctlebssnapshotdeleteprotection001 "Direct link to CTL.EBS.SNAPSHOT.DELETEPROTECTION.001")

**EBS Snapshot Lock Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CP-9, SC-28; soc2: CC6.1;

EBS snapshot does not have snapshot lock enabled. Snapshot lock prevents deletion for a configurable retention period, providing protection against both accidental and malicious deletion. Combined with Recycle Bin, snapshot lock is the primary defense against ransomware that targets backup artifacts. Without it, an attacker with ec2:DeleteSnapshot can permanently destroy recovery points.

**Remediation:** Enable snapshot lock on critical snapshots using ec2:LockSnapshot. Set the lock mode to compliance for immutable protection or governance for removable protection. Set a retention period that exceeds your recovery time objective.

***
