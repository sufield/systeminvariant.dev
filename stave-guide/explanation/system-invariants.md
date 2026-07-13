---
title: "System Invariants"
sidebar_label: "System Invariants"
description: "What system invariants are, how they are expressed as code in Stave, and how they differ from OPA, IaC scanners, and CSPM tools."
---


What a System Invariant is, why it is the right abstraction for infrastructure security, and how Stave expresses invariants as code.

---

## What a System Invariant Is

A System Invariant is a property of deployed infrastructure that must hold across all observable states. It is a statement about the system that must be true at every moment the system is observed.

"PHI data must be private and encrypted" is a System Invariant. It must hold in every account, every region, at every point in time, regardless of who configured the resource, when it was deployed, or what exemption process exists. If the invariant does not hold, the system is in a violated state.

This is distinct from code-level invariants in the Dijkstra or Hoare logic sense. A code-level invariant is a property of a program's execution state — a loop invariant, a class invariant, a precondition. A System Invariant is a property of a *deployed system's configuration state*. The asset is an S3 bucket, an RDS database, a Kubernetes cluster. The evaluation is a predicate evaluated against a JSON observation of infrastructure configuration.

## The Abstraction Level

System Invariants operate at the system level. They describe properties of infrastructure configuration — encryption settings, access controls, network exposure, logging configuration.

"S3 buckets must block public access" is a System Invariant. "The login page must rate-limit after 5 failed attempts" is application behavior, outside scope — it is invisible in any infrastructure configuration snapshot.

This distinction is the boundary between what Stave can evaluate and what it cannot. If a property is visible in a configuration snapshot, Stave can enforce a System Invariant over it.

## Formal Model

Let:

- `S_t` be an observation snapshot at time `t`
- `I` be a control predicate over asset properties
- `U(r, t) = 1` when asset `r` is unsafe in snapshot `S_t` under `I`

For `unsafe_state`, a violation exists if `U(r, t_now) = 1`.

For `unsafe_duration`, a violation exists when:

- `U(r, t_now) = 1`
- and `(t_now - t_first_unsafe(r)) > threshold`

This is why Stave can express "unsafe now" and "unsafe for too long" as separate control types.

## Example: S3 PHI bucket must not be public

```yaml
dsl_version: ctrl.v1
id: CTL.S3.PUBLIC.001
name: No Public S3 Buckets
description: S3 buckets with sensitive data must not be publicly readable or listable.
domain: exposure
scope_tags: [aws, s3]
type: unsafe_state
unsafe_predicate:
  any:
    - field: properties.storage.access.public_read
      op: eq
      value: true
    - field: properties.storage.access.public_list
      op: eq
      value: true
```

If either property is true in a snapshot, Stave emits a finding.

## The Duality: System Invariant and Attack Path

Every System Invariant has a dual: when the invariant is violated, a specific attack capability is enabled. "EBS volumes must be encrypted at rest" — when this invariant is violated, the capability "unencrypted disk data accessible to any attacker with volume access" is enabled.

This duality is structurally encoded in the chain model. Each compound chain declares which capabilities its member invariant violations enable (postconditions) and which capabilities an attacker must already possess to exploit the violations (preconditions).

When three System Invariants fail simultaneously — public endpoint, no MFA on the IAM role, no CloudTrail logging — the capabilities they enable compose: internet access enables credential theft, which enables undetected data access. The chain is a path through simultaneously violated invariants.

## Why Chains Are Compound Simultaneous Violations

A single violated invariant creates a condition. A combination of violated invariants creates a capability. The distinction is *composability*.

An S3 bucket with public access is a condition. An S3 bucket with public access, containing PHI, with no access logging, and no CloudTrail data events is a *complete exfiltration path*: discoverable, accessible, containing valuable data, with no detection mechanism. Each individual invariant violation is a finding. The combination is a different class of risk — one that cannot be captured by summing individual severities.

This is why chains are separate from controls. A control evaluates one invariant on one asset. A chain evaluates whether a *set of simultaneously violated invariants* compose into an attack path.

## The Positive Framing Consequence

The most counterintuitive property of System Invariants: the *absence* of a violation is positive evidence that the invariant holds.

Most security tools detect the presence of problems. A vulnerability scanner finds CVEs. A penetration test finds exploitable weaknesses. The absence of findings does not mean the system is secure.

System Invariants invert this. When `stave apply` evaluates 630 controls against a snapshot and produces 0 violations, each passing control is positive evidence that the corresponding invariant holds for every observed asset at that point in time. The evidence is "we proved, for each asset, that the required property is true."

This is the foundation of evidence-based compliance. An auditor asking "was encryption enabled on this database during Q1?" can receive 90 daily snapshots showing the invariant held on every observation.

## How Stave Differs from Alternatives

| Approach | Primary input | Cloud credentials needed | Offline | What it proves | Typical use |
|---|---|---|---|---|---|
| Policy-as-Code (OPA/Sentinel) | Config, admission requests | Usually no | Often | Policy decision for a request/config | CI/CD gates, admission control |
| IaC scanners (tfsec/Checkov) | IaC source and plan artifacts | No | Yes | Static misconfiguration patterns in IaC | Pre-merge / CI scan |
| CSPM (Wiz/Prisma/etc.) | Live cloud APIs and graph inventory | Yes | No | Continuous posture and exposure | Continuous monitoring |
| Stave | Local observation snapshots + control rules | No | Yes | Deterministic control violations over observed state and time windows | Offline preflight, audit evidence, investigations |

- **Stave + OPA:** Use OPA for request-time or pipeline gate policy decisions; use Stave to prove state controls over snapshots and time-based thresholds.
- **Stave + CSPM:** Use CSPM for continuous cloud detection; use Stave for offline, deterministic replay and preflight checks with no API access.

## Scope Boundaries

- **Evaluation-first** — Stave evaluates observations and ships a built-in converter (`stave transform`) that reshapes raw snapshots into `obs.v0.1`; collection and remediation are separate programs.
- **Offline by design** — all inputs are local files; cloud API access belongs to collectors.
- **Deterministic** — same inputs produce the same findings, scores, and rankings.
