# Build stage
FROM node:lts-alpine as builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies cleanly using npm ci
# (Requires package-lock.json)
RUN npm ci

# TEMPORARY WORKAROUND: Ensure the missing dependency is installed
# Remove this if it's not needed or once the issue is resolved.
RUN npm install @jridgewell/gen-mapping --save-dev

# Copy the rest of the source code
COPY . .

# Add environment variables as needed
ENV TSC_COMPILE_ON_ERROR=true
ENV DISABLE_ESLINT_PLUGIN=true

# Build the project
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build artifacts to nginx html directory
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 5000
EXPOSE 5000

# By default, nginx's entrypoint is set, so no need to specify CMD.
