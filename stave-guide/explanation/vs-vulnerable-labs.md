---
title: "Stave vs Vulnerable Labs"
sidebar_label: "vs Vulnerable Labs"
sidebar_position: 3
description: "Attacker-centered labs versus defender-centered evaluation — and how they compose."
---

# Stave vs Vulnerable Labs

## Two sides of the same problem

```
Vulnerable labs:  Attacker-centered. "Can you exploit this?"
                  Needs a live cloud environment.
                  Tests attack execution.

Stave:            Defender-centered. "Can you prove, explain, and prevent this?"
                  Air-gapped. No credentials.
                  Tests reasoning over static evidence.
```

## The relationship

Labs are sources of known-bad test fixtures. Stave turns lab lessons
into repeatable checks.

The workflow:

1. Deploy a CloudGoat scenario → vulnerable infrastructure exists
2. Capture a snapshot → static JSON, no credentials needed after this
3. Destroy the infrastructure → the evidence persists
4. Run `stave apply` on the snapshot → findings match the known attack path
5. The snapshot becomes a regression fixture → the check runs forever

The lab teaches the attack. Stave encodes the defense. The fixture
proves the defense works.

## Verified results

| Vendor | Lab | Attack paths | Stave findings | Match |
|--------|-----|-------------|---------------|-------|
| Rhino Security | CloudGoat (10 scenarios) | 10 | 53 findings, 12 chains | 100% |
| Bishop Fox | IAM Vulnerable (33 users) | 30 modeled | 30 | 100% |
| NCC Group | [SadCloud (12 services)](../labs/sadcloud-multi-service-validation.md) | 57 misconfigs | 57 | 100% |
| Datadog | Pathfinding Labs (2 chains) | 7 hops | 7 | 100% |

Every attack path documented by the lab vendor is detected by Stave
from the static snapshot. No false positives. No live infrastructure
needed after capture.

## What labs test that Stave doesn't

Labs test exploitation — the actual runtime steps an attacker takes.
Stave doesn't execute attacks. It evaluates the configuration
preconditions that make attacks possible.

- "Can I SSH into this EC2 instance?" → lab (runtime)
- "Does this EC2 instance have IMDSv1 + a public IP?" → Stave (configuration)
- "Can I steal the instance role credentials?" → lab (exploitation)
- "Is the credential theft chain `ec2_public_credential_exposure` active?" → Stave (reasoning)

## What Stave tests that labs don't

Labs test one scenario at a time. Stave evaluates the entire
configuration surface simultaneously.

- **Cross-scenario composition** — a finding from the IAM escalation
  scenario and a finding from the S3 exposure scenario compose into a
  chain that neither scenario tests individually
- **Prevention** — the control predicate IS the prevention rule; labs
  teach you what went wrong, Stave encodes the rule that stops it
- **Determinism** — the same snapshot produces the same findings on
  every run, on every machine, verified by three independent engines
