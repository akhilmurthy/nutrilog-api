# Build stage
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript)
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Debug: verify dist folder contents
RUN echo "=== Contents of /app/dist ===" && ls -la /app/dist && echo "=== Contents of /app/dist/app.js ===" && head -5 /app/dist/app.js

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Debug: verify dist folder in production stage
RUN echo "=== Production stage: Contents of /app ===" && ls -la /app && echo "=== Contents of /app/dist ===" && ls -la /app/dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run uses port 8080
EXPOSE 8080

CMD ["node", "dist/app.js"]
