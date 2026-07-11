# SECURITYLAKE controls (2)

### CTL.SECURITYLAKE.ENABLED.001[​](#ctlsecuritylakeenabled001 "Direct link to CTL.SECURITYLAKE.ENABLED.001")

**Amazon Security Lake Not Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: AU-6, SI-4; scs\_c02: 10.8; soc2: CC7.1;

Amazon Security Lake is not enabled. Security Lake centralizes security data from AWS services, SaaS providers, and custom sources into a purpose-built data lake using the Open Cybersecurity Schema Framework (OCSF). Without it, security data is scattered across services and accounts, making cross-service correlation and long-term retention difficult.

**Remediation:** Enable Security Lake from the delegated admin account and configure log sources and rollup regions.

***

### CTL.SECURITYLAKE.SOURCES.001[​](#ctlsecuritylakesources001 "Direct link to CTL.SECURITYLAKE.SOURCES.001")

**Security Lake Missing Critical Log Sources**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: AU-3; scs\_c02: 10.8; soc2: CC7.1;

Amazon Security Lake does not have all critical AWS log sources configured. Missing sources (CloudTrail, VPC Flow Logs, Route 53 DNS, Security Hub findings, Lambda, EKS audit, S3 data events) create visibility gaps in the centralized security data lake.

**Remediation:** Add missing log sources: aws securitylake create-aws-log-source --sources '\[{"sourceName":"CLOUD\_TRAIL\_MGMT","regions":\["us-east-1"]}]'.

***
