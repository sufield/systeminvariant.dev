# Risk Reasoning

Stave is not a scanner. It is a deterministic risk reasoning engine that transforms individual configuration findings into a structured argument about compound risk.

## From observation to inference[​](#from-observation-to-inference "Direct link to From observation to inference")

Traditional security tools produce lists: "This bucket is public. That key is unrotated. Logging is disabled." Each finding is independent. The auditor must reason about how they combine.

Stave automates that reasoning. It takes three independent facts (public bucket, PHI tag, no CloudTrail) and infers that together they constitute a total safety envelope failure. That inference step is what separates a reasoning engine from a scanner.

## Three-layer risk scoring[​](#three-layer-risk-scoring "Direct link to Three-layer risk scoring")

```
Layer 1: Environmental
  base_impact × asset_sensitivity × exposure_vector
  → "How bad is this finding given what it protects?"

Layer 2: Compound
  environmental × chain_escalation × blast_multiplier
  → "How bad is this combination of failures?"

Layer 3: Attack Stage Summary
  Map each MITRE stage to its worst severity
  → "Where are the structural gaps in your defenses?"
```

The attack stage summary maps MITRE ATT\&CK-aligned stages to the worst severity observed in that stage:

* `initial_access` — public S3, open security groups, public RDS
* `credential_access` — MFA failures, key rotation
* `persistence` — IAM self-modification, break-glass
* `exfiltration` — encryption controls
* `detection_evasion` — CloudTrail, GuardDuty, Config
* `resilience` — backups, versioning, Object Lock

### Environmental scoring[​](#environmental-scoring "Direct link to Environmental scoring")

A public S3 bucket in a sandbox account is a bug. The same misconfiguration on a PHI bucket in production is a breach path. Environmental scoring captures this distinction:

| Asset sensitivity | Multiplier |
| ----------------- | ---------- |
| phi / cde         | 3.0        |
| production        | 2.0        |
| internal          | 1.0        |
| dev / sandbox     | 0.5        |

| Exposure vector  | Multiplier |
| ---------------- | ---------- |
| public\_internet | 2.0        |
| cross\_account   | 1.5        |
| vpc\_internal    | 1.0        |
| no\_network      | 0.5        |

### Chain escalation[​](#chain-escalation "Direct link to Chain escalation")

Analysis engines treat findings as a list. Reasoning engines treat findings as a graph. Stave's chain definitions model how one failure weakens another:

```
1 control failing:  1.0x (no escalation)
2 controls failing: 1.8x
3+ controls failing: 2.5x (bounded asymptote)
```

The escalation is intentionally not purely multiplicative — a bucket that's public + unencrypted + unlogged is catastrophically worse than public alone, but the marginal risk has diminishing returns.

### Blast radius multiplier[​](#blast-radius-multiplier "Direct link to Blast radius multiplier")

Some controls, when disabled, make all other violations invisible. CloudTrail being disabled is a medium finding on its own. But it multiplies the risk of every other finding because there is no evidence trail for investigation.

```
Detection controls (CloudTrail, GuardDuty): 2.5x blast multiplier
Prevention controls (PAB, MFA): 1.0x (default)
Recovery controls (backups, versioning): 1.0x (default)
```

### Exposure ranking: finding the silent killers[​](#exposure-ranking-finding-the-silent-killers "Direct link to Exposure ranking: finding the silent killers")

Beyond scoring individual findings and chains, the reasoning engine ranks every finding by exposure to answer the question auditors ask: *what do I fix first?* The ranking surfaces long-lived, high-impact failures that have persisted undetected — the silent killers.

Exposure score combines the base score with how long the failure has been live, its blast radius, and whether it is reachable from outside:

```
ExposureScore = BaseScore × DurationFactor × BlastMultiplier × ExposureMultiplier
```

Duration is the differentiator. A public bucket discovered today is a problem; a public bucket that has been public for four years is a breach that already happened. The duration factor steps up sharply with age:

| Duration               | Factor | Label         |
| ---------------------- | ------ | ------------- |
| < 30 days              | 1.0    | Recent        |
| 30-89 days             | 1.5    | Aging         |
| 90-364 days            | 2.0    | Stale         |
| 365-1642 days          | 3.0    | Long-lived    |
| 1643+ days (4.5 years) | 5.0    | Silent killer |

Findings that have gone unobserved for more than \~300 days are flagged as silent killers. The ranking is deterministic — the same inputs always produce the same order, with ties broken by control ID then asset ID.

## Safety chains[​](#safety-chains "Direct link to Safety chains")

Chains are the inference rules of the reasoning engine. They define which controls form a compound risk when co-failing:

| Chain                  | Controls                                  | Threshold | What it means                                 |
| ---------------------- | ----------------------------------------- | --------- | --------------------------------------------- |
| `public_phi_exposure`  | PUBLIC + ENCRYPT + LOG + CLOUDTRAIL       | 2         | PHI exposed without protection                |
| `root_compromise_path` | ROOT.MFA + ROOT.ACCESSKEY + POLICY.ADMIN  | 2         | Root account lacks defenses                   |
| `detection_blindness`  | CLOUDTRAIL + GUARDDUTY + CONFIG + FLOWLOG | 2         | Monitoring disabled, all violations invisible |

Chains live in `chains/*.yaml` — auditable, version-controlled, and extensible by users.

## Deterministic reasoning vs probabilistic guessing[​](#deterministic-reasoning-vs-probabilistic-guessing "Direct link to Deterministic reasoning vs probabilistic guessing")

This is Stave's sharpest competitive edge:

|                      | AI-powered tools                | Stave                                  |
| -------------------- | ------------------------------- | -------------------------------------- |
| **Method**           | Probabilistic model (black box) | Deterministic logic (transparent)      |
| **Score derivation** | "The model says high risk"      | "PHI × public × no CloudTrail = 150.0" |
| **Auditability**     | Trust the algorithm             | Read the invariants                    |
| **Reproducibility**  | Varies between runs             | Identical for same input               |

When an auditor asks "How did the tool arrive at this Critical score?", Stave provides the logic trace of the reasoning chain. It isn't a score from an algorithm — it's a logical conclusion from a set of invariants.

## Responsibility boundaries[​](#responsibility-boundaries "Direct link to Responsibility boundaries")

```
Assessor    → "Did this control pass or fail?" (observation)
RiskEngine  → "What does this pattern of failures mean?" (inference)
Reporter    → "How do we explain this reasoning?" (attestation)
```

The Logic Trace is what makes the reasoning auditable. It's a first-class data structure, not a log string.

## Time is the second axis scanners miss[​](#time-is-the-second-axis-scanners-miss "Direct link to Time is the second axis scanners miss")

Compound reasoning is one half of what separates Stave from a scanner; time is the other. A scanner sees *existence* ("this bucket is public"). Stave sees *persistence* ("this bucket has been public for 9 days, past your 7-day bound").

Most breaches are not caused by a misconfiguration existing — they are caused by it existing *long enough*. A public bucket for three hours is often fine; for ninety days it is a breach. A leaked admin token rotated in five minutes costs nothing; left for weeks it becomes attacker persistence. Stave encodes this as a duration bound: an `unsafe_duration` control fires only when the unsafe state has persisted past the threshold, which filters transient noise from deployments, testing, and in-flight migrations.

Because evaluation runs over a series of immutable, timestamped snapshots rather than a single live query, the historical record itself becomes a capability scanners cannot offer:

| Use case                   | Scanner (no history) | Stave (with history)                            |
| -------------------------- | -------------------- | ----------------------------------------------- |
| Prove SLA compliance       | No                   | "Fixed on 2026-01-08, within the 7-day SLA"     |
| Grace periods for deploys  | No                   | Tracks but does not alert until threshold       |
| Regression detection       | No                   | Safe Jan 5–Feb 10, then unsafe again            |
| Trend / posture reporting  | No                   | 15 → 12 → 8 → 5 unsafe resources over time      |
| Root-cause correlation     | No                   | `first_unsafe_at` lines up with a commit/deploy |
| Tamper-evident audit trail | No                   | Immutable per-timestamp JSON snapshots          |
| "Was it ever safe?"        | No                   | Grep the snapshot series for the property       |

This is why the evidence on a finding is temporal, not point-in-time: each finding carries `first_unsafe_at`, `last_seen_unsafe_at`, `unsafe_duration_hours`, and the `threshold_hours` it crossed — auditable proof of *when* and *for how long*, not just *that* a problem exists.

## What this means for users[​](#what-this-means-for-users "Direct link to What this means for users")

* **Security engineers**: Define safety chains for your environment. A chain is a security expert's mental model encoded as YAML.
* **Compliance teams**: The output is a structured argument, not a checklist. Sign off on a proof, not a score. History lets you prove remediation happened within SLA instead of asserting it.
* **CISOs**: The attack stage summary tells you where your defenses have structural gaps — in language aligned to MITRE ATT\&CK. Posture trends across snapshots show whether security debt is shrinking.
