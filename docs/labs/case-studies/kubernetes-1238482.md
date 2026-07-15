# The Ingress that rewrote a neighbor's firewall

## Metadata[​](#metadata "Direct link to Metadata")

* **Title:** The Ingress that rewrote a neighbor's firewall
* **Source of the case:** Kubernetes / aws-load-balancer-controller report #1238482
* **AWS service(s):** EKS, EC2 Security Groups, ELB (ALB)
* **Risk archetype:** trust confusion — a controller acts on attacker-supplied references
* **One-line hook:** Can you prove one tenant can't reshape another tenant's security group?

***

## 0. The challenge (what the reader does first)[​](#0-the-challenge-what-the-reader-does-first "Direct link to 0. The challenge (what the reader does first)")

**Scenario given to the reader:**

A shared EKS cluster runs the AWS ALB Ingress Controller. The controller reconciles security groups based on annotations that any tenant can put on their own Ingress object. One tenant's namespace is annotated to reference a security group that belongs to a *different* tenant. The controller has no check that the requesting namespace owns the security group it names.

**Evidence they're handed (and nothing else):**

```
{
  "cluster": "shared-eks",
  "ingress_annotation": {"alb.ingress.kubernetes.io/security-groups": "sg-0abc123def456"},
  "security_group_owner": "tenant-a",
  "ingress_namespace": "tenant-b",
  "controller_validates_ownership": false
}
```

* The cluster name, the Ingress annotation, who owns the referenced SG, which namespace the Ingress lives in, and whether the controller validates ownership.
* No AWS credentials. No live account. No scripts.

**The questions they must answer from the evidence alone:**

1. When tenant-b's Ingress references `sg-0abc123def456` (owned by tenant-a), what does the controller do to that security group?
2. Why does the controller act on this annotation at all — what trust is it extending to a tenant-supplied identifier it never verified?
3. Which path produces the exposure: a missing RBAC rule inside Kubernetes, or a missing *ownership validation* between the Kubernetes object and the AWS resource?
4. In a multi-tenant cluster, what is the blast radius — one SG, or every SG any tenant can name?
5. What single rule would have prevented a namespace from binding an Ingress to a security group it does not own?

***

## 1. The manual problem[​](#1-the-manual-problem "Direct link to 1. The manual problem")

Answering this by hand means tracing a reference across two trust domains. Inside Kubernetes, tenant-b is fully entitled to annotate its own Ingress — RBAC sees nothing wrong. Inside AWS, the security group belongs to tenant-a — IAM sees a controller principal acting normally. Neither side, looked at alone, shows a violation. The exposure only appears when you line up "who issued the annotation" against "who owns the resource the annotation names," and notice the controller collapses that gap by trusting the annotation verbatim.

To prove safety the reviewer has to enumerate, for every Ingress in the cluster, which security group it references and whether the namespace owns that group — a cross-product that grows with every tenant and changes on every deploy. There is no single place that records "this binding crosses a tenant boundary."

***

## 2. The reasoning wall (capture, don't invent)[​](#2-the-reasoning-wall-capture-dont-invent "Direct link to 2. The reasoning wall (capture, don't invent)")

| What they hit                       | What they said / would say                                                                      |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| Two trust domains, neither flags it | "RBAC's fine and IAM's fine, so where's the bug?"                                               |
| Controller trusts the annotation    | "The annotation is just a string — I didn't think the controller would act on a foreign SG ID." |
| Blast radius across tenants         | "Wait, so any namespace can name any security group in the account?"                            |

**The insight the reader should reach on their own:**

> The vulnerability is not in any single setting — it's that a privileged controller turns an untrusted reference into a cross-tenant write.

***

## 3. Why scanners miss or flatten it[​](#3-why-scanners-miss-or-flatten-it "Direct link to 3. Why scanners miss or flatten it")

A per-setting scanner inspects the security group and reports its rules as fine. It inspects the Ingress and reports valid YAML. It inspects the controller's IAM role and reports a normal permission set. Every node is green. What it cannot see is the *edge*: that a namespace in one tenant is bound, through an annotation the controller trusts blindly, to a security group owned by another tenant. The risk is the relationship between two objects that each look correct in isolation — and a node-by-node scanner has no representation for "this reference crosses an ownership boundary the controller never checks."

***

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it. The reader has now done the work and hit the wall. Only now does the tool appear.

***

## 4. The evidence Stave consumes[​](#4-the-evidence-stave-consumes "Direct link to 4. The evidence Stave consumes")

The same static facts the reader had — the Ingress annotation, the security group's owner, the requesting namespace, and the controller's validation behavior — captured as an observation snapshot. No live cluster access, no new privileges.

```
{
  "cluster": "shared-eks",
  "ingress_annotation": {"alb.ingress.kubernetes.io/security-groups": "sg-0abc123def456"},
  "security_group_owner": "tenant-a",
  "ingress_namespace": "tenant-b",
  "controller_validates_ownership": false
}
```

* Normalization: the referenced SG and its owner are joined against the requesting namespace, and the controller's `validates_ownership` flag is recorded so the cross-tenant binding becomes an explicit fact rather than an inference.

***

## 5. The reasoning Stave performs[​](#5-the-reasoning-stave-performs "Direct link to 5. The reasoning Stave performs")

* **Control / invariant:** `CTL.EKS.AWSAUTH.MASTERS.BROAD.001` — broad cluster permissions must not let one tenant manipulate another tenant's AWS resources.
* **What it evaluates:** does an Ingress in namespace X reference a security group whose owner is not X, while the controller does not validate ownership? If so, the controller will reconcile a cross-tenant write to that SG's rules.
* **Verdict produced:** NON\_COMPLIANT when the referenced security group's owner differs from the requesting namespace and ownership validation is off. When owner metadata is absent, the control reports the binding as unverifiable rather than silently passing it.

```
control: CTL.EKS.AWSAUTH.MASTERS.BROAD.001
asset:   ingress(tenant-b) -> security-group sg-0abc123def456 (owner: tenant-a)
evidence: controller_validates_ownership = false; sg owner != ingress namespace
verdict: NON_COMPLIANT — tenant-b can modify tenant-a's security group rules
```

***

## 6. The prevention artifact Stave produces[​](#6-the-prevention-artifact-stave-produces "Direct link to 6. The prevention artifact Stave produces")

* **Artifact:** an ownership-validation guardrail for the controller — an admission policy (and matching SCP guidance) that rejects any Ingress whose `security-groups` annotation names a security group not owned by the requesting tenant's namespace.
* **What it forecloses:** the exact latent state from question 2 — the moment the controller would otherwise turn a foreign SG reference into a write. Manual fix: remove the cross-tenant annotation or scope each tenant to its own SG namespace prefix; the guardrail then keeps the binding from ever being reconciled again.

```
# Admission guardrail (deny cross-tenant security-group binding)
when:
  object.kind == "Ingress"
  annotation["alb.ingress.kubernetes.io/security-groups"] is set
require:
  for each sg in annotation.security-groups:
    sg.owner_tag["tenant"] == object.metadata.namespace.tenant
otherwise:
  deny "Ingress references security group not owned by this tenant namespace"
```

***

## 7. What the team no longer does manually[​](#7-what-the-team-no-longer-does-manually "Direct link to 7. What the team no longer does manually")

| Before                                                        | After Stave                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| Cross-reference every Ingress annotation against SG ownership | One control joins reference to owner and fails cross-tenant bindings |
| Trust that RBAC + IAM together imply tenant isolation         | Isolation is proven at the controller's reference edge, not assumed  |
| Re-audit on every tenant deploy                               | The guardrail rejects foreign-SG bindings at admission, every time   |

***

## Positioning line for this case[​](#positioning-line-for-this-case "Direct link to Positioning line for this case")

> Stave proves that no tenant's Ingress can reshape another tenant's firewall — by evaluating the ownership edge between a Kubernetes annotation and the AWS security group it names — and emits an admission guardrail that refuses the cross-tenant binding before the controller acts.

***

## Reuse checklist[​](#reuse-checklist "Direct link to Reuse checklist")

* [x] A reader could attempt section 0 with zero Stave knowledge
* [x] Stave is not named or shown before the pivot point
* [x] Section 2 quotes are real (or honestly plausible), not slogans
* [x] Section 3 names the *specific* thing per-setting tools can't see
* [x] Section 6 closes the exact latent state raised in section 0, question 2
* [x] The title names the failure, not the product
