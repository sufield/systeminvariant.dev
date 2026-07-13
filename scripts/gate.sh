#!/usr/bin/env bash
# gate.sh — post-deploy acceptance gate. Exit 0 iff all invariants hold.
set -uo pipefail

SITE="${1:-https://www.systeminvariant.dev}"
FAIL=0
pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1"; FAIL=1; }
fetch() { curl -sf "$1"; }

SITEMAP="$(fetch "$SITE/sitemap.xml")" || { fail "INV-1 sitemap.xml unreachable"; exit 1; }
URLS="$(printf '%s' "$SITEMAP" | grep -o '<loc>[^<]*' | sed 's/<loc>//')"
BAD="$(printf '%s\n' "$URLS" | grep -v "^$SITE" || true)"
[ -z "$BAD" ] && pass "INV-1 all sitemap URLs on $SITE" \
              || fail "INV-1 foreign host in sitemap: $(printf '%s\n' "$BAD" | head -3 | tr '\n' ' ')"

declare -A FP
CANON_BAD=0; META_BAD=0; N=0
while IFS= read -r u; do
  [ -z "$u" ] && continue; N=$((N+1))
  HTML="$(fetch "$u")" || { fail "INV-0 fetch failed: $u"; continue; }

  CANON="$(printf '%s' "$HTML" | grep -o '<link[^>]*rel="canonical"[^>]*>' | head -1 \
          | grep -o 'href="[^"]*"' | sed 's/^href="//;s/"$//')"
  if [ "${CANON%/}" != "${u%/}" ]; then
    fail "INV-2 canonical: $u -> ${CANON:-<missing>}"; CANON_BAD=$((CANON_BAD+1))
  fi

  if printf '%s' "$HTML" | grep -oE '<(link|meta)[^>]*>' | grep -q 'stave\.dev'; then
    fail "INV-3 stave.dev in head: $u"; META_BAD=$((META_BAD+1))
  fi

  R="$(printf '%s' "$HTML" | grep -o 'runtime~main\.[0-9a-f]*\.js' | head -1)"
  [ -n "$R" ] && FP["$R"]=1
done <<< "$URLS"

[ "$CANON_BAD" -eq 0 ] && pass "INV-2 canonical self-referential on all $N pages"
[ "$META_BAD"  -eq 0 ] && pass "INV-3 no foreign domain in head metadata"

if   [ "${#FP[@]}" -eq 1 ]; then pass "INV-4 single build generation: ${!FP[*]}"
elif [ "${#FP[@]}" -eq 0 ]; then fail "INV-4 no runtime chunk found (check pattern)"
else fail "INV-4 ${#FP[@]} generations served: ${!FP[*]}"; fi

# INV-5: retired paths should redirect (301 or meta-refresh 200).
# On Render, 200 with no redirect = stale file blocking the rule.
RETIRED="/docs/discover /docs/evaluate /docs/learn /docs/build /docs/scale
/docs/tutorials/first-evaluation /docs/tutorials/quick-start
/docs/tutorials/ci-pipeline-gate /docs/demos /docs/challenge /docs/positioning"
for p in $RETIRED; do
  CODE="$(curl -s -o /dev/null -w '%{http_code}' "$SITE$p")"
  case "$CODE" in
    301|302|308) pass "INV-5 $p -> $CODE (server redirect)" ;;
    200)
      BODY="$(curl -s "$SITE$p" | head -10)"
      if printf '%s' "$BODY" | grep -q 'meta http-equiv="refresh"'; then
        pass "INV-5 $p -> 200 (client redirect stub)"
      else
        fail "INV-5 $p -> 200: real content at retired path"
      fi
      ;;
    *)  fail "INV-5 $p -> $CODE (missing)" ;;
  esac
done

exit $FAIL
