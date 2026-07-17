# GLOBALACCELERATOR controls (1)

### CTL.GLOBALACCELERATOR.EXISTS.001[​](#ctlglobalacceleratorexists001 "Direct link to CTL.GLOBALACCELERATOR.EXISTS.001")

**Global Accelerator Existence Must Be Tracked and Approved**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** nist\_800\_53\_r5: CM-8; soc2: CC6.1;

Global Accelerator exists in the account without documented approval. Global Accelerators create public entry points with static anycast IP addresses that route traffic to endpoints in AWS regions. Their existence should be intentional and documented — an untracked accelerator is an unmonitored public surface. Scott Piper's aws\_exposable\_resources lists Global Accelerator as a resource type that creates public network exposure. API: globalaccelerator:ListAccelerators.

**Remediation:** Document the accelerator's purpose and approve it via your organization's change management process. If unneeded, delete it to reduce public surface area.

***
