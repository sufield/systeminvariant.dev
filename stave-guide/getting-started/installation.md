---
title: "Installation"
sidebar_label: "Installation"
sidebar_position: 2
description: "Install Stave in three progressive tiers. Tier 1 is the standalone Go binary; Tier 2 adds external reasoning engines; Tier 3 adds Neo4j visualisation."
---

# Installation

Stave ships in **three progressive tiers**. Each tier adds capability
on top of the previous one — they are not alternatives.

| Goal | Tier | What you install |
|---|---|---|
| Scan AWS / cloud configurations | **Tier 1** | One Go binary |
| Formal proofs / blast-radius / risk quantification | **Tier 2** | Tier 1 + external solvers |
| Conference demo with graph visualisation | **Tier 3** | Tier 2 + Neo4j |

Most adopters live in Tier 1 with occasional Tier 2 when they need a
proof for an auditor or a breach investigation. Tier 3 is the demo
stage. This tutorial walks you through Tier 1 in detail and points
to Tier 2 / Tier 3 setup at the end.

## Tier 1 — Stave standalone

The Go binary, built from source. CEL evaluation across the full
control catalogue plus fact export (JSONL, SMT-LIB v2). No Docker, no
Python, no solver libraries.

### Prerequisites

- Go 1.26 or later (1.26.4 is the pinned toolchain — see `go.mod`)
- `make`

### Build from source

```bash
git clone https://github.com/sufield/stave.git
cd stave
make build
```

This produces a `./stave` binary in the project root. The `make build`
step copies schema files into the embed directory before compiling —
running bare `go build` after a fresh clone will fail because the
embedded schema files are generated artifacts.

### Verify

```bash
./stave --version
./stave apply --observations examples/public-bucket/observations \
              --controls    examples/public-bucket/controls \
              --max-unsafe 12h --eval-time 2026-01-02T00:00:00Z
```

The `apply` command should exit with code 3 (violations found) on the
public-bucket fixture.

### Install to PATH

**Option A — GOPATH (recommended, no sudo):**

```bash
make install   # installs to $GOPATH/bin
export PATH="$(go env GOPATH)/bin:$PATH"
```

**Option B — user bin directory (no sudo):**

```bash
mkdir -p ~/bin
cp stave ~/bin/
export PATH="$HOME/bin:$PATH"
```

**Option C — system-wide (requires sudo):**

```bash
sudo cp stave /usr/local/bin/
```

Prefer user-space paths (Options A or B) when possible.

### Development setup

```bash
make test     # Run all tests
make lint     # Run golangci-lint (requires v2.8.0)
make check    # Run fmt, vet, lint, and test
make ci       # Full CI pipeline (tidy, check, build)
```

You now have a working Tier 1 install. This is what early adopters
ship to production. Move on to [Your First Evaluation](first-evaluation) to
run your first evaluation.

## Tier 2 — adding reasoning engines

Tier 2 is Tier 1 plus external solvers — Z3, cvc5, Yices, Soufflé,
Clingo, SWI-Prolog, PySAT. They consume the same `stave export-sir`
output; they don't replace anything in Tier 1.

There are two ways to land in Tier 2.

### Option A — devcontainer (batteries included)

The repository ships a [`.devcontainer/`](https://github.com/sufield/stave/tree/main/.devcontainer)
configuration. Open Stave in **GitHub Codespaces** (use the **Open in
GitHub Codespaces** badge in the README) or in **VS Code** with the
Dev Containers extension; the post-create script installs every
solver, builds the binary, and reports `[stave devcontainer] ready`
when finished.

This is the quickest path to running every example end-to-end with
zero local install footprint.

### Option B — install engines individually

If you only need one or two engines, install them à la carte. The
engines are independent processes; Stave itself never invokes them.

```bash
# macOS (Homebrew)
brew install z3 cvc5 swi-prolog clingo
pip install python-sat pyyaml

# Ubuntu / Debian
sudo apt install z3 cvc5 swi-prolog libz3-dev python3-venv
python3 -m venv .tools-venv
.tools-venv/bin/pip install clingo python-sat pyyaml
```

Soufflé is special — see
[`stave/examples/PREREQUISITES.md`](https://github.com/sufield/stave/tree/main/examples/PREREQUISITES.md)
for the upstream `.deb` install (it is not in standard Ubuntu repos).

### Verify Tier 2

```bash
# SMT (Z3)
bash examples/z3-multi-hop-can-assume/run.sh

# Datalog (Soufflé)
bash examples/souffle-reachability/run.sh

# All engines, one fixture set
bash examples/compare-engines/run.sh
```

For the decision table on which engine answers which question shape,
see [Reasoning Engines](../how-to/controls/reasoning-engines.md). For the
on-disk format that every engine reads, see
[Fact Export](../reference/fact-export.md). For the architectural
rationale, see
[Files as the Boundary](../explanation/files-as-the-boundary.md).

## Tier 3 — adding visualisation

Tier 3 is Tier 2 plus **Neo4j 5** for graph visualisation. It is the
demo / presentation tier — not the daily-use tier. Adopters reach
Tier 3 only when running a conference demo or a stakeholder
walk-through.

```bash
cd demos/nodes-2026
docker compose up -d   # Neo4j 5
make demo              # ten-step walkthrough, all nine engines + graph import
make teardown          # tears down the Neo4j container
```

The conference demos at
[`demos/nodes-2026/`](https://github.com/sufield/stave/tree/main/demos/nodes-2026)
and
[`demos/fwd-cloudsec-2026/`](https://github.com/sufield/stave/tree/main/demos/fwd-cloudsec-2026)
drive the same fixture through every engine and import the resulting
graph into Neo4j.

## What you have installed

After Tier 1 you have the complete default Stave install — the
in-process Google CEL evaluator and the SIR fact exporter, both built
into the same binary, no other runtime dependencies. The control
catalogue, chain walker, property projector, risk-reasoning engine,
and `export-sir` projection all live inside this binary.

After Tier 2 you have Tier 1 plus a set of independent solver
binaries / Python packages on the side. They read Stave's exported
files; they do not link against Stave. Adding or removing a Tier 2
engine has no effect on Stave itself.

For a deeper look at why Stave is shaped this way, see
[Files as the Boundary](../explanation/files-as-the-boundary.md). For
the release pipeline that produced your Tier 1 binary, see
[Release Security](../explanation/release-security.md).

---

**Next:** [Understand the Output](reading-chain-findings) — learn what compound chains and ★ markers mean.
