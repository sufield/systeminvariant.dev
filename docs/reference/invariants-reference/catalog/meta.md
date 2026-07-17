# META controls (1)

### CTL.META.OBSERVATION.STALE.001[​](#ctlmetaobservationstale001 "Direct link to CTL.META.OBSERVATION.STALE.001")

**Observation Data Is Stale — Collector May Have Stopped**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** governance
* **Compliance:** hipaa: 164.312(b); nist\_800\_53\_r5: SI-4, AU-6; owasp\_nhi: NHI8; soc2: CC7.1, CC7.2;

The most recent observation's captured\_at timestamp is older than the configured freshness threshold (default 24 hours, exceeded = precomputed boolean on a synthetic meta asset). The infrastructure may have changed since the last collection. Every finding evaluated against this snapshot is therefore based on stale data — every PASS is suspect, every violation may have been remediated, and every green dashboard is potentially green because the collector died, not because the infrastructure is safe. This is a meta-control — it checks the observation pipeline itself, not the infrastructure the observations describe. A stale observation is the canary that catches collector failure before it causes a coverage gap.

**Remediation:** Triage the collector pipeline: 1) Confirm the collector process is running (check the systemd unit, container task, or scheduler entry that drives it). 2) Verify the collector still has the IAM credentials and permissions it needs to read the cloud APIs. 3) Check the output path is writable and not full. 4) Inspect the collector's logs (CloudWatch, journald, container stdout) for errors immediately before captured\_at. Once the collector is restored, re-run `stave apply` with the fresh observation; this control falls silent automatically.

***
