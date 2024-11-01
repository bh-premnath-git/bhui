# FROM node:18-alpine

# RUN mkdir -p /usr/src/app

# WORKDIR /usr/src/app

# COPY package.json .

# RUN npm install -f

# COPY . .

# EXPOSE 5000

# CMD ["npm", "run", "start"]

# Dockerfile
# FROM node:18-alpine as builder

# WORKDIR /app

# # Copy package files
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy project files
# COPY . .

# # Build the app
# RUN npm run build

# # Production stage
# FROM nginx:alpine

# # Copy built assets from builder stage
# COPY --from=builder /app/dist /usr/share/nginx/html

# # Copy nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# # Expose port
# EXPOSE 80

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]
