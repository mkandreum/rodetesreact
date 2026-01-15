FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies including dev dependencies (needed for tsc)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript code
RUN npm run build

# ============================================
# Production Stage
# ============================================
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install ONLY production dependencies
RUN npm ci --only=production

# Copy built code from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start the server (compiled JS)
CMD ["node", "dist/server.js"]
