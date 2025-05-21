# syntax=docker/dockerfile:1.4
FROM node:current-bullseye

RUN apt-get update && apt-get install -y curl unzip && curl --version && echo "curl installed successfully."

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf awscliv2.zip aws \
    && echo "AWS CLI installation completed."

RUN aws --version && echo "AWS CLI verified."

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh && ls -l /usr/local/bin/entrypoint.sh && echo "entrypoint.sh is ready."

# Install dependencies using BuildKit secrets for AWS credentials
RUN --mount=type=secret,id=aws_access_key_id \
    --mount=type=secret,id=aws_secret_access_key \
    --mount=type=secret,id=aws_region \
    export AWS_ACCESS_KEY_ID=$(cat /run/secrets/aws_access_key_id) && \
    export AWS_SECRET_ACCESS_KEY=$(cat /run/secrets/aws_secret_access_key) && \
    export AWS_REGION=$(cat /run/secrets/aws_region) && \
    aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID && \
    aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY && \
    aws configure set region $AWS_REGION && \
    TOKEN=$(aws codeartifact get-authorization-token --domain bighammer --domain-owner 058264070106 --query authorizationToken --output text) && \
    echo "registry=https://bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/" > .npmrc && \
    echo "//bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/:always-auth=true" >> .npmrc && \
    echo "//bighammer-058264070106.d.codeartifact.us-east-1.amazonaws.com/npm/bh-npm-repo/:_authToken=$TOKEN" >> .npmrc && \
    echo "Contents of .npmrc after manual token injection:" && cat .npmrc && \
    npm install --force

COPY .npmrc ./
COPY node_modules/ ./node_modules/
COPY . .

EXPOSE 5000

ENTRYPOINT ["sh", "-x", "entrypoint.sh"]


