# The cluster admin keyed to an identifier that isn't a secret

## Metadata[​](#metadata "Direct link to Metadata")

* **Title:** The cluster admin keyed to an identifier that isn't a secret
* **Source of the case:** HackerOne report #1580493 (Kubernetes / EKS)
* **AWS service(s):** EKS, IAM
* **Risk archetype:** broad privilege bound to a non-secret identity
* **One-line hook:** Can you prove that knowing a public Access Key ID does not grant someone cluster admin?

***

## 0. The challenge (what the reader does first)[​](#0-the-challenge-what-the-reader-does-first "Direct link to 0. The challenge (what the reader does first)")

**Scenario given to the reader:**

An EKS cluster authenticates IAM identities into Kubernetes through the `aws-auth` ConfigMap, using `aws-iam-authenticator`. One `mapUsers` entry maps an IAM user to a Kubernetes username, and assigns it RBAC groups. The username template is `{{AccessKeyID}}`, and the assigned group is `system:masters`. Authentication mode is `CONFIG_MAP`.

**Evidence they're handed (and nothing else):**

```
{
  "cluster": "prod-eks",
  "aws_auth_configmap": {
    "mapUsers": [{"userarn": "arn:aws:iam::123456789012:user/deploy-bot", "username": "{{AccessKeyID}}", "groups": ["system:masters"]}]
  },
  "auth_mode": "CONFIG_MAP"
}
```

* No AWS credentials. No live cluster. No scripts.

**The questions they must answer from the evidence alone:**

1. What happens the moment an attacker learns a valid AccessKeyID for this principal?
2. Why is `{{AccessKeyID}}` a dangerous choice of identity — what property does an Access Key ID lack that a real secret has?
3. Which exposure comes from path A — the identity template `{{AccessKeyID}}`?
4. Which exposure comes from path B — the RBAC group `system:masters`?
5. What single rule, applied to the ConfigMap, would have kept both the identity and the privilege scoped correctly?

***

## 1. The manual problem[​](#1-the-manual-problem "Direct link to 1. The manual problem")

To answer by hand you have to understand two layers at once and the bridge between them. The IAM layer says: this entry maps the user `deploy-bot`. The Kubernetes layer says: the resulting principal is placed in `system:masters`, which is the built-in group bound to `cluster-admin` — unrestricted control of every resource in the cluster. So far that reads like a normal, if powerful, service-account mapping.

The trap is the `username` template. `{{AccessKeyID}}` derives the Kubernetes identity from the Access Key ID. An Access Key ID (the `AKIA...` value) is not a credential — it is the public, non-secret half of a key pair. It appears in CloudTrail entries, in request signatures, in logs, in support tickets, sometimes in client-side code. The secret access key is the part that proves possession; the key *ID* proves nothing. Binding the RBAC identity to the key ID means the thing that distinguishes "this user" from "anyone who has seen this user's requests" is a string that leaks by design. Confirming this by hand means knowing AWS credential mechanics, Kubernetes RBAC semantics, and noticing that the bridge between them is built on the wrong half of the key.

***

## 2. The reasoning wall (capture, don't invent)[​](#2-the-reasoning-wall-capture-dont-invent "Direct link to 2. The reasoning wall (capture, don't invent)")

| What they hit                                     | What they said / would say                                                                                             |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Two layers, IAM and RBAC, with a templated bridge | "The ARN looked fine, so we assumed the mapping was fine. We didn't read the username template."                       |
| The identity is keyed to a non-secret value       | "Hang on — the Access Key ID shows up in CloudTrail. We're authenticating people on a string that's basically public." |
| The privilege is the maximum the cluster offers   | "And the group is `system:masters`. So a public string maps straight to cluster-admin."                                |

**The insight the reader should reach on their own:**

> The danger isn't either line of the ConfigMap — it's that a leak-by-design identifier was wired to the highest privilege the cluster can grant.

***

## 3. Why scanners miss or flatten it[​](#3-why-scanners-miss-or-flatten-it "Direct link to 3. Why scanners miss or flatten it")

A per-setting scanner can flag `system:masters` as an over-privileged group — many do. What it cannot see is *what the identity is*. The scanner reads the group and the ARN and stops; it does not reason that the `username` template `{{AccessKeyID}}` binds authentication to a value that is not secret. The specific thing it flattens is the relationship between the identity field and the privilege field: a scoped group keyed to a non-secret identifier is still dangerous, and a powerful group keyed to a strong identity might be acceptable. The risk is the *pairing* — a public string promoted to `system:masters` — and a control that checks each field independently has no way to say "this identity is too weak for this privilege."

***

> **Pivot point.** Everything above is the gap. Everything below is Stave filling it. The reader has now done the work and hit the wall. Only now does the tool appear.

***

## 4. The evidence Stave consumes[​](#4-the-evidence-stave-consumes "Direct link to 4. The evidence Stave consumes")

* The same static observation snapshot the reader had: the cluster name, the `aws-auth` ConfigMap `mapUsers` entry (its `userarn`, `username` template, and `groups`), and the authentication mode.

```
{
  "cluster": "prod-eks",
  "aws_auth_configmap": {
    "mapUsers": [{"userarn": "arn:aws:iam::123456789012:user/deploy-bot", "username": "{{AccessKeyID}}", "groups": ["system:masters"]}]
  },
  "auth_mode": "CONFIG_MAP"
}
```

* No new privileges, no live cluster call. The mapping is normalized into pairs of (effective identity source, granted RBAC group).

***

## 5. The reasoning Stave performs[​](#5-the-reasoning-stave-performs "Direct link to 5. The reasoning Stave performs")

* **Control / invariant:** `CTL.EKS.AWSAUTH.MASTERS.BROAD.001` — `aws-auth` mappings must not grant `system:masters` through a broad or non-secret identity.
* **What it evaluates:** Does any `mapUsers` / `mapRoles` entry place a principal in `system:masters` (path B), and is the identity that reaches it derived from something weaker than a full, unforgeable principal ARN (path A, here the `{{AccessKeyID}}` template)? The control couples the privilege check to the identity check, so a cluster-admin grant bound to a non-secret or templated identifier is flagged even though each field alone might pass a naive review.
* **Verdict produced:** `NON_COMPLIANT` — `system:masters` is granted via an identity keyed to the Access Key ID rather than the full principal ARN.

```
control: CTL.EKS.AWSAUTH.MASTERS.BROAD.001
asset:   eks/prod-eks aws-auth mapUsers[deploy-bot]
evidence: username template {{AccessKeyID}} (non-secret identifier) mapped to group system:masters (cluster-admin)
verdict: NON_COMPLIANT
```

***

## 6. The prevention artifact Stave produces[​](#6-the-prevention-artifact-stave-produces "Direct link to 6. The prevention artifact Stave produces")

* **Artifact:** A corrected `aws-auth` ConfigMap mapping that uses the full principal ARN as the identity and replaces `system:masters` with a scoped RBAC group bound to a least-privilege Role.
* **What it forecloses:** The latent state from question 2 — authentication bound to a leak-by-design Access Key ID, and the unbounded privilege it reached. The identity is now the unforgeable ARN; the privilege is scoped to what the deploy bot actually needs.

```
# aws-auth ConfigMap (corrected)
mapUsers:
  - userarn: arn:aws:iam::123456789012:user/deploy-bot
    username: deploy-bot                      # bound to the full principal, not {{AccessKeyID}}
    groups:
      - deploy-bot-scoped                      # scoped group, not system:masters
---
# RBAC for the scoped group (least privilege)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: deploy-bot-deployer
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "update", "patch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: deploy-bot-binding
subjects:
  - kind: Group
    name: deploy-bot-scoped
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: deploy-bot-deployer
  apiGroup: rbac.authorization.k8s.io
```

***

## 7. What the team no longer does manually[​](#7-what-the-team-no-longer-does-manually "Direct link to 7. What the team no longer does manually")

| Before                                                                           | After Stave                                                                                  |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Read the ConfigMap and trust the ARN without parsing the `username` template     | One control couples the identity source to the granted RBAC group                            |
| Treat `system:masters` as "powerful but probably intended"                       | A cluster-admin grant tied to a non-secret identity is flagged as a violation                |
| Reason about AWS credential mechanics and RBAC semantics by hand on every change | The corrected ConfigMap pins identity to the full ARN and scopes the group deterministically |

***

## Positioning line for this case[​](#positioning-line-for-this-case "Direct link to Positioning line for this case")

> Stave proves that this cluster grants full admin to anyone who knows a public Access Key ID, names the `{{AccessKeyID}}` identity and the `system:masters` privilege as the pairing that does it, and emits the ARN-pinned, scoped-group ConfigMap that closes the path.

***

## Reuse checklist[​](#reuse-checklist "Direct link to Reuse checklist")

* [x] A reader could attempt section 0 with zero Stave knowledge
* [x] Stave is not named or shown before the pivot point
* [x] Section 2 quotes are real (or honestly plausible), not slogans
* [x] Section 3 names the *specific* thing per-setting tools can't see
* [x] Section 6 closes the exact latent state raised in section 0, question 2
* [x] The title names the failure, not the product
