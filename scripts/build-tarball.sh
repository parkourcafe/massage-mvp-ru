#!/usr/bin/env bash
# Build the production app and package the deployable artifact.
# Produces massage-marketplace-mvp.tar.gz at the repo root.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Installing dependencies"
npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund

echo "==> Type checking"
npm run typecheck

echo "==> Running tests"
npm run test

echo "==> Building Next.js"
npm run build

echo "==> Creating tarball"
ARTIFACT="massage-marketplace-mvp.tar.gz"
rm -f "$ARTIFACT"
tar -czf "$ARTIFACT" \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude="$ARTIFACT" \
  .next public package.json package-lock.json next.config.js \
  tsconfig.json tailwind.config.ts postcss.config.js \
  src supabase .env.example README.md 2>/dev/null || \
tar -czf "$ARTIFACT" \
  --exclude="node_modules" \
  --exclude=".git" \
  --exclude="$ARTIFACT" \
  .next package.json next.config.js tsconfig.json \
  tailwind.config.ts postcss.config.js src supabase .env.example README.md

echo "==> Done: $ARTIFACT"
ls -lh "$ARTIFACT"
