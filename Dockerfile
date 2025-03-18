# docker pull node:alpine3.21
FROM node:alpine3.21

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire project
COPY . .

# Expose port 5000 for both HTTP & HTTPS
EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]
