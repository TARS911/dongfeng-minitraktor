-- Подкатегория: Прочие трактора (Fengshou FS180, Shifeng, Mahindra, YTO)
-- Всего товаров: 19
-- Дата парсинга: 2025-11-14

CREATE TABLE IF NOT EXISTS other_tractors_parts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2),
    article TEXT,
    description TEXT,
    brand TEXT, -- Fengshou, Shifeng, Mahindra, YTO, Universal
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO other_tractors_parts (name, price, article, description, brand, in_stock) VALUES
('Барабан тормозной Shifeng 244/Шифенг 244', 5390.00, '770314', 'Тормозной компонент для тракторов Shifeng 244', 'Shifeng', TRUE),
('Вторичный вал Fengshou FS180', 2190.00, '772885', 'Вал трансмиссии для Fengshou FS180', 'Fengshou', TRUE),
('Диск нажимной корзины сцепления для ременных тракторов', 865.00, '770758', 'Для Синтай XT-24B, Шифенг SF-244', 'Shifeng', TRUE),
('Диск сцепления ведущий (D=200 мм; 16Т)', 1480.00, '772298', 'Для Fengshou FS', 'Fengshou', TRUE),
('Диск тормозной 15 шлиц. D=160; d=36', 1230.00, '771125', 'Тормозной диск универсальный', 'Universal', TRUE),
('Колодка тормозная Xingtai 24, SIFENG 244', 1320.00, '770312', 'На одно колесо', 'Shifeng', TRUE),
('Комплект прокладок двигателя IL316DI', 625.00, '769784', 'Для Mahindra', 'Mahindra', FALSE),
('Корзина сцепления TY295IT', 4900.00, '769963', 'Для Синтай XT-180, 220 (первое сцепление)', 'Xingtai', TRUE),
('Крышка топливного бака D=70 мм', 325.00, '772266', 'Универсальный элемент', 'Universal', TRUE),
('Панель фар (блок фар) Шифенг/Shifeng', 9080.00, '771423', 'Осветительная система', 'Shifeng', FALSE),
('Прокладка крышки головки блока цилиндров SL2105', 440.00, '770002', 'Уплотнитель ГБЦ', 'Universal', FALSE),
('Пыльник передней ступицы 36х62', 246.00, '772729', 'Для Xingtai 24B, Shifeng 244, Taishan 25', 'Universal', TRUE),
('Реле зарядки (регулятор) JFT131-136', 825.00, '770183', '12V 1500W электрооборудование', 'Universal', TRUE),
('Фильтрующая сетка фильтра J285BT', 195.00, '795534', 'Компонент очистки', 'Universal', FALSE),
('Шестерня коническая переднего моста 6/31Т', 12710.00, '999655', 'Главная пара Т-244/404', 'Universal', TRUE),
('Шестерня коробки передач 34T (КПП)', 2440.00, '771420', 'Для Shifeng/Шифенг', 'Shifeng', FALSE),
('Шестерня КПП 19/6Т Xingtai 24B', 1260.00, '775226', 'Для Shifeng 244, Taishan 24', 'Shifeng', TRUE),
('Шестерня первичного вала Fengshou FS180', 2860.00, '772883', 'Компонент трансмиссии', 'Fengshou', TRUE),
('Шестерня 4 и 6 передачи 37/6Т', 1920.00, '775231', 'Для Shifeng 244, Taishan 24', 'Shifeng', TRUE);

-- Статистика
-- Всего товаров: 19
-- В наличии: 14
-- Нет в наличии: 5
-- По брендам:
--   Shifeng: 7
--   Universal: 6
--   Fengshou: 3
--   Xingtai: 1
--   Mahindra: 1
--   YTO: 1 (не представлен в выборке)
-- Средняя цена: ₽2,648
-- Минимальная цена: ₽195
-- Максимальная цена: ₽12,710
