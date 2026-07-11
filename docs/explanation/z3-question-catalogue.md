# Z3 Question Catalogue

A scanner asks "is this setting bad?" An SMT solver asks "is this failure **mathematically possible** given the whole system?" That shift turns each finding into a logical proposition the solver can prove or refute against a snapshot — across policies, trust relationships, and network paths.

Stave's own evaluator is Google CEL — it answers per-control predicates, not SAT/UNSAT questions. The questions catalogued below are the ones an SMT-shaped tool, such as the Go example under `examples/z3-public-exposure/`, is well-suited to answer. For the broader architectural picture, see [Stave and Z3](/docs/explanation/z3-solver.md).

## Two question modes[​](#two-question-modes "Direct link to Two question modes")

Cloud-security questions are an open set, but they almost always take one of two shapes:

* **"Can X happen?"** — search for an attack path. Z3 returns the satisfying assignment (the specific principal / condition / resource tuple that makes the unsafe predicate true). Stave surfaces that tuple as a **suggested fix**.
* **"Is it true that Y can never happen?"** — verify a security invariant. Z3 returns UNSAT — a proof that no combination of inputs satisfies the unsafe predicate against the current SIR.

Every question below maps onto one of these two modes.

## Stage 1 — Initial Access[​](#stage-1--initial-access "Direct link to Stage 1 — Initial Access")

Where the cloud perimeter is thin: external actors entering an account.

| Question shape                                                                             | What Z3 reasons over                                                                                                              |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Is any resource provably reachable from the public internet?                               | Bucket policy + PublicAccessBlock + IAM authorization (today: S3); future: VPC route tables + internet gateways + security groups |
| Can an external identity (outside the org) assume any role in this account?                | `AssumeRolePolicyDocument` trust statements + side-channel `AWSPrincipalTrusts` for account-root expansion                        |
| Does any role's trust policy admit a Principal whose conditions Stave does not understand? | The fail-closed rule (unrecognised conditions evaluate to `False`) makes this question well-defined                               |

## Stage 2 — Persistence[​](#stage-2--persistence "Direct link to Stage 2 — Persistence")

Once inside, attackers want to stay. Z3 finds backdoors created by IAM logic flaws.

| Question shape                                                                           | What Z3 reasons over                                                                                           |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Can a restricted user create new access keys for themselves or others?                   | Effective-permission resolution: `iam:CreateAccessKey` granted, not denied by SCP / boundary                   |
| Is it possible to modify an existing trust relationship to add a new external principal? | Permissions on `iam:UpdateAssumeRolePolicy` + the target role's trust policy                                   |
| Can a user change the default version of a policy to a previous, more permissive one?    | `iam:SetDefaultPolicyVersion` permission combined with prior versions of the policy that exist in the snapshot |

## Stage 3 — Privilege Escalation[​](#stage-3--privilege-escalation "Direct link to Stage 3 — Privilege Escalation")

The shift from foothold to admin. This is the densest area of Stave's chain-walker primitives.

| Question shape                                                                                                            | Stave's mechanism                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Can an identity with a `Create*` action plus `iam:PassRole` launch a service resource attached to a more-privileged role? | `lambda_exec` / `ecs_exec` / `cfn_exec` / `glue_exec` / `codebuild_exec` hop types — the create-and-pass primitive                                                                    |
| Can an identity invoke an EXISTING service resource that is bound to a more-privileged role?                              | `lambda_invoke_existing` / `cfn_update_existing` hop types — the [confused-deputy](/docs/explanation/z3-solver.md#confused-deputy-the-use-existing-pattern) invoke-existing primitive |
| Can the principal self-tag a role to satisfy a tag-conditional trust policy?                                              | `tag_mutation` hop type — ABAC privesc primitive                                                                                                                                      |
| Can the principal modify their own IAM policies?                                                                          | Effective-permission analysis with the principal as both subject and resource                                                                                                         |

## Stage 4 — Lateral Movement[​](#stage-4--lateral-movement "Direct link to Stage 4 — Lateral Movement")

Pivoting between identities, networks, accounts, or services once a foothold has admin-equivalent privileges in one slice.

| Question shape                                                                                                                              | What Z3 reasons over                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Is there a multi-hop role-assumption chain leading from a low-privilege identity to an admin role?                                          | The recursive chain walker (`assume_role` hops, depth-bounded, cycle-aware) plus federated assume actions (`AssumeRoleWithWebIdentity`, `AssumeRoleWithSAML`) |
| Can a principal in account B perform `sts:AssumeRole` on a role in account A whose trust policy uses `Principal: AWS: arn:aws:iam::B:root`? | Account-root trust expansion via the `AWSPrincipalTrusts` side-channel                                                                                        |
| Are any cross-account resource-based policies (S3 bucket policies, KMS key policies) admitting principals from untrusted accounts?          | Resource-policy parsing + side-channel principal extraction                                                                                                   |

## Stage 5 — Exfiltration[​](#stage-5--exfiltration "Direct link to Stage 5 — Exfiltration")

Data leaving the trust boundary.

| Question shape                                                                                                                    | What Z3 reasons over                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Is there any combination of conditions (IP, principal, time) under which an unauthenticated user can read data from an S3 bucket? | Bucket-policy statements + IAM-policy statements + PublicAccessBlock composed as one constraint system. Returns UNSAT under PAB or returns a satisfying tuple if exposure is possible. The `examples/z3-public-exposure/` example is a minimal version of this question. |
| Can an identity write data to an S3 bucket that is not owned by the org?                                                          | IAM-policy resource scoping; the question reduces to "does any `s3:PutObject` grant lack a `Resource:` constraint binding to org-owned buckets?"                                                                                                                         |
| Can a private resource bypass logging via a VPC endpoint?                                                                         | VPC-endpoint policy semantics — would be a separate Z3 model, not yet illustrated in `examples/`.                                                                                                                                                                        |
| Can a user share a snapshot / AMI externally?                                                                                     | Permissions on `rds:ModifyDBSnapshotAttribute` / `ec2:ModifySnapshotAttribute`.                                                                                                                                                                                          |

## Beyond per-question SAT/UNSAT[​](#beyond-per-question-satunsat "Direct link to Beyond per-question SAT/UNSAT")

Three reasoning patterns produce more than a yes/no verdict.

### Conflict diagnosis (Unsat Cores)[​](#conflict-diagnosis-unsat-cores "Direct link to Conflict diagnosis (Unsat Cores)")

When Z3 finds a chain of statements that together prove an unsafe predicate, it can extract the **minimal core** — the smallest subset of statements whose removal would change the verdict. Stave renders this as the **suggested fix**: "these three specific lines are jointly responsible; change any one and the resource becomes safe."

This is what makes Z3's findings actionable in a way CEL's boolean output cannot match.

### Redundancy analysis (Subsumption)[​](#redundancy-analysis-subsumption "Direct link to Redundancy analysis (Subsumption)")

For a set of policy rules `{R1, R2, …, Rn}`, Z3 can answer "are the actions allowed by Ri already covered by the rest?" If yes, Ri is redundant — removable without changing the security posture. Useful for tightening sprawling security-group rule sets and IAM policy versions that have accumulated dead clauses. This is a future capability — not in today's Stave Z3 model but a natural fit for the same SIR contract.

### Least-privilege optimization[​](#least-privilege-optimization "Direct link to Least-privilege optimization")

For a set of observed actions an application actually uses (from CloudTrail logs or similar evidence), Z3 can search for the **minimal set of permissions** whose conjunction permits all observed actions and nothing more. The output is a policy diff: "`AdministratorAccess` was attached, but `s3:GetObject` and `dynamodb:PutItem` are the only permissions the application exercises." Also future capability; depends on log-driven evidence that's outside the current snapshot model.

## Multi-stage questions[​](#multi-stage-questions "Direct link to Multi-stage questions")

The strongest questions chain stages together. The chain walker plus the property projector make these expressible against a single SIR:

> Can an attacker gain initial access via a public-internet path AND escalate privileges via the confused-deputy primitive AND exfiltrate data to an external account?

The three sub-questions reduce to:

1. A network-reachability check at Stage 1.
2. A `lambda_invoke_existing` or `cfn_update_existing` hop in Stage 3.
3. An S3 cross-account write in Stage 5.

Stave answers each independently today; chaining them into a single derived finding is the role of the [risk reasoning engine](/docs/explanation/risk-reasoning.md), which composes multi-control chain definitions across findings after evaluation.

## How to surface these to operators[​](#how-to-surface-these-to-operators "Direct link to How to surface these to operators")

A CLI doesn't have buttons, but the question catalogue maps onto how operators run Stave today:

* **Profile-based runs** — `stave apply --profile hipaa` or `--profile pci` activates the subset of controls relevant to a posture. Each profile is essentially a curated answer to "which questions are in scope for my compliance regime?"
* **Domain-scoped runs** — `--controls controls/iam/` runs only the IAM-stage questions; `--controls controls/s3/` only the data-exfiltration / public-exposure ones.
* **Logic Trace** — `stave apply --trace` produces the step-by-step reasoning chain for every verdict. See [the Logic Trace explainer](/docs/explanation/logic-trace.md).
* **SMT-shaped questions** — for SAT/UNSAT reasoning over a snapshot, see the Go example at `examples/z3-public-exposure/`. The example pattern is the starting point for any tool that needs the kinds of question this page catalogues.
