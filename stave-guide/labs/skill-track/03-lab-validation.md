---
title: "Lab Validation"
sidebar_label: "3. Lab Validation"
sidebar_position: 3
description: "Deploy a known-vulnerable lab and confirm Stave detects the documented attack path."
---

# Lab Validation

Deploy a known-vulnerable IAM configuration from Bishop Fox `iam-vulnerable`, model it as a Stave observation, and confirm the finding matches the documented attack path. The payoff is empirical trust: Stave matches an independent expert oracle.

**Time:** ~30 minutes. **Requires a sandbox AWS account.** Cost: $0 (IAM only).

## Prerequisites

- Built `stave` binary
- AWS sandbox account with a configured profile
- Terraform

**Never run this against production** — the lab creates intentionally-vulnerable IAM users.

```bash
aws sts get-caller-identity --profile <your-sandbox-profile>
```

## Steps

### 1. Install Terraform

```bash
terraform version || {
  wget -O- https://apt.releases.hashicorp.com/gpg | \
    sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
  echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] \
    https://apt.releases.hashicorp.com $(lsb_release -cs) main" | \
    sudo tee /etc/apt/sources.list.d/hashicorp.list
  sudo apt update && sudo apt install -y terraform
}
```

### 2. Deploy the lab

```bash
git clone https://github.com/BishopFox/iam-vulnerable.git
cd iam-vulnerable
export TF_VAR_aws_local_profile=<your-sandbox-profile>
terraform init && terraform apply
```

Expect ~30 new IAM users with names containing `privesc`.

### 3. Pick one privesc user

Start simple: `privesc4-CreateAccessKey-user`.

```bash
aws iam list-attached-user-policies \
  --user-name privesc4-CreateAccessKey-user \
  --profile <your-sandbox-profile>
```

### 4. Find the matching control

```bash
./stave search "CreateAccessKey escalation"
```

Result: `CTL.IAM.ESCALATE.CREATEACCESSKEY.001`. Check which fields the control reads:

```bash
find controls -name '*CREATEACCESSKEY*' -exec grep -A4 unsafe_predicate {} \;
```

### 5. Build the observation

```bash
mkdir -p ~/bf-obs
cat > ~/bf-obs/2026-01-01T000000Z.json << 'EOF'
{
  "schema_version": "obs.v0.1",
  "source": "deployed",
  "generated_by": { "source_type": "aws.cli" },
  "captured_at": "2026-01-01T00:00:00Z",
  "assets": [
    {
      "id": "arn:aws:iam::<ACCOUNT>:user/privesc4-CreateAccessKey-user",
      "type": "aws_iam_user",
      "vendor": "aws",
      "properties": {
        "identity": {
          "kind": "user",
          "escalation": {
            "create_access_key": {
              "present": true,
              "target_user_arn": "arn:aws:iam::<ACCOUNT>:user/some-admin",
              "permission_delta": ["iam:*"]
            }
          }
        }
      }
    }
  ]
}
EOF
```

Replace `<ACCOUNT>` with your sandbox account ID.

### 6. Run Stave

```bash
./stave apply --observations ~/bf-obs/ --eval-time 2026-01-02T00:00:00Z
```

**Expected:** 1 violation — `CTL.IAM.ESCALATE.CREATEACCESSKEY.001`.

### 7. Compare to the oracle

Bishop Fox documents privesc4 as "escalate via CreateAccessKey." Stave fired `CTL.IAM.ESCALATE.CREATEACCESSKEY.001`. **Match.**

### 8. Tear down

```bash
cd iam-vulnerable && terraform destroy
```

Confirm no privesc users remain:

```bash
aws iam list-users --profile <your-sandbox-profile> | \
  jq -r '.Users[].UserName' | grep -ci privesc
```

## Done

You verified Stave against an independent expert oracle; findings match documented attack paths.

**Next:** [Write a Control](04-write-a-control.md)
