# ============================================================
# CortexForge Frontend — Multi-stage Dockerfile
# Stage 1: Build the Vite + React app
# Stage 2: Serve with Nginx with API proxy
# ============================================================

# ---- Build Stage ----
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY index.html ./
COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# ---- Production Stage (Nginx) ----
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config with API proxy
RUN rm /etc/nginx/conf.d/default.conf
COPY <<'EOF' /etc/nginx/conf.d/cortexforge.conf
server {
    listen 5173;
    server_name localhost;

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    # API proxy to backend
    location /api/ {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy to backend
    location /ws {
        proxy_pass http://api:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK";
    }
}
EOF

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]