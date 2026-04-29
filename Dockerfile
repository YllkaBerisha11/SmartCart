# ── Stage 1: Builder ─────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Kopjo package files
COPY package*.json ./

# Instalo dependencies
RUN npm ci --only=production

# ── Stage 2: Production ───────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Shto user jo-root për siguri
RUN addgroup -g 1001 -S nodejs && \
    adduser -S smartcart -u 1001

# Kopjo node_modules nga builder
COPY --from=builder /app/node_modules ./node_modules

# Kopjo kodin
COPY . .

# Krijo folder për logs
RUN mkdir -p logs && chown -R smartcart:nodejs logs

# Përdor user jo-root
USER smartcart

# Expose porta
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Starto aplikacionin
CMD ["node", "app.js"]