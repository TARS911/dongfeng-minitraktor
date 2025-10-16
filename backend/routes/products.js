import db from '../config/database.js';

export default async function productRoutes(fastify, options) {

  // GET /api/products - Получить все товары с фильтрацией
  fastify.get('/products', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          category: { type: 'string' },
          in_stock: { type: 'boolean' },
          is_hit: { type: 'boolean' },
          is_new: { type: 'boolean' },
          min_price: { type: 'integer' },
          max_price: { type: 'integer' },
          search: { type: 'string' },
          sort_by: { type: 'string', enum: ['price_asc', 'price_desc', 'power_asc', 'power_desc', 'newest'] },
          limit: { type: 'integer', default: 100 },
          offset: { type: 'integer', default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const {
        category,
        in_stock,
        is_hit,
        is_new,
        min_price,
        max_price,
        search,
        sort_by = 'newest',
        limit = 100,
        offset = 0
      } = request.query;

      let query = `
        SELECT
          p.*,
          c.name as category_name,
          c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      const params = [];

      // Фильтры
      if (category) {
        query += ' AND c.slug = ?';
        params.push(category);
      }

      if (in_stock !== undefined) {
        query += ' AND p.in_stock = ?';
        params.push(in_stock ? 1 : 0);
      }

      if (is_hit !== undefined) {
        query += ' AND p.is_hit = ?';
        params.push(is_hit ? 1 : 0);
      }

      if (is_new !== undefined) {
        query += ' AND p.is_new = ?';
        params.push(is_new ? 1 : 0);
      }

      if (min_price) {
        query += ' AND p.price >= ?';
        params.push(min_price);
      }

      if (max_price) {
        query += ' AND p.price <= ?';
        params.push(max_price);
      }

      if (search) {
        query += ' AND (p.name LIKE ? OR p.model LIKE ? OR p.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Сортировка
      switch (sort_by) {
        case 'price_asc':
          query += ' ORDER BY p.price ASC';
          break;
        case 'price_desc':
          query += ' ORDER BY p.price DESC';
          break;
        case 'power_asc':
          query += ' ORDER BY p.power ASC';
          break;
        case 'power_desc':
          query += ' ORDER BY p.power DESC';
          break;
        case 'newest':
        default:
          query += ' ORDER BY p.created_at DESC';
      }

      // Pagination
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const products = db.prepare(query).all(...params);

      // Парсим JSON поля
      const processedProducts = products.map(p => ({
        ...p,
        specifications: p.specifications ? JSON.parse(p.specifications) : null,
        in_stock: Boolean(p.in_stock),
        is_hit: Boolean(p.is_hit),
        is_new: Boolean(p.is_new)
      }));

      // Общее количество для пагинации
      let countQuery = `
        SELECT COUNT(*) as total
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE 1=1
      `;
      const countParams = params.slice(0, params.length - 2); // Убираем LIMIT и OFFSET

      const { total } = db.prepare(countQuery).get(...countParams.slice(0, -2));

      return {
        success: true,
        data: processedProducts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Ошибка при получении товаров'
      });
    }
  });

  // GET /api/products/:slug - Получить один товар
  fastify.get('/products/:slug', async (request, reply) => {
    try {
      const { slug } = request.params;

      const product = db.prepare(`
        SELECT
          p.*,
          c.name as category_name,
          c.slug as category_slug
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.slug = ?
      `).get(slug);

      if (!product) {
        return reply.code(404).send({
          success: false,
          error: 'Товар не найден'
        });
      }

      // Парсим JSON поля
      const processedProduct = {
        ...product,
        specifications: product.specifications ? JSON.parse(product.specifications) : null,
        in_stock: Boolean(product.in_stock),
        is_hit: Boolean(product.is_hit),
        is_new: Boolean(product.is_new)
      };

      return {
        success: true,
        data: processedProduct
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Ошибка при получении товара'
      });
    }
  });

  // GET /api/categories - Получить все категории
  fastify.get('/categories', async (request, reply) => {
    try {
      const categories = db.prepare(`
        SELECT
          c.*,
          COUNT(p.id) as products_count
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id AND p.in_stock = 1
        GROUP BY c.id
        ORDER BY c.id
      `).all();

      return {
        success: true,
        data: categories
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Ошибка при получении категорий'
      });
    }
  });

}
