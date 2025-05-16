#!/usr/bin/env bash
set -euo pipefail

# ─── Параметри ───
REPO_URL="https://github.com/dz-vadim/moneycyberclicker.git"
REPO_DIR="$HOME/moneycyberclicker"
IMAGE_NAME="moneycyberclicker:latest"
CONTAINER_NAME="moneycyberclicker"
HOST_PORT=3000
CONTAINER_PORT=3000

# ─── Зупинка та видалення існуючого контейнера ───
echo "🛑 Зупиняємо та видаляємо існуючий контейнер (якщо є)..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# ─── Очищення Docker, але не видаляємо всі образи ───
echo "🧹 Очищення невикористаних Docker ресурсів..."
docker system prune -f

# ─── Звільнення пам'яті ───
echo "🧠 Звільнення пам'яті перед збіркою..."
sync && echo 3 > /proc/sys/vm/drop_caches

# ─── Репозиторій ───
echo "📁 Видаляємо стару копію..."
rm -rf "$REPO_DIR"

echo "📥 Клонуємо репозиторій..."
git clone --branch master "$REPO_URL" "$REPO_DIR"
cd "$REPO_DIR"

# ─── Спрощення Dockerfile для економії пам'яті ───
echo "✍️ Створюємо спрощений Dockerfile..."
cat > Dockerfile << 'DOCKERFILE'
FROM node:16-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install --only=prod

COPY . .
RUN npm run build

FROM node:16-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
DOCKERFILE

# ─── Build & Run з обмеженням пам'яті ───
echo "🔨 Будуємо образ з обмеженням пам'яті..."
# Використовуємо --memory для обмеження пам'яті
docker build --memory=512m --memory-swap=1g -t "$IMAGE_NAME" .

echo "▶️ Запускаємо контейнер..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart=always \
  -p "$HOST_PORT:$CONTAINER_PORT" \
  "$IMAGE_NAME"

IP=$(hostname -I | awk '{print $1}')
echo "✅ Додаток доступний за адресою http://$IP:$HOST_PORT" 