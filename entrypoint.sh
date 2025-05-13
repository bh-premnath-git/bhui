#!/usr/bin/env sh
set -e

echo "🔐 Fetching AWS CodeArtifact token…"
export CODEARTIFACT_AUTH_TOKEN=$(
  aws codeartifact get-authorization-token \
    --domain bighammer \
    --domain-owner 058264070106 \
    --query authorizationToken \
    --output text
)

echo "📦 Installing NPM dependencies…"
npm install --force

# Run the service in the foreground
npm run dev
