#!/usr/bin/env bash
# verify-build.sh — pre-publish gates. Fail-closed.
set -euo pipefail

BUILD="${1:-build}"

if grep -rq 'https://stave\.dev' "$BUILD/"; then
  echo "GATE FAIL (INV-3): foreign domain in build:"
  grep -rl 'https://stave\.dev' "$BUILD/" | head
  exit 1
fi

if grep -rqE 'href="/docs/(discover|evaluate|learn|build|scale)[/"]' "$BUILD/" 2>/dev/null; then
  echo "GATE FAIL (INV-6): internal links to retired journey paths:"
  grep -rlE 'href="/docs/(discover|evaluate|learn|build|scale)[/"]' "$BUILD/" | head
  exit 1
fi

GENS=$(find "$BUILD/" -name '*.html' ! -path '*/.git/*' -print0 | head -z -n 50 | xargs -0 grep -oh 'runtime~main\.[0-9a-f]*\.js' 2>/dev/null | sort -u | wc -l || true)
if [ "$GENS" -gt 1 ]; then
  echo "GATE FAIL (INV-4): multiple build generations in output"
  find "$BUILD/" -name '*.html' | head -50 | xargs grep -oh 'runtime~main\.[0-9a-f]*\.js' 2>/dev/null | sort -u
  exit 1
fi

echo "verify-build: all artifact gates passed."
