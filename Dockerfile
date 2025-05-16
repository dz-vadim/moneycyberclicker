# ─────────────── STAGE 1: BUILD ───────────────
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Копіюємо лише package*.json для швидкого npm ci
COPY package.json package-lock.json ./

# 2) Встановлюємо залежності (включно з dev)
RUN npm ci

# 3) Копіюємо весь код і будуємо Next.js
COPY . .
RUN npm run build

# ─────────────── STAGE 2: RUNTIME ────────────
FROM node:18-alpine AS runner
WORKDIR /app

# 1) Копіюємо лише production-залежності
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2) Копіюємо результат збірки та статичні файли
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 3) Експортуємо порт
EXPOSE 3000

# 4) Стартуємо сервер
CMD ["npm", "run", "start"] 