# ATHENA controls (3)

### CTL.ATHENA.ENCRYPT.001[​](#ctlathenaencrypt001 "Direct link to CTL.ATHENA.ENCRYPT.001")

**Athena Workgroups Must Encrypt Query Results**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-28; soc2: CC6.7;

Athena workgroups must encrypt query results at rest. Unencrypted query results in S3 expose data extracted by SQL queries.

**Remediation:** Enable encryption in the workgroup result configuration.

***

### CTL.ATHENA.GHOST.OUTPUT.S3.001[​](#ctlathenaghostoutputs3001 "Direct link to CTL.ATHENA.GHOST.OUTPUT.S3.001")

**Athena Query Results S3 Bucket Deleted**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3, SC-28; soc2: CC6.1;

Athena workgroup is configured to write query results to an S3 bucket that has been deleted. Queries fail or, if the bucket name is re-registered under a different account, query results — which may contain sensitive data from the queried tables — are written to attacker- controlled storage.

**Remediation:** Update the workgroup output location to an existing bucket: aws athena update-work-group --work-group --configuration-updates ResultConfigurationUpdates={OutputLocation=s3:///}.

***

### CTL.ATHENA.WORKGROUP.001[​](#ctlathenaworkgroup001 "Direct link to CTL.ATHENA.WORKGROUP.001")

**Athena Workgroups Must Enforce Query Result Location**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-4; soc2: CC6.6;

Athena workgroups must enforce a specific query result location and override client-side settings. Without this enforcement, individual users can direct query results to arbitrary S3 buckets outside the organization's control, potentially exfiltrating data or bypassing encryption and access logging.

**Remediation:** Enable enforce workgroup configuration in the workgroup settings. This forces all queries to use the workgroup's output location and encryption settings.

***
