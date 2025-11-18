-- Миграция: Создание категорий запчастей
-- Дата: 2025-11-18
-- Категорий: 18
-- Всего товаров: 2833

-- Создаём таблицу категорий запчастей (если не существует)
CREATE TABLE IF NOT EXISTS parts_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Очищаем таблицу перед вставкой
TRUNCATE TABLE parts_categories RESTART IDENTITY CASCADE;

-- Вставляем категории
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (1, 'Навесное оборудование', 'navesnoe-oborudovanie', 'Навеска, прицепы, плуги, культиваторы, КУН', 563);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (2, 'Двигатель', 'dvigatel', 'Запчасти для двигателя: поршни, кольца, прокладки, фильтры', 561);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (3, 'Прочее', 'prochee', 'Прочие запчасти и комплектующие', 437);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (4, 'Стандартные изделия', 'standartnye-izdeliya', 'Метизы, крепёж, болты, гайки, шайбы', 335);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (5, 'Трансмиссия', 'transmissiya', 'КПП, сцепление, валы, шестерни, подшипники', 233);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (6, 'Гидравлика', 'gidravlika', 'Гидравлические системы, насосы, распределители, шланги РВД', 198);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (7, 'Карданные валы', 'kardannye-valy', 'Карданные валы, крестовины, муфты', 112);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (8, 'Передний мост', 'peredniy-most', 'Передняя ось, ступицы, подшипники, поворотные кулаки', 71);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (9, 'Фильтры', 'filtry', 'Масляные, воздушные, топливные фильтры', 69);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (10, 'Электрооборудование', 'elektrooborudovanie', 'Генераторы, стартеры, проводка, датчики, фары', 64);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (11, 'Рулевое управление', 'rulevoe-upravlenie', 'Рулевой механизм, рулевая колонка, наконечники тяг', 55);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (12, 'Тормозная система', 'tormoznaya-sistema', 'Тормозные колодки, диски, цилиндры, шланги', 40);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (13, 'Кабина', 'kabina', 'Элементы кабины: стёкла, уплотнители, замки, обшивка', 39);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (14, 'Топливная система', 'toplivnaya-sistema', 'Топливные насосы, фильтры, форсунки, баки', 21);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (15, 'Капот и крылья', 'kapot-i-krylya', 'Кузовные элементы: капот, крылья, облицовка', 18);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (16, 'Колеса и шины', 'kolesa-i-shiny', 'Шины, диски, камеры для минитракторов', 11);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (17, 'РВД', 'rvd', 'Рукава высокого давления, фитинги, быстросъёмы', 4);
INSERT INTO parts_categories (id, name, slug, description, product_count)
VALUES (18, 'Сиденья', 'sidenya', 'Сиденья для трактора, амортизаторы сидений', 2);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_parts_categories_slug ON parts_categories(slug);
CREATE INDEX IF NOT EXISTS idx_parts_categories_name ON parts_categories(name);

-- Проверка результата
SELECT id, name, slug, product_count FROM parts_categories ORDER BY product_count DESC;