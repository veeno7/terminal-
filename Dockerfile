# ============================================================
# CortexForge — Backend + Core Engine Dockerfile
# Multi-stage build for smaller production images
# ============================================================

# ---- Build Stage ----
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code and build
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Production Stage ----
FROM node:20-slim AS production

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Create data directory for persistent storage
RUN mkdir -p /app/data/db /app/data/logs /app/data/vector

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/agent/state', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

CMD ["node", "dist/index.js"]