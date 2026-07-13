---
title: Command Interpretation Reference
sidebar_position: 98
---

# Command Interpretation Reference

Use this page to quickly interpret `stave` command output and jump to the right detail page.

| Command | What Output Means | Interpretation Guide | CLI Reference |
|---|---|---|---|
| `stave demo` | One-command proof of detection loop (`finding/evidence/fix/report`) | `stave.md` | [`stave demo`](/docs/cli-reference/stave-demo) |
| `stave quickstart` | Fast-path execution summary (`Source/Top finding/Resource/Fix/Report/Next`) | `stave.md` | [`stave quickstart`](/docs/cli-reference/stave-quickstart) |
| `stave validate` | Input correctness and schema/contract readiness | — | [`stave validate`](/docs/cli-reference/stave-validate) |
| `stave plan` | Readiness gate with explicit next command | — | [`stave plan`](/docs/cli-reference/stave-plan) |
| `stave apply` | Invariant engine result; violations are expected exit `3` | — | [`stave apply`](/docs/cli-reference/stave-apply) |
| `stave diagnose` | Why findings occurred (root-cause style guidance) | — | [`stave diagnose`](/docs/cli-reference/stave-diagnose) |
| `stave verify` | Before/after remediation comparison (`resolved/remaining/introduced`) | [`verify.md`](/docs/verify) | [`stave verify`](/docs/cli-reference/stave-verify) |
| `stave report` | Human-readable report artifact from evaluation output | — | [`stave report`](/docs/cli-reference/stave-report) |
| `stave ingest` | Raw snapshot conversion to observation schema | — | [`stave ingest`](/docs/cli-reference/stave-ingest) |
| `stave snapshot upcoming` | Time-based action queue and due-state summary | — | [`stave snapshot upcoming`](/docs/cli-reference/stave-snapshot-upcoming) |
| `stave status` | Current project state and next workflow step | — | [`stave status`](/docs/cli-reference/stave-status) |
| `stave doctor` | Environment prerequisite checks (`PASS/WARN/FAIL`) | — | [`stave doctor`](/docs/cli-reference/stave-doctor) |

`—` means a dedicated interpretation deep-dive page is not published yet; use CLI reference plus command docs.
