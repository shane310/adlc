#!/usr/bin/env bash
set -euo pipefail
pnpm db:start
pnpm db:generate
pnpm dev
