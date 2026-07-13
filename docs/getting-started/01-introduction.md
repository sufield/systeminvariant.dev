---
title: "Introduction"
sidebar_label: "Introduction"
sidebar_position: 1
description: "What Stave is, who it's for, and how it works."
---

# Introduction

Stave is a configuration safety evaluator that detects infrastructure misconfigurations by analyzing exported configuration snapshots locally, without requiring cloud credentials or API access.

Infrastructure misconfigurations — public S3 buckets, missing encryption, overly permissive IAM policies — are the root cause of most cloud data breaches. Traditional security scanners require live API access to your cloud accounts, which expands your attack surface and creates credential management overhead. Stave takes a different approach: you export your infrastructure configuration as JSON snapshots, and Stave evaluates them against a library of safety invariants entirely offline. No credentials leave your environment. No network calls are made.

Stave is built for platform engineers, DevSecOps teams, and security teams at organizations with compliance requirements like HIPAA. It ships with 43 invariants covering S3 public access, encryption, access control, lifecycle management, data retention, and tenant isolation. It tracks how long resources remain in unsafe states over time, detects recurrence patterns, and produces structured findings with remediation guidance.

**Try it without installing anything:**

```bash
docker compose -f stave/docker-compose.yaml build demo
docker compose -f stave/docker-compose.yaml run --rm demo
```

This runs 7 curated scenarios based on real HackerOne bug bounty reports. See the [Demo](../demo/README.md) for details.

**Or build from source:**

```bash
git clone https://github.com/sufield/stave.git && cd stave && make build
./stave apply --invariants invariants/s3 --observations ./observations --max-unsafe 7d
```
