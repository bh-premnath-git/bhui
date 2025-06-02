#!/usr/bin/env sh
set -e

echo "🔐 Fetching AWS CodeArtifact token…"

# Get CODEARTIFACT_AUTH_TOKEN from environment variables
if [ -z "$CODEARTIFACT_AUTH_TOKEN" ]; then
  export CODEARTIFACT_AUTH_TOKEN=$(
  aws codeartifact get-authorization-token \
    --domain bighammer \
    --domain-owner 058264070106 \
    --query authorizationToken \
    --output text
  )
  eccho "Its inside"
else
  echo "Using existing CODEARTIFACT_AUTH_TOKEN"
fi

if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then \
    echo "Configuring AWS credentials for CodeArtifact..." && \
    aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID" && \
    aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY" && \
    aws configure set region "$AWS_REGION" && \
    echo "registry=https://bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/" > .npmrc && \
    echo "//bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/:always-auth=true" >> .npmrc && \
    echo "//bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/:_authToken=${CODEARTIFACT_AUTH_TOKEN}" >> .npmrc; \
else \
    echo "AWS credentials not provided. Skipping CodeArtifact configuration."; \
fi

echo "📦 Installing NPM dependencies…"
npm install --force

# Run the service in the foreground
npm run dev
