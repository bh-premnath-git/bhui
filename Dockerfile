# Base image
FROM node:alpine3.21

# Install AWS CLI v2 (required for CodeArtifact authentication)
RUN apk add --no-cache \
    python3 \
    py3-pip \
    groff \
    less \
    curl \
    unzip \
    && pip3 install --upgrade pip \
    && pip3 install awscli \
    && rm -rf /var/cache/apk/*

# Set the working directory
WORKDIR /app


# Copy package config and .npmrc
COPY package.json package-lock.json .npmrc ./

# Copy entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Copy the @bh-ai directory if it exists locally
COPY ../@bh-ai ./@bh-ai

# Set ARGs for build-time AWS credentials (do not persist in the image)
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION=us-east-1

# Install dependencies (can use CodeArtifact authentication if credentials provided)
RUN if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then \
        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID && \
        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY && \
        aws configure set region $AWS_REGION && \
        aws codeartifact login --tool npm --domain bighammer --domain-owner 058264070106 --repository bh-npm-repo && \
        npm install --force; \
    else \
        echo "AWS credentials not provided, using existing .npmrc token" && \
        npm install --force; \
    fi

# Copy the rest of the application
COPY . .

EXPOSE 5000

# Ensure entrypoint runs first
ENTRYPOINT ["entrypoint.sh"]


