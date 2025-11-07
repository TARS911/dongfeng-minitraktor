# 🔧 ИСПРАВЛЕНИЕ ПРОБЛЕМ С ДЕПЛОЕМ

## 🚨 Текущие проблемы

1. ❌ **Netlify показывает старый сайт** - деплой не работает
2. ❌ **Supabase ошибка** - отсутствуют колонки в таблице products
3. ❌ **GitHub Actions конфликтует** - неправильная конфигурация

---

## ✅ РЕШЕНИЕ (по шагам)

### ШАГ 1: Исправить Supabase (5 минут)

#### 1.1 Открыть SQL Editor
1. Перейдите: https://supabase.com/dashboard/project/wbfhvcmvkyjsjvqkbxpz/sql
2. Нажмите **New query**

#### 1.2 Выполнить миграцию
Скопируйте **ВСЁ** содержимое файла `supabase-migration.sql` и вставьте в SQL Editor

Или скопируйте отсюда:
```sql
-- Добавление is_featured
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Добавление is_new
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'is_new'
  ) THEN
    ALTER TABLE products ADD COLUMN is_new BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Добавление power
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'power'
  ) THEN
    ALTER TABLE products ADD COLUMN power INTEGER;
  END IF;
END $$;

-- Добавление drive
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'drive'
  ) THEN
    ALTER TABLE products ADD COLUMN drive TEXT;
  END IF;
END $$;

-- Добавление transmission
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'transmission'
  ) THEN
    ALTER TABLE products ADD COLUMN transmission TEXT;
  END IF;
END $$;

-- Добавление updated_at
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;
  END IF;
END $$;

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_is_new ON products(is_new);

-- Функция и триггер для updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

3. Нажмите **Run** (или Ctrl+Enter)
4. Должны увидеть: ✅ Success

#### 1.3 Проверить результат
```bash
cd frontend
node test-supabase.js
```

Должны увидеть: `✅ Найдено товаров: X` (без ошибок)

---

### ШАГ 2: Настроить Netlify правильно (10 минут)

#### 2.1 Удалить старый сайт (если нужно)
1. Откройте https://app.netlify.com
2. Выберите ваш старый сайт
3. Site settings → General → Danger zone → **Delete this site**

#### 2.2 Создать новый сайт
1. На https://app.netlify.com нажмите **Add new site**
2. Выберите **Import an existing project**
3. Выберите **Deploy with GitHub**
4. Найдите репозиторий: **TARS911/dongfeng-minitraktor**
5. Кликните на него

#### 2.3 Настроить Build Settings
Netlify должен автоматически определить настройки из `netlify.toml`, но проверьте:

**Base directory:** (оставьте пустым)

**Build command:**
```
cd frontend && npm install && npm run build
```

**Publish directory:**
```
frontend/.next
```

**Node version:**
```
20
```

#### 2.4 Добавить Environment Variables
Нажмите **Add environment variables** и добавьте:

```
NEXT_PUBLIC_SUPABASE_URL
https://wbfhvcmvkyjsjvqkbxpz.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZmh2Y212a3lqc2p2cWtieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNzg1MzksImV4cCI6MjA3Njg1NDUzOX0.5yHwVSIkbhDnnUKrPSe6uTCW-ImZYrczI-8nRQB0fHY

NODE_VERSION
20
```

#### 2.5 Deploy!
1. Нажмите **Deploy site**
2. Дождитесь завершения (3-5 минут)
3. Скопируйте URL вашего сайта

---

### ШАГ 3: Закомитить изменения

Изменения уже сделаны в коде, нужно только закомитить:

```bash
git add .
git commit -m "🔧 FIX: Исправлена конфигурация для Netlify direct deploy

- Обновлен netlify.toml с правильными build settings
- Отключен GitHub Actions (используем прямую интеграцию)
- Добавлена документация по исправлению проблем
- Добавлен скрипт миграции Supabase"

git push origin main
```

После push Netlify **автоматически** начнет новый деплой!

---

### ШАГ 4: Проверить что все работает

#### 4.1 Проверить деплой в Netlify
1. Откройте https://app.netlify.com
2. Выберите ваш сайт
3. Перейдите в **Deploys**
4. Последний деплой должен быть 🟢 **Published**

#### 4.2 Открыть сайт
1. Скопируйте URL из Netlify (например: `https://ваш-сайт.netlify.app`)
2. Откройте в браузере (Ctrl+Shift+N для инкогнито)
3. Сайт должен загрузиться с новым Next.js кодом

#### 4.3 Проверить Supabase на сайте
1. Откройте DevTools (F12) → Console
2. Не должно быть ошибок
3. На главной странице должны отображаться данные

---

## 📊 Чеклист

Выполните все шаги по порядку:

- [ ] **Шаг 1.1** - Открыт Supabase SQL Editor
- [ ] **Шаг 1.2** - Выполнена миграция (✅ Success)
- [ ] **Шаг 1.3** - Проверка `node test-supabase.js` без ошибок
- [ ] **Шаг 2.1** - Старый сайт удален (если был)
- [ ] **Шаг 2.2** - Создан новый сайт через GitHub
- [ ] **Шаг 2.3** - Build settings настроены
- [ ] **Шаг 2.4** - Environment variables добавлены (3 штуки)
- [ ] **Шаг 2.5** - Первый деплой завершен успешно
- [ ] **Шаг 3** - Изменения закомичены и запушены
- [ ] **Шаг 4.1** - Автодеплой завершен (после git push)
- [ ] **Шаг 4.2** - Сайт открывается и работает
- [ ] **Шаг 4.3** - Нет ошибок в консоли, данные загружаются

---

## 🆘 Если что-то не работает

### Ошибка при миграции Supabase
**Симптом:** SQL Editor показывает ошибку

**Решение:**
1. Проверьте что выполняете в правильном проекте
2. Проверьте что таблица `products` существует
3. Попробуйте выполнять команды по одной

### Netlify build fails
**Симптом:** Deploy failed в Netlify

**Решение:**
1. Откройте Deploy logs
2. Найдите строку с ошибкой
3. Чаще всего: не добавлены Environment variables
4. Попробуйте: Site settings → Build & deploy → Clear cache and retry

### Сайт показывает старую версию
**Симптом:** После деплоя все еще старый сайт

**Решение:**
1. Очистите кэш браузера (Ctrl+Shift+Del)
2. Откройте в режиме инкогнито (Ctrl+Shift+N)
3. В Netlify: Clear cache and retry deploy
4. Проверьте что URL правильный (из нового сайта)

### Supabase connection failed на сайте
**Симптом:** В консоли ошибка "Missing Supabase"

**Решение:**
1. Проверьте Environment variables в Netlify
2. Должны быть `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. После добавления - Retry deploy

---

## 📞 Контакты

| Сервис | Ссылка |
|--------|--------|
| Supabase SQL Editor | https://supabase.com/dashboard/project/wbfhvcmvkyjsjvqkbxpz/sql |
| Supabase Table Editor | https://supabase.com/dashboard/project/wbfhvcmvkyjsjvqkbxpz/editor |
| Netlify Dashboard | https://app.netlify.com |
| GitHub Repo | https://github.com/TARS911/dongfeng-minitraktor |

---

## 💡 Что изменилось

### В коде:
1. ✅ `netlify.toml` - добавлены build settings
2. ✅ `deploy.yml` - отключен автозапуск (только вручную)
3. ✅ `FIX_DEPLOYMENT.md` - эта инструкция
4. ✅ `NETLIFY_DIRECT_DEPLOY.md` - подробная документация
5. ✅ `migrate-supabase.js` - скрипт для проверки миграции

### Больше НЕ используется:
- ❌ GitHub Actions для автодеплоя
- ❌ Деплой только `.next` папки

### Теперь используется:
- ✅ Прямая интеграция Netlify с GitHub
- ✅ Автоматический деплой при git push
- ✅ Правильная сборка Next.js
