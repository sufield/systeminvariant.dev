# Evidence Packet

An evidence packet is a self-contained, independently verifiable compliance artifact. It contains everything an auditor needs to confirm that the assessment happened, what it found, and that it can be reproduced.

## Generating a packet[​](#generating-a-packet "Direct link to Generating a packet")

```
stave bundle audit \
  --framework hipaa \
  --period Q1-2026 \
  --history ./assessments/ \
  --out ./evidence/
```

Required inputs:

* `--framework` — compliance framework (`hipaa`, `soc2`, `fedramp`, `pci_dss`)
* `--period` — period shorthand (`Q1-2026`) or explicit range (`--from 2026-01-01 --to 2026-03-31`)
* `--history` — directory of assessment JSON files from `stave apply --format json`
* `--out` — output directory (created if not exists)

Optional:

* `--exempt` — path to acknowledgments YAML (includes exemption register in the packet)
* `--dry-run` — show what would be collected without writing

## Packet contents[​](#packet-contents "Direct link to Packet contents")

```
evidence/
├── manifest.sha256          # SHA-256 of every file in the packet
├── assessment-results/      # All assessment JSON files for the period
│   ├── 2026-01-15.json
│   ├── 2026-02-01.json
│   └── ...
├── executive-report.json    # Summary: finding counts, trends, risk posture
├── continuity-attestation/  # Evidence of continuous monitoring (no gaps)
├── remediation-trend.json   # Finding open/close over the period
└── exemption-register.json  # Active and expired exemptions during the period
```

## Re-derivability[​](#re-derivability "Direct link to Re-derivability")

The evidence packet is independently verifiable:

1. An auditor with the original snapshots and the same Stave version can re-run every assessment and get byte-identical findings
2. The manifest provides integrity — any modification to any file in the packet is detectable
3. The catalog version is recorded — the auditor knows exactly which controls were evaluated

This means the assessor does not need to be trusted. The auditor can verify the assessment themselves.

## Verifying a packet[​](#verifying-a-packet "Direct link to Verifying a packet")

```
stave bundle audit --path ./evidence/ --verify
```

Verification checks:

* Manifest integrity (SHA-256 of each file matches)
* Period coverage (no gaps in the assessment cadence)
* Catalog version consistency across assessments
* Exemption register matches the acknowledgments file

## What an auditor receives[​](#what-an-auditor-receives "Direct link to What an auditor receives")

The evidence packet crosses the practitioner → CISO gap without requiring tool knowledge. An auditor sees:

* **What was evaluated** — catalog version, control count, resource scope
* **What was found** — finding counts by severity, trend over time
* **What was accepted** — exemption register with rationale and expiry
* **That it's reproducible** — manifest + catalog version = re-derivable
* **That monitoring was continuous** — no gaps in the assessment cadence

The auditor does not need to install Stave, understand the control YAML format, or have cloud credentials. The packet is the deliverable.
