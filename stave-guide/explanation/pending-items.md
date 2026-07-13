---
title: "Pending Items"
sidebar_label: "Pending Items"
sidebar_position: 11
description: "Controls and engine slices that are scheduled for implementation but not yet shipped."
---

# Pending Items

The following work items are scheduled for implementation but not
yet shipped. Each entry names the artifact, what it depends on,
and the rough scope.

| Item | Type | Notes |
|------|------|-------|
| EFS encryption controls | New control domain | Requires a new `internal/controldata/embedded/efs/` directory and a `go:embed` directive update. |
| Identity / drift / composition / rank / check engine slices | Engine (Go) | Five feature slices on the evaluation engine roadmap. |
| Service locator refactoring | Engine refactor | Touches the `apply` critical path; staged behind a regression-safe rollout. |
