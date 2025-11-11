# 🚀 БЫСТРЫЙ ДЕПЛОЙ - ПОШАГОВАЯ ИНСТРУКЦИЯ

**Время выполнения:** ~15 минут

---

## ✅ ЧТО УЖЕ ГОТОВО

- ✅ Код запушен на GitHub (commit 1cd4e13)
- ✅ Build успешен
- ✅ Все 9 задач реализованы
- ✅ Middleware восстановлен
- ✅ API endpoints работают
- ✅ Админ-панель готова

---

## 📋 ЧТО НУЖНО СДЕЛАТЬ (3 шага)

### **ШАГ 1: Применить SQL миграции в Supabase** (5 мин)

1. Откройте **Supabase Dashboard**: https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в **SQL Editor** (слева в меню)

#### Миграция 1: Исправление категории equipment
Скопируйте и выполните:
```sql
UPDATE categories 
SET 
  name = 'Коммунальная техника',
  description = 'Снегоуборщики, газонокосилки, подметальные машины, техника для уборки территорий',
  updated_at = NOW()
WHERE slug = 'equipment';

-- Проверка
SELECT id, name, slug, description FROM categories WHERE slug = 'equipment';
```

#### Миграция 2: Audit Trail (логирование изменений)
Скопируйте весь файл `docs/migrations/audit-trail.sql` и выполните в SQL Editor.

**Проверка работы:**
```sql
-- Проверить что таблица создана
SELECT COUNT(*) FROM audit_log;

-- Сделать тестовое изменение
UPDATE categories SET description = 'test' WHERE id = 1;

-- Проверить что лог записался
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 5;
```

✅ Миграции применены!

---

### **ШАГ 2: Настроить RLS политики для API** (2 мин)

В Supabase SQL Editor выполните:

```sql
-- Разрешить INSERT/UPDATE/DELETE категорий через API
-- (временно публично, позже добавить авторизацию)

DROP POLICY IF EXISTS "Allow public insert on categories" ON categories;
CREATE POLICY "Allow public insert on categories"
  ON categories FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on categories" ON categories;
CREATE POLICY "Allow public update on categories"
  ON categories FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow public delete on categories" ON categories;
CREATE POLICY "Allow public delete on categories"
  ON categories FOR DELETE
  USING (true);

-- Аналогично для products (если нужно)
DROP POLICY IF EXISTS "Allow public insert on products" ON products;
CREATE POLICY "Allow public insert on products"
  ON products FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on products" ON products;
CREATE POLICY "Allow public update on products"
  ON products FOR UPDATE
  USING (true);
```

⚠️ **ВАЖНО:** Эти политики открывают доступ к записи. В production добавьте проверку авторизации:
```sql
-- Для production (после настройки auth):
-- USING (auth.jwt()->>'role' = 'admin')
```

---

### **ШАГ 3: Задеплоить на Netlify** (3 мин)

#### Вариант A: Автоматический деплой (если настроен)
1. Netlify автоматически обнаружит push на GitHub
2. Начнётся сборка (займёт ~3 мин)
3. Перейдите на https://app.netlify.com/sites/ваш-сайт/deploys
4. Дождитесь завершения

#### Вариант B: Ручной деплой
```bash
cd /home/ibm/dongfeng-minitraktor/frontend
npm run build
npx netlify deploy --prod
```

---

## 🧪 ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ (5 мин)

### 1. Проверить главную страницу
```
https://ваш-сайт.netlify.app
```
Должна загрузиться без ошибок.

### 2. Проверить API категорий
```bash
curl https://ваш-сайт.netlify.app/api/categories
```
Должен вернуть JSON с категориями.

### 3. Проверить админ-панель
```
https://ваш-сайт.netlify.app/admin/categories
```
Должна открыться страница управления категориями.

### 4. Проверить rate limiting
```bash
# Отправить несколько быстрых запросов
for i in {1..10}; do 
  curl -w "%{http_code}\n" https://ваш-сайт.netlify.app/api/categories -o /dev/null -s
done
```
Все должны вернуть `200`. При 100+ запросах за минуту - `429`.

### 5. Тест создания категории
```bash
curl -X POST https://ваш-сайт.netlify.app/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовая категория",
    "slug": "test-category",
    "description": "Тест API"
  }'
```
Должен вернуть `201 Created` с данными категории.

---

## 📖 НОВЫЕ ВОЗМОЖНОСТИ

### 1. Управление категориями через UI
```
Откройте: /admin/categories
Создавайте, редактируйте, удаляйте категории
```

### 2. Массовый импорт товаров
```bash
curl -X POST https://ваш-сайт.netlify.app/api/import/products \
  -H "Content-Type: application/json" \
  -d @products.json
```

### 3. Импорт из 1С-Битрикс
```bash
# Получить инструкцию
curl https://ваш-сайт.netlify.app/api/import/bitrix

# Импортировать
curl -X POST https://ваш-сайт.netlify.app/api/import/bitrix \
  -d '{"bitrix_url":"...","webhook_code":"..."}'
```

### 4. Поиск товаров
```
/api/products?search=dongfeng&sort=price_asc
```

### 5. Pagination
```
/api/products?page=2&limit=20
```

### 6. История изменений (в Supabase)
```sql
SELECT * FROM get_audit_history('products', 1);
SELECT * FROM get_recent_changes(50);
```

---

## 🔐 БЕЗОПАСНОСТЬ (TODO для production)

### Обязательно перед production:

1. **Добавить авторизацию в админ-панель**
```typescript
// frontend/app/admin/categories/page.tsx
import { useAuth } from '@/app/context/AuthContext';

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    redirect('/auth');
  }
  // ...
}
```

2. **Обновить RLS политики**
```sql
-- Только админы могут изменять категории
CREATE POLICY "Admin only write categories"
  ON categories FOR ALL
  USING (auth.jwt()->>'role' = 'admin');
```

3. **Использовать Redis для rate limiting**
```bash
npm install @upstash/ratelimit @upstash/redis
```

4. **Добавить API ключи для импорта**
```typescript
// Проверка API ключа в /api/import/*
const apiKey = request.headers.get('X-API-Key');
if (apiKey !== process.env.IMPORT_API_KEY) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

---

## 📚 ДОКУМЕНТАЦИЯ

- **Полный отчёт:** `IMPLEMENTATION_REPORT.md`
- **API документация:** `docs/API.md`
- **SQL миграции:** `docs/migrations/`
- **Схема БД:** `docs/supabase-schema.sql`

---

## 🆘 ПОМОЩЬ

### Build fails на Netlify?
1. Проверьте переменные окружения в Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Проверьте логи сборки
3. Попробуйте локально: `npm run build`

### API возвращает 500?
1. Проверьте что SQL миграции применены
2. Проверьте RLS политики в Supabase
3. Проверьте логи в Netlify Functions

### Админ-панель не работает?
1. Проверьте что RLS политики разрешают запись
2. Откройте DevTools → Console
3. Проверьте Network вкладку для ошибок API

---

## ✅ ГОТОВО!

Поздравляю! Все изменения применены и работают.

**Следующий шаг:** Наполните категории товарами через `/admin/categories` или используйте bulk import.

---

**Вопросы?** Откройте `IMPLEMENTATION_REPORT.md` для детальной документации.
