---
title: "Installation"
sidebar_label: "Installation"
sidebar_position: 2
description: "How to install Stave from source."
---

# Installation

Stave is distributed as source and built with Go. If you just want to see Stave in action first, you can skip installation and run the [Docker demo](../demo/README.md):

```bash
docker compose -f stave/docker-compose.yaml build demo
docker compose -f stave/docker-compose.yaml run --rm demo
```

## Prerequisites

- Go 1.26.0 or later
- `make`

## Build from Source

```bash
git clone https://github.com/sufield/stave.git
cd stave
make build
```

This produces a `./stave` binary in the project root. The `make build` step copies schema files into the embed directory before compiling — running bare `go build` after a fresh clone will fail because the embedded schema files are generated artifacts.

## Verify Installation

```bash
./stave --version
```

## Install to PATH

**Option A — GOPATH (recommended, no sudo):**

```bash
make install   # installs to $GOPATH/bin
```

Ensure `$GOPATH/bin` is on your PATH:

```bash
export PATH="$(go env GOPATH)/bin:$PATH"
```

**Option B — User bin directory (no sudo):**

```bash
mkdir -p ~/bin
cp stave ~/bin/
export PATH="$HOME/bin:$PATH"
```

**Option C — System-wide (requires sudo):**

```bash
sudo cp stave /usr/local/bin/
```

Prefer user-space paths (Options A or B) over system-wide installation when possible.

## Development Setup

```bash
make test           # Run all tests
make lint           # Run golangci-lint (requires v2.8.0)
make check          # Run fmt, vet, lint, and test
make ci             # Full CI pipeline (tidy, check, build)
```
