# Lab 4 — Compound Path: Graph Reachability

This is the lab that shows why graph reasoning matters. The MicroVM's execution role (`LooksSafe`) only has `sts:AssumeRole` on **one** specific role — it passes every per-resource check. The intermediate role only has `secretsmanager:GetSecretValue` on **one** secret — it passes every per-resource check too. Individually, both look fine.

The lethal property is the **composition**:

```
MicroVM (LooksSafe) ─sts:AssumeRole→ IntermediateRole ─GetSecretValue→ production secret
```

Per-resource controls (Labs 2–3) are blind to this by design. Reachability is what graph engines see. Stave answers it with two independent engines — **Soufflé** (Datalog) and **Z3** (SMT) — over edges modeled from the captured policies. Verified against the real engines.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

Same shared exports as [Lab 1](/docs/labs/lambda-microvm/baseline-compliant-microvm.md), **plus** `souffle` and `z3` on your `PATH`:

```
export PATH="$HOME/.local/bin:$PATH"
souffle --version && z3 --version   # confirm both are installed
mkdir -p lab4-compound && cd lab4-compound && mkdir -p snapshots
```

The graph programs ship in the repo at `ctf/labs/microvm/reasoning/`:

```
export REASONING=~/work/bizacademy/ctf/labs/microvm/reasoning
```

## Step 1 — Build the chain[​](#step-1--build-the-chain "Direct link to Step 1 — Build the chain")

Create the production secret, the intermediate role (reads only that secret), and the LooksSafe execution role (assumes only the intermediate role):

```
aws secretsmanager create-secret --name stave-lab-production-db-creds \
  --secret-string '{"username":"admin","password":"lab-test-only"}'

aws iam create-role --role-name MicroVMLab-IntermediateRole \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::'${AWS_ACCOUNT_ID}':role/MicroVMLab-ExecRole-LooksSafe"},"Action":"sts:AssumeRole"}]}'
aws iam put-role-policy --role-name MicroVMLab-IntermediateRole --policy-name secrets-access \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"secretsmanager:GetSecretValue","Resource":"arn:aws:secretsmanager:'${AWS_REGION}':'${AWS_ACCOUNT_ID}':secret:stave-lab-production-db-creds*"}]}'

aws iam create-role --role-name MicroVMLab-ExecRole-LooksSafe \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":["sts:AssumeRole","sts:TagSession"]}]}'
aws iam put-role-policy --role-name MicroVMLab-ExecRole-LooksSafe --policy-name assume-intermediate \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"sts:AssumeRole","Resource":"arn:aws:iam::'${AWS_ACCOUNT_ID}':role/MicroVMLab-IntermediateRole"}]}'
```

## Step 2 — Per-resource check is blind (the point)[​](#step-2--per-resource-check-is-blind-the-point "Direct link to Step 2 — Per-resource check is blind (the point)")

Capture the LooksSafe role and run the per-resource controls — it **passes**:

```
aws iam get-role        --role-name MicroVMLab-ExecRole-LooksSafe > snapshots/exec-role-lookssafe.json
aws iam get-role-policy --role-name MicroVMLab-ExecRole-LooksSafe --policy-name assume-intermediate > snapshots/exec-role-lookssafe-policy.json
aws iam get-role        --role-name MicroVMLab-IntermediateRole > snapshots/intermediate-role.json
aws iam get-role-policy --role-name MicroVMLab-IntermediateRole --policy-name secrets-access > snapshots/intermediate-role-policy.json

EXEC_ROLE=snapshots/exec-role-lookssafe.json EXEC_POL=snapshots/exec-role-lookssafe-policy.json \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" compound
"$STAVE" apply -i "$CTRL" -o observations/compound --eval-time "$TS" --format json | jq -r '"\(.findings|length) finding(s)"'
```

```
0 finding(s)
```

Zero. `AssumeRole` on one role isn't over-privileged; the trust policy has `TagSession`. Per-resource checks are satisfied — and the compound path is still lethal.

## Step 3 — Graph reachability[​](#step-3--graph-reachability "Direct link to Step 3 — Graph reachability")

Model the edges from the captured policies, then run both engines:

```
# 1. Edge modeling: assumes(role,role) + reads_secret(role,secret) + microvm_role(role)
MICROVM_ROLE=MicroVMLab-ExecRole-LooksSafe bash "$REASONING/build-facts.sh" facts

# 2. Soufflé (Datalog) transitive reachability
mkdir -p out
souffle "$REASONING/microvm-compound-path.dl" -F facts -D out
echo "compound path:"; cat out/compound_path.csv

# 3. Z3 (SMT) — independent cross-check (grep drops a cosmetic line on unsat)
cat facts/facts.smt2 "$REASONING/microvm-017.smt2" | z3 -in | grep -vF 'model is not available'
```

```
compound path:
MicroVMLab-ExecRole-LooksSafe	stave-lab-production-db-creds
sat
((start "MicroVMLab-ExecRole-LooksSafe")
 (mid "MicroVMLab-IntermediateRole")
 (secret "stave-lab-production-db-creds"))
```

Both agree: Soufflé lists the reachable `(role, secret)` pair; Z3 returns `sat` with the full witness — `LooksSafe → IntermediateRole → production secret`. The closed-world facts (each relation true *only* for captured edges) make the Z3 verdict sound: it cannot invent an edge.

## Step 4 — Remediate and re-verify[​](#step-4--remediate-and-re-verify "Direct link to Step 4 — Remediate and re-verify")

Break the chain — scope LooksSafe so it can no longer assume the intermediate role — then re-run:

```
aws iam put-role-policy --role-name MicroVMLab-ExecRole-LooksSafe --policy-name assume-intermediate \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["logs:CreateLogGroup","logs:PutLogEvents"],"Resource":"arn:aws:logs:*:*:*"}]}'
aws iam get-role-policy --role-name MicroVMLab-ExecRole-LooksSafe --policy-name assume-intermediate > snapshots/exec-role-lookssafe-policy.json

MICROVM_ROLE=MicroVMLab-ExecRole-LooksSafe bash "$REASONING/build-facts.sh" facts
mkdir -p out; souffle "$REASONING/microvm-compound-path.dl" -F facts -D out
echo "compound path:"; cat out/compound_path.csv            # empty
cat facts/facts.smt2 "$REASONING/microvm-017.smt2" | z3 -in | grep -vF 'model is not available'   # unsat
```

Soufflé's `compound_path.csv` is now **empty** and Z3 returns **`unsat`** — the assume-role hop is gone, so the role no longer reaches the secret.

## Step 5 — Cleanup[​](#step-5--cleanup "Direct link to Step 5 — Cleanup")

```
for R in MicroVMLab-ExecRole-LooksSafe MicroVMLab-IntermediateRole; do
  aws iam list-role-policies --role-name $R --query 'PolicyNames[]' --output text \
    | xargs -n1 aws iam delete-role-policy --role-name $R --policy-name
  aws iam delete-role --role-name $R
done
aws secretsmanager delete-secret --secret-id stave-lab-production-db-creds --force-delete-without-recovery
```

## What you learned[​](#what-you-learned "Direct link to What you learned")

* **Per-resource checks can pass on every node while the path is lethal.** That blindness is the finding, not a bug.
* Stave models the assume-role / secret-read edges from the captured policies and computes reachability with **two independent engines** (Soufflé + Z3) that agree — `sat` = vulnerable, `unsat` = safe.
* Remediation is structural: remove one edge and the path is gone.

## Next[​](#next "Direct link to Next")

* [Lab 5 — Public artifact bucket](/docs/labs/lambda-microvm/public-artifact-bucket.md)
