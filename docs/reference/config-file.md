# Configuration

Stave supports layered configuration so common settings do not need to be repeated on every command.

## Configuration Sources[​](#configuration-sources "Direct link to Configuration Sources")

1. CLI flags (highest priority)
2. Project config: `stave.yaml` (repo root)
3. User config: `~/.config/stave/config.yaml`
4. Environment variables (`STAVE_*`)
5. Built-in defaults

Use `stave config show` to inspect effective values and their sources.

## Project Config (`stave.yaml`)[​](#project-config-staveyaml "Direct link to project-config-staveyaml")

Typical project-level settings:

```
max_unsafe: 168h
snapshot_retention: 30d

enabled_control_packs:
  - s3

exclude_controls:
  - CTL.S3.PUBLIC.LIST.002

ci_failure_policy: fail_on_any_violation
```

### Control Selection Settings[​](#control-selection-settings "Direct link to Control Selection Settings")

* `enabled_control_packs`: selects embedded packs for evaluation
* `exclude_controls`: removes specific control IDs after selection
* `use_built_in_controls`: selector-based built-in loading

### Explicit Selection Semantics[​](#explicit-selection-semantics "Direct link to Explicit Selection Semantics")

* Built-in catalog (`stave controls list --built-in`) is the complete embedded rule inventory.
* Pack selection (`enabled_control_packs`, `stave packs show`) is curated and may include only a subset of catalog IDs.
* `exclude_controls` is applied after pack/catalog selection.
* If both `enabled_control_packs` and CLI `--controls` are provided on `apply`, Stave fails fast to avoid ambiguous policy resolution.

When `enabled_control_packs` is set, `stave apply` records selection metadata in output extensions:

* `selected_controls_source`
* `enabled_control_packs`
* `resolved_control_ids`
* `pack_registry_version`
* `pack_registry_hash`

## User Config (`~/.config/stave/config.yaml`)[​](#user-config-configstaveconfigyaml "Direct link to user-config-configstaveconfigyaml")

User config stores personal defaults and aliases, for example:

```
max_unsafe: 168h
snapshot_retention: 30d
cli_defaults:
  output: text
  quiet: false
  sanitize: false
  path_mode: base
aliases:
  ev: "apply --controls controls/s3 --observations observations"
```

## Environment Variables[​](#environment-variables "Direct link to Environment Variables")

* `STAVE_MAX_UNSAFE`
* `STAVE_SNAPSHOT_RETENTION`
* `STAVE_RETENTION_TIER`
* `STAVE_CI_FAILURE_POLICY`
* `STAVE_USER_CONFIG`

## Command to Inspect Effective Config[​](#command-to-inspect-effective-config "Direct link to Command to Inspect Effective Config")

```
stave config show
stave config show --format json
```

This is the fastest way to verify what value is active and where it came from.
