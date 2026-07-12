# Build & Verify

Build Stave from source and confirm the binary, control catalog, and search all work.

**Time:** \~5 minutes. **No AWS account needed.**

## Prerequisites[​](#prerequisites "Direct link to Prerequisites")

* Go >= 1.26 ([go.dev/dl](https://go.dev/dl/))
* git
* jq (`sudo apt install jq`)

## Steps[​](#steps "Direct link to Steps")

### 1. Check Go version[​](#1-check-go-version "Direct link to 1. Check Go version")

```
go version
```

If missing or below 1.26:

```
wget https://go.dev/dl/go1.26.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.26.5.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
go version
```

### 2. Check jq[​](#2-check-jq "Direct link to 2. Check jq")

```
jq --version || sudo apt install -y jq
```

### 3. Clone and build[​](#3-clone-and-build "Direct link to 3. Clone and build")

```
git clone https://github.com/sufield/stave
cd stave
make build
```

Use `make build`, not bare `go build` — it runs `sync-schemas` and `sync-controls` first, which a fresh clone requires.

### 4. Verify the binary[​](#4-verify-the-binary "Direct link to 4. Verify the binary")

```
./stave version
```

Expect a version line (e.g. `edge (production)`).

### 5. Verify the control catalog[​](#5-verify-the-control-catalog "Direct link to 5. Verify the control catalog")

```
./stave controls list -i controls | wc -l
```

Expect **2,600+** controls.

### 6. Verify search[​](#6-verify-search "Direct link to 6. Verify search")

```
./stave search "privilege escalation"
```

Expect multiple results with control IDs and descriptions.

## Done[​](#done "Direct link to Done")

A working `stave` binary with 2,600+ controls and functioning search.

**Next:** [First Findings](/docs/labs/skill-track/first-findings.md)
