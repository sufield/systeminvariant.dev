#!/bin/bash
# deploy.sh — atomic deploy to public repo
set -euo pipefail

SITE_SOURCE="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$SITE_SOURCE/build"
PUBLIC_REPO="${PUBLIC_REPO:-/home/zepho/work/systeminvariant.dev}"

# 1. Build
echo "Building site..."
cd "$SITE_SOURCE"
npm run build

# 2. Verify build succeeded
if [ ! -d "$BUILD_DIR" ]; then
  echo "ERROR: Build directory $BUILD_DIR does not exist. Build failed."
  exit 1
fi

# 3. Verify .git exists in public repo
if [ ! -d "$PUBLIC_REPO/.git" ]; then
  echo "ERROR: .git directory missing from $PUBLIC_REPO. Aborting to prevent data loss."
  exit 1
fi

# 4. Run invariant checks against build output
echo "Running invariant checks..."
bash "$SITE_SOURCE/scripts/check-deploy-invariants.sh" "$BUILD_DIR"

# 5. Clean public repo (everything EXCEPT .git and .gitignore)
echo "Cleaning public repo..."
find "$PUBLIC_REPO" -mindepth 1 -maxdepth 1 -not -name '.git' -not -name '.gitignore' -not -name 'CNAME' -exec rm -rf {} +

# 6. Copy new build output
echo "Copying build output..."
cp -r "$BUILD_DIR"/* "$PUBLIC_REPO"/

# 7. Commit
cd "$PUBLIC_REPO"
git add -A
git commit -m "Deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)" || echo "No changes to commit"

echo ""
echo "Deploy complete. Review with: cd $PUBLIC_REPO && git log --oneline -1"
echo "Push with: cd $PUBLIC_REPO && git push"
