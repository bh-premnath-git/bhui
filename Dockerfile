# Switch to a newer Node.js version for better compatibility
FROM node:current-bullseye

# Ensure curl is installed and available
RUN apt-get update && apt-get install -y curl unzip && curl --version && echo "curl installed successfully."

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws \
    && echo "AWS CLI installation completed."

# Verify AWS CLI installation
RUN aws --version && echo "AWS CLI verified."

# Set the working directory
WORKDIR /app

# Copy package config and .npmrc
COPY package.json package-lock.json .npmrc ./

# Copy entrypoint
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

# Ensure entrypoint.sh is executable and verify its presence
RUN chmod +x /usr/local/bin/entrypoint.sh && ls -l /usr/local/bin/entrypoint.sh && echo "entrypoint.sh is ready."

# Set ARGs for build-time AWS credentials (do not persist in the image)
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION=us-east-1

# Install dependencies (can use CodeArtifact authentication if credentials provided)
RUN if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then \
        aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID && \
        aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY && \
        aws configure set region $AWS_REGION && \
        TOKEN=$(aws codeartifact get-authorization-token --domain bighammer --domain-owner 058264070106 --query authorizationToken --output text) && \
        echo "registry=https://bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/" > .npmrc && \
        echo "//bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/:always-auth=true" >> .npmrc && \
        echo "//bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/:_authToken=$TOKEN" >> .npmrc && \
        echo "Contents of .npmrc after manual token injection:" && cat .npmrc && \
        npm install --force; \
    else \
        echo "AWS credentials not provided, using existing .npmrc token" && \
        npm install --force; \
    fi

# Copy the rest of the application
COPY . .

EXPOSE 5000

# Ensure entrypoint runs first
ENTRYPOINT ["sh", "-x", "entrypoint.sh"]


