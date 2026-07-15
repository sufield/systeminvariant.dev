# LIGHTSAIL controls (3)

### CTL.LIGHTSAIL.BLUEPRINT.RETIRED.001[​](#ctllightsailblueprintretired001 "Direct link to CTL.LIGHTSAIL.BLUEPRINT.RETIRED.001")

**Lightsail Instance Must Not Use Retired Blueprint**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-2; soc2: CC7.1;

Lightsail instances must not run retired OS or application blueprints. AWS retires blueprints when the underlying OS reaches end-of-life (Ubuntu 18.04, CentOS 7, Amazon Linux 1) or when the application version is no longer maintained. Instances on retired blueprints no longer receive security patches through the blueprint update channel. Unlike EC2, Lightsail instances are often managed by operators who do not run their own patch pipelines — the blueprint is their sole patch source.

**Remediation:** Create a new instance with a supported blueprint and migrate your application. Export data from the retired instance, launch a replacement with a current blueprint (e.g. ubuntu\_22\_04), and restore. Use aws lightsail create-instances with the updated --blueprint-id.

***

### CTL.LIGHTSAIL.DB.PUBLIC.001[​](#ctllightsaildbpublic001 "Direct link to CTL.LIGHTSAIL.DB.PUBLIC.001")

**Lightsail Databases Must Not Be Publicly Accessible**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

Lightsail managed databases must not be publicly accessible.

**Remediation:** Disable public mode on the database.

***

### CTL.LIGHTSAIL.INSTANCE.PUBLIC.001[​](#ctllightsailinstancepublic001 "Direct link to CTL.LIGHTSAIL.INSTANCE.PUBLIC.001")

**Lightsail Instances Must Not Expose Public Ports Broadly**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

Lightsail instances with public IPs must not have firewall rules allowing broad public access to service ports.

**Remediation:** Restrict firewall rules to specific CIDR ranges.

***
