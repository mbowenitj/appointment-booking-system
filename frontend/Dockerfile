# Build stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json tsconfig*.json ./
RUN npm ci

COPY index.html postcss.config.js tailwind.config.js ./
COPY src ./src
RUN npm run build

# Production stage
FROM nginx:1.25-alpine AS runner

COPY --from=builder /app/dist           /usr/share/nginx/html
COPY               nginx.conf           /etc/nginx/conf.d/default.conf

# Remove the default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
