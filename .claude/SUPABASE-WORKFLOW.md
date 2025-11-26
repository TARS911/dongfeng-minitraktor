# РАБОЧИЙ ПРОЦЕСС С SUPABASE

## ГЛАВНОЕ ПРАВИЛО: ПОСТЕПЕННОСТЬ

**НИКОГДА не делай все сразу!**
**ВСЕГДА работай с одной подкатегорией за раз!**

---

## 1. СТРУКТУРА БАЗЫ ДАННЫХ

### Таблица `products`
```
- id (int, primary key)
- name (text) - название товара
- slug (text) - URL-friendly название
- price (numeric) - цена
- old_price (numeric, nullable) - старая цена
- image_url (text) - ссылка на изображение
- category_id (int) - ID категории (ОБЯЗАТЕЛЬНО!)
- manufacturer (text) - производитель (case-sensitive!)
- model (text, nullable) - модель
- in_stock (boolean) - в наличии
- is_featured (boolean) - избранный
- stock (int) - количество на складе
- specifications (jsonb) - характеристики
- created_at (timestamp)
- updated_at (timestamp)
```

### Таблица `categories`
```
- id (int, primary key)
- name (text) - название категории
- slug (text) - URL-friendly название
- parent_id (int, nullable) - ID родительской категории
- description (text, nullable)
- created_at (timestamp)
```

---

## 2. ВАЖНЫЕ ОСОБЕННОСТИ SUPABASE

### 🚨 Case Sensitivity (Регистр букв)
```python
# ❌ НЕПРАВИЛЬНО
.eq("manufacturer", "DONGFENG")  # Не найдёт "DongFeng"

# ✅ ПРАВИЛЬНО
.eq("manufacturer", "DongFeng")  # Найдёт точно "DongFeng"
```

### 🚨 Python SDK методы
```python
# ❌ НЕПРАВИЛЬНО
.maybeSingle()  # JavaScript стиль

# ✅ ПРАВИЛЬНО
.maybe_single()  # Python стиль с underscore
```

### 🚨 Проверка manufacturer в БД
```bash
# ВСЕГДА сначала проверяй, как написан manufacturer в БД:
python3 -c "
from supabase import create_client
import os
supabase = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_SERVICE_ROLE_KEY'])
result = supabase.table('products').select('manufacturer').limit(10).execute()
for p in result.data:
    print(p['manufacturer'])
"
```

---

## 3. ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ РАБОТЫ

### Шаг 1: Проверка категории (ВСЕГДА ПЕРВЫМ!)

```python
#!/usr/bin/env python3
from supabase import create_client
import os

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)

# Проверяем конкретную категорию
slug = "engines-assembled"  # Или другую
cat = supabase.table("categories").select("id, name, slug").eq("slug", slug).maybe_single().execute()

if cat.data:
    print(f"✅ Категория найдена: ID={cat.data['id']}, Name={cat.data['name']}")

    # Считаем товары
    count = supabase.table("products").select("id", count="exact").eq("category_id", cat.data['id']).execute()
    print(f"📦 Товаров: {count.count}")
else:
    print(f"❌ Категория '{slug}' НЕ НАЙДЕНА!")
```

### Шаг 2: Проверка товаров производителя

```python
# Проверяем разные варианты написания
manufacturers = ["DongFeng", "DONGFENG", "dongfeng"]

for mfr in manufacturers:
    count = supabase.table("products").select("id", count="exact").eq("manufacturer", mfr).execute()
    if count.count > 0:
        print(f"✅ '{mfr}': {count.count} товаров")
```

### Шаг 3: Выборка первых 5 товаров для проверки

```python
# НИКОГДА не загружай сразу все!
result = supabase.table("products").select("*").eq("manufacturer", "DongFeng").limit(5).execute()

for p in result.data:
    print(f"ID: {p['id']}")
    print(f"Name: {p['name'][:50]}...")
    print(f"Category ID: {p['category_id']}")
    print(f"Manufacturer: {p['manufacturer']}")
    print("-" * 40)
```

### Шаг 4: Исправление (ТОЛЬКО после проверки!)

```python
# Пример: обновление category_id для одной подкатегории
update_result = supabase.table("products")\
    .update({"category_id": 302})\
    .eq("manufacturer", "DongFeng")\
    .eq("model", "240")\
    .execute()

print(f"✅ Обновлено товаров: {len(update_result.data)}")
```

### Шаг 5: Финальная проверка

```python
# Проверяем результат
count = supabase.table("products").select("id", count="exact").eq("category_id", 302).execute()
print(f"📦 Итого товаров в категории 302: {count.count}")
```

---

## 4. МИКРО-ЗАДАЧИ ДЛЯ ОДНОЙ ПОДКАТЕГОРИИ

### Чеклист работы с подкатегорией:

- [ ] 1. Проверить категорию в БД (ID, slug, name)
- [ ] 2. Посчитать товары в категории
- [ ] 3. Проверить manufacturer (регистр букв!)
- [ ] 4. Загрузить первые 5 товаров для проверки
- [ ] 5. Проверить структуру данных (name, price, image_url)
- [ ] 6. Если нужно - создать скрипт исправления
- [ ] 7. Запустить скрипт на ОДНОЙ подкатегории
- [ ] 8. Проверить результат (посчитать товары снова)
- [ ] 9. Проверить фронтенд (открыть страницу в браузере)
- [ ] 10. ТОЛЬКО ПОТОМ переходить к следующей подкатегории

---

## 5. РАБОТА С FRONTEND (Next.js)

### Основные запросы Supabase в Next.js:

```typescript
// ✅ Загрузка товаров по категории
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("category_id", categoryId)
  .eq("in_stock", true)
  .order("created_at", { ascending: false });

// ✅ Загрузка товаров по manufacturer
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("manufacturer", "DongFeng")  // Case-sensitive!
  .eq("in_stock", true)
  .limit(100);  // ВСЕГДА используй limit!

// ✅ Поиск по названию
const { data } = await supabase
  .from("products")
  .select("*")
  .ilike("name", "%240%")  // ilike = case-insensitive
  .eq("in_stock", true);
```

---

## 6. ТИПИЧНЫЕ ОШИБКИ И КАК ИХ ИЗБЕЖАТЬ

### ❌ Ошибка 1: Загрузка всех товаров сразу
```typescript
// ПЛОХО - загрузит 10,000 товаров!
const { data } = await supabase.from("products").select("*");
```

### ✅ Правильно:
```typescript
// ХОРОШО - загрузит только 100
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("category_id", 302)
  .limit(100);
```

### ❌ Ошибка 2: Неправильный регистр
```typescript
// ПЛОХО
.eq("manufacturer", "DONGFENG")  // Не найдёт "DongFeng"
```

### ✅ Правильно:
```typescript
// ХОРОШО - сначала проверь в БД!
.eq("manufacturer", "DongFeng")
```

### ❌ Ошибка 3: Забыть фильтр in_stock
```typescript
// ПЛОХО - покажет товары НЕ в наличии
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("category_id", 302);
```

### ✅ Правильно:
```typescript
// ХОРОШО - только товары в наличии
const { data } = await supabase
  .from("products")
  .select("*")
  .eq("category_id", 302)
  .eq("in_stock", true);
```

---

## 7. ШАБЛОН ДИАГНОСТИЧЕСКОГО СКРИПТА

Сохрани это как `scripts/check-subcategory.py`:

```python
#!/usr/bin/env python3
"""
Проверка одной подкатегории
Usage: python3 check-subcategory.py <category-slug>
"""

import sys
import os
from supabase import create_client

if len(sys.argv) < 2:
    print("Usage: python3 check-subcategory.py <category-slug>")
    sys.exit(1)

slug = sys.argv[1]

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_ROLE_KEY"]
)

print("=" * 80)
print(f"🔍 ПРОВЕРКА ПОДКАТЕГОРИИ: {slug}")
print("=" * 80)
print()

# 1. Категория
cat = supabase.table("categories").select("id, name, slug, parent_id").eq("slug", slug).maybe_single().execute()

if not cat.data:
    print(f"❌ Категория '{slug}' не найдена!")
    sys.exit(1)

cat_id = cat.data["id"]
cat_name = cat.data["name"]
parent_id = cat.data.get("parent_id")

print(f"✅ ID: {cat_id}")
print(f"✅ Название: {cat_name}")
print(f"✅ Parent ID: {parent_id or 'нет'}")
print()

# 2. Подсчёт товаров
count = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).execute()
print(f"📦 Всего товаров: {count.count}")

count_in_stock = supabase.table("products").select("id", count="exact").eq("category_id", cat_id).eq("in_stock", True).execute()
print(f"📦 В наличии: {count_in_stock.count}")
print()

# 3. Первые 5 товаров
if count.count > 0:
    print("📋 ПЕРВЫЕ 5 ТОВАРОВ:")
    print("-" * 80)

    result = supabase.table("products").select("id, name, price, manufacturer, in_stock").eq("category_id", cat_id).limit(5).execute()

    for p in result.data:
        print(f"\nID: {p['id']}")
        print(f"Название: {p['name'][:60]}...")
        print(f"Цена: {p['price']} руб")
        print(f"Производитель: {p.get('manufacturer', 'НЕТ')}")
        print(f"В наличии: {'✅' if p.get('in_stock') else '❌'}")

print()
print("=" * 80)
print("✅ ПРОВЕРКА ЗАВЕРШЕНА")
print("=" * 80)
```

---

## 8. ПОСЛЕДОВАТЕЛЬНОСТЬ ПОДКАТЕГОРИЙ

### Порядок работы (по одной за раз!):

1. **parts-minitractors-dongfeng/240-244** ← Начни с этой
   - Проверка
   - Исправление manufacturer
   - Проверка результата
   - Проверка фронтенда

2. **parts-minitractors-dongfeng/354-404** ← Потом эта
   - Проверка
   - Исправление manufacturer
   - Проверка результата
   - Проверка фронтенда

3. **engines-assembled** ← Потом эта
   - Проверка
   - Понять, почему пусто
   - Решить, нужно ли заполнять
   - Проверка фронтенда

4. **parts** (главная страница запчастей)
   - Проверка всех подкатегорий
   - Проверка фронтенда

5. **mini-tractors** (главная страница мини-тракторов)
   - И так далее...

---

## 9. GIT WORKFLOW

### Коммиты делай после КАЖДОЙ подкатегории:

```bash
# После исправления одной подкатегории:
git add .
git commit -m "Fix: DongFeng 240-244 manufacturer case sensitivity

- Changed DONGFENG → DongFeng in query
- Now shows 414 products instead of 0
- Tested on /catalog/parts/parts-minitractors-dongfeng/240-244

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

### НЕ делай большие коммиты со всеми изменениями сразу!

---

## 10. ФИНАЛЬНЫЙ ЧЕКЛИСТ

Перед тем как считать подкатегорию готовой:

- [ ] Скрипт проверки запущен
- [ ] Количество товаров подсчитано
- [ ] Manufacturer проверен (регистр!)
- [ ] Frontend код просмотрен
- [ ] npm run build прошёл успешно
- [ ] git commit сделан
- [ ] git push выполнен
- [ ] Vercel задеплоил
- [ ] Страница открыта в браузере
- [ ] Товары отображаются корректно
- [ ] ТОЛЬКО ПОТОМ → следующая подкатегория

---

## ПОМНИ ГЛАВНОЕ:

> **"Не спеши! По чуть-чуть, постепенно, одну подкатегорию за раз!"**

> **"Сначала проверь, потом исправь, потом проверь снова!"**

> **"10,000 товаров = много маленьких задач, а не одна большая!"**
