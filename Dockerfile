# Этап 1: Установка зависимостей
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Копируем только файлы зависимостей
COPY frontend/package.json frontend/package-lock.json* ./

# Пропускаем постинсталл скрипты для избежания проблем с правами
ENV SKIP_SENTRY_DOWNLOAD=1
ENV SKIP_INSTALL_SIMPLE_GIT_HOOKS=1

# Устанавливаем зависимости от имени root с allow-root
RUN npm ci --ignore-scripts --allow-root

# Этап 2: Сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Создаем /tmp с правильными правами для Unix сокетов
RUN mkdir -p /tmp && chmod 1777 /tmp

COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ ./

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Собираем приложение от root с allow-root
RUN npm run build --allow-root

# Этап 3: Финальный образ для запуска
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем собранное приложение с правильным владельцем
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
