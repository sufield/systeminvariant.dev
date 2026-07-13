---
title: "Build & Verify"
sidebar_label: "1. Build & Verify"
sidebar_position: 1
description: "Build Stave from source and verify the binary and control catalog work."
---

# Build & Verify

Build Stave from source and confirm the binary, control catalog, and search all work.

**Time:** ~5 minutes. **No AWS account needed.**

## Prerequisites

- Go >= 1.26 ([go.dev/dl](https://go.dev/dl/))
- git
- jq (`sudo apt install jq`)

## Steps

### 1. Check Go version

```bash
go version
```

If missing or below 1.26:

```bash
wget https://go.dev/dl/go1.26.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.26.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
go version
```

### 2. Check jq

```bash
jq --version || sudo apt install -y jq
```

### 3. Clone and build

```bash
git clone https://github.com/sufield/stave
cd stave
make build
```

Use `make build`, not bare `go build` — it runs `sync-schemas` and `sync-controls` first, which a fresh clone requires.

### 4. Verify the binary

```bash
./stave version
```

Expect a version line (e.g. `edge (production)`).

### 5. Verify the control catalog

```bash
./stave controls list -i controls | wc -l
```

Expect **2,600+** controls.

### 6. Verify search

```bash
./stave search "privilege escalation"
```

Expect multiple results with control IDs and descriptions.

## Done

A working `stave` binary with 2,600+ controls and functioning search.

**Next:** [First Findings](02-first-findings.md)
