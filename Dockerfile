# ==========================================
# Stage 1: Build Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
# Set API URL to empty string so it uses relative path (/api)
# Set API URL to empty string so it uses relative path (/api)
ENV VITE_API_URL=""
ARG VITE_ADMIN_USER
ARG VITE_ADMIN_PASS
ENV VITE_ADMIN_USER=$VITE_ADMIN_USER
ENV VITE_ADMIN_PASS=$VITE_ADMIN_PASS
RUN npm run build

# ==========================================
# Stage 2: Build Backend
# ==========================================
FROM node:18-alpine AS backend-builder
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build

# ==========================================
# Stage 3: Production Runner
# ==========================================
FROM node:18-alpine
WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm install --only=production

# Copy built backend
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend to 'public' folder inside dist (so server.js can find it at ./public)
COPY --from=frontend-builder /app/dist ./dist/public

# Create uploads directory
RUN mkdir -p uploads

# Expose port 3000 (Standard Node Port)
EXPOSE 3000

# Start server
CMD ["node", "dist/server.js"]
