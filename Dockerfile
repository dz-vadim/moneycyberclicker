# ─────────────── BUILD STAGE ───────────────
FROM node:18-alpine AS builder

# щоб Next.js міг знайти pnpm
RUN npm install -g pnpm

WORKDIR /app

# встановлюємо всі залежності (ігноруємо peer-deps конфлікти)
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# копіюємо код і збираємо
COPY . .
RUN npm run build

# ─────────────── RUNTIME STAGE ───────────────
FROM node:18-alpine AS runner

WORKDIR /app

# ставимо тільки production-залежності
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

# копіюємо зібраний код
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "run", "start"]
