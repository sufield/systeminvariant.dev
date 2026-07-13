#!/bin/bash
set -euo pipefail

BUILD_DIR="${1:-build}"
ERRORS=0

echo "Running deploy invariant checks..."

# 1. Every content page canonical uses systeminvariant.dev
#    Redirect stubs (http-equiv="refresh") have relative canonicals by design.
echo -n "Check 1: Canonical domain... "
BAD=0
while IFS= read -r f; do
  grep -q 'http-equiv="refresh"' "$f" && continue
  if grep -q 'rel="canonical"' "$f" && ! grep 'rel="canonical"' "$f" | grep -q 'systeminvariant.dev'; then
    echo ""
    echo "  BAD: $f"
    BAD=1
  fi
done < <(find "$BUILD_DIR" -name '*.html' -type f)
if [ "$BAD" -eq 1 ]; then
  echo "FAIL"
  ERRORS=$((ERRORS + 1))
else
  echo "OK"
fi

# 2. No stave.dev references in content pages
echo -n "Check 2: No stave.dev references... "
STAVE_DEV=$(grep -rl 'stave\.dev' "$BUILD_DIR" --include='*.html' || true)
if [ -n "$STAVE_DEV" ]; then
  echo "FAIL"
  echo "$STAVE_DEV" | head -10 | sed 's/^/  /'
  ERRORS=$((ERRORS + 1))
else
  echo "OK"
fi

# 3. Build directory exists and has content
echo -n "Check 3: Build has content... "
HTML_COUNT=$(find "$BUILD_DIR" -name '*.html' -type f | wc -l)
if [ "$HTML_COUNT" -lt 10 ]; then
  echo "FAIL ($HTML_COUNT HTML files — expected 100+)"
  ERRORS=$((ERRORS + 1))
else
  echo "OK ($HTML_COUNT HTML files)"
fi

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "FAILED: $ERRORS invariant(s) violated. Do not deploy."
  exit 1
else
  echo "PASSED: All invariants satisfied."
fi
