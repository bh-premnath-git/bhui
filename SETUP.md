# Project Setup Guide

## Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [Git](https://git-scm.com/)

## Setup Steps

### 1. Clone the Required Repositories

First, create a parent directory for both repositories:

```bash
mkdir bh-project
cd bh-project
```

Clone this repository:
```bash
git clone https://github.com/your-org/bh-ui.git
```

Clone the required schema repository as a sibling directory:
```bash
git clone https://github.com/bh-ai/-bh-ai-flow-schema.git
```

Your directory structure should look like:
```
bh-project/
├── bh-ui/
└── -bh-ai-flow-schema/
```

### 2. Environment Setup

Create a `.env` file in the root of the bh-ui project:

```bash
cd bh-ui
```

Create a `.env` file with the following content:
```
VITE_API_PREFIX_URL=/api/v1
VITE_DECRYPTION_KEY=passwordpasswordpasswordpassword
VITE_KEYCLOAK_REALM=master
VITE_KEYCLOAK_CLIENT_ID=bighammer-admin
VITE_AUTO_SAVE_TIME=10000
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_CATALOG_REMOTE_API_URL=http://localhost:8011
VITE_AGENT_REMOTE_URL=http://localhost:8090
VITE_AUDIT_REMOTE_URL=http://localhost:8003
VITE_MONITOR_REMOTE_URL=http://localhost:8004
VITE_KEYCLOAK_API_REMOTE_URL=http://localhost:8005
VITE_KEYCLOAK_REDIRECT_REMOTE_URI=http://localhost:5000
VITE_AUTO_SAVE_TIME=10000
AWS_ACCESS_KEY_ID=AKIAQ3EGPE7NNTR6FEGD
AWS_SECRET_ACCESS_KEY=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
AWS_REGION=us-east-1
AWS_CODEARTIFACT_DOMAIN=bighammer
AWS_CODEARTIFACT_DOMAIN_OWNER=058264070106
AWS_CODEARTIFACT_REPOSITORY=bh-npm-repo
VITE_KEYCLOAK_PORT=5000
VITE_ALLOWED_HOSTS=localhost
VITE_ENV=development
VITE_SPARK_PORT=15003
VITE_PANDAS_PORT=15004
VITE_FLINK_PORT=15005
# Add any other required environment variables
```

### 3. Install Dependencies

Install the dependencies for the UI project:
```bash
npm install
```

This will automatically resolve the local dependency for `@bh-ai/schemas` from the sibling directory.

### 4. Run the Project

Start the development server:
```bash
npm run dev
```

The application should now be running at http://localhost:5000 .

## Troubleshooting

If you encounter issues with the local dependency:
- Make sure both repositories are in the correct directory structure
- Try running `npm install` again with the `--force` flag
- Verify that the schema package directory name exactly matches `-bh-ai-flow-schema`

For other issues, please check the project's issue tracker or contact the development team.
