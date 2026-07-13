---
title: "Lab Results"
sidebar_label: "Lab Results"
sidebar_position: 4
description: "Verified detection rates across four vendor lab suites — with links to detailed tutorials."
---

# Lab Results

Stave's control catalog and evaluation engine verified against four
independent vulnerable-infrastructure lab suites. Every documented
attack path is detected from a static configuration snapshot.

## Summary

| Vendor | Lab | Scenarios | Findings | Chains | Detection rate |
|--------|-----|-----------|----------|--------|---------------|
| Rhino Security | CloudGoat | 10 | 53 | 12 | 100% |
| Bishop Fox | IAM Vulnerable | 33 users | 30 | — | 100% |
| NCC Group | SadCloud | 12 services | 57 | 3 | 100% |
| Datadog | Pathfinding Labs | 2 chains | 7 | — | 100% |

**Zero false positives across all four suites.**

## CloudGoat — 10 scenarios

| Scenario | Key finding | Chains |
|----------|------------|--------|
| iam_privesc_by_attachment | ATTACHUSERPOLICY.001 | iam_privesc_by_attachment |
| iam_privesc_by_rollback | CREATEPOLICYVERSION.001 | iam_privesc_by_rollback |
| lambda_privesc | ASSUMEROLE.001 + PASSROLE.CREATEFUNCTION.001 | lambda_privesc |
| cloud_breach_s3 | IMDSV2.001 + PUBLIC.001 | ec2_public_credential_exposure |
| codebuild_secrets | SECRETS.001 + ENCRYPT.001 | — |
| ecs_efs_attack | IMDSV2.001 + ENCRYPT.001 | ec2_public_credential_exposure (x2) |
| glue_privesc | PASSROLE.CREATEJOB.001 | — |
| sns_secrets | POLICY.PUBLIC.001 + ENCRYPT.001 | sns_data_exposure |
| sqs_flag_shop | ASSUMEROLE.001 | lambda_privesc |
| vulnerable_cognito | COGNITO.MFA.001 | — |

## What the labs proved

1. **The control catalog covers real attack paths** — not theoretical
   misconfigurations, but the exact configurations deployed by
   professional red-team lab vendors
2. **Compound chains assemble correctly** — multi-hop escalation paths
   (user → role → Lambda → admin) are detected as chains, not just
   individual findings
3. **Three reasoning engines agree** — CEL, Soufflé, and Z3
   independently verify the same facts on the IAM escalation scenarios
4. **The collector pattern works** — scenario-specific collectors
   capture only the relevant assets, producing clean, focused
   observations

## What the labs surfaced

- **3 engine bugs** fixed during Lab 1 (Inconclusive exposure, asset-type
  gate, assessment cache)
- **1 new control** authored during Lab 7 (PASSROLE.CREATEJOB.001 for
  Glue job escalation — the catalog had no Glue CreateJob control)
- **2 S3 policy intersection controls** authored after the labs
  (SHADOW.ALLOW.001, DENY.BYPASS.001)
- **Collector enrichments** accumulated across labs: service wildcards,
  group-inherited policies, compound escalation actions, role escalation
  properties

Every bug, gap, and enrichment was found by running the labs, not by
auditing the code. The labs are the test suite.
