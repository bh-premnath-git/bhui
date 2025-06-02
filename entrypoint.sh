#!/usr/bin/env sh
set -e

echo "🔐 Fetching AWS CodeArtifact token…"

# Get CODEARTIFACT_AUTH_TOKEN from environment variables
if [ -z "$CODEARTIFACT_AUTH_TOKEN" ]; then
  export CODEARTIFACT_AUTH_TOKEN=$(
  aws codeartifact get-authorization-token \
    --domain bighammer \
    --domain-owner 211125309326 \
    --query authorizationToken \
    --output text
  )
  echo "Its inside"
else
  echo "Using existing CODEARTIFACT_AUTH_TOKEN"
fi


echo "📦 Installing NPM dependencies…"
npm install --force

# Run the service in the foreground
npm run dev
