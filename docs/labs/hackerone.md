# HackerOne Case Challenges

30 real bug bounty cases converted into reasoning challenges. Each gives you the static configuration and asks: what's wrong, why is it dangerous, and what rule prevents it?

Every case has a known answer. Attempt the challenge before revealing the solution.

## How to use[​](#how-to-use "Direct link to How to use")

1. Read the scenario — what the asset is, what the configuration looks like
2. Answer the questions from the static evidence
3. Expand the solution to see what Stave finds
4. Run the program yourself to verify

## By category[​](#by-category "Direct link to By category")

### Public Exposure (11 cases)[​](#public-exposure-11-cases "Direct link to Public Exposure (11 cases)")

Cases where S3 buckets, CDN origins, or build artifacts are publicly readable.

| Case                          | Company    | Challenge                                            |
| ----------------------------- | ---------- | ---------------------------------------------------- |
| [#361438](#uber-361438)       | Uber       | Confidential-tagged bucket publicly readable         |
| [#404822](#slack-404822)      | Slack      | iOS test builds in public bucket                     |
| [#1021906](#shopify-1021906)  | Shopify    | Production API bucket publicly accessible            |
| [#1474017](#omise-1474017)    | Omise      | CDN origin bucket readable with no PAB               |
| [#507097](#zomato-507097)     | Zomato     | Chat images in public bucket                         |
| [#57505](#shopify-57505)      | Shopify    | Public listing not intended                          |
| [#819278](#greenhouse-819278) | Greenhouse | Marketing assets bucket public                       |
| [#94502](#shopify-94502)      | Shopify    | Partial remediation — listing removed, read persists |
| [#202725](#mapbox-202725)     | Mapbox     | Per-object ACLs on "private" bucket                  |
| [#2383486](#mozilla-2383486)  | Mozilla    | .git directory in public bucket                      |
| [#2083771](#dod-2083771)      | DoD        | IMDSv1 credential exfiltration                       |

### Bucket Takeover (6 cases)[​](#bucket-takeover-6-cases "Direct link to Bucket Takeover (6 cases)")

Cases where unclaimed S3 buckets enable subdomain takeover or supply chain attacks.

| Case                             | Company      | Challenge                             |
| -------------------------------- | ------------ | ------------------------------------- |
| [#121461](#bime-121461)          | Bime         | Dangling DNS → bucket takeover        |
| [#918946](#dod-918946)           | DoD          | Government subdomain takeover         |
| [#1777077](#khanacademy-1777077) | Khan Academy | S3 website hosting takeover           |
| [#1397826](#tendermint-1397826)  | Tendermint   | Package distribution takeover         |
| [#1791558](#brave-1791558)       | Brave        | APT repository takeover               |
| [#1295497](#shopify-1295497)     | Shopify      | EC2 IP takeover via dangling A record |

### Write Scope (4 cases)[​](#write-scope-4-cases "Direct link to Write Scope (4 cases)")

Cases where upload policies or write permissions are too broad.

| Case                      | Company | Challenge                                  |
| ------------------------- | ------- | ------------------------------------------ |
| [#254200](#unikrn-254200) | Unikrn  | Prefix-wide upload breaks tenant isolation |
| [#93691](#shopify-93691)  | Shopify | Signed upload allows any key under prefix  |
| [#764243](#bcm-764243)    | BCM     | Unrestricted upload API on private bucket  |
| [#98819](#shopify-98819)  | Shopify | Anonymous writes + cross-account reads     |

### Access Control (1 case)[​](#access-control-1-case "Direct link to Access Control (1 case)")

| Case                     | Company | Challenge                              |
| ------------------------ | ------- | -------------------------------------- |
| [#94087](#shopify-94087) | Shopify | Path traversal breaks tenant isolation |

### Credential Theft (1 case)[​](#credential-theft-1-case "Direct link to Credential Theft (1 case)")

| Case                            | Company    | Challenge                                 |
| ------------------------------- | ---------- | ----------------------------------------- |
| [#1580493](#kubernetes-1580493) | Kubernetes | IAM authenticator identity mapping bypass |

### Audit Evasion (2 cases)[​](#audit-evasion-2-cases "Direct link to Audit Evasion (2 cases)")

| Case                     | Company | Challenge                     |
| ------------------------ | ------- | ----------------------------- |
| [#3021451](#aws-3021451) | AWS     | ElastiCache CloudTrail bypass |
| [#3022516](#aws-3022516) | AWS     | Forecast CloudTrail bypass    |

### Transport Security (1 case)[​](#transport-security-1-case "Direct link to Transport Security (1 case)")

| Case                       | Company   | Challenge                |
| -------------------------- | --------- | ------------------------ |
| [#43280](#hackerone-43280) | HackerOne | HTTPS not enforced on S3 |

### Identity Misconfiguration (2 cases)[​](#identity-misconfiguration-2-cases "Direct link to Identity Misconfiguration (2 cases)")

| Case                            | Company    | Challenge                     |
| ------------------------------- | ---------- | ----------------------------- |
| [#1238482](#kubernetes-1238482) | Kubernetes | ALB controller tag confusion  |
| [#1835133](#brave-1835133)      | Brave      | Dangling RPM bucket reference |

### Other (2 cases)[​](#other-2-cases "Direct link to Other (2 cases)")

| Case                           | Company   | Challenge                        |
| ------------------------------ | --------- | -------------------------------- |
| [#1598347](#hackerone-1598347) | HackerOne | Widget bucket → script injection |
| [#2498255](#ibm-2498255)       | IBM       | Post-acquisition bucket takeover |

***

## Related real-world reports (same patterns)[​](#related-real-world-reports-same-patterns "Direct link to Related real-world reports (same patterns)")

Several other public disclosures match the same misconfiguration classes as the challenges below. They reinforce that these patterns recur across very different organizations, and the same control catches each one:

| Report                                            | Company        | Same pattern as                                                                   | Detected by                              |
| ------------------------------------------------- | -------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| [#111643](https://hackerone.com/reports/111643)   | Shopify        | #94502 — public read + write + list (CloudTrail logs bucket)                      | `CTL.S3.PUBLIC.001`, `CTL.S3.PUBLIC.003` |
| [#189023](https://hackerone.com/reports/189023)   | Legal Robot    | #98819 — AuthenticatedUsers ACL grants read + list                                | `CTL.S3.AUTH.READ.001`                   |
| [#1297689](https://hackerone.com/reports/1297689) | Affirm         | #918946 — dangling CNAME → S3 subdomain takeover                                  | `CTL.S3.BUCKET.TAKEOVER.001`             |
| [#2262939](https://hackerone.com/reports/2262939) | IBB / RubyGems | CloudFront dangling S3 origin (modeled as remediated — boundary case, no finding) | —                                        |

***

## Challenges[​](#challenges "Direct link to Challenges")

Each challenge follows the same format: scenario, configuration evidence, questions, then a collapsible solution.

***

### Uber #361438[​](#uber-361438 "Direct link to Uber #361438")

**Scenario:** An S3 bucket named `ubergreece` holds operational data for Uber's Greece market. The bucket is tagged `data-classification: confidential`.

**Evidence:**

```
{
  "bucket": "ubergreece",
  "tags": {"data-classification": "confidential"},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::ubergreece/*"}]},
  "public_access_block": null
}
```

**Questions:**

1. Is this bucket publicly readable?
2. What is the contradiction between the tags and the policy?
3. What control would detect this?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.001` — bucket policy grants `Principal: *` read access
* `CTL.S3.PUBLIC.002` — public read on data classified as confidential

Two controls fire and consolidate into one Issue. The tag metadata (`data-classification: confidential`) is the organization's own declaration that this data should not be public — the bucket policy contradicts it.

**Run it:**

```
cd stave-hackerone-tests/cmd/uber-361438 && go run .
```

***

### Slack #404822[​](#slack-404822 "Direct link to Slack #404822")

**Scenario:** Slack's iOS test build artifacts are stored in an S3 bucket.

**Evidence:**

```
{
  "bucket": "slack-ios-builds",
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::slack-ios-builds/*"}]},
  "public_access_block": {"BlockPublicPolicy": false, "BlockPublicAcls": false}
}
```

**Questions:**

1. What is exposed?
2. What is the blast radius of this exposure?
3. What single setting would prevent this?

Reveal solution

<!-- -->

**Stave finding:** `CTL.S3.PUBLIC.001` — public read on build artifacts.

The blast radius: test builds may contain debug symbols, API endpoints, internal service names, and authentication tokens. Enabling `BlockPublicPolicy: true` would have prevented the bucket policy from granting public access.

**Run it:**

```
cd stave-hackerone-tests/cmd/slack-404822 && go run .
```

***

### Shopify #94087[​](#shopify-94087 "Direct link to Shopify #94087")

**Scenario:** Shopify uses presigned URLs to let merchants upload files to a shared S3 bucket. Each merchant's files are stored under a prefix (`/merchants/{merchant_id}/`).

**Questions:**

1. If the presigned URL allows writes to `merchants/12345/*`, can a merchant write to `merchants/12346/*`?
2. What configuration determines whether prefix isolation holds?
3. What Stave control detects this class of issue?

Reveal solution

<!-- -->

**Stave finding:** `CTL.S3.TENANT.ISOLATION.001` — presigned URL prefix scope does not enforce tenant boundaries.

The presigned URL's `Resource` field must be scoped to the exact merchant prefix. If it uses a wildcard or the prefix is broader than one tenant, path traversal breaks isolation.

**Run it:**

```
cd stave-hackerone-tests/cmd/shopify-94087 && go run .
```

***

### Shopify #1021906[​](#shopify-1021906 "Direct link to Shopify #1021906")

**Scenario:** A production API bucket named `ping-api-production` is tagged `environment: internal` by the engineering team.

**Evidence:**

```
{
  "bucket": "ping-api-production",
  "tags": {"environment": "internal"},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::ping-api-production", "arn:aws:s3:::ping-api-production/*"]}]},
  "public_access_block": null
}
```

**Questions:**

1. What does the tag say about intended access, and does the policy match?
2. What data could an attacker enumerate and download?
3. What controls detect the contradiction?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.001` — bucket policy grants public read
* `CTL.S3.PUBLIC.LIST.001` — bucket policy grants public listing

The tag declares the bucket internal, but the policy opens it to the internet. No Public Access Block is configured to prevent this. Listing lets an attacker enumerate every object key, then download each one.

**Run it:**

```
cd stave-hackerone-tests/cmd/shopify-1021906 && go run .
```

***

### Omise #1474017[​](#omise-1474017 "Direct link to Omise #1474017")

**Scenario:** A CDN origin bucket stores assets for a payment processor. Both ACL and bucket policy grant public access.

**Evidence:**

```
{
  "bucket": "omise-cdn-assets",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::omise-cdn-assets", "arn:aws:s3:::omise-cdn-assets/*"]}]},
  "public_access_block": null
}
```

**Questions:**

1. How many independent paths grant public read access?
2. If you fix the ACL but not the policy, is the bucket still public?
3. What single setting blocks both paths at once?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.001` — public read via policy
* `CTL.S3.PUBLIC.LIST.001` — public listing via policy
* `CTL.S3.ACL.OBJECT.001` — ACL grants AllUsers READ

Dual exposure: the ACL and the policy independently grant public access. Fixing one leaves the other active. Enabling Public Access Block with all four flags blocks both mechanisms.

**Run it:**

```
cd stave-hackerone-tests/cmd/omise-1474017 && go run .
```

***

### Zomato #507097[​](#zomato-507097 "Direct link to Zomato #507097")

**Scenario:** A bucket holds user-uploaded chat images from a food delivery app's messaging feature.

**Evidence:**

```
{
  "bucket": "zomato-chat-images",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::zomato-chat-images", "arn:aws:s3:::zomato-chat-images/*"]}]},
  "public_access_block": null
}
```

**Questions:**

1. What type of user data is exposed?
2. Can an attacker discover file names without knowing them?
3. What is the privacy impact?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.001` — public read on user content
* `CTL.S3.PUBLIC.LIST.001` — public listing exposes object keys

Private user chat images are browsable and downloadable by anyone. ListBucket lets an attacker enumerate every image key, then fetch them individually. This is a direct privacy violation for every user who sent images through the chat feature.

**Run it:**

```
cd stave-hackerone-tests/cmd/zomato-507097 && go run .
```

***

### Shopify #57505[​](#shopify-57505 "Direct link to Shopify #57505")

**Scenario:** A storefront assets bucket is intentionally public for serving product images. The team intended to grant only object reads.

**Evidence:**

```
{
  "bucket": "shopify-storefront-assets",
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::shopify-storefront-assets", "arn:aws:s3:::shopify-storefront-assets/*"]}]},
  "public_access_block": null
}
```

**Questions:**

1. Which action in the policy was unintentional?
2. What can an attacker learn from listing that they cannot from reading?
3. How would you fix this without breaking the storefront?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.LIST.001` — unintended public listing

GetObject is intentional for serving assets, but ListBucket reveals every object key in the bucket. An attacker can enumerate internal file paths, staging assets, and unreleased content. Removing `s3:ListBucket` from the policy statement fixes the issue without affecting the storefront.

**Run it:**

```
cd stave-hackerone-tests/cmd/shopify-57505 && go run .
```

***

### Greenhouse #819278[​](#greenhouse-819278 "Direct link to Greenhouse #819278")

**Scenario:** A marketing team's asset bucket is publicly accessible for embedding images in blog posts and landing pages.

**Evidence:**

```
{
  "bucket": "greenhouse-marketing-assets",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::greenhouse-marketing-assets", "arn:aws:s3:::greenhouse-marketing-assets/*"]}]},
  "public_access_block": null
}
```

**Questions:**

1. Is public read on marketing assets inherently dangerous?
2. What does public listing add beyond public read?
3. What control distinguishes between intended and unintended exposure?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.001` — public read
* `CTL.S3.PUBLIC.LIST.001` — public listing

Even if public read is intentional for marketing assets, listing reveals the full inventory: draft content, internal naming conventions, and files not yet linked from public pages. The risk is information disclosure beyond what was intended to be public.

**Run it:**

```
cd stave-hackerone-tests/cmd/greenhouse-819278 && go run .
```

***

### Shopify #94502[​](#shopify-94502 "Direct link to Shopify #94502")

**Scenario:** Three buckets were reported as public. The team removed listing but left read and write access in place.

**Evidence:**

```
{
  "bucket": "shopify-uploads-partial-fix",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}, {"grantee": "AllUsers", "permission": "WRITE"}]},
  "bucket_policy": {"Statement": []},
  "public_access_block": null
}
```

**Questions:**

1. Is the remediation complete?
2. What can an attacker do with public WRITE access?
3. What controls detect the remaining exposure?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.001` — public read persists via ACL
* `CTL.S3.PUBLIC.003` — public write persists via ACL

Removing listing was incomplete remediation. Public read still exposes every object (if you know the key), and public write lets an attacker upload malicious content or overwrite existing files. Both ACL grants must be removed.

**Run it:**

```
cd stave-hackerone-tests/cmd/shopify-94502 && go run .
```

***

### Mapbox #202725[​](#mapbox-202725 "Direct link to Mapbox #202725")

**Scenario:** A bucket named `mapbox-private` has no public bucket policy and no public ACL at the bucket level. However, individual objects inside have been uploaded with public-read ACLs.

**Evidence:**

```
{
  "bucket": "mapbox-private",
  "acl": {"grants": [{"grantee": "Owner", "permission": "FULL_CONTROL"}]},
  "bucket_policy": {"Statement": []},
  "public_access_block": null,
  "objects_can_be_public": true,
  "sample_object_acl": {"grants": [{"grantee": "AllUsers", "permission": "READ"}]}
}
```

**Questions:**

1. Does the bucket-level configuration look secure?
2. How can objects be public when the bucket is not?
3. What control catches this gap?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.ACL.OBJECT.001` — individual objects are public via object-level ACL

The bucket itself appears private. But S3 allows per-object ACL overrides: any object uploaded with `--acl public-read` is individually accessible. The bucket name says "private" but objects inside are public. Enabling `BlockPublicAcls` and `IgnorePublicAcls` in Public Access Block prevents this.

**Run it:**

```
cd stave-hackerone-tests/cmd/mapbox-202725 && go run .
```

***

### Mozilla #2383486[​](#mozilla-2383486 "Direct link to Mozilla #2383486")

**Scenario:** A public S3 bucket serving static content also contains a `.git` directory that was synced alongside the site files.

**Evidence:**

```
{
  "bucket": "mozilla-community-site",
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": "*", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::mozilla-community-site/*"}]},
  "public_access_block": null,
  "notable_prefixes": [".git/HEAD", ".git/config", ".git/refs/"]
}
```

**Questions:**

1. What can an attacker reconstruct from the `.git` directory?
2. Why is this worse than just having public files?
3. What control detects sensitive prefixes in public buckets?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.PREFIX.001` — protected prefix `.git/` publicly readable

The `.git` directory contains the full repository history: commit messages, author emails, branches, and every version of every file. Tools like `git-dumper` reconstruct the complete repository from the exposed objects. This turns a public static site into a full source code leak, including any secrets that were ever committed.

**Run it:**

```
cd stave-hackerone-tests/cmd/mozilla-2383486 && go run .
```

***

### DoD #2083771[​](#dod-2083771 "Direct link to DoD #2083771")

**Scenario:** An EC2 instance runs Jenkins with its script console exposed to the network. The instance uses IMDSv1.

**Evidence:**

```
{
  "instance_id": "i-0a1b2c3d4e5f",
  "metadata_options": {
    "HttpEndpoint": "enabled",
    "HttpTokens": "optional",
    "HttpPutResponseHopLimit": 2
  },
  "security_group": {"ingress": [{"port": 8080, "cidr": "0.0.0.0/0"}]}
}
```

**Questions:**

1. What does `HttpTokens: optional` mean for credential theft?
2. How does an exposed Jenkins console enable IMDS exploitation?
3. What control would force IMDSv2?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.EC2.IMDS.HOPLIMIT.001` — hop limit allows container escape to IMDS

`HttpTokens: optional` means IMDSv1 is enabled. Any SSRF vulnerability (like an open Jenkins script console) lets an attacker curl `http://169.254.169.254/latest/meta-data/iam/security-credentials/` to steal the instance role's temporary credentials. IMDSv2 requires a PUT request with a token header, which SSRF attacks cannot typically forge.

**Run it:**

```
cd stave-hackerone-tests/cmd/dod-2083771 && go run .
```

***

### Kubernetes #1580493[​](#kubernetes-1580493 "Direct link to Kubernetes #1580493")

**Scenario:** An EKS cluster uses `aws-iam-authenticator` with a ConfigMap that maps IAM identities to Kubernetes RBAC groups. The mapping uses the AccessKeyID as the identity.

**Evidence:**

```
{
  "cluster": "prod-eks",
  "aws_auth_configmap": {
    "mapUsers": [{"userarn": "arn:aws:iam::123456789012:user/deploy-bot", "username": "{{AccessKeyID}}", "groups": ["system:masters"]}]
  },
  "auth_mode": "CONFIG_MAP"
}
```

**Questions:**

1. What happens if an attacker obtains a valid AccessKeyID?
2. Why is `{{AccessKeyID}}` a dangerous identity mapping?
3. What RBAC privilege does `system:masters` grant?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.EKS.AWSAUTH.MASTERS.BROAD.001` — overly broad system:masters mapping

AccessKeyID is not a secret -- it appears in logs, signed URLs, and CloudTrail entries. Using it as the identity means anyone who knows the key ID can authenticate. Combined with `system:masters`, the attacker gets full cluster admin. The mapping should use the full ARN and a scoped RBAC group.

**Run it:**

```
cd stave-hackerone-tests/cmd/kubernetes-1580493 && go run .
```

***

### Bime #121461[​](#bime-121461 "Direct link to Bime #121461")

**Scenario:** A SaaS company's subdomain points via CNAME to an S3 bucket that has been deleted.

**Evidence:**

```
{
  "dns_record": {"name": "app.bime.io", "type": "CNAME", "value": "app.bime.io.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

**Questions:**

1. What happens when someone visits `app.bime.io`?
2. What can an attacker do with the deleted bucket name?
3. What control detects this?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — CNAME points to unclaimed S3 bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — referenced bucket does not exist

An attacker creates an S3 bucket named `app.bime.io` in their own account. The CNAME now resolves to attacker-controlled content served under the legitimate domain. This enables phishing, cookie theft, and credential harvesting under the company's trusted domain.

**Run it:**

```
cd stave-hackerone-tests/cmd/bime-121461 && go run .
```

***

### DoD #918946[​](#dod-918946 "Direct link to DoD #918946")

**Scenario:** A `.gov` subdomain has a CNAME pointing to a deleted S3 bucket.

**Evidence:**

```
{
  "dns_record": {"name": "data.defense.gov", "type": "CNAME", "value": "data.defense.gov.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

**Questions:**

1. Why is a `.gov` takeover worse than a commercial domain?
2. What trust signals does a `.gov` domain carry?
3. What control detects the dangling reference?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — government subdomain points to unclaimed bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — referenced bucket does not exist

A `.gov` domain carries implicit government trust. Browsers, email filters, and users treat it as authoritative. An attacker who claims the bucket can serve malware or phishing pages under a government domain, bypassing many security filters that whitelist `.gov`.

**Run it:**

```
cd stave-hackerone-tests/cmd/dod-918946 && go run .
```

***

### Khan Academy #1777077[​](#khanacademy-1777077 "Direct link to Khan Academy #1777077")

**Scenario:** An S3 bucket configured for static website hosting was deleted, but the DNS record still points to it.

**Evidence:**

```
{
  "dns_record": {"name": "smarthistory.khanacademy.org", "type": "CNAME", "value": "smarthistory.khanacademy.org.s3-website-us-east-1.amazonaws.com"},
  "s3_bucket_exists": false,
  "website_hosting": true,
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

**Questions:**

1. Why does the S3 website hosting endpoint matter?
2. What content can an attacker serve after claiming the bucket?
3. How does the subdomain relationship to the parent domain amplify risk?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — CNAME points to unclaimed S3 website bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — referenced bucket does not exist

S3 website hosting serves `index.html` by default, making takeover seamless -- the attacker's page looks like a real Khan Academy page. Subdomain cookies set by the parent domain may be sent to the attacker's bucket, enabling session theft.

**Run it:**

```
cd stave-hackerone-tests/cmd/khanacademy-1777077 && go run .
```

***

### Tendermint #1397826[​](#tendermint-1397826 "Direct link to Tendermint #1397826")

**Scenario:** The official install documentation references an S3 bucket for package distribution. The bucket has been deleted.

**Evidence:**

```
{
  "dns_record": {"name": "releases.tendermint.com", "type": "CNAME", "value": "releases.tendermint.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "referenced_in": ["docs/install.md", "README.md"],
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

**Questions:**

1. What happens when a developer follows the install docs?
2. What kind of payload could an attacker serve?
3. Why is this a supply chain attack?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — release domain points to unclaimed bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — package distribution bucket deleted

An attacker claims the bucket and serves trojaned binaries. Developers following the official documentation download and execute malicious code. The install docs serve as a trusted distribution channel that the attacker now controls. This is a textbook supply chain attack.

**Run it:**

```
cd stave-hackerone-tests/cmd/tendermint-1397826 && go run .
```

***

### Brave #1791558[​](#brave-1791558 "Direct link to Brave #1791558")

**Scenario:** Brave's APT repository bucket has been deleted, but community install guides still reference it for Linux package installation.

**Evidence:**

```
{
  "dns_record": {"name": "brave-browser-apt-release.s3.brave.com", "type": "CNAME", "value": "brave-browser-apt-release.s3.brave.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "referenced_in": ["community-install-guide.md"],
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

**Questions:**

1. What does `apt-get install` do with a compromised repository?
2. Why are community install guides a persistent risk?
3. What control catches the deleted bucket?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — APT repo domain points to unclaimed bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — APT repository bucket deleted

An attacker who claims this bucket can serve malicious `.deb` packages. Users running `apt-get install` from the community guide will install attacker-controlled code with root privileges. Community guides persist long after the official infrastructure changes, creating a long-tail supply chain risk.

**Run it:**

```
cd stave-hackerone-tests/cmd/brave-1791558 && go run .
```

***

### Shopify #1295497[​](#shopify-1295497 "Direct link to Shopify #1295497")

**Scenario:** An EC2 instance was terminated and its Elastic IP released, but the DNS A record still points to the old IP address.

**Evidence:**

```
{
  "dns_record": {"name": "api-staging.shopify.com", "type": "A", "value": "54.x.x.x"},
  "ec2_instance_exists": false,
  "elastic_ip_allocated": false,
  "ip_claimable": true
}
```

**Questions:**

1. What happens when someone allocates the released IP?
2. How is an IP takeover different from a bucket takeover?
3. What control detects dangling A records?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — A record points to unowned IP address

An attacker repeatedly allocates Elastic IPs until they get the target address. They then run any service on that IP, receiving all traffic directed to the subdomain. Unlike bucket takeover, IP takeover requires no name matching -- just luck or persistence in the allocation loop.

**Run it:**

```
cd stave-hackerone-tests/cmd/shopify-1295497 && go run .
```

***

### Unikrn #254200[​](#unikrn-254200 "Direct link to Unikrn #254200")

**Scenario:** A gaming platform uses presigned upload URLs with a broad prefix that covers multiple tenants.

**Evidence:**

```
{
  "bucket": "unikrn-user-uploads",
  "upload_policy": {
    "conditions": [["starts-with", "$key", "uploads/"]],
    "expiration": "2024-12-31T00:00:00Z"
  }
}
```

**Questions:**

1. What prefix does the upload policy restrict to?
2. Can user A upload to user B's path under `uploads/`?
3. What control detects overly broad prefix scoping?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.TENANT.ISOLATION.001` — upload prefix does not enforce tenant boundaries

The prefix `uploads/` covers all tenants. Any authenticated user can write to any path under this prefix, including other users' directories. The condition should be `uploads/${user_id}/` to enforce per-tenant isolation.

**Run it:**

```
cd stave-hackerone-tests/cmd/unikrn-254200 && go run .
```

***

### Shopify #93691[​](#shopify-93691 "Direct link to Shopify #93691")

**Scenario:** Shopify uses presigned POST policies to let merchants upload product images. The policy's key condition uses a shared prefix.

**Evidence:**

```
{
  "bucket": "shopify-merchant-uploads",
  "upload_policy": {
    "conditions": [["starts-with", "$key", "merchants/"]],
    "expiration": "2024-12-31T00:00:00Z"
  }
}
```

**Questions:**

1. Can merchant 12345 overwrite merchant 12346's files?
2. What would a properly scoped prefix look like?
3. What is the blast radius of a prefix this broad?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.TENANT.ISOLATION.001` — presigned URL prefix scope allows cross-tenant writes

The prefix `merchants/` lets any merchant write to any other merchant's directory. A properly scoped policy would use `merchants/${merchant_id}/` as the prefix condition. Every merchant on the platform is affected because any single merchant can overwrite any other merchant's product images.

**Run it:**

```
cd stave-hackerone-tests/cmd/shopify-93691 && go run .
```

***

### BCM #764243[​](#bcm-764243 "Direct link to BCM #764243")

**Scenario:** A file upload API uses presigned POST with an empty prefix condition, allowing writes to any path in the bucket.

**Evidence:**

```
{
  "bucket": "bcm-document-store",
  "upload_policy": {
    "conditions": [["starts-with", "$key", ""]],
    "expiration": "2024-12-31T00:00:00Z"
  }
}
```

**Questions:**

1. What does an empty `starts-with` prefix mean?
2. What paths can an attacker write to?
3. How could this be used for code execution?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.TENANT.ISOLATION.001` — empty prefix grants unrestricted write scope

An empty prefix means any key is valid. The attacker can write to any path in the bucket, including overwriting application configuration files, injecting malicious scripts into served content, or replacing legitimate documents with phishing pages.

**Run it:**

```
cd stave-hackerone-tests/cmd/bcm-764243 && go run .
```

***

### Shopify #98819[​](#shopify-98819 "Direct link to Shopify #98819")

**Scenario:** An internal bucket allows anonymous writes via ACL and grants cross-account read access via bucket policy.

**Evidence:**

```
{
  "bucket": "shopify-internal-data",
  "acl": {"grants": [{"grantee": "AllUsers", "permission": "WRITE"}]},
  "bucket_policy": {"Statement": [{"Effect": "Allow", "Principal": {"AWS": "arn:aws:iam::987654321098:root"}, "Action": "s3:GetObject", "Resource": "arn:aws:s3:::shopify-internal-data/*"}]},
  "public_access_block": null
}
```

**Questions:**

1. Who can write to this bucket?
2. Who can read from it?
3. What is the combined risk of anonymous write + cross-account read?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.PUBLIC.003` — anonymous write access via ACL
* `CTL.S3.POLICY.WRITE.001` — public write exposure

Anyone on the internet can upload objects to the bucket. A separate AWS account can read those objects. This creates a data injection pipeline: an attacker writes malicious content, and the cross-account reader consumes it as trusted internal data.

**Run it:**

```
cd stave-hackerone-tests/cmd/shopify-98819 && go run .
```

***

### AWS #3021451[​](#aws-3021451 "Direct link to AWS #3021451")

**Scenario:** ElastiCache API calls made through a non-production endpoint do not appear in CloudTrail.

**Evidence:**

```
{
  "service": "elasticache",
  "trail": {"IsMultiRegionTrail": true, "IsLogging": true},
  "event_selectors": [{"ReadWriteType": "All", "IncludeManagementEvents": true}],
  "non_production_endpoint": "elasticache.us-east-1.api.aws",
  "events_logged_via_standard_endpoint": true,
  "events_logged_via_non_production_endpoint": false
}
```

**Questions:**

1. What does the trail configuration suggest about coverage?
2. Why would an attacker use the non-production endpoint?
3. What class of vulnerability is this?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.CLOUDTRAIL.ENABLED.001` — trail is enabled but coverage has gaps

The trail configuration looks complete: multi-region, all events, management events included. But API calls routed through the non-production endpoint bypass CloudTrail entirely. An attacker can modify ElastiCache clusters without generating any audit log entries. This is an audit evasion vulnerability in the AWS control plane itself.

**Run it:**

```
cd stave-hackerone-tests/cmd/aws-3021451 && go run .
```

***

### AWS #3022516[​](#aws-3022516 "Direct link to AWS #3022516")

**Scenario:** Amazon Forecast API calls through non-production endpoints bypass CloudTrail logging.

**Evidence:**

```
{
  "service": "forecast",
  "trail": {"IsMultiRegionTrail": true, "IsLogging": true},
  "event_selectors": [{"ReadWriteType": "All", "IncludeManagementEvents": true}],
  "non_production_endpoints": ["forecast.us-east-1.api.aws", "forecast-fips.us-east-1.api.aws"],
  "events_logged_via_non_production_endpoints": false
}
```

**Questions:**

1. How many non-production endpoints bypass logging?
2. Is the trail misconfigured, or is the service at fault?
3. What compensating control would detect the gap?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.CLOUDTRAIL.ENABLED.001` — trail active but service endpoints bypass logging

Two non-production endpoints bypass CloudTrail. The trail is correctly configured -- this is a gap in AWS's own CloudTrail integration for the Forecast service. The customer's audit log has blind spots regardless of their configuration. Compensating controls include monitoring VPC flow logs and DNS queries for non-standard endpoint usage.

**Run it:**

```
cd stave-hackerone-tests/cmd/aws-3022516 && go run .
```

***

### HackerOne #43280[​](#hackerone-43280 "Direct link to HackerOne #43280")

**Scenario:** An S3 bucket serves content over both HTTP and HTTPS. No bucket policy enforces transport encryption.

**Evidence:**

```
{
  "bucket": "hackerone-attachments",
  "bucket_policy": {"Statement": []},
  "secure_transport_enforced": false,
  "http_accessible": true,
  "https_accessible": true
}
```

**Questions:**

1. What is the risk of serving S3 objects over HTTP?
2. What bucket policy condition enforces HTTPS?
3. What data is at risk during plaintext transfer?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.S3.ENCRYPT.002` — no `aws:SecureTransport` deny policy

Without a deny policy on `aws:SecureTransport=false`, all S3 API calls and object downloads can occur over plaintext HTTP. An attacker on the network path can intercept file contents, authentication headers, and presigned URL parameters. The fix is a bucket policy statement that denies all actions when `aws:SecureTransport` is false.

**Run it:**

```
cd stave-hackerone-tests/cmd/hackerone-43280 && go run .
```

***

### Kubernetes #1238482[​](#kubernetes-1238482 "Direct link to Kubernetes #1238482")

**Scenario:** The AWS ALB Ingress Controller reconciles security groups based on Kubernetes Ingress annotations. An attacker in a shared cluster can annotate their Ingress to reference another tenant's security group.

**Evidence:**

```
{
  "cluster": "shared-eks",
  "ingress_annotation": {"alb.ingress.kubernetes.io/security-groups": "sg-0abc123def456"},
  "security_group_owner": "tenant-a",
  "ingress_namespace": "tenant-b",
  "controller_validates_ownership": false
}
```

**Questions:**

1. What happens when tenant-b references tenant-a's security group?
2. Why does the controller not validate ownership?
3. What is the blast radius in a shared cluster?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.EKS.AWSAUTH.MASTERS.BROAD.001` — broad cluster permissions enable cross-tenant manipulation

The ALB controller trusts Ingress annotations without validating that the requesting namespace owns the referenced security group. Tenant-b can modify tenant-a's security group rules by adding or removing ingress rules through annotation changes. In a shared cluster, any tenant can modify any other tenant's network security boundaries.

**Run it:**

```
cd stave-hackerone-tests/cmd/kubernetes-1238482 && go run .
```

***

### Brave #1835133[​](#brave-1835133 "Direct link to Brave #1835133")

**Scenario:** A community install guide references a staging RPM repository bucket that has been deleted.

**Evidence:**

```
{
  "dns_record": {"name": "brave-browser-rpm-staging.s3.brave.com", "type": "CNAME", "value": "brave-browser-rpm-staging.s3.brave.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "referenced_in": ["community/linux-install-rpm.md"],
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

**Questions:**

1. What happens when a user follows the community guide on a Fedora system?
2. How does a staging bucket differ from a production bucket in terms of risk?
3. What control detects the dangling reference?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — staging RPM repo domain points to unclaimed bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — RPM repository bucket deleted

An attacker claims the bucket and serves malicious RPM packages. Users following the community guide add the attacker's repository to their package manager and install trojaned software with root privileges. Staging buckets are especially dangerous because they are less monitored and more likely to be decommissioned without cleaning up references.

**Run it:**

```
cd stave-hackerone-tests/cmd/brave-1835133 && go run .
```

***

### HackerOne #1598347[​](#hackerone-1598347 "Direct link to HackerOne #1598347")

**Scenario:** HackerOne's embedded widget is served from an S3 bucket. The bucket was deleted but the widget `<script>` tag remains on the main domain.

**Evidence:**

```
{
  "dns_record": {"name": "widgets.hackerone.com", "type": "CNAME", "value": "widgets.hackerone.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "script_tag": "<script src=\"https://widgets.hackerone.com/widget.js\"></script>",
  "parent_domain": "hackerone.com"
}
```

**Questions:**

1. What happens when an attacker claims the widget bucket?
2. Why is a script tag more dangerous than a static asset reference?
3. What is the impact on the parent domain?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — widget subdomain points to unclaimed bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — widget bucket deleted

The attacker claims the bucket and serves a malicious `widget.js`. Every page that includes the script tag now executes attacker-controlled JavaScript in the context of the parent domain. This enables full cross-site scripting: stealing session cookies, redirecting users, modifying page content, and exfiltrating form data. Script injection via bucket takeover is the highest-impact variant.

**Run it:**

```
cd stave-hackerone-tests/cmd/hackerone-1598347 && go run .
```

***

### IBM #2498255[​](#ibm-2498255 "Direct link to IBM #2498255")

**Scenario:** After an acquisition, a subsidiary's subdomain still points to an S3 bucket that was decommissioned during infrastructure migration.

**Evidence:**

```
{
  "dns_record": {"name": "docs.acquired-subsidiary.ibm.com", "type": "CNAME", "value": "docs.acquired-subsidiary.ibm.com.s3.amazonaws.com"},
  "s3_bucket_exists": false,
  "acquisition_status": "completed",
  "dns_migration_status": "incomplete",
  "http_response": {"status": 404, "body": "NoSuchBucket"}
}
```

**Questions:**

1. Why are acquisitions a common source of dangling DNS?
2. What trust does the IBM parent domain confer?
3. What control catches the orphaned reference?

Reveal solution

<!-- -->

**Stave findings:**

* `CTL.DNS.DANGLING.001` — post-acquisition subdomain points to unclaimed bucket
* `CTL.S3.BUCKET.TAKEOVER.001` — decommissioned bucket claimable

Acquisitions create dangling DNS because the acquiring company inherits DNS zones it does not fully audit. The subsidiary's infrastructure gets decommissioned, but the DNS records persist under the parent domain. An attacker who claims the bucket serves content under an IBM-branded subdomain, inheriting the trust and reputation of the parent organization.

**Run it:**

```
cd stave-hackerone-tests/cmd/ibm-2498255 && go run .
```

***

**Next:** [Setup](/docs/labs/case-studies-setup.md) — download fixtures and prepare your environment.
