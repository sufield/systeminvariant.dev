---
title: What's Coming
tags: [stave]
---

Articles on cloud security evaluation, IAM policy semantics, and
configuration-graph analysis — each one a real finding, a real fix,
and a machine-verifiable proof that the fix worked.

<!-- truncate -->

Every article ships with the snapshot, the control, and the commands
to reproduce the finding yourself. No trust required — re-derive the
result on your own machine.

Topics in the queue:

- **ForAllValues / ForAnyValue** — the IAM condition key semantics that
  produce silent privilege escalation, and how to prove your policies
  are safe
- **Ghost-reference findings** — when a resource references something
  that doesn't exist in the account snapshot, and why that's a
  critical signal
- **Compound chains** — multi-hop attack paths that only appear when
  you reason across the relationship graph, not resource-by-resource
