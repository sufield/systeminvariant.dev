---
title: "Identity Blast Radius"
sidebar_label: "Identity Blast Radius"
description: "Why identity blast radius measures the damage surface of a single compromised credential, and how it differs from control-level blast radius."
---

# Identity Blast Radius

Identity blast radius answers: "If this credential is compromised,
how many resources can the attacker reach?"

Unlike control-level blast radius (which measures how disabling a
control blinds the account), identity blast radius measures the
**damage surface** of a single compromised credential. A role that
can reach 80 resources across 3 accounts is a different risk than
a role scoped to 5 resources in one account — even if both roles
have the same severity-level findings.

## How it works

### Extractor computes, Stave evaluates

The extractor performs the IAM policy graph analysis and stores
the results as observation properties. Stave evaluates them:

```
Extractor                              Stave
────────                              ─────
Traverse sts:AssumeRole edges    →    Check reachable_resources_count > 50
Collect data access permissions  →    Check blast_radius_scope == "cross_account"
Count unique resources/accounts  →    Check assume_chain_depth > 2
Store in observation properties  →    Evaluate as standard predicates
```

This preserves Stave's core promise: deterministic evaluation of
YAML controls against observation properties.

### Extractor analysis steps

1. For each IAM role, list attached and inline policies
2. Parse policy documents for `sts:AssumeRole` with Resource ARNs
3. For each assumable role, recursively collect its permissions
4. Count unique resource ARNs across all reachable roles
5. Count unique account IDs from resource ARNs
6. Measure the longest assumption chain depth
7. Classify scope: `cross_account` if any resource is in another account

## Relationship to control-level blast radius

Stave has two kinds of blast radius:

| Type | What it measures | Where it's stored |
|---|---|---|
| **Control blast radius** | How far damage spreads when a *control* fails | Control `params.blast_radius` |
| **Identity blast radius** | How far damage spreads when a *credential* is compromised | Observation `identity.role.*` properties |

Control blast radius multiplies compound scores (e.g., disabled
CloudTrail inflates all findings by 2.5x). Identity blast radius
triggers its own controls when thresholds are exceeded.

Both feed into the risk reasoning engine — control blast radius
through the multiplier, identity blast radius through the chain.

## See also

- [Identity Blast Radius Reference](../reference/identity-blast-radius.md) —
  the four blast radius controls, observation properties, the
  `identity_blast_radius` chain, and example output.
