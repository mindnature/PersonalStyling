#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' "Node.js 20+ is required: https://nodejs.org/"
  exit 1
fi
printf '%s\n' "PersonalStyling: http://127.0.0.1:3000"
exec node server.mjs
