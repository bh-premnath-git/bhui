# Use latest stable Node.js on Debian
FROM node:current-bullseye  AS build-stage

# Install curl, unzip, and AWS CLI v2
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl unzip && \
    curl --version && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws && \
    aws --version

# Set working directory
WORKDIR /app

# Copy package files and .npmrc
COPY package.json package-lock.json .npmrc ./

# Copy entrypoint script
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh && ls -l /usr/local/bin/entrypoint.sh

# Optional AWS Credentials at build time (not persisted)
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION=us-east-1

# Copy the entire application
COPY . .

EXPOSE 5000

ENTRYPOINT ["sh", "-x", "/usr/local/bin/entrypoint.sh"]