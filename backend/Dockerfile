# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src ./src
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --omit=dev

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY package.json                     ./

# SQLite data directory (mount a volume here in production)
RUN mkdir -p /data
VOLUME /data
ENV DB_DIR=/data

EXPOSE 3001

# Use non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app /data
USER appuser

CMD ["node", "dist/server.js"]
