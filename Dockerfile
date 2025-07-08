# ---- Build Stage ----
FROM node:current-bullseye AS build-stage

# Install dependencies and AWS CLI v2
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl unzip && \
    curl --version && \
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws && \
    aws --version

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_REGION=us-east-1

COPY . .

# ---- Runtime Stage ----
FROM node:current-bullseye-slim AS runtime-stage

# Set build args for user/group
ARG UID=10001
ARG GID=10001

# Create non-root user and group, and set up home directory
RUN groupadd --system --gid "${GID}" ghrobo \
    && useradd --system --uid "${UID}" --gid "${GID}" \
       --home-dir "/home/ghrobo" --shell "/usr/sbin/nologin" --no-create-home ghrobo \
    && mkdir -p /home/ghrobo \
    && chown ghrobo:ghrobo /home/ghrobo

WORKDIR /app

# Copy app and entrypoint from build-stage
COPY --from=build-stage /app /app
COPY --from=build-stage /usr/local/bin/entrypoint.sh /usr/local/bin/entrypoint.sh

# Set permissions for ghrobo user
RUN chown -R ghrobo:ghrobo /app /usr/local/bin/entrypoint.sh

USER ghrobo

EXPOSE 5000

ENTRYPOINT ["sh", "-x", "/usr/local/bin/entrypoint.sh"]
