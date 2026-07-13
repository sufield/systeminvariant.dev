---
sidebar_position: 2
title: "Design Philosophy"
description: "Why Stave is standards-first from day one and how that avoids vendor lock-in."
---

# Design Philosophy

Stave is standards-first from the first version so teams can adopt quickly without locking into a single vendor stack.

## Principles

1. Contract-first workflows with versioned schemas
2. Vendor-neutral data model and extractor strategy
3. Deterministic outputs for reproducible CI/CD
4. Offline operation without cloud credentials for evaluation
5. CLI composability with stable flags, formats, and exit codes

## Open Contracts

- `inv.v0.1` for invariants
- `obs.v0.1` for observations
- `out.v0.1` for findings and reports
- JSON Schemas in `schemas/` as the source of truth

## Why This Matters

- You can build extractors in any language.
- You can validate contracts in other language runtimes.
- You can run the same workflows locally, in CI, or in audit environments.
- You can evolve infrastructure tooling without rewriting Stave’s core engine.

Stave is intended to be a portable safety layer that integrates with your existing platform choices.
