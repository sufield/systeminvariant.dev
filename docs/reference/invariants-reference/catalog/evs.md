# EVS controls (1)

### CTL.EVS.ENVIRONMENT.ACTIVE.001[​](#ctlevsenvironmentactive001 "Direct link to CTL.EVS.ENVIRONMENT.ACTIVE.001")

**EVS Environment Is Active in Account**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-8; soc2: CC6.1;

The account has active Elastic VMware Service environments. EVS provisions a full VMware SDDC in an AWS-managed account — compute, storage, and the vCenter/NSX management plane run outside the customer's VPC. Not inventoried by AWS Config, not visible to VPC Flow Logs, not monitored by GuardDuty.

**Remediation:** Evaluate intent; if unwanted, decommission and SCP deny evs:\*.

***
