# ─────────────── STAGE 1: BUILD ───────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
# Примусово ігноруємо peer-deps конфлікти
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ─────────────── STAGE 2: RUNTIME ────────────
FROM node:18-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm","run","start"]
