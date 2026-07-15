# GITHUB controls (22)

### CTL.GITHUB.ORG.MFA.001[​](#ctlgithuborgmfa001 "Direct link to CTL.GITHUB.ORG.MFA.001")

**GitHub Organization MFA Not Required**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: IA-2; nist\_ssdf: PO.1; pci\_dss\_v4: 8.3; soc2: CC6.1;

MFA not required for organization members. Compromised passwords give direct access to source code, CI/CD pipelines, and deployment workflows.

**Remediation:** Enable "Require two-factor authentication" in organization settings.

***

### CTL.GITHUB.ORG.PERMISSION.001[​](#ctlgithuborgpermission001 "Direct link to CTL.GITHUB.ORG.PERMISSION.001")

**Organization Default Repository Permission Too Broad**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: AC-6; nist\_ssdf: PO.1; soc2: CC6.1;

Default repository permission is "write" or "admin." Every member automatically gets write access to every new repository.

**Remediation:** Set default repository permission to "read" or "none."

***

### CTL.GITHUB.ORG.REPOCREATE.001[​](#ctlgithuborgrepocreate001 "Direct link to CTL.GITHUB.ORG.REPOCREATE.001")

**Organization Allows All Members to Create Repositories**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: CM-5; soc2: CC6.1;

Any member can create repositories. Uncontrolled repository creation leads to sprawl and shadow repositories.

**Remediation:** Restrict repository creation to administrators.

***

### CTL.GITHUB.ORG.REPODELETE.001[​](#ctlgithuborgrepodelete001 "Direct link to CTL.GITHUB.ORG.REPODELETE.001")

**Organization Allows All Members to Delete Repositories**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-5; soc2: CC6.1;

Any member can delete repositories. A compromised account can destroy source code, CI/CD history, and release artifacts.

**Remediation:** Restrict repository deletion to administrators.

***

### CTL.GITHUB.ORG.VERIFIED.001[​](#ctlgithuborgverified001 "Direct link to CTL.GITHUB.ORG.VERIFIED.001")

**Organization Domain Not Verified**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: IA-9; soc2: CC6.1;

Organization domain not verified. GitHub cannot confirm the organization controls the domain it claims.

**Remediation:** Verify the organization's domain in GitHub settings.

***

### CTL.GITHUB.REPO.ADMINENFORCE.001[​](#ctlgithubrepoadminenforce001 "Direct link to CTL.GITHUB.REPO.ADMINENFORCE.001")

**Branch Protection Does Not Apply to Admins**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: AC-6; nist\_ssdf: PO.1; soc2: CC6.1;

Administrators exempt from branch protection. Admins can push directly, merge without approvals, and bypass status checks. Admin accounts are the highest-value targets.

**Remediation:** Enable "Do not allow bypassing the above settings" (include administrators).

***

### CTL.GITHUB.REPO.APPROVALS.001[​](#ctlgithubrepoapprovals001 "Direct link to CTL.GITHUB.REPO.APPROVALS.001")

**Default Branch Does Not Require Multiple Approvals**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-3; nist\_ssdf: PW\.1; slsa: Level 3; soc2: CC8.1;

Branch protection requires fewer than 2 approvals. A single approval is a single point of failure in the review process.

**Remediation:** Set required approving reviews to 2 or more.

***

### CTL.GITHUB.REPO.BRANCHPROT.001[​](#ctlgithubrepobranchprot001 "Direct link to CTL.GITHUB.REPO.BRANCHPROT.001")

**Default Branch Protection Not Enabled**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-3; nist\_ssdf: PW\.1; pci\_dss\_v4: 6.3; slsa: Level 2; soc2: CC8.1;

No branch protection rules on the default branch. Anyone with write access can push directly — no code review, no CI checks, no approval required.

**Remediation:** Enable branch protection rules on the default branch.

***

### CTL.GITHUB.REPO.CODEOWNERS.001[​](#ctlgithubrepocodeowners001 "Direct link to CTL.GITHUB.REPO.CODEOWNERS.001")

**Default Branch Does Not Require CODEOWNERS Review**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-5; soc2: CC8.1;

CODEOWNERS review not required. Changes to critical files can be approved by any reviewer, not the designated code owners.

**Remediation:** Enable "Require review from Code Owners" in branch protection.

***

### CTL.GITHUB.REPO.CODEOWNERS.FILE.001[​](#ctlgithubrepocodeownersfile001 "Direct link to CTL.GITHUB.REPO.CODEOWNERS.FILE.001")

**Repository Missing CODEOWNERS File**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-5; nist\_ssdf: PO.3; soc2: CC8.1;

No CODEOWNERS file. No defined ownership of code paths — any reviewer can approve changes to security-critical files.

**Remediation:** Create a CODEOWNERS file defining ownership of critical paths.

***

### CTL.GITHUB.REPO.DEPSCAN.001[​](#ctlgithubrepodepscan001 "Direct link to CTL.GITHUB.REPO.DEPSCAN.001")

**Repository Dependency Scanning Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-2; nist\_ssdf: PW\.4; pci\_dss\_v4: 6.2; soc2: CC8.1;

Dependabot vulnerability scanning not enabled. Known CVEs in dependencies (Log4j, Spring4Shell, polyfill.io) are not detected.

**Remediation:** Enable Dependabot alerts and security updates.

***

### CTL.GITHUB.REPO.FORCEPUSH.001[​](#ctlgithubrepoforcepush001 "Direct link to CTL.GITHUB.REPO.FORCEPUSH.001")

**Default Branch Allows Force Push**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-5; nist\_ssdf: PS.1; soc2: CC8.1;

Force push allowed on the default branch. Force push rewrites git history — an attacker can remove evidence of previous commits and replace branch content entirely.

**Remediation:** Disable force push on the default branch in branch protection.

***

### CTL.GITHUB.REPO.GHOST.001[​](#ctlgithubrepoghost001 "Direct link to CTL.GITHUB.REPO.GHOST.001")

**CODEOWNERS References Deleted Team or User**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: AC-2; soc2: CC6.2;

CODEOWNERS file references a team or user that no longer exists. Code ownership assigned to a ghost — changes to the owned path have no actual reviewer.

**Remediation:** Update CODEOWNERS to reference existing teams and users.

***

### CTL.GITHUB.REPO.IMMUTABLE.001[​](#ctlgithubrepoimmutable001 "Direct link to CTL.GITHUB.REPO.IMMUTABLE.001")

**Repository Immutable Releases Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SI-7; nist\_ssdf: PS.2; slsa: Level 3; soc2: CC8.1;

Published releases can be modified after publication. An attacker can replace release artifacts with malicious versions under the same version identifier.

**Remediation:** Enable immutable releases (tag protection + release locking).

***

### CTL.GITHUB.REPO.INACTIVE.001[​](#ctlgithubrepoinactive001 "Direct link to CTL.GITHUB.REPO.INACTIVE.001")

**Inactive Repository Not Archived**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-3; soc2: CC8.1;

No commits in 90+ days and not archived. Dependencies accumulate CVEs, secrets remain unrotated, and the codebase drifts from current security practices.

**Remediation:** Archive the repository or resume active maintenance.

***

### CTL.GITHUB.REPO.LINEARHISTORY.001[​](#ctlgithubrepolinearhistory001 "Direct link to CTL.GITHUB.REPO.LINEARHISTORY.001")

**Default Branch Does Not Require Linear History**

* **Severity:** low
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-3; soc2: CC8.1;

Merge commits allowed. Linear history (rebase/squash only) makes git history easier to audit and harder to hide malicious commits.

**Remediation:** Enable "Require linear history" in branch protection.

***

### CTL.GITHUB.REPO.SECRETSCAN.001[​](#ctlgithubreposecretscan001 "Direct link to CTL.GITHUB.REPO.SECRETSCAN.001")

**Repository Secret Scanning Not Enabled**

* **Severity:** critical
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SA-11; nist\_ssdf: PW\.7; pci\_dss\_v4: 6.5; soc2: CC8.1;

Secret scanning not enabled. Committed credentials (API keys, tokens, passwords, private keys) are not detected. Secrets in git history persist forever.

**Remediation:** Enable secret scanning in repository security settings.

***

### CTL.GITHUB.REPO.SECRETSCAN.PUSH.001[​](#ctlgithubreposecretscanpush001 "Direct link to CTL.GITHUB.REPO.SECRETSCAN.PUSH.001")

**Secret Scanning Push Protection Not Enabled**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SA-11; nist\_ssdf: PW\.7; soc2: CC8.1;

Push protection disabled. Secrets detected after commit, not blocked before. The credential enters git history before detection and must be rotated.

**Remediation:** Enable push protection in secret scanning settings.

***

### CTL.GITHUB.REPO.SECURITYMD.001[​](#ctlgithubreposecuritymd001 "Direct link to CTL.GITHUB.REPO.SECURITYMD.001")

**Public Repository Missing SECURITY.md File**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SA-11; nist\_ssdf: RV.1; soc2: CC8.1;

Public repository has no SECURITY.md. No vulnerability disclosure process defined for security researchers.

**Remediation:** Create a SECURITY.md file with vulnerability reporting instructions.

***

### CTL.GITHUB.REPO.SIGNED.001[​](#ctlgithubreposigned001 "Direct link to CTL.GITHUB.REPO.SIGNED.001")

**Default Branch Does Not Require Signed Commits**

* **Severity:** medium
* **Type:** unsafe\_state
* **Domain:** identity
* **Compliance:** nist\_800\_53\_r5: SI-7; nist\_ssdf: PS.1; soc2: CC8.1;

Commits not required to be GPG or SSH signed. Commit authorship can be spoofed — an attacker can create commits appearing to come from a trusted developer.

**Remediation:** Enable "Require signed commits" in branch protection.

***

### CTL.GITHUB.REPO.STALEREVIEWS.001[​](#ctlgithubrepostalereviews001 "Direct link to CTL.GITHUB.REPO.STALEREVIEWS.001")

**Default Branch Does Not Dismiss Stale Reviews**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: CM-3; nist\_ssdf: PW\.1; soc2: CC8.1;

Approvals not dismissed when new commits are pushed. An attacker can get a benign PR approved, then push malicious commits after approval. The PR merges with stale approval covering different code.

**Remediation:** Enable "Dismiss stale pull request approvals when new commits are pushed."

***

### CTL.GITHUB.REPO.STATUSCHECKS.001[​](#ctlgithubrepostatuschecks001 "Direct link to CTL.GITHUB.REPO.STATUSCHECKS.001")

**Default Branch Does Not Require Status Checks**

* **Severity:** high
* **Type:** unsafe\_state
* **Domain:** exposure
* **Compliance:** nist\_800\_53\_r5: SA-11; nist\_ssdf: PW\.1; pci\_dss\_v4: 6.5; soc2: CC8.1;

CI status checks not required before merging. Code merges even when tests fail, security scans flag issues, or linting detects problems.

**Remediation:** Enable "Require status checks to pass before merging."

***
