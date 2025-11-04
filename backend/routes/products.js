/**
 * PRODUCTS ROUTES - МАРШРУТЫ ТОВАРОВ
 *
 * API endpoints для работы с товарами и категориями.
 *
 * Endpoints:
 * - GET /api/products - Список товаров с фильтрацией и поиском
 * - GET /api/products/:slug - Один товар по slug
 * - GET /api/categories - Список категорий с количеством товаров
 *
 * База данных: Supabase (PostgreSQL)
 *
 * @author DONGFENG Team
 * @version 2.0.0
 */

import { supabase } from "../config/supabase.js";

/**
 * Регистрирует маршруты для работы с товарами
 * @param {FastifyInstance} fastify - Инстанс Fastify
 * @param {Object} options - Опции (например, prefix)
 */
export default async function productRoutes(fastify, options) {
  // ============================================
  // GET /api/products - СПИСОК ТОВАРОВ
  // ============================================
  /**
   * Получить список товаров с фильтрацией, поиском и сортировкой.
   *
   * Query параметры:
   * @param {string} category - Фильтр по категории (slug)
   * @param {boolean} in_stock - Только в наличии
   * @param {boolean} is_hit - Только хиты продаж
   * @param {boolean} is_new - Только новинки
   * @param {number} min_price - Минимальная цена
   * @param {number} max_price - Максимальная цена
   * @param {string} search - Поиск по названию/модели/описанию
   * @param {string} sort_by - Сортировка: price_asc, price_desc, power_asc, power_desc, newest
   * @param {number} limit - Количество товаров на странице (default: 100)
   * @param {number} offset - Смещение для пагинации (default: 0)
   *
   * @returns {Object} - { success, data, pagination }
   *
   * Примеры:
   * - GET /api/products?in_stock=true - Все товары в наличии
   * - GET /api/products?category=minitraktory&sort_by=price_asc - Минитрактора по возрастанию цены
   * - GET /api/products?search=dongfeng&is_hit=true - Хиты с поиском по "dongfeng"
   */
  fastify.get(
    "/products",
    {
      // Схема валидации query параметров
      schema: {
        querystring: {
          type: "object",
          properties: {
            category: { type: "string" },
            in_stock: { type: "boolean" },
            is_hit: { type: "boolean" },
            is_new: { type: "boolean" },
            min_price: { type: "integer" },
            max_price: { type: "integer" },
            search: { type: "string" },
            sort_by: {
              type: "string",
              enum: [
                "price_asc", // Цена: дешевле → дороже
                "price_desc", // Цена: дороже → дешевле
                "power_asc", // Мощность: слабее → мощнее
                "power_desc", // Мощность: мощнее → слабее
                "newest", // Новые → старые (по created_at)
              ],
            },
            limit: { type: "integer", default: 100 },
            offset: { type: "integer", default: 0 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        // Извлекаем query параметры с дефолтными значениями
        const {
          category,
          in_stock,
          is_hit,
          is_new,
          min_price,
          max_price,
          search,
          sort_by = "newest",
          limit = 100,
          offset = 0,
        } = request.query;

        // ========================================
        // ПОСТРОЕНИЕ ЗАПРОСА К SUPABASE
        // ========================================

        /**
         * Начинаем запрос с JOIN к таблице categories.
         *
         * SELECT products.*, categories.name, categories.slug
         * FROM products
         * INNER JOIN categories ON products.category_id = categories.id
         *
         * { count: "exact" } - для подсчета общего количества товаров
         */
        let query = supabase.from("products").select(
          `
          *,
          categories!inner(name, slug)
        `,
          { count: "exact" }, // Включаем подсчет общего кол-ва
        );

        // ========================================
        // ФИЛЬТРАЦИЯ
        // ========================================

        // Фильтр по категории (slug категории)
        if (category) {
          query = query.eq("categories.slug", category);
        }

        // Фильтр: только в наличии
        if (in_stock !== undefined) {
          query = query.eq("in_stock", in_stock);
        }

        // Фильтр: только хиты продаж
        if (is_hit !== undefined) {
          query = query.eq("is_hit", is_hit);
        }

        // Фильтр: только новинки
        if (is_new !== undefined) {
          query = query.eq("is_new", is_new);
        }

        // Фильтр: минимальная цена (price >= min_price)
        if (min_price) {
          query = query.gte("price", min_price);
        }

        // Фильтр: максимальная цена (price <= max_price)
        if (max_price) {
          query = query.lte("price", max_price);
        }

        // Поиск по названию, модели или описанию (регистронезависимый)
        if (search) {
          query = query.or(
            `name.ilike.%${search}%,model.ilike.%${search}%,description.ilike.%${search}%`,
          );
        }

        // ========================================
        // СОРТИРОВКА
        // ========================================

        switch (sort_by) {
          case "price_asc":
            // Сортировка по цене: дешевые сначала
            query = query.order("price", { ascending: true });
            break;
          case "price_desc":
            // Сортировка по цене: дорогие сначала
            query = query.order("price", { ascending: false });
            break;
          case "power_asc":
            // Сортировка по мощности: слабые сначала
            query = query.order("power", { ascending: true });
            break;
          case "power_desc":
            // Сортировка по мощности: мощные сначала
            query = query.order("power", { ascending: false });
            break;
          case "newest":
          default:
            // Сортировка по дате создания: новые сначала
            query = query.order("created_at", { ascending: false });
        }

        // ========================================
        // ПАГИНАЦИЯ
        // ========================================

        /**
         * range(offset, offset + limit - 1)
         *
         * Примеры:
         * - range(0, 9) → первые 10 товаров (limit=10, offset=0)
         * - range(10, 19) → следующие 10 товаров (limit=10, offset=10)
         * - range(20, 29) → следующие 10 товаров (limit=10, offset=20)
         */
        query = query.range(offset, offset + limit - 1);

        // Выполняем запрос
        const { data: products, error, count } = await query;

        if (error) {
          throw error;
        }

        // ========================================
        // ОБРАБОТКА ДАННЫХ
        // ========================================

        /**
         * Преобразуем данные для совместимости с фронтендом.
         *
         * Было:
         * {
         *   id: 1,
         *   name: "DONGFENG DF-244",
         *   categories: { name: "Минитрактора", slug: "minitraktory" }
         * }
         *
         * Стало:
         * {
         *   id: 1,
         *   name: "DONGFENG DF-244",
         *   category_name: "Минитрактора",
         *   category_slug: "minitraktory"
         * }
         */
        const processedProducts = products.map((p) => ({
          ...p,
          category_name: p.categories?.name || null,
          category_slug: p.categories?.slug || null,
          categories: undefined, // Убираем вложенный объект
        }));

        // Возвращаем успешный ответ
        return {
          success: true,
          data: processedProducts,
          pagination: {
            total: count || 0,
            limit,
            offset,
            hasMore: offset + limit < (count || 0), // Есть ли еще товары
          },
        };
      } catch (error) {
        // Логируем ошибку
        fastify.log.error(error);

        // Возвращаем ошибку клиенту
        reply.code(500).send({
          success: false,
          error: "Ошибка при получении товаров",
        });
      }
    },
  );

  // ============================================
  // GET /api/products/:slug - ОДИН ТОВАР
  // ============================================
  /**
   * Получить подробную информацию об одном товаре по slug.
   *
   * @param {string} slug - URL-friendly идентификатор товара
   *
   * @returns {Object} - { success, data }
   *
   * Примеры:
   * - GET /api/products/df-244-s-kabinoy
   * - GET /api/products/dongfeng-354
   *
   * Возвращает 404 если товар не найден.
   */
  fastify.get("/products/:slug", async (request, reply) => {
    try {
      const { slug } = request.params;

      // Запрос одного товара с JOIN к категории
      const { data: product, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories(name, slug)
        `,
        )
        .eq("slug", slug) // Фильтр по slug
        .single(); // Возвращаем один объект, а не массив

      // Если товар не найден
      if (error || !product) {
        return reply.code(404).send({
          success: false,
          error: "Товар не найден",
        });
      }

      // Преобразуем данные для совместимости с фронтендом
      const processedProduct = {
        ...product,
        category_name: product.categories?.name || null,
        category_slug: product.categories?.slug || null,
        categories: undefined, // Убираем вложенный объект
      };

      return {
        success: true,
        data: processedProduct,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении товара",
      });
    }
  });

  // ============================================
  // GET /api/categories - СПИСОК КАТЕГОРИЙ
  // ============================================
  /**
   * Получить список всех категорий с количеством товаров в наличии.
   *
   * @returns {Object} - { success, data }
   *
   * Пример ответа:
   * {
   *   success: true,
   *   data: [
   *     {
   *       id: 1,
   *       name: "Минитрактора",
   *       slug: "minitraktory",
   *       description: "...",
   *       products_count: 8  // Количество товаров в наличии
   *     },
   *     ...
   *   ]
   * }
   *
   * Используется для:
   * - Фильтров каталога
   * - Меню категорий
   * - Показа количества товаров в каждой категории
   */
  fastify.get("/categories", async (request, reply) => {
    try {
      // Получаем все категории
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("id"); // Сортировка по ID (порядок создания)

      if (categoriesError) {
        throw categoriesError;
      }

      // Для каждой категории считаем товары в наличии
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          // Подсчет товаров: только in_stock = true
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true }) // head: true → не возвращать данные, только count
            .eq("category_id", category.id)
            .eq("in_stock", true);

          return {
            ...category,
            products_count: count || 0,
          };
        }),
      );

      return {
        success: true,
        data: categoriesWithCount,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении категорий",
      });
    }
  });
}
