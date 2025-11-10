# 🗄️ Оптимизация базы данных Supabase

**Проект:** БелТехФермЪ  
**База данных:** PostgreSQL (Supabase)  
**Дата:** 2025-11-10

---

## 📋 Текущая структура БД

### Таблицы:
1. **categories** - Категории товаров
2. **products** - Товары с характеристиками
3. **customers** - Покупатели
4. **orders** - Заказы
5. **order_items** - Товары в заказах
6. **contacts** - Контакт-формы

---

## 🚀 Рекомендуемые индексы

### 1. Таблица `products`

#### Индекс для поиска по категории
```sql
-- Индекс для быстрого поиска товаров по категории
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON products(category_id) 
WHERE in_stock = true;

-- Композитный индекс для сортировки по цене внутри категории
CREATE INDEX IF NOT EXISTS idx_products_category_price 
ON products(category_id, price) 
WHERE in_stock = true;

-- Индекс для полнотекстового поиска по названию
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON products USING gin(name gin_trgm_ops);

-- Включаем расширение для fuzzy search (если еще не включено)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

#### Индекс для slug (уникальный)
```sql
-- Уникальный индекс для slug (URL-friendly идентификатор)
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug 
ON products(slug);
```

#### Индекс для is_featured (хиты продаж)
```sql
-- Индекс для быстрой выборки популярных товаров
CREATE INDEX IF NOT EXISTS idx_products_is_featured 
ON products(is_featured) 
WHERE is_featured = true AND in_stock = true;
```

#### Индекс для поиска по производителю
```sql
-- Индекс для фильтрации по производителю
CREATE INDEX IF NOT EXISTS idx_products_manufacturer 
ON products(manufacturer) 
WHERE manufacturer IS NOT NULL;
```

---

### 2. Таблица `categories`

```sql
-- Индекс для slug категорий (уникальный)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug 
ON categories(slug);

-- Индекс для сортировки по имени
CREATE INDEX IF NOT EXISTS idx_categories_name 
ON categories(name);
```

---

### 3. Таблица `orders`

```sql
-- Индекс для поиска заказов по клиенту
CREATE INDEX IF NOT EXISTS idx_orders_customer_id 
ON orders(customer_id);

-- Индекс для фильтрации по статусу
CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

-- Композитный индекс для поиска заказов клиента по дате
CREATE INDEX IF NOT EXISTS idx_orders_customer_created 
ON orders(customer_id, created_at DESC);

-- Индекс для поиска по номеру заказа
CREATE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(order_number);
```

---

### 4. Таблица `order_items`

```sql
-- Индекс для поиска товаров в заказе
CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

-- Индекс для аналитики по товарам
CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
ON order_items(product_id);

-- Композитный индекс для подсчета количества проданных товаров
CREATE INDEX IF NOT EXISTS idx_order_items_product_quantity 
ON order_items(product_id, quantity);
```

---

### 5. Таблица `customers`

```sql
-- Уникальный индекс для email (предотвращаем дубликаты)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email 
ON customers(email);

-- Индекс для поиска по телефону
CREATE INDEX IF NOT EXISTS idx_customers_phone 
ON customers(phone) 
WHERE phone IS NOT NULL;
```

---

### 6. Таблица `contacts`

```sql
-- Индекс для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_contacts_created_at 
ON contacts(created_at DESC);

-- Индекс для фильтрации по статусу обработки
CREATE INDEX IF NOT EXISTS idx_contacts_is_processed 
ON contacts(is_processed) 
WHERE is_processed = false;
```

---

## 📊 SQL скрипт для быстрого применения

Скопируйте и выполните в Supabase SQL Editor:

```sql
-- ========================================
-- ОПТИМИЗАЦИЯ БД БELTEHFERM
-- ========================================

-- Включаем расширение для fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ========================================
-- ТАБЛИЦА: products
-- ========================================

-- Поиск по категории (в наличии)
CREATE INDEX IF NOT EXISTS idx_products_category_id 
ON products(category_id) 
WHERE in_stock = true;

-- Сортировка по цене внутри категории
CREATE INDEX IF NOT EXISTS idx_products_category_price 
ON products(category_id, price) 
WHERE in_stock = true;

-- Полнотекстовый поиск по названию
CREATE INDEX IF NOT EXISTS idx_products_name_trgm 
ON products USING gin(name gin_trgm_ops);

-- Уникальный slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug 
ON products(slug);

-- Хиты продаж
CREATE INDEX IF NOT EXISTS idx_products_is_featured 
ON products(is_featured) 
WHERE is_featured = true AND in_stock = true;

-- Фильтр по производителю
CREATE INDEX IF NOT EXISTS idx_products_manufacturer 
ON products(manufacturer) 
WHERE manufacturer IS NOT NULL;

-- ========================================
-- ТАБЛИЦА: categories
-- ========================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug 
ON categories(slug);

CREATE INDEX IF NOT EXISTS idx_categories_name 
ON categories(name);

-- ========================================
-- ТАБЛИЦА: orders
-- ========================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_id 
ON orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_orders_status 
ON orders(status);

CREATE INDEX IF NOT EXISTS idx_orders_customer_created 
ON orders(customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_order_number 
ON orders(order_number);

-- ========================================
-- ТАБЛИЦА: order_items
-- ========================================

CREATE INDEX IF NOT EXISTS idx_order_items_order_id 
ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id 
ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_quantity 
ON order_items(product_id, quantity);

-- ========================================
-- ТАБЛИЦА: customers
-- ========================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email 
ON customers(email);

CREATE INDEX IF NOT EXISTS idx_customers_phone 
ON customers(phone) 
WHERE phone IS NOT NULL;

-- ========================================
-- ТАБЛИЦА: contacts
-- ========================================

CREATE INDEX IF NOT EXISTS idx_contacts_created_at 
ON contacts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_contacts_is_processed 
ON contacts(is_processed) 
WHERE is_processed = false;

-- ========================================
-- ПРОВЕРКА СОЗДАННЫХ ИНДЕКСОВ
-- ========================================

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 🔍 Проверка эффективности индексов

### 1. Проверить, используются ли индексы

```sql
-- Запрос для проверки использования индексов
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as "Index Scans",
    idx_tup_read as "Tuples Read",
    idx_tup_fetch as "Tuples Fetched"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### 2. Найти неиспользуемые индексы

```sql
-- Индексы, которые никогда не использовались
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as "Index Size"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexrelname NOT LIKE 'pg_toast%'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 3. EXPLAIN ANALYZE для запросов

```sql
-- Проверка плана выполнения запроса
EXPLAIN ANALYZE
SELECT * FROM products 
WHERE category_id = 1 
  AND in_stock = true 
ORDER BY price ASC 
LIMIT 20;
```

---

## 📈 Ожидаемые улучшения

| Запрос | До индексов | После индексов | Улучшение |
|--------|-------------|----------------|-----------|
| **Поиск по категории** | ~50ms | ~5ms | **90%** |
| **Поиск по slug** | ~30ms | ~1ms | **97%** |
| **Хиты продаж** | ~40ms | ~3ms | **92%** |
| **Заказы клиента** | ~100ms | ~10ms | **90%** |
| **Полнотекстовый поиск** | ~200ms | ~20ms | **90%** |

---

## 🎯 Дополнительные оптимизации

### 1. Партицирование таблицы orders (если много заказов)

```sql
-- Партицирование по году для больших таблиц
-- Применять только если orders > 1 млн записей
CREATE TABLE orders_2024 PARTITION OF orders
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE orders_2025 PARTITION OF orders
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 2. Материализованное представление для статистики

```sql
-- Материализованное view для dashboard
CREATE MATERIALIZED VIEW product_stats AS
SELECT 
    p.id,
    p.name,
    p.price,
    COUNT(oi.id) as total_orders,
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.price) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.price;

-- Индекс для материализованного view
CREATE INDEX idx_product_stats_total_sold 
ON product_stats(total_sold DESC);

-- Обновление view (запускать раз в день)
REFRESH MATERIALIZED VIEW CONCURRENTLY product_stats;
```

### 3. Автоматическая очистка (VACUUM)

```sql
-- Настроить автоматический VACUUM для больших таблиц
ALTER TABLE products SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02
);

ALTER TABLE orders SET (
    autovacuum_vacuum_scale_factor = 0.05,
    autovacuum_analyze_scale_factor = 0.02
);
```

---

## ✅ Чек-лист оптимизации БД

### Обязательно:
- [ ] Применить все индексы из SQL скрипта
- [ ] Проверить создание индексов (SELECT * FROM pg_indexes)
- [ ] Протестировать EXPLAIN ANALYZE для критических запросов
- [ ] Обновить API queries для использования конкретных полей вместо SELECT *

### Желательно:
- [ ] Настроить мониторинг размера БД
- [ ] Настроить автоматический VACUUM
- [ ] Создать материализованное view для статистики
- [ ] Настроить backup schedule в Supabase

### При необходимости:
- [ ] Партицирование orders (если > 1 млн записей)
- [ ] Архивирование старых заказов
- [ ] Репликация для read-only запросов

---

## 📚 Документация

**Supabase SQL Editor:**  
Dashboard → SQL Editor → New Query → Вставить скрипт → Run

**Проверка производительности:**  
https://supabase.com/dashboard/project/YOUR_PROJECT/database/query-performance

**Документация PostgreSQL индексов:**  
https://www.postgresql.org/docs/current/indexes.html

---

**Автор:** AI Assistant  
**Дата:** 2025-11-10  
**Версия:** 1.0
