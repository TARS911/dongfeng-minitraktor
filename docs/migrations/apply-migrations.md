# 📝 ПРИМЕНЕНИЕ SQL МИГРАЦИЙ В SUPABASE

## Вариант 1: Через веб-интерфейс (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Откройте Supabase
1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект
3. В левом меню выберите **SQL Editor**

### Шаг 2: Примените миграцию категории
1. Скопируйте весь код из `fix-equipment-category.sql`
2. Вставьте в SQL Editor
3. Нажмите **Run** (или Ctrl+Enter)
4. Должно выполниться без ошибок

**Проверка:**
```sql
SELECT id, name, slug, description 
FROM categories 
WHERE slug = 'equipment';
```

Должно показать: `Коммунальная техника`

---

### Шаг 3: Примените Audit Trail
1. Скопируйте весь код из `audit-trail.sql`
2. Вставьте в SQL Editor
3. Нажмите **Run**
4. Дождитесь выполнения (~30 секунд)

**Проверка:**
```sql
-- Проверить что таблица создана
SELECT COUNT(*) FROM audit_log;

-- Сделать тестовое изменение
UPDATE categories SET description = 'test update' WHERE id = 1;

-- Проверить что лог записался
SELECT 
  table_name, 
  action, 
  changed_fields, 
  created_at 
FROM audit_log 
ORDER BY created_at DESC 
LIMIT 5;
```

Должны увидеть запись об UPDATE категории.

---

### Шаг 4: Настройте RLS политики

**Для категорий (INSERT/UPDATE/DELETE):**
```sql
-- Разрешить публичное создание категорий
DROP POLICY IF EXISTS "Allow public insert on categories" ON categories;
CREATE POLICY "Allow public insert on categories"
  ON categories FOR INSERT
  WITH CHECK (true);

-- Разрешить публичное обновление категорий
DROP POLICY IF EXISTS "Allow public update on categories" ON categories;
CREATE POLICY "Allow public update on categories"
  ON categories FOR UPDATE
  USING (true);

-- Разрешить публичное удаление категорий
DROP POLICY IF EXISTS "Allow public delete on categories" ON categories;
CREATE POLICY "Allow public delete on categories"
  ON categories FOR DELETE
  USING (true);
```

**Для товаров (INSERT/UPDATE):**
```sql
-- Разрешить публичное создание товаров
DROP POLICY IF EXISTS "Allow public insert on products" ON products;
CREATE POLICY "Allow public insert on products"
  ON products FOR INSERT
  WITH CHECK (true);

-- Разрешить публичное обновление товаров
DROP POLICY IF EXISTS "Allow public update on products" ON products;
CREATE POLICY "Allow public update on products"
  ON products FOR UPDATE
  USING (true);
```

⚠️ **ВАЖНО ДЛЯ PRODUCTION:**
Эти политики открывают доступ к записи для всех. Для production рекомендуется:

```sql
-- Только авторизованные пользователи с ролью admin
CREATE POLICY "Admin only write categories"
  ON categories FOR ALL
  USING (auth.jwt()->>'role' = 'admin');
```

---

## Вариант 2: Через Supabase CLI (для продвинутых)

### Установка Supabase CLI
```bash
npm install -g supabase
```

### Применение миграций
```bash
# 1. Войдите в Supabase
supabase login

# 2. Свяжите проект
supabase link --project-ref your-project-ref

# 3. Примените миграции
supabase db push --include-all
```

---

## 🧪 ТЕСТИРОВАНИЕ ПОСЛЕ МИГРАЦИИ

### 1. Проверка категорий через API
```bash
curl http://localhost:3000/api/categories
```

Должно вернуть JSON с категориями, включая обновлённую "Коммунальная техника".

### 2. Тест создания категории
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тестовая",
    "slug": "test-category",
    "description": "Тест после миграции"
  }'
```

Должно вернуть `201 Created`.

### 3. Проверка Audit Trail
```bash
curl -X PUT http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated via API"}'
```

Затем в Supabase SQL Editor:
```sql
SELECT * FROM get_recent_changes(10);
```

Должна появиться запись об UPDATE.

---

## ❌ TROUBLESHOOTING

### Ошибка: "permission denied for table audit_log"
**Решение:** Убедитесь что RLS политика для audit_log разрешает чтение:
```sql
CREATE POLICY "Allow public read audit_log"
  ON audit_log FOR SELECT
  USING (true);
```

### Ошибка: "function audit_trigger_func already exists"
**Решение:** Это нормально, функция уже создана. Пропустите создание или используйте:
```sql
CREATE OR REPLACE FUNCTION audit_trigger_func() ...
```

### Ошибка: "new row violates row-level security policy"
**Решение:** Проверьте что RLS политики разрешают INSERT:
```sql
-- Посмотреть существующие политики
SELECT * FROM pg_policies WHERE tablename = 'categories';

-- Временно отключить RLS для отладки
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- Включить обратно после исправления
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
```

---

## ✅ ЧЕКЛИСТ

- [ ] Миграция fix-equipment-category.sql выполнена
- [ ] Миграция audit-trail.sql выполнена
- [ ] RLS политики настроены
- [ ] Проверка: категория equipment обновлена
- [ ] Проверка: таблица audit_log создана
- [ ] Проверка: триггеры работают
- [ ] Тест: API создания категории работает
- [ ] Тест: Audit log записывает изменения

---

## 📚 ДОПОЛНИТЕЛЬНО

### Откат миграций (если что-то пошло не так)

**Откат Audit Trail:**
```sql
DROP TRIGGER IF EXISTS audit_categories_trigger ON categories;
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
DROP TRIGGER IF EXISTS audit_orders_trigger ON orders;
DROP FUNCTION IF EXISTS audit_trigger_func();
DROP TABLE IF EXISTS audit_log;
```

**Откат изменений категории:**
```sql
UPDATE categories 
SET 
  name = 'Навесное оборудование',
  description = 'Плуги, культиваторы, косилки'
WHERE slug = 'equipment';
```

---

Готово! После применения всех миграций ваш проект полностью готов к работе.
