# Get the token from AWS CodeArtifact
$token = aws codeartifact get-authorization-token --domain bighammer --domain-owner 058264070106 --query authorizationToken --output text

# Set it as an environment variable for the current session
$env:CODEARTIFACT_AUTH_TOKEN = $token

# Output confirmation
Write-Host "CodeArtifact token set successfully for this PowerShell session."
Write-Host "You can now run npm commands."

# Optional: Run your npm command directly
# npm install