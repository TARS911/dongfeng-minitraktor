-- Создание подкатегорий для раздела "Запчасти"
-- Категория "Запчасти" имеет id = 2

-- 1. ДВС в Сборе
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'ДВС в Сборе',
    'engines-assembled',
    'Двигатели внутреннего сгорания в сборе для минитракторов и мотоблоков',
    2,
    1,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 2. Запчасти на ДВС
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Запчасти на ДВС',
    'parts-engines',
    'Запчасти для двигателей: поршни, кольца, прокладки, клапаны',
    2,
    2,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 3. Запчасти на Минитракторы
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Запчасти на Минитракторы',
    'parts-minitractors',
    'Запчасти для минитракторов DongFeng, Foton, Jinma, Xingtai, Уралец',
    2,
    3,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 4. Запчасти на Мототракторы
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Запчасти на Мототракторы',
    'parts-mototractors',
    'Запчасти для мототракторов с колесом 16 дюймов: Зубр, Crosser',
    2,
    4,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 5. Запчасти на Мотоблоки
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Запчасти на Мотоблоки',
    'parts-motoblocks',
    'Запчасти для мотоблоков: Garden, Скаут, Прораб, Булат, Зубр, Crosser',
    2,
    5,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 6. Запчасти на Навесное оборудование
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Запчасти на Навесное оборудование',
    'parts-attachments',
    'Запчасти для навесного оборудования: плуги, культиваторы, косилки, картофелекопалки',
    2,
    6,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 7. Запчасти на Садовую технику
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Запчасти на Садовую технику',
    'parts-garden-equipment',
    'Запчасти для садовой техники: газонокосилки, триммеры, кусторезы, мотопомпы',
    2,
    7,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 8. Запчасти на Электрогенераторы
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Запчасти на Электрогенераторы',
    'parts-generators',
    'Запчасти для электрогенераторов: AVR, щетки, статоры, роторы, конденсаторы',
    2,
    8,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 9. Топливная система
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Топливная система',
    'parts-fuel-system',
    'Топливные баки, насосы, краны, шланги, фитинги, карбюраторы',
    2,
    9,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 10. Фильтры
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Фильтры',
    'parts-filters',
    'Фильтры: воздушные, топливные, масляные, гидравлические',
    2,
    10,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- 11. Гидравлика
INSERT INTO categories (name, slug, description, parent_id, display_order, created_at, updated_at)
VALUES (
    'Гидравлика',
    'parts-hydraulics',
    'Гидравлические системы: насосы, распределители, цилиндры, шланги, муфты',
    2,
    11,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Проверяем результат
SELECT
    c.id,
    c.name,
    c.slug,
    c.parent_id,
    c.display_order,
    p.name as parent_name
FROM categories c
LEFT JOIN categories p ON c.parent_id = p.id
WHERE c.parent_id = 2
ORDER BY c.display_order;
