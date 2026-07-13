---
title: "Stave vs Scanners"
sidebar_label: "vs Scanners"
sidebar_position: 1
description: "What scanners check versus what Stave checks — the trichotomy of cloud security tools."
---

# Stave vs Scanners

## The trichotomy

| Approach | What it does | Example |
|----------|-------------|---------|
| **Detect and delegate** | Scan current state, report findings | Prowler, ScoutSuite, Steampipe |
| **Infer from data** | Scan contents + configuration, infer risk paths | Wiz, Orca, Prisma Cloud |
| **Enforce declared intent** | Evaluate static evidence against authored rules | Stave |

These are not competitors — they're different bets on the same problem.

## What scanners do well

Scanners are fast, broad, and low-friction. A scanner can check 200
services in 5 minutes and report every deviation from a benchmark.
They're excellent at:

- **Benchmarking** — CIS, NIST, PCI compliance checklists
- **Coverage** — touching every AWS service in one pass
- **Speed** — real-time or near-real-time detection

Stave does not replace this. If you need "is MFA enabled on every
IAM user?" across 50 accounts in 3 minutes, run a scanner.

## What scanners miss

Scanners check one resource at a time. They answer: "is this S3 bucket
public?" They don't answer:

- **Composition** — "can this user reach this bucket through a
  two-hop role assumption chain?"
- **Latent exposure** — "is this bucket safe today but dangerous if
  one setting changes?"
- **Prevention** — "what rule would have prevented this exposure
  from ever existing?"
- **Proof** — "can you formally verify that this finding is correct
  using a second reasoning engine?"

These are reasoning problems, not scanning problems. They require
evaluating relationships between configurations, not checking
individual resources against a checklist.

## The gap in practice

The CloudGoat `lambda_privesc` scenario has three IAM resources:
a user, a role, and a high-privilege execution role. No individual
resource is "misconfigured" in isolation. The user has `sts:AssumeRole`
(legitimate). The role has `lambda:*` + `iam:PassRole` (its job). The
execution role has `AdministratorAccess` (intentional for the Lambda).

The vulnerability is the *composition*: user assumes role, role
creates Lambda with execution role, Lambda runs with admin. A scanner
that checks each resource independently finds no issue. Stave
evaluates the three-asset chain and fires `lambda_privesc [critical]`.

## When to use which

| Situation | Tool |
|-----------|------|
| "Is this account CIS-compliant?" | Scanner |
| "Can any user reach admin through role chains?" | Stave |
| "What changed since last week?" | Scanner (state diff) or Stave (finding diff) |
| "Prove this finding to the auditor" | Stave (deterministic, reproducible, multi-engine) |
| "What rule prevents this class of exposure?" | Stave (control authoring) |

They compose. Run the scanner for coverage. Run Stave for reasoning.
The scanner finds what's wrong. Stave proves why it's dangerous and
how to prevent it.
