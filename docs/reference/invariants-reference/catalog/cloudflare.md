# CLOUDFLARE controls (29)

### CTL.CLOUDFLARE.DNS.DANGLING.001[​](#ctlcloudflarednsdangling001 "Direct link to CTL.CLOUDFLARE.DNS.DANGLING.001")

**DNS CNAME Record Points to Invalid Target**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-20; soc2: CC6.6;

CNAME record points to a target that doesn't resolve. Subdomain takeover candidate — an attacker registers the target and serves content under the organization's domain.

**Remediation:** Remove the dangling CNAME or re-provision the target resource.

***

### CTL.CLOUDFLARE.DNS.GHOST.001[​](#ctlcloudflarednsghost001 "Direct link to CTL.CLOUDFLARE.DNS.GHOST.001")

**DNS Record References Non-Existent Origin**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: AC-3; soc2: CC6.1;

DNS A/AAAA record points to an IP not associated with any known origin in the organization's cloud inventory. The IP may have been released — traffic hijacking risk.

**Remediation:** Update the DNS record to point to a valid origin or remove it.

***

### CTL.CLOUDFLARE.DNS.INTERNALIP.001[​](#ctlcloudflarednsinternalip001 "Direct link to CTL.CLOUDFLARE.DNS.INTERNALIP.001")

**DNS Record Exposes Internal IP Address**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

DNS record contains an RFC1918 private IP address. Exposes internal network topology to anyone who queries DNS.

**Remediation:** Remove the internal IP from the DNS record or proxy through Cloudflare.

***

### CTL.CLOUDFLARE.DNS.PROXY.001[​](#ctlcloudflarednsproxy001 "Direct link to CTL.CLOUDFLARE.DNS.PROXY.001")

**DNS Record Not Proxied Through Cloudflare**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

DNS record not proxied (grey cloud). Traffic goes directly to the origin, bypassing WAF, DDoS protection, and bot management. Origin IP exposed in DNS.

**Remediation:** Enable Cloudflare proxy (orange cloud) on the DNS record.

***

### CTL.CLOUDFLARE.DNS.WILDCARD.001[​](#ctlcloudflarednswildcard001 "Direct link to CTL.CLOUDFLARE.DNS.WILDCARD.001")

**Wildcard DNS Record Configured**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

Wildcard record (\*.example.com) resolves any subdomain. Increases subdomain takeover surface and enables enumeration.

**Remediation:** Remove the wildcard record and create explicit records.

***

### CTL.CLOUDFLARE.ZONE.ALWAYSONLINE.001[​](#ctlcloudflarezonealwaysonline001 "Direct link to CTL.CLOUDFLARE.ZONE.ALWAYSONLINE.001")

**Always Online Mode Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-6; soc2: CC6.1;

Always Online serves stale cached pages when origin is down. May serve outdated security content.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.BOT.001[​](#ctlcloudflarezonebot001 "Direct link to CTL.CLOUDFLARE.ZONE.BOT.001")

**Bot Fight Mode Not Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-4; soc2: CC7.1;

Bot Fight Mode not enabled. Automated bot traffic not detected or challenged.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.BROWSERCHECK.001[​](#ctlcloudflarezonebrowsercheck001 "Direct link to CTL.CLOUDFLARE.ZONE.BROWSERCHECK.001")

**Browser Integrity Check Not Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-4; soc2: CC7.1;

Browser integrity check not enabled. HTTP headers not inspected for common bot signatures.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.CAA.001[​](#ctlcloudflarezonecaa001 "Direct link to CTL.CLOUDFLARE.ZONE.CAA.001")

**Cloudflare Zone Missing CAA Record**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-12; soc2: CC6.1;

No CAA record. Any CA can issue certificates for this domain.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.CHALLENGE.001[​](#ctlcloudflarezonechallenge001 "Direct link to CTL.CLOUDFLARE.ZONE.CHALLENGE.001")

**Challenge Passage TTL Not Configured**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-4; soc2: CC7.1;

Challenge passage TTL at default. Solved challenges remain valid too long — bots operate unchallenged.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.DEVMODE.001[​](#ctlcloudflarezonedevmode001 "Direct link to CTL.CLOUDFLARE.ZONE.DEVMODE.001")

**Development Mode Enabled in Production**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-6; soc2: CC6.1;

Development mode enabled. Disables caching and may bypass security features. Never for production zones.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.DKIM.001[​](#ctlcloudflarezonedkim001 "Direct link to CTL.CLOUDFLARE.ZONE.DKIM.001")

**Cloudflare Zone Missing DKIM Record**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-13; soc2: CC6.1;

No DKIM record. Outgoing email not cryptographically signed.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.DMARC.001[​](#ctlcloudflarezonedmarc001 "Direct link to CTL.CLOUDFLARE.ZONE.DMARC.001")

**Cloudflare Zone Missing DMARC Record**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

No DMARC record. Email spoofing for this domain is not detectable by receiving mail servers.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.DNSSEC.001[​](#ctlcloudflarezonednssec001 "Direct link to CTL.CLOUDFLARE.ZONE.DNSSEC.001")

**Cloudflare Zone DNSSEC Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-20; soc2: CC6.6;

DNSSEC not enabled. DNS responses can be spoofed.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.EMAILOBFUSCATION.001[​](#ctlcloudflarezoneemailobfuscation001 "Direct link to CTL.CLOUDFLARE.ZONE.EMAILOBFUSCATION.001")

**Email Obfuscation Not Enabled**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

Email addresses in HTML not obfuscated. Email scrapers can harvest addresses for spam and phishing.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.FIREWALL.001[​](#ctlcloudflarezonefirewall001 "Direct link to CTL.CLOUDFLARE.ZONE.FIREWALL.001")

**Cloudflare Zone Has No Firewall Blocking Rules**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

No custom firewall rules in block mode. Zone has no custom filtering beyond managed rulesets.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.GEOLOCATION.001[​](#ctlcloudflarezonegeolocation001 "Direct link to CTL.CLOUDFLARE.ZONE.GEOLOCATION.001")

**IP Geolocation Not Enabled**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

CF-IPCountry header not added. Origin cannot implement geographic access controls.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.HOTLINK.001[​](#ctlcloudflarezonehotlink001 "Direct link to CTL.CLOUDFLARE.ZONE.HOTLINK.001")

**Hotlink Protection Not Enabled**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

Other websites can embed images and assets from this domain. Bandwidth theft and content association risk.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.HSTS.001[​](#ctlcloudflarezonehsts001 "Direct link to CTL.CLOUDFLARE.ZONE.HSTS.001")

**Cloudflare Zone HSTS Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-8; soc2: CC6.7;

HTTP Strict Transport Security not enabled. Browsers allow downgrade to HTTP via man-in-the-middle.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.HTTPS.001[​](#ctlcloudflarezonehttps001 "Direct link to CTL.CLOUDFLARE.ZONE.HTTPS.001")

**Cloudflare Zone HTTPS Redirect Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-8; pci\_dss\_v4: 4.1; soc2: CC6.7;

Automatic HTTPS redirect not enabled. HTTP requests served without redirecting to HTTPS.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.RATELIMIT.001[​](#ctlcloudflarezoneratelimit001 "Direct link to CTL.CLOUDFLARE.ZONE.RATELIMIT.001")

**Rate Limiting Not Configured**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-5; pci\_dss\_v4: 6.5; soc2: CC6.6;

No rate limiting rules. Brute force, credential stuffing, and API abuse operate without throttling.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.SPF.001[​](#ctlcloudflarezonespf001 "Direct link to CTL.CLOUDFLARE.ZONE.SPF.001")

**Cloudflare Zone Missing SPF Record**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; soc2: CC6.6;

No SPF record. Any mail server can send email claiming to be from this domain.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.SSL.001[​](#ctlcloudflarezonessl001 "Direct link to CTL.CLOUDFLARE.ZONE.SSL.001")

**Cloudflare SSL Mode Not Full (Strict)**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** hipaa: 164.312(e)(1); nist\_800\_53\_r5: SC-8; pci\_dss\_v4: 4.1; soc2: CC6.7;

SSL mode is Off, Flexible, or Full instead of Full (Strict). Flexible encrypts client-to-Cloudflare but sends plaintext to origin — false HTTPS.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.TLS.001[​](#ctlcloudflarezonetls001 "Direct link to CTL.CLOUDFLARE.ZONE.TLS.001")

**Cloudflare Zone Minimum TLS Version Below 1.2**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-8; pci\_dss\_v4: 4.1; soc2: CC6.1;

Zone accepts TLS 1.0 or 1.1 with known vulnerabilities.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.TLS13.001[​](#ctlcloudflarezonetls13001 "Direct link to CTL.CLOUDFLARE.ZONE.TLS13.001")

**Cloudflare Zone TLS 1.3 Not Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-8; soc2: CC6.1;

TLS 1.3 not enabled. Improved security and performance unavailable.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.UNDERATTACK.001[​](#ctlcloudflarezoneunderattack001 "Direct link to CTL.CLOUDFLARE.ZONE.UNDERATTACK.001")

**Under Attack Mode Permanently Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-6; soc2: CC6.1;

Under Attack mode permanently enabled without active DDoS. Degrades user experience and interferes with legitimate automation.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.UNIVERSALSSL.001[​](#ctlcloudflarezoneuniversalssl001 "Direct link to CTL.CLOUDFLARE.ZONE.UNIVERSALSSL.001")

**Cloudflare Universal SSL Not Enabled**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** encryption
* **Compliance:** nist\_800\_53\_r5: SC-8; soc2: CC6.1;

Universal SSL not active. Subdomains may not have SSL certificates.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.WAF.001[​](#ctlcloudflarezonewaf001 "Direct link to CTL.CLOUDFLARE.ZONE.WAF.001")

**Cloudflare Zone WAF Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; pci\_dss\_v4: 6.4; soc2: CC6.6;

WAF not enabled. No application-layer inspection. All traffic passes to origin unfiltered.

**Remediation:** Remediate per control description.

***

### CTL.CLOUDFLARE.ZONE.WAF.OWASP.001[​](#ctlcloudflarezonewafowasp001 "Direct link to CTL.CLOUDFLARE.ZONE.WAF.OWASP.001")

**Cloudflare OWASP Managed Ruleset Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SC-7; pci\_dss\_v4: 6.5; soc2: CC6.6;

WAF enabled but OWASP managed ruleset not active. No coverage for OWASP Top 10 attack categories.

**Remediation:** Remediate per control description.

***
