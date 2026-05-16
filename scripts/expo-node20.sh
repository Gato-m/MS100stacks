#!/usr/bin/env bash
set -euo pipefail

REQUIRED_NODE="20.19.4"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_ROOT"

if command -v nvm >/dev/null 2>&1; then
  nvm use "$REQUIRED_NODE" >/dev/null
  exec npx expo "$@"
fi

if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
  nvm use "$REQUIRED_NODE" >/dev/null
  exec npx expo "$@"
fi

if [ -f "node_modules/expo/bin/cli" ]; then
  exec npx -y node@${REQUIRED_NODE} node_modules/expo/bin/cli "$@"
fi

echo "Expo CLI not found in node_modules. Run npm install in project root first." >&2
exit 1
