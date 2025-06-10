#!/usr/bin/env sh
set -e # Exit immediately if a command exits with a non-zero status.
set -x # Print commands and their arguments as they are executed.

echo "🎬 Entrypoint script started."

# --- Configuration ---
: "${AWS_CODEARTIFACT_DOMAIN:=bighammer}"
# AWS_CODEARTIFACT_DOMAIN_OWNER must be set. If not, script will exit due to 'set -e' and unbound variable.
: "${AWS_CODEARTIFACT_DOMAIN_OWNER:?Error: AWS_CODEARTIFACT_DOMAIN_OWNER is not set. Please provide this environment variable.}"
: "${AWS_CODEARTIFACT_REPOSITORY:=bh-npm-repo}"
: "${AWS_REGION:=us-east-1}"

echo "🔧 Configuration:"
echo "   AWS_CODEARTIFACT_DOMAIN: ${AWS_CODEARTIFACT_DOMAIN}"
echo "   AWS_CODEARTIFACT_DOMAIN_OWNER: ${AWS_CODEARTIFACT_DOMAIN_OWNER}"
echo "   AWS_CODEARTIFACT_REPOSITORY: ${AWS_CODEARTIFACT_REPOSITORY}"
echo "   AWS_REGION: ${AWS_REGION}"

# --- AWS Credentials & CodeArtifact Token ---
# Check if static AWS credentials are provided as environment variables
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
  echo "🔑 Static AWS credentials detected. Configuring AWS CLI..."
  aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
  aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
  aws configure set region "$AWS_REGION"
  echo "AWS CLI configured with provided static credentials."
elif [ -n "$AWS_WEB_IDENTITY_TOKEN_FILE" ]; then
  echo "🔑 AWS Web Identity Token File detected (likely IRSA). AWS CLI will use this for credentials."
  # No explicit 'aws configure' needed here if role and token file are correctly set up.
else
  echo "⚠️ No static AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY) or AWS_WEB_IDENTITY_TOKEN_FILE found."
  echo "   The script will rely on the environment's default AWS credential chain (e.g., EC2 instance profile, ECS task role)."
fi

echo "🔐 Fetching AWS CodeArtifact token..."
# Attempt to fetch the CodeArtifact token
# We capture stderr to check for specific errors
CODEARTIFACT_AUTH_TOKEN_OUTPUT=$(aws codeartifact get-authorization-token \
  --domain "$AWS_CODEARTIFACT_DOMAIN" \
  --domain-owner "$AWS_CODEARTIFACT_DOMAIN_OWNER" \
  --query authorizationToken \
  --output text 2>&1)

# Check the exit status of the aws command
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Failed to fetch CodeArtifact token."
  echo "   AWS CLI Error Output: ${CODEARTIFACT_AUTH_TOKEN_OUTPUT}"
  if echo "${CODEARTIFACT_AUTH_TOKEN_OUTPUT}" | grep -q "AssumeRoleWithWebIdentity"; then
    echo "   HINT: The error 'AssumeRoleWithWebIdentity' suggests an IAM permission issue."
    echo "         Ensure the IAM role has 'sts:AssumeRoleWithWebIdentity' permission and a correct trust policy."
  elif echo "${CODEARTIFACT_AUTH_TOKEN_OUTPUT}" | grep -q "AccessDenied"; then
    echo "   HINT: An 'AccessDenied' error occurred. Ensure the IAM principal has:"
    echo "         1. 'codeartifact:GetAuthorizationToken' permission for the domain."
    echo "         2. 'sts:GetServiceBearerToken' permission for resource '*'."
  fi
  exit 1
fi

export CODEARTIFACT_AUTH_TOKEN="$CODEARTIFACT_AUTH_TOKEN_OUTPUT"

if [ -z "$CODEARTIFACT_AUTH_TOKEN" ]; then
  echo "❌ ERROR: Fetched CODEARTIFACT_AUTH_TOKEN is empty. This should not happen if the AWS CLI command succeeded."
  echo "   Please check AWS CLI logs and permissions."
  exit 1
else
  echo "✅ Successfully fetched CODEARTIFACT_AUTH_TOKEN."
fi

# --- .npmrc Configuration ---
echo "📝 Configuring .npmrc for CodeArtifact..."
NPM_REGISTRY_URL="https://${AWS_CODEARTIFACT_DOMAIN}-${AWS_CODEARTIFACT_DOMAIN_OWNER}.d.codeartifact.${AWS_REGION}.amazonaws.com/npm/${AWS_CODEARTIFACT_REPOSITORY}/"

# Create or overwrite .npmrc with the registry and auth token
{
  echo "registry=${NPM_REGISTRY_URL}"
  echo "${NPM_REGISTRY_URL}:always-auth=true"
  echo "${NPM_REGISTRY_URL}:_authToken=\${CODEARTIFACT_AUTH_TOKEN}"
  # Add a newline at the end of the file for robustness
  echo ""
} > .npmrc

echo ".npmrc configured:"
cat .npmrc # Print .npmrc content for verification, token will be visible here.

# --- NPM Install ---
echo "📦 Installing NPM dependencies..."
# Using --verbose for more detailed output if issues persist
if npm install --force --verbose; then
  echo "✅ NPM dependencies installed successfully."
else
  echo "❌ ERROR: npm install failed."
  echo "   Please check the npm logs above for details."
  # Consider printing the npm debug log path if available
  NPM_DEBUG_LOG=$(find /root/.npm/_logs/ -name "*-debug-0.log" -print -quit 2>/dev/null || find $HOME/.npm/_logs/ -name "*-debug-0.log" -print -quit 2>/dev/null)
  if [ -n "$NPM_DEBUG_LOG" ]; then
    echo "   Detailed npm debug log can be found at: ${NPM_DEBUG_LOG}"
  fi
  exit 1
fi

# --- Run Application ---
echo "🚀 Starting the application..."
npm run dev