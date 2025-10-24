/**
 * Admin routes - управление базой данных
 */

import { supabase } from "../config/supabase.js";

export default async function adminRoutes(fastify, options) {
  // POST /api/admin/rebuild-db - Пересоздать базу данных
  fastify.post("/rebuild-db", async (request, reply) => {
    try {
      const { secret } = request.body;

      // Простая защита секретом
      const ADMIN_SECRET = process.env.ADMIN_SECRET || "dongfeng2024";

      if (secret !== ADMIN_SECRET) {
        return reply.code(403).send({
          success: false,
          error: "Неверный секрет",
        });
      }

      fastify.log.info("🔄 Пересоздание базы данных...");

      // Удаляем все таблицы
      db.exec("DROP TABLE IF EXISTS contacts");
      db.exec("DROP TABLE IF EXISTS delivery_requests");
      db.exec("DROP TABLE IF EXISTS products");
      db.exec("DROP TABLE IF EXISTS categories");

      // Создаем таблицы напрямую (без чтения init.sql)
      db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT NOT NULL UNIQUE,
          model TEXT NOT NULL,
          category_id INTEGER NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          old_price REAL,
          power INTEGER,
          drive TEXT,
          transmission TEXT,
          engine_type TEXT,
          fuel_tank INTEGER,
          weight INTEGER,
          dimensions TEXT,
          warranty_years INTEGER DEFAULT 1,
          in_stock BOOLEAN DEFAULT 1,
          is_hit BOOLEAN DEFAULT 0,
          is_new BOOLEAN DEFAULT 0,
          image_url TEXT,
          specifications TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        );

        CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT,
          message TEXT,
          product_model TEXT,
          status TEXT DEFAULT 'new',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS delivery_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          city TEXT NOT NULL,
          product_model TEXT NOT NULL,
          phone TEXT NOT NULL,
          estimated_cost REAL,
          estimated_days TEXT,
          status TEXT DEFAULT 'new',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      fastify.log.info("✅ Таблицы созданы");

      // Вставка категорий
      const insertCategory = db.prepare(`
        INSERT INTO categories (name, slug, description)
        VALUES (?, ?, ?)
      `);

      const categories = [
        [
          "Минитрактора",
          "minitractory",
          "Компактные тракторы для дачи и небольших хозяйств",
        ],
        [
          "Навесное оборудование",
          "equipment",
          "Навесное оборудование для минитракторов",
        ],
        ["Запчасти", "parts", "Оригинальные запчасти DONGFENG"],
      ];

      categories.forEach((cat) => {
        insertCategory.run(...cat);
      });

      // Вставка товаров
      const insertProduct = db.prepare(`
        INSERT INTO products (
          name, slug, model, category_id, description, price, old_price,
          power, drive, transmission, engine_type, fuel_tank, weight,
          dimensions, warranty_years, in_stock, is_hit, is_new, image_url, specifications
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);

      const products = [
        [
          "Минитрактор DONGFENG DF-244",
          "df-244",
          "DF-244",
          1,
          "Надежный минитрактор для небольших хозяйств и дачных участков. Отличное соотношение цены и качества.",
          285000,
          null,
          24,
          "4x4",
          "8+8",
          "Дизельный, 3-цилиндровый",
          30,
          850,
          "2800x1300x1450",
          3,
          1,
          1,
          0,
          "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-244-main.jpg",
          JSON.stringify({
            engine: {
              type: "Дизельный",
              cylinders: 3,
              displacement: "1.5 л",
              cooling: "Водяное охлаждение",
              start: "Электростартер",
            },
            transmission: {
              type: "Механическая",
              gears: "8 вперед / 8 назад",
              clutch: "Сухое, однодисковое",
            },
            hydraulics: {
              lift_capacity: "600 кг",
              connections: "2 задних вывода",
            },
            dimensions: {
              length: "2800 мм",
              width: "1300 мм",
              height: "1450 мм",
              clearance: "300 мм",
            },
          }),
        ],
        [
          "Минитрактор DONGFENG DF-304",
          "df-304",
          "DF-304",
          1,
          "Мощный и производительный минитрактор для фермерских хозяйств. Новинка 2024 года с улучшенными характеристиками.",
          385000,
          420000,
          30,
          "4x4",
          "12+12",
          "Дизельный, 3-цилиндровый",
          40,
          950,
          "3000x1400x1500",
          3,
          1,
          0,
          1,
          "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-304-main.jpg",
          JSON.stringify({
            engine: {
              type: "Дизельный",
              cylinders: 3,
              displacement: "1.8 л",
              cooling: "Водяное охлаждение",
              start: "Электростартер",
            },
            transmission: {
              type: "Механическая",
              gears: "12 вперед / 12 назад",
              clutch: "Сухое, двухдисковое",
            },
            hydraulics: {
              lift_capacity: "800 кг",
              connections: "3 задних вывода",
            },
            dimensions: {
              length: "3000 мм",
              width: "1400 мм",
              height: "1500 мм",
              clearance: "320 мм",
            },
          }),
        ],
        [
          "Минитрактор DONGFENG DF-404",
          "df-404",
          "DF-404",
          1,
          "Профессиональный минитрактор повышенной мощности для интенсивной работы. Идеален для крупных участков.",
          485000,
          null,
          40,
          "4x4",
          "16+8",
          "Дизельный, 4-цилиндровый",
          50,
          1100,
          "3200x1500x1600",
          3,
          1,
          0,
          0,
          "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-404-main.jpg",
          JSON.stringify({
            engine: {
              type: "Дизельный",
              cylinders: 4,
              displacement: "2.2 л",
              cooling: "Водяное охлаждение",
              start: "Электростартер",
            },
            transmission: {
              type: "Механическая",
              gears: "16 вперед / 8 назад",
              clutch: "Сухое, двухдисковое усиленное",
            },
            hydraulics: {
              lift_capacity: "1000 кг",
              connections: "4 задних вывода + передний ВОМ",
            },
            dimensions: {
              length: "3200 мм",
              width: "1500 мм",
              height: "1600 мм",
              clearance: "350 мм",
            },
          }),
        ],
        [
          "Минитрактор DONGFENG DF-354",
          "df-354",
          "DF-354",
          1,
          "Универсальный минитрактор среднего класса. Оптимален для работы на участках до 5 гектаров.",
          435000,
          null,
          35,
          "4x4",
          "12+12",
          "Дизельный, 4-цилиндровый",
          45,
          1000,
          "3100x1450x1550",
          3,
          1,
          0,
          0,
          "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-354-main.jpg",
          JSON.stringify({
            engine: {
              type: "Дизельный",
              cylinders: 4,
              displacement: "2.0 л",
              cooling: "Водяное охлаждение",
              start: "Электростартер",
            },
            transmission: {
              type: "Механическая",
              gears: "12 вперед / 12 назад",
              clutch: "Сухое, двухдисковое",
            },
            hydraulics: {
              lift_capacity: "900 кг",
              connections: "3 задних вывода",
            },
            dimensions: {
              length: "3100 мм",
              width: "1450 мм",
              height: "1550 мм",
              clearance: "330 мм",
            },
          }),
        ],
      ];

      products.forEach((product) => {
        insertProduct.run(...product);
      });

      const stats = {
        categories: db
          .prepare("SELECT COUNT(*) as count FROM categories")
          .get(),
        products: db.prepare("SELECT COUNT(*) as count FROM products").get(),
      };

      fastify.log.info("✅ База данных успешно пересоздана!");

      return {
        success: true,
        message: "База данных успешно пересоздана",
        stats: {
          categories: stats.categories.count,
          products: stats.products.count,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при пересоздании базы данных",
      });
    }
  });
}
