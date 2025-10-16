# 🚀 Инструкция по деплою

## Вариант 1: Render.com (РЕКОМЕНДУЕТСЯ) ⭐

### Автоматический деплой через Blueprint

1. **Зарегистрируйтесь:** https://render.com/
2. **New → Blueprint**
3. **Подключите GitHub репозиторий:** `TARS911/dongfeng-minitraktor`
4. **Render автоматически найдет** `render.yaml` и настроит всё сам!
5. **Нажмите:** Apply

**Готово!** Через 5-10 минут сайт будет доступен на:
```
https://dongfeng-minitraktor.onrender.com
```

### Ручной деплой (если Blueprint не сработал)

1. **New → Web Service**
2. **Connect Repository:** `TARS911/dongfeng-minitraktor`
3. **Настройки:**
   ```
   Name: dongfeng-minitraktor
   Region: Frankfurt (ближе к РФ)
   Branch: main
   Root Directory: (оставить пустым)
   Runtime: Node
   Build Command: cd backend && npm install && npm run init-db && npm run seed-db
   Start Command: cd backend && npm start
   Plan: Free
   ```
4. **Advanced → Add Disk:**
   ```
   Mount Path: /opt/render/project/src/backend/database
   Size: 1 GB
   ```
5. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   HOST=0.0.0.0
   DB_PATH=/opt/render/project/src/backend/database/dongfeng.db
   ```
6. **Create Web Service**

---

## Вариант 2: Railway.app

1. **Установите Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Логин:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   cd /home/ibm/dongfeng-minitraktor
   railway init
   railway up
   ```

4. **Добавьте переменные окружения:**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set DB_PATH=./backend/database/dongfeng.db
   ```

**URL:** Railway автоматически сгенерирует URL

---

## Вариант 3: Vercel (только Frontend)

⚠️ Vercel не поддерживает SQLite напрямую. Используйте для статического фронтенда.

1. **Установите Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

Для backend используйте отдельно Render/Railway.

---

## Вариант 4: VPS (Полный контроль)

### Для РФ рекомендуем:
- **Timeweb** (РФ хостинг)
- **Reg.ru VPS**
- **Beget VPS**

### Установка на Ubuntu:

```bash
# 1. Подключитесь к VPS
ssh user@your-vps-ip

# 2. Установите Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Установите PM2
sudo npm install -g pm2

# 4. Клонируйте репозиторий
git clone https://github.com/TARS911/dongfeng-minitraktor.git
cd dongfeng-minitraktor/backend

# 5. Установите зависимости
npm install

# 6. Инициализируйте БД
npm run init-db
npm run seed-db

# 7. Запустите с PM2
pm2 start server.js --name dongfeng-api
pm2 startup
pm2 save

# 8. Настройте Nginx (опционально)
sudo apt install nginx
sudo nano /etc/nginx/sites-available/dongfeng

# Добавьте конфигурацию:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Активируйте
sudo ln -s /etc/nginx/sites-available/dongfeng /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 9. SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Сравнение платформ

| Платформа | Цена | Сложность | Производительность | Для РФ |
|-----------|------|-----------|-------------------|---------|
| **Render** | Free/от $7 | ⭐ Легко | ⭐⭐⭐ | ✅ Работает |
| **Railway** | $5/мес | ⭐ Легко | ⭐⭐⭐⭐ | ✅ Работает |
| **Vercel** | Free | ⭐ Очень легко | ⭐⭐⭐⭐⭐ | ⚠️ Frontend only |
| **VPS** | от 200₽/мес | ⭐⭐⭐ Сложно | ⭐⭐⭐⭐⭐ | ✅ Лучший для РФ |

---

## ✅ После деплоя

### 1. Проверьте работоспособность:
```bash
curl https://your-url.com/api/health
curl https://your-url.com/api/products
```

### 2. Обновите Frontend URL:
В `backend/.env` измените:
```
FRONTEND_URL=https://your-url.com
```

### 3. Настройте домен (опционально)
- Купите домен на Reg.ru / Timeweb
- Добавьте CNAME запись на Render/Railway
- Настройте SSL

### 4. Мониторинг
- Render Dashboard: https://dashboard.render.com
- Railway Dashboard: https://railway.app/dashboard
- PM2 на VPS: `pm2 monit`

---

## 🐛 Troubleshooting

### База данных не инициализируется
```bash
# Вручную запустите на сервере:
npm run init-db
npm run seed-db
```

### Сервер падает после деплоя
Проверьте логи:
- Render: Dashboard → Logs
- Railway: `railway logs`
- VPS: `pm2 logs dongfeng-api`

### CORS ошибки
Убедитесь что `FRONTEND_URL` в `.env` указан правильно.

---

## 📝 Checklist перед деплоем

- [ ] Закоммичены все изменения в Git
- [ ] Залито на GitHub
- [ ] `.env` файл добавлен в `.gitignore` (✅ уже есть)
- [ ] Проверена работа локально
- [ ] Готов к production траффику

---

**🚀 Удачи с деплоем!**

Если возникнут проблемы - пишите в Issues:
https://github.com/TARS911/dongfeng-minitraktor/issues
