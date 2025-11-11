-- ============================================
-- AUDIT TRAIL - Логирование изменений в БД
-- Дата: 2025-11-11
-- Описание: Отслеживание всех изменений в категориях и товарах
-- ============================================

-- 1. Создание таблицы для логов
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id BIGINT NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[], -- список изменённых полей
  user_id UUID, -- ID пользователя (если есть авторизация)
  ip_address INET, -- IP адрес
  user_agent TEXT, -- User Agent
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);

-- 3. Функция для логирования изменений
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data_json JSONB;
  new_data_json JSONB;
  changed_fields_arr TEXT[];
  key TEXT;
BEGIN
  -- Определяем старые и новые данные
  IF (TG_OP = 'DELETE') THEN
    old_data_json := row_to_json(OLD)::JSONB;
    new_data_json := NULL;
  ELSIF (TG_OP = 'INSERT') THEN
    old_data_json := NULL;
    new_data_json := row_to_json(NEW)::JSONB;
  ELSIF (TG_OP = 'UPDATE') THEN
    old_data_json := row_to_json(OLD)::JSONB;
    new_data_json := row_to_json(NEW)::JSONB;

    -- Определяем изменённые поля
    changed_fields_arr := ARRAY[]::TEXT[];
    FOR key IN SELECT jsonb_object_keys(new_data_json)
    LOOP
      IF (old_data_json->>key IS DISTINCT FROM new_data_json->>key) THEN
        changed_fields_arr := array_append(changed_fields_arr, key);
      END IF;
    END LOOP;
  END IF;

  -- Вставляем запись в лог
  INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields
  ) VALUES (
    TG_TABLE_NAME,
    CASE
      WHEN TG_OP = 'DELETE' THEN (OLD.id)::BIGINT
      ELSE (NEW.id)::BIGINT
    END,
    TG_OP,
    old_data_json,
    new_data_json,
    changed_fields_arr
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 4. Создание триггеров для категорий
DROP TRIGGER IF EXISTS audit_categories_trigger ON categories;
CREATE TRIGGER audit_categories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- 5. Создание триггеров для товаров
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- 6. Создание триггеров для заказов
DROP TRIGGER IF EXISTS audit_orders_trigger ON orders;
CREATE TRIGGER audit_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- ============================================
-- ФУНКЦИИ ДЛЯ РАБОТЫ С AUDIT LOG
-- ============================================

-- Функция для получения истории изменений записи
CREATE OR REPLACE FUNCTION get_audit_history(
  p_table_name TEXT,
  p_record_id BIGINT,
  p_limit INT DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  action TEXT,
  changed_fields TEXT[],
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    audit_log.id,
    audit_log.action,
    audit_log.changed_fields,
    audit_log.old_data,
    audit_log.new_data,
    audit_log.created_at
  FROM audit_log
  WHERE
    audit_log.table_name = p_table_name AND
    audit_log.record_id = p_record_id
  ORDER BY audit_log.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения последних изменений в системе
CREATE OR REPLACE FUNCTION get_recent_changes(
  p_limit INT DEFAULT 100
)
RETURNS TABLE (
  id BIGINT,
  table_name TEXT,
  record_id BIGINT,
  action TEXT,
  changed_fields TEXT[],
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    audit_log.id,
    audit_log.table_name,
    audit_log.record_id,
    audit_log.action,
    audit_log.changed_fields,
    audit_log.created_at
  FROM audit_log
  ORDER BY audit_log.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ПРИМЕРЫ ИСПОЛЬЗОВАНИЯ
-- ============================================

-- Получить историю изменений товара ID=1
-- SELECT * FROM get_audit_history('products', 1);

-- Получить последние 50 изменений в системе
-- SELECT * FROM get_recent_changes(50);

-- Получить все удаления за последний месяц
-- SELECT * FROM audit_log
-- WHERE action = 'DELETE' AND created_at > NOW() - INTERVAL '1 month';

-- Найти все изменения цены товаров
-- SELECT * FROM audit_log
-- WHERE table_name = 'products' AND 'price' = ANY(changed_fields);

-- ============================================
-- ОЧИСТКА СТАРЫХ ЛОГОВ (ОПЦИОНАЛЬНО)
-- ============================================

-- Функция для автоматической очистки логов старше N дней
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM audit_log
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Запускать вручную или через cron:
-- SELECT cleanup_old_audit_logs(90); -- Удалить логи старше 90 дней

-- ============================================
-- RLS ПОЛИТИКИ ДЛЯ AUDIT_LOG
-- ============================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Только администраторы могут читать логи
-- (Настроить после добавления системы авторизации)
-- CREATE POLICY "Admin read audit_log"
--   ON audit_log FOR SELECT
--   USING (auth.jwt()->>'role' = 'admin');

-- Временно: разрешить публичное чтение (только для разработки)
CREATE POLICY "Allow public read audit_log"
  ON audit_log FOR SELECT
  USING (true);

-- ============================================
-- ГОТОВО! ✅
-- ============================================
-- Теперь все изменения в categories, products, orders
-- автоматически логируются в таблицу audit_log
