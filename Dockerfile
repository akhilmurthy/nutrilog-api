FROM node:22-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy built files
COPY dist/ ./dist/

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Cloud Run uses port 8080
EXPOSE 8080

CMD ["node", "dist/app.js"]
