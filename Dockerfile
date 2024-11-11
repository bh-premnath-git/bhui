# Build stage
FROM node:lts-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:lts-alpine

WORKDIR /usr/src/app

RUN npm install -g serve

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]