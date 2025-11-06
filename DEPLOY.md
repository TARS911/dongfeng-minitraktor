# 🚀 Деплой БелТехФермЪ на Netlify

## Быстрый старт

### 1️⃣ Создайте аккаунт на Netlify
1. Зайдите на https://netlify.com
2. Нажмите **Sign up** (можно через GitHub)

### 2️⃣ Подключите GitHub репозиторий
1. В Netlify нажмите **Add new site** → **Import an existing project**
2. Выберите **GitHub**
3. Найдите репозиторий `dongfeng-minitraktor`
4. Настройки:
   - **Build command:** `echo "Static site"`
   - **Publish directory:** `frontend/public`
5. Нажмите **Deploy site**

### 3️⃣ Получите токены для GitHub Actions

**Netlify Auth Token:**
1. В Netlify → User settings → Applications
2. Создайте новый **Personal access token**
3. Скопируйте токен

**Netlify Site ID:**
1. Откройте ваш сайт в Netlify
2. Site settings → General → Site information
3. Скопируйте **API ID**

### 4️⃣ Добавьте секреты в GitHub

1. Откройте репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Добавьте:
   - `NETLIFY_AUTH_TOKEN` - ваш Personal access token
   - `NETLIFY_SITE_ID` - ваш API ID

### 5️⃣ Готово! 🎉

Теперь при каждом `git push` в ветку `main`:
- GitHub Actions автоматически запустится
- Сайт задеплоится на Netlify
- Получите ссылку типа `https://beltehferm.netlify.app`

---

## 🌐 Настройка своего домена

1. В Netlify → Domain management
2. Add custom domain → `beltehferm.ru`
3. Следуйте инструкциям для настройки DNS

---

## 📊 Что дальше?

### ✅ Уже готово:
- HTML сайт с дизайном БелТехФермь
- Supabase подключение
- Автоматический деплой

### 🔜 Добавить товары:
Запустите SQL в Supabase:
\`\`\`sql
INSERT INTO products (name, slug, price, category_id, is_featured, in_stock) VALUES
('Мини-трактор Т-244', 't-244', 580000, 7, true, true);
\`\`\`

---

## 🛠️ Локальная разработка

\`\`\`bash
cd frontend/public
python3 -m http.server 9000
# Откройте http://localhost:9000
\`\`\`

---

## 📞 Поддержка

- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- GitHub Actions: https://docs.github.com/actions
