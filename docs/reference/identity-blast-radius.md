# Identity Blast Radius Reference

Specs for the identity blast radius feature: the observation properties the extractor populates, the four controls Stave evaluates against them, the compound chain they participate in, and example output. For the concept and how it works, see [Identity Blast Radius](/docs/explanation/identity-blast-radius.md).

## Observation properties[​](#observation-properties "Direct link to Observation properties")

The extractor populates these fields on each IAM role:

```
properties:
  identity:
    kind: role
    role:
      reachable_resources_count: 47    # total unique resources accessible
      reachable_accounts_count: 3      # AWS accounts reachable via assume chains
      assume_chain_depth: 2            # longest sts:AssumeRole chain
      blast_radius_scope: cross_account # account | cross_account
```

## Controls[​](#controls "Direct link to Controls")

### CTL.IAM.IDENTITY.BLASTRADIUS.001 — Resource threshold[​](#ctliamidentityblastradius001--resource-threshold "Direct link to CTL.IAM.IDENTITY.BLASTRADIUS.001 — Resource threshold")

```
Fires when: reachable_resources_count > 50
Severity: high
```

A single role that can reach more than 50 resources has a wide blast radius. Credential compromise gives an attacker a large surface area.

**Remediation:** Split broad roles into per-service roles with scoped Resource ARNs. Use IAM Access Analyzer to identify unused permissions.

### CTL.IAM.IDENTITY.BLASTRADIUS.002 — Cross-account without external ID[​](#ctliamidentityblastradius002--cross-account-without-external-id "Direct link to CTL.IAM.IDENTITY.BLASTRADIUS.002 — Cross-account without external ID")

```
Fires when: blast_radius_scope == "cross_account"
        AND cross_account_trust_without_external_id == true
Severity: critical
```

This is the maximum blast radius configuration: the role can reach resources across multiple AWS accounts AND anyone in the trusted account can assume it (no external ID barrier).

**Remediation:** Add `sts:ExternalId` condition to the trust policy. Restrict trust to specific role ARNs, not account-wide principals.

### CTL.IAM.IDENTITY.BLASTRADIUS.003 — Assume chain depth[​](#ctliamidentityblastradius003--assume-chain-depth "Direct link to CTL.IAM.IDENTITY.BLASTRADIUS.003 — Assume chain depth")

```
Fires when: assume_chain_depth > 2
Severity: medium
```

Deep assumption chains (A → B → C → D) create hidden transitive access that is difficult to audit. Each hop potentially widens the blast radius beyond what was intended for the originating role.

**Remediation:** Flatten the chain. Grant permissions directly to the role that needs them rather than chaining through intermediates.

### CTL.IAM.IDENTITY.BLASTRADIUS.004 — Sensitive resource count[​](#ctliamidentityblastradius004--sensitive-resource-count "Direct link to CTL.IAM.IDENTITY.BLASTRADIUS.004 — Sensitive resource count")

```
Fires when: sensitive_resource_count > 20
Severity: critical
```

A role that can reach 85 sensitive resources (PHI, PII, confidential) is a qualitatively different risk than one that reaches 5. The extractor counts unique sensitive resources reachable through the role's policies and stores the count.

**Remediation:** Split broad roles into per-service roles scoped to specific resource ARNs. Use IAM Access Analyzer to identify unused permissions on sensitive resources.

## Safety chain: identity\_blast\_radius[​](#safety-chain-identity_blast_radius "Direct link to Safety chain: identity_blast_radius")

The four blast radius controls participate in a compound chain together with credential protection controls:

```
id: identity_blast_radius
controls:
  - CTL.IAM.IDENTITY.BLASTRADIUS.001  # wide reach
  - CTL.IAM.MFA.HWKEY.001             # no hardware MFA
  - CTL.IAM.CRED.EXPIRY.001           # no credential TTL
  - CTL.IAM.POLICY.SOD.001            # data + IAM combined
escalation_threshold: 2
compound_severity: critical
```

When a role has wide blast radius AND lacks credential protections, the compound finding fires: "If this credential is stolen, the attacker reaches many resources with no time-based or identity-based barrier."

## Example output[​](#example-output "Direct link to Example output")

### JSON[​](#json "Direct link to JSON")

```
{
  "chain_findings": [{
    "chain": "identity_blast_radius",
    "controls_failing": [
      "CTL.IAM.IDENTITY.BLASTRADIUS.001",
      "CTL.IAM.CRED.EXPIRY.001"
    ],
    "missing_safeguards": [
      "CTL.IAM.MFA.HWKEY.001",
      "CTL.IAM.POLICY.SOD.001"
    ],
    "compound_score": 36.0,
    "severity": "CRITICAL",
    "narrative": "Identity with wide blast radius and weak protections..."
  }]
}
```

### Text[​](#text "Direct link to Text")

```
Compound Risk Chains
--------------------

  [CRITICAL] Chain: identity_blast_radius
  Identity with wide blast radius and weak protections.
  Failing:    CTL.IAM.IDENTITY.BLASTRADIUS.001, CTL.IAM.CRED.EXPIRY.001
  Fix any of: CTL.IAM.MFA.HWKEY.001, CTL.IAM.POLICY.SOD.001
  Score:      36.0
  Stages:     persistence
```

"Fix any of" shows the cheapest remediation: enabling hardware MFA or enforcing separation of duties would break the chain below its escalation threshold.

## Key files[​](#key-files "Direct link to Key files")

| File                                                              | Purpose                                             |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| `controls/iam/identity/CTL.IAM.IDENTITY.BLASTRADIUS.001-004.yaml` | 4 blast radius controls                             |
| `chains/identity_blast_radius.yaml`                               | Compound chain definition                           |
| `aws-lab/scripts/exp73-iam-identity-blast-radius.sh`              | Extractor pattern for computing reachable resources |
| `docs/blast-radius.md`                                            | Control-level blast radius documentation            |
