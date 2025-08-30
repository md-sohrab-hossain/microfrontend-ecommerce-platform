# Shared Package Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the package
RUN npm run build

# The built files will be in /app/dist
