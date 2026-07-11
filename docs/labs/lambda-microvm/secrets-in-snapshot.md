# Lab 7 — Secrets Baked Into the Snapshot

MicroVMs boot fast because they resume from a **memory snapshot** taken after initialization. If your init code loads a secret at module scope — `secretsmanager:GetSecretValue` before `CMD` — that secret is **baked into the snapshot**. Every MicroVM launched from that image, on every resume, carries the same secret in memory, indefinitely. No per-resource cloud scanner looks inside a Firecracker snapshot. This lab catches it.

Like the runtime limits in [Lab 6](/docs/labs/lambda-microvm/excessive-idle-runtime.md), this is an **asserted** signal: whether init loads a secret isn't an AWS API field — it's a property the image build surfaces (a static check over the Dockerfile / app init). The transform records it; the control evaluates it. Verified against the real `stave` binary.

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

Same shared exports as [Lab 1](/docs/labs/lambda-microvm/baseline-compliant-microvm.md). Then:

```
mkdir -p lab7-snapshot-secret && cd lab7-snapshot-secret && mkdir -p snapshots
```

## The defect[​](#the-defect "Direct link to The defect")

A non-compliant `app.py` loads the secret during init — at module scope, before the server starts:

```
import boto3
app = Flask(__name__)

# BAD: runs at init -> the value is in the snapshot taken after init
client = boto3.client("secretsmanager")
SECRET = client.get_secret_value(SecretId="prod-db-creds")["SecretString"]
```

The build step surfaces this as `microvm_image.init_secret_access = true`.

## Step 1 — Detect[​](#step-1--detect "Direct link to Step 1 — Detect")

Assert the init-secret signal via the transform; everything else defaults compliant:

```
INIT_SECRET=true \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" snapshot-secret

"$STAVE" apply -i "$CTRL" -o observations/snapshot-secret --eval-time "$TS" --format json \
  | jq -r '"\(.findings|length) finding(s):", (.findings[] | "  [\(.control_severity)] \(.control_id) — \(.control_name)")'
```

```
1 finding(s):
  [critical] CTL.LAMBDA.MICROVM.SNAPSHOTSECRET.001 — MicroVM Image Loads Secrets Into the Snapshot at Init
```

`microvm_image.init_secret_access = true` fires **SNAPSHOTSECRET** (critical).

## Step 2 — Remediate and re-verify[​](#step-2--remediate-and-re-verify "Direct link to Step 2 — Remediate and re-verify")

Defer secret loading to a runtime **lifecycle hook** (`/run`) so it executes *after* the snapshot is taken — the value is fetched fresh on each run, never baked in:

```
@app.route("/run", methods=["POST"])
def run_hook():
    app.config["SECRET"] = boto3.client("secretsmanager") \
        .get_secret_value(SecretId="prod-db-creds")["SecretString"]
    return jsonify(status="ready"), 200
```

Rebuild the image from the fixed app; the build now reports `init_secret_access = false`:

```
INIT_SECRET=false \
  BUCKET=stave-microvm-lab-${AWS_ACCOUNT_ID} bash "$TRANSFORM" snapshot-secret-fixed

"$STAVE" apply -i "$CTRL" -o observations/snapshot-secret-fixed --eval-time "$TS" --format json | jq -r '"\(.findings|length) finding(s):"'
```

```
0 finding(s):
```

## What you learned[​](#what-you-learned "Direct link to What you learned")

* The fast-boot mechanism (memory snapshot) is itself an attack surface: a secret loaded at init persists in every launched MicroVM.
* The fix is structural — move secret loading into a runtime hook so it runs after the snapshot, not before.
* Some controls evaluate a **build-time signal** (`init_secret_access`), not a cloud-API field — the four-quadrant point that LLM source-scanning and config evaluation are different jobs.

## You've finished the series[​](#youve-finished-the-series "Direct link to You've finished the series")

All seven labs map to the `CTL.LAMBDA.MICROVM.*` family:

| Lab                      | Controls                          |
| ------------------------ | --------------------------------- |
| 1 Baseline               | all 16 pass                       |
| 2 Over-privileged role   | EXECROLE, TAGSESSION              |
| 3 Missing TagSession     | TAGSESSION                        |
| 4 Compound path          | graph reachability (Soufflé + Z3) |
| 5 Public S3              | S3PUBLIC, S3VERSION               |
| 6 Excessive idle/runtime | IDLE, RUNTIME                     |
| 7 Secrets in snapshot    | SNAPSHOTSECRET                    |

Browse the full catalog in the [invariants reference](/docs/reference/invariants-reference/catalog/.md), or author your own with [Writing Controls](/docs/labs/writing-controls.md).
