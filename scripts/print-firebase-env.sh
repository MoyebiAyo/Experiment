#!/usr/bin/env sh
# Prints FIREBASE_* env vars for Vercel from Firebase CLI (requires firebase login).
set -e
cd "$(dirname "$0")/.."
node scripts/print-firebase-env.mjs "$@"
