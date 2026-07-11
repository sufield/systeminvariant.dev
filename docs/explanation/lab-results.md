# Lab Results

Stave's control catalog and evaluation engine verified against four independent vulnerable-infrastructure lab suites. Every documented attack path is detected from a static configuration snapshot.

## Summary[​](#summary "Direct link to Summary")

| Vendor         | Lab              | Scenarios   | Findings | Chains | Detection rate |
| -------------- | ---------------- | ----------- | -------- | ------ | -------------- |
| Rhino Security | CloudGoat        | 10          | 53       | 12     | 100%           |
| Bishop Fox     | IAM Vulnerable   | 33 users    | 30       | —      | 100%           |
| NCC Group      | SadCloud         | 12 services | 57       | 3      | 100%           |
| Datadog        | Pathfinding Labs | 2 chains    | 7        | —      | 100%           |

**Zero false positives across all four suites.**

## CloudGoat — 10 scenarios[​](#cloudgoat--10-scenarios "Direct link to CloudGoat — 10 scenarios")

| Scenario                     | Key finding                                  | Chains                                 |
| ---------------------------- | -------------------------------------------- | -------------------------------------- |
| iam\_privesc\_by\_attachment | ATTACHUSERPOLICY.001                         | iam\_privesc\_by\_attachment           |
| iam\_privesc\_by\_rollback   | CREATEPOLICYVERSION.001                      | iam\_privesc\_by\_rollback             |
| lambda\_privesc              | ASSUMEROLE.001 + PASSROLE.CREATEFUNCTION.001 | lambda\_privesc                        |
| cloud\_breach\_s3            | IMDSV2.001 + PUBLIC.001                      | ec2\_public\_credential\_exposure      |
| codebuild\_secrets           | SECRETS.001 + ENCRYPT.001                    | —                                      |
| ecs\_efs\_attack             | IMDSV2.001 + ENCRYPT.001                     | ec2\_public\_credential\_exposure (x2) |
| glue\_privesc                | PASSROLE.CREATEJOB.001                       | —                                      |
| sns\_secrets                 | POLICY.PUBLIC.001 + ENCRYPT.001              | sns\_data\_exposure                    |
| sqs\_flag\_shop              | ASSUMEROLE.001                               | lambda\_privesc                        |
| vulnerable\_cognito          | COGNITO.MFA.001                              | —                                      |

## What the labs proved[​](#what-the-labs-proved "Direct link to What the labs proved")

1. **The control catalog covers real attack paths** — not theoretical misconfigurations, but the exact configurations deployed by professional red-team lab vendors
2. **Compound chains assemble correctly** — multi-hop escalation paths (user → role → Lambda → admin) are detected as chains, not just individual findings
3. **Three reasoning engines agree** — CEL, Soufflé, and Z3 independently verify the same facts on the IAM escalation scenarios
4. **The collector pattern works** — scenario-specific collectors capture only the relevant assets, producing clean, focused observations

## What the labs surfaced[​](#what-the-labs-surfaced "Direct link to What the labs surfaced")

* **3 engine bugs** fixed during Lab 1 (Inconclusive exposure, asset-type gate, assessment cache)
* **1 new control** authored during Lab 7 (PASSROLE.CREATEJOB.001 for Glue job escalation — the catalog had no Glue CreateJob control)
* **2 S3 policy intersection controls** authored after the labs (SHADOW\.ALLOW\.001, DENY.BYPASS.001)
* **Collector enrichments** accumulated across labs: service wildcards, group-inherited policies, compound escalation actions, role escalation properties

Every bug, gap, and enrichment was found by running the labs, not by auditing the code. The labs are the test suite.
