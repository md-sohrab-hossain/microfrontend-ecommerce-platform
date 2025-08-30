# Auth App Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy shared dependency
COPY --from=shared /app/dist /app/node_modules/@microfrontend-ecommerce/shared/dist

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3003

# Start the application
CMD ["npm", "run", "dev"]
