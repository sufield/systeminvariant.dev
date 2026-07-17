# APPRUNNER controls (1)

### CTL.APPRUNNER.SERVICE.ACTIVE.001[​](#ctlapprunnerserviceactive001 "Direct link to CTL.APPRUNNER.SERVICE.ACTIVE.001")

**App Runner Services Are Active in Account**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-8; soc2: CC6.1;

The account has active App Runner services. App Runner provisions fully managed container compute with public HTTPS endpoints in an AWS-managed VPC outside the customer's governance boundary. Services are not visible through ec2:DescribeInstances or standard network security monitoring and run with IAM execution roles that may have broad permissions.

**Remediation:** Evaluate intent; if unwanted, delete services and SCP deny apprunner:\*.

***
