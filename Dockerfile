FROM node:lts-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package.json .

RUN npm install 

COPY . .

# Build the application
RUN npm run build

# Install serve to serve the static files
RUN npm install -g serve

EXPOSE 5000

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "5000"]