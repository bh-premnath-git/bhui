#!/usr/bin/env sh
set -e

echo "🔐 Fetching AWS CodeArtifact token…"

# Use env vars for domain and owner
: "${AWS_CODEARTIFACT_DOMAIN:=bighammer}"
: "${AWS_CODEARTIFACT_DOMAIN_OWNER:?AWS_CODEARTIFACT_DOMAIN_OWNER not set}"
: "${AWS_CODEARTIFACT_REPOSITORY:=bh-npm-repo}"
: "${AWS_REGION:=us-east-1}"

# Get CODEARTIFACT_AUTH_TOKEN from environment variables
if [ -z "$CODEARTIFACT_AUTH_TOKEN" ]; then
  export CODEARTIFACT_AUTH_TOKEN=$(
    aws codeartifact get-authorization-token \
      --domain "$AWS_CODEARTIFACT_DOMAIN" \
      --domain-owner "$AWS_CODEARTIFACT_DOMAIN_OWNER" \
      --query authorizationToken \
      --output text
  )
  echo "Fetched new CODEARTIFACT_AUTH_TOKEN"
else
  echo "Using existing CODEARTIFACT_AUTH_TOKEN"
fi

if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "Configuring AWS credentials for CodeArtifact..."
  aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
  aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
  aws configure set region "$AWS_REGION"
  echo "registry=https://${AWS_CODEARTIFACT_DOMAIN}-${AWS_CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${AWS_CODEARTIFACT_REPOSITORY}/" > .npmrc
  echo "//${AWS_CODEARTIFACT_DOMAIN}-${AWS_CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${AWS_CODEARTIFACT_REPOSITORY}/:always-auth=true" >> .npmrc
  echo "//${AWS_CODEARTIFACT_DOMAIN}-${AWS_CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${AWS_CODEARTIFACT_REPOSITORY}/:_authToken=${CODEARTIFACT_AUTH_TOKEN}" >> .npmrc
else
  echo "AWS credentials not provided. Skipping CodeArtifact configuration."
fi

echo "📦 Installing NPM dependencies…"
npm install --force

# Run the service in the foreground
npm run dev