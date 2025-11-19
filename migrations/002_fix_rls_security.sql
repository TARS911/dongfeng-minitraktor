-- ============================================================================
-- МИГРАЦИЯ 002: ИСПРАВЛЕНИЕ RLS ПОЛИТИК (БЕЗОПАСНОСТЬ)
-- Дата: 2025-11-19
-- Описание: Замена публичных политик на admin-only для создания/изменения
-- ============================================================================

-- ============================================================================
-- 1. УДАЛЯЕМ СТАРЫЕ НЕБЕЗОПАСНЫЕ ПОЛИТИКИ
-- ============================================================================

-- Categories - удаляем публичные политики записи
DROP POLICY IF EXISTS "Allow public insert on categories" ON categories;
DROP POLICY IF EXISTS "Allow public update on categories" ON categories;
DROP POLICY IF EXISTS "Allow public delete on categories" ON categories;

-- Products - удаляем публичные политики записи
DROP POLICY IF EXISTS "Allow public insert on products" ON products;
DROP POLICY IF EXISTS "Allow public update on products" ON products;
DROP POLICY IF EXISTS "Allow public delete on products" ON products;

-- ============================================================================
-- 2. СОЗДАЁМ ТАБЛИЦУ ДЛЯ РОЛЕЙ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Индекс для быстрой проверки ролей
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- RLS для user_roles (только админы могут управлять)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admins to read all roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admins to insert roles"
  ON user_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. ФУНКЦИЯ ДЛЯ ПРОВЕРКИ РОЛИ ADMIN
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. НОВЫЕ БЕЗОПАСНЫЕ RLS ПОЛИТИКИ ДЛЯ CATEGORIES
-- ============================================================================

-- Чтение доступно всем (публично)
CREATE POLICY "Allow public read on categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Создание только для админов
CREATE POLICY "Allow admin insert on categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Обновление только для админов
CREATE POLICY "Allow admin update on categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Удаление только для админов
CREATE POLICY "Allow admin delete on categories"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 5. НОВЫЕ БЕЗОПАСНЫЕ RLS ПОЛИТИКИ ДЛЯ PRODUCTS
-- ============================================================================

-- Чтение доступно всем (публично)
CREATE POLICY "Allow public read on products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Создание только для админов
CREATE POLICY "Allow admin insert on products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- Обновление только для админов
CREATE POLICY "Allow admin update on products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Удаление только для админов
CREATE POLICY "Allow admin delete on products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin());

-- ============================================================================
-- 6. СОЗДАНИЕ ПЕРВОГО ADMIN ПОЛЬЗОВАТЕЛЯ (ЗАМЕНИТЕ EMAIL!)
-- ============================================================================

-- ВАЖНО: После применения миграции выполните этот SQL вручную:
--
-- 1. Зарегистрируйтесь на сайте с email, который будет админом
-- 2. Найдите свой user_id в таблице auth.users:
--    SELECT id, email FROM auth.users WHERE email = 'ваш@email.com';
-- 3. Добавьте себе роль admin:
--    INSERT INTO user_roles (user_id, role)
--    VALUES ('ваш-user-id', 'admin');

-- Альтернатива: Если у вас уже есть пользователь с известным email:
-- INSERT INTO user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'admin@example.com'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- ============================================================================
-- 7. ОБНОВЛЕНИЕ AUDIT_LOG (если есть)
-- ============================================================================

-- Добавляем триггеры для логирования изменений в user_roles
CREATE OR REPLACE FUNCTION log_user_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, record_id, action, new_data, changed_by)
    VALUES ('user_roles', NEW.id::TEXT, 'INSERT', row_to_json(NEW), auth.uid()::TEXT);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data, changed_by)
    VALUES ('user_roles', NEW.id::TEXT, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid()::TEXT);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, changed_by)
    VALUES ('user_roles', OLD.id::TEXT, 'DELETE', row_to_json(OLD), auth.uid()::TEXT);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER user_roles_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION log_user_role_changes();

-- ============================================================================
-- ПРОВЕРКА ПРИМЕНЕНИЯ МИГРАЦИИ
-- ============================================================================

-- Выполните эти запросы для проверки:
-- 1. Проверка политик categories:
--    SELECT * FROM pg_policies WHERE tablename = 'categories';
--
-- 2. Проверка политик products:
--    SELECT * FROM pg_policies WHERE tablename = 'products';
--
-- 3. Проверка функции is_admin():
--    SELECT is_admin(); -- должно вернуть false если вы не admin
--
-- 4. Проверка создания категории (должно fail без admin):
--    INSERT INTO categories (name, slug) VALUES ('Test', 'test');
--    -- Ожидается: new row violates row-level security policy

-- ============================================================================
-- ОТКАТ МИГРАЦИИ (если нужно вернуться)
-- ============================================================================

-- DROP POLICY IF EXISTS "Allow public read on categories" ON categories;
-- DROP POLICY IF EXISTS "Allow admin insert on categories" ON categories;
-- DROP POLICY IF EXISTS "Allow admin update on categories" ON categories;
-- DROP POLICY IF EXISTS "Allow admin delete on categories" ON categories;
--
-- DROP POLICY IF EXISTS "Allow public read on products" ON products;
-- DROP POLICY IF EXISTS "Allow admin insert on products" ON products;
-- DROP POLICY IF EXISTS "Allow admin update on products" ON products;
-- DROP POLICY IF EXISTS "Allow admin delete on products" ON products;
--
-- DROP TRIGGER IF EXISTS user_roles_audit_trigger ON user_roles;
-- DROP FUNCTION IF EXISTS log_user_role_changes();
-- DROP FUNCTION IF EXISTS is_admin();
-- DROP TABLE IF EXISTS user_roles;
