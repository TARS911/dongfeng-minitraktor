/**
 * Admin routes - управление базой данных
 */

import { supabase } from "../config/supabase.js";

export default async function adminRoutes(fastify, options) {
  // POST /api/admin/rebuild-db - Пересоздать базу данных (seeding)
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

      fastify.log.info("🔄 Пересоздание базы данных (seeding)...");

      // Удаляем все существующие данные (осторожно!)
      await supabase.from("order_items").delete().neq("id", 0);
      await supabase.from("orders").delete().neq("id", 0);
      await supabase.from("delivery_requests").delete().neq("id", 0);
      await supabase.from("contacts").delete().neq("id", 0);
      await supabase.from("products").delete().neq("id", 0);
      await supabase.from("categories").delete().neq("id", 0);

      fastify.log.info("✅ Старые данные удалены");

      // Вставка категорий
      const categories = [
        {
          name: "Минитрактора",
          slug: "minitractory",
          description: "Компактные тракторы для дачи и небольших хозяйств",
        },
        {
          name: "Навесное оборудование",
          slug: "equipment",
          description: "Навесное оборудование для минитракторов",
        },
        {
          name: "Запчасти",
          slug: "parts",
          description: "Оригинальные запчасти DONGFENG",
        },
      ];

      const { data: insertedCategories, error: catError } = await supabase
        .from("categories")
        .insert(categories)
        .select();

      if (catError) throw catError;

      fastify.log.info(`✅ Создано ${insertedCategories.length} категорий`);

      // Получаем ID первой категории (Минитрактора)
      const categoryId = insertedCategories.find(
        (c) => c.slug === "minitractory",
      ).id;

      // Вставка товаров
      const products = [
        {
          name: "Минитрактор DONGFENG DF-244",
          slug: "df-244",
          model: "DF-244",
          category_id: categoryId,
          description:
            "Надежный минитрактор для небольших хозяйств и дачных участков. Отличное соотношение цены и качества.",
          price: 285000,
          old_price: null,
          power: 24,
          drive: "4x4",
          transmission: "8+8",
          engine_type: "Дизельный, 3-цилиндровый",
          fuel_tank: 30,
          weight: 850,
          dimensions: "2800x1300x1450",
          warranty_years: 3,
          in_stock: true,
          is_hit: true,
          is_new: false,
          image_url:
            "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-244-main.jpg",
          specifications: {
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
          },
        },
        {
          name: "Минитрактор DONGFENG DF-304",
          slug: "df-304",
          model: "DF-304",
          category_id: categoryId,
          description:
            "Мощный и производительный минитрактор для фермерских хозяйств. Новинка 2024 года с улучшенными характеристиками.",
          price: 385000,
          old_price: 420000,
          power: 30,
          drive: "4x4",
          transmission: "12+12",
          engine_type: "Дизельный, 3-цилиндровый",
          fuel_tank: 40,
          weight: 950,
          dimensions: "3000x1400x1500",
          warranty_years: 3,
          in_stock: true,
          is_hit: false,
          is_new: true,
          image_url:
            "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-304-main.jpg",
          specifications: {
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
          },
        },
        {
          name: "Минитрактор DONGFENG DF-404",
          slug: "df-404",
          model: "DF-404",
          category_id: categoryId,
          description:
            "Профессиональный минитрактор повышенной мощности для интенсивной работы. Идеален для крупных участков.",
          price: 485000,
          old_price: null,
          power: 40,
          drive: "4x4",
          transmission: "16+8",
          engine_type: "Дизельный, 4-цилиндровый",
          fuel_tank: 50,
          weight: 1100,
          dimensions: "3200x1500x1600",
          warranty_years: 3,
          in_stock: true,
          is_hit: false,
          is_new: false,
          image_url:
            "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-404-main.jpg",
          specifications: {
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
          },
        },
        {
          name: "Минитрактор DONGFENG DF-354",
          slug: "df-354",
          model: "DF-354",
          category_id: categoryId,
          description:
            "Универсальный минитрактор среднего класса. Оптимален для работы на участках до 5 гектаров.",
          price: 435000,
          old_price: null,
          power: 35,
          drive: "4x4",
          transmission: "12+12",
          engine_type: "Дизельный, 4-цилиндровый",
          fuel_tank: 45,
          weight: 1000,
          dimensions: "3100x1450x1550",
          warranty_years: 3,
          in_stock: true,
          is_hit: false,
          is_new: false,
          image_url:
            "https://cdn.jsdelivr.net/gh/TARS911/dongfeng-minitraktor@main/frontend/images/df-354-main.jpg",
          specifications: {
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
          },
        },
      ];

      const { data: insertedProducts, error: prodError } = await supabase
        .from("products")
        .insert(products)
        .select();

      if (prodError) throw prodError;

      fastify.log.info(`✅ Создано ${insertedProducts.length} товаров`);

      // Получаем статистику
      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      fastify.log.info("✅ База данных успешно пересоздана!");

      return {
        success: true,
        message: "База данных успешно пересоздана",
        stats: {
          categories: categoriesCount || 0,
          products: productsCount || 0,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при пересоздании базы данных: " + error.message,
      });
    }
  });

  // GET /api/admin/stats - Получить статистику
  fastify.get("/stats", async (request, reply) => {
    try {
      const { count: categoriesCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      const { count: ordersCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      const { count: contactsCount } = await supabase
        .from("contacts")
        .select("*", { count: "exact", head: true });

      return {
        success: true,
        data: {
          categories: categoriesCount || 0,
          products: productsCount || 0,
          orders: ordersCount || 0,
          contacts: contactsCount || 0,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении статистики",
      });
    }
  });
}
