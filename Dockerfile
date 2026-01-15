# ============================================
# STAGE 1: Build React Application with Vite
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files for dependency installation
# Copy package files for dependency installation
COPY package.json ./

# Install dependencies (use install since lockfile might be missing)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# ============================================
# STAGE 2: Production - Serve with Nginx
# ============================================
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (Coolify will auto-detect this)
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
