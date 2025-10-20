# Установка и настройка Telegram MCP

Telegram MCP (Model Context Protocol) позволяет Claude интегрироваться с Telegram для отправки уведомлений, сообщений и получения данных.

---

## Установка Telegram MCP

### Способ 1: Через Homebrew (macOS/Linux)

```bash
# Установить Telegram MCP
brew install chaindead/tap/telegram-mcp

# Проверить установку
telegram-mcp --version
```

### Способ 2: Через npm (все платформы)

```bash
# Установить глобально
npm install -g @chaindead/telegram-mcp

# Или локально в проект
npm install @chaindead/telegram-mcp
```

### Способ 3: Через Docker

```bash
# Скачать образ
docker pull chaindead/telegram-mcp:latest

# Запустить контейнер
docker run -d --name telegram-mcp \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e TELEGRAM_CHAT_ID=your_chat_id \
  chaindead/telegram-mcp
```

---

## Создание Telegram бота

Telegram MCP требует бота для работы.

### Шаг 1: Создать бота через @BotFather

1. Откройте Telegram
2. Найдите **@BotFather** (официальный бот Telegram)
3. Отправьте команду `/newbot`
4. Введите имя бота (например: **DONGFENG Notifications**)
5. Введите username бота (например: **dongfeng_notify_bot**)
6. BotFather отправит вам **TOKEN** (сохраните его!)

Пример токена: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### Шаг 2: Получить Chat ID

**Вариант A: Через @userinfobot**
1. Найдите **@userinfobot** в Telegram
2. Отправьте ему `/start`
3. Бот отправит ваш Chat ID (например: `123456789`)

**Вариант B: Через API**
1. Отправьте любое сообщение вашему боту
2. Откройте в браузере:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
3. Найдите `"chat":{"id":123456789}` в JSON ответе

---

## Настройка Telegram MCP

### Способ 1: Через конфигурационный файл

Создайте файл `~/.telegram-mcp/config.json`:

```json
{
  "token": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
  "chatId": "123456789",
  "notifications": {
    "deploySuccess": true,
    "deployFailed": true,
    "orderReceived": true
  },
  "commands": {
    "/status": "Check site status",
    "/orders": "Get recent orders",
    "/stats": "Get statistics"
  }
}
```

### Способ 2: Через переменные окружения

Создайте файл `.env` в корне проекта:

```bash
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
TELEGRAM_ENABLED=true
```

Добавьте в `.gitignore`:
```
.env
```

---

## Интеграция с проектом DONGFENG

### Шаг 1: Установить пакет в проект

```bash
cd /home/ibm/dongfeng-minitraktor/backend
npm install @chaindead/telegram-mcp --save
```

### Шаг 2: Создать Telegram сервис

Создайте `backend/services/telegram.js`:

```javascript
import TelegramBot from '@chaindead/telegram-mcp';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
  polling: false // Webhook лучше для production
});

export const sendNotification = async (message) => {
  try {
    await bot.sendMessage(process.env.TELEGRAM_CHAT_ID, message, {
      parse_mode: 'Markdown'
    });
    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Telegram error:', error.message);
  }
};

export const sendOrder = async (orderData) => {
  const message = `
🛒 *Новый заказ!*

📦 Товары: ${orderData.items.map(i => i.name).join(', ')}
💰 Сумма: ${orderData.total} ₽
👤 Клиент: ${orderData.customer.name}
📞 Телефон: ${orderData.customer.phone}
  `;

  await sendNotification(message);
};

export const sendDeploy = async (status, commit) => {
  const emoji = status === 'success' ? '✅' : '❌';
  const message = `
${emoji} *Деплой ${status === 'success' ? 'успешен' : 'провален'}*

📝 Commit: \`${commit}\`
🔗 Site: https://dongfeng-minitraktor.onrender.com
  `;

  await sendNotification(message);
};

export default bot;
```

### Шаг 3: Использовать в routes

Обновите `backend/routes/orders.js`:

```javascript
import { sendOrder } from '../services/telegram.js';

// В обработчике создания заказа
fastify.post('/orders', async (request, reply) => {
  // ... существующий код создания заказа ...

  // Отправить уведомление в Telegram
  if (process.env.TELEGRAM_ENABLED === 'true') {
    await sendOrder(orderData);
  }

  return { success: true, order };
});
```

### Шаг 4: Интеграция с GitHub Actions

Обновите `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Trigger Render Deploy
      id: deploy
      run: |
        curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
        echo "status=success" >> $GITHUB_OUTPUT
      continue-on-error: true

    - name: Notify Telegram
      if: always()
      run: |
        STATUS="${{ steps.deploy.outcome }}"
        COMMIT="${{ github.sha }}"

        if [ "$STATUS" == "success" ]; then
          MESSAGE="✅ Деплой успешен%0ACommit: $COMMIT"
        else
          MESSAGE="❌ Деплой провален%0ACommit: $COMMIT"
        fi

        curl -X POST "https://api.telegram.org/bot${{ secrets.TELEGRAM_BOT_TOKEN }}/sendMessage" \
          -d "chat_id=${{ secrets.TELEGRAM_CHAT_ID }}" \
          -d "text=$MESSAGE" \
          -d "parse_mode=Markdown"
```

Добавьте секреты в GitHub:
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

---

## Использование Telegram MCP в Claude Code

После установки Telegram MCP, Claude Code может использовать его через MCP серверы.

### Настройка в Claude Code:

1. Откройте настройки Claude Code
2. Перейдите в раздел **MCP Servers**
3. Добавьте Telegram MCP:

```json
{
  "mcpServers": {
    "telegram": {
      "command": "telegram-mcp",
      "args": [],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_token",
        "TELEGRAM_CHAT_ID": "your_chat_id"
      }
    }
  }
}
```

4. Перезапустите Claude Code
5. Теперь Claude может отправлять уведомления в Telegram!

---

## Примеры использования

### 1. Уведомление о заказе

```javascript
// При создании заказа
await sendOrder({
  items: [{ name: 'DF-244', price: 285000 }],
  total: 285000,
  customer: { name: 'Иван', phone: '+79991234567' }
});
```

### 2. Уведомление о форме обратной связи

```javascript
// В routes/forms.js
await sendNotification(`
📞 *Новая заявка*

Имя: ${formData.name}
Телефон: ${formData.phone}
Сообщение: ${formData.message}
`);
```

### 3. Мониторинг сайта

Создайте скрипт для мониторинга:

```javascript
// backend/monitoring/check-health.js
import { sendNotification } from '../services/telegram.js';

async function checkSiteHealth() {
  try {
    const response = await fetch('https://dongfeng-minitraktor.onrender.com/api/health');

    if (!response.ok) {
      await sendNotification(`⚠️ Сайт не отвечает! Status: ${response.status}`);
    }
  } catch (error) {
    await sendNotification(`🔴 Сайт недоступен! Error: ${error.message}`);
  }
}

// Проверять каждые 5 минут
setInterval(checkSiteHealth, 5 * 60 * 1000);
```

### 4. Статистика заказов

```javascript
// Отправлять ежедневный отчет
async function sendDailyStats() {
  const stats = await getOrderStats();

  await sendNotification(`
📊 *Статистика за сегодня*

🛒 Заказов: ${stats.orders}
💰 Выручка: ${stats.revenue} ₽
👥 Новых клиентов: ${stats.newCustomers}
📈 Конверсия: ${stats.conversion}%
  `);
}

// Отправлять каждый день в 18:00
cron.schedule('0 18 * * *', sendDailyStats);
```

---

## Команды бота

Настройте команды для вашего бота через @BotFather:

```
/start - Начать работу сботом
/status - Статус сайта
/orders - Последние заказы
/stats - Статистика за день
/help - Помощь
```

---

## Безопасность

⚠️ **ВАЖНО:**

1. **Никогда не коммитьте токены в Git!**
   ```bash
   # Добавьте в .gitignore
   .env
   config.json
   ```

2. **Используйте переменные окружения:**
   - Локально: `.env` файл
   - На Render: Dashboard → Environment Variables

3. **Ограничьте доступ к боту:**
   - Проверяйте `chat_id` перед выполнением команд
   - Используйте whitelist разрешенных пользователей

4. **Используйте HTTPS для webhooks**

---

## Troubleshooting

### Проблема: Bot token is invalid
**Решение:** Проверьте что токен скопирован полностью от BotFather

### Проблема: Chat not found
**Решение:** Отправьте `/start` боту перед использованием

### Проблема: Telegram MCP не найден
**Решение:**
```bash
# Переустановить
npm uninstall -g @chaindead/telegram-mcp
npm install -g @chaindead/telegram-mcp

# Или через brew
brew uninstall telegram-mcp
brew install chaindead/tap/telegram-mcp
```

---

## Дополнительные возможности

- **Webhooks** - для получения сообщений от пользователей
- **Inline кнопки** - интерактивные меню в сообщениях
- **Медиа** - отправка фото, видео, документов
- **Группы** - уведомления в группу вместо личных сообщений
- **Боты-ассистенты** - автоответы на частые вопросы

---

## Полезные ссылки

- **Telegram Bot API:** https://core.telegram.org/bots/api
- **BotFather:** https://t.me/BotFather
- **Telegram MCP GitHub:** https://github.com/chaindead/telegram-mcp
- **MCP Documentation:** https://modelcontextprotocol.io
