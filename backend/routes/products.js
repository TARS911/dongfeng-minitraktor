import { supabase } from "../config/supabase.js";

export default async function productRoutes(fastify, options) {
  // GET /api/products - Получить все товары с фильтрацией
  fastify.get(
    "/products",
    {
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
                "price_asc",
                "price_desc",
                "power_asc",
                "power_desc",
                "newest",
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

        // Начинаем запрос с JOIN
        let query = supabase.from("products").select(
          `
          *,
          categories!inner(name, slug)
        `,
          { count: "exact" },
        );

        // Фильтры
        if (category) {
          query = query.eq("categories.slug", category);
        }

        if (in_stock !== undefined) {
          query = query.eq("in_stock", in_stock);
        }

        if (is_hit !== undefined) {
          query = query.eq("is_hit", is_hit);
        }

        if (is_new !== undefined) {
          query = query.eq("is_new", is_new);
        }

        if (min_price) {
          query = query.gte("price", min_price);
        }

        if (max_price) {
          query = query.lte("price", max_price);
        }

        if (search) {
          query = query.or(
            `name.ilike.%${search}%,model.ilike.%${search}%,description.ilike.%${search}%`,
          );
        }

        // Сортировка
        switch (sort_by) {
          case "price_asc":
            query = query.order("price", { ascending: true });
            break;
          case "price_desc":
            query = query.order("price", { ascending: false });
            break;
          case "power_asc":
            query = query.order("power", { ascending: true });
            break;
          case "power_desc":
            query = query.order("power", { ascending: false });
            break;
          case "newest":
          default:
            query = query.order("created_at", { ascending: false });
        }

        // Pagination
        query = query.range(offset, offset + limit - 1);

        const { data: products, error, count } = await query;

        if (error) {
          throw error;
        }

        // Преобразуем данные для совместимости с фронтендом
        const processedProducts = products.map((p) => ({
          ...p,
          category_name: p.categories?.name || null,
          category_slug: p.categories?.slug || null,
          categories: undefined, // Убираем вложенный объект
        }));

        return {
          success: true,
          data: processedProducts,
          pagination: {
            total: count || 0,
            limit,
            offset,
            hasMore: offset + limit < (count || 0),
          },
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          error: "Ошибка при получении товаров",
        });
      }
    },
  );

  // GET /api/products/:slug - Получить один товар
  fastify.get("/products/:slug", async (request, reply) => {
    try {
      const { slug } = request.params;

      const { data: product, error } = await supabase
        .from("products")
        .select(
          `
          *,
          categories(name, slug)
        `,
        )
        .eq("slug", slug)
        .single();

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
        categories: undefined,
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

  // GET /api/categories - Получить все категории
  fastify.get("/categories", async (request, reply) => {
    try {
      // Получаем категории
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("id");

      if (categoriesError) {
        throw categoriesError;
      }

      // Для каждой категории считаем товары в наличии
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
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
