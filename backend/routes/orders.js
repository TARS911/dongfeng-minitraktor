import supabase from "../config/supabase.js";

export default async function orderRoutes(fastify, options) {
  // POST /api/orders - Создать новый заказ
  fastify.post(
    "/orders",
    {
      schema: {
        body: {
          type: "object",
          required: [
            "customer_name",
            "customer_phone",
            "delivery_city",
            "items",
          ],
          properties: {
            customer_name: { type: "string", minLength: 2, maxLength: 100 },
            customer_phone: { type: "string", minLength: 10, maxLength: 20 },
            customer_email: { type: "string", format: "email" },
            delivery_address: { type: "string", maxLength: 500 },
            delivery_city: { type: "string", minLength: 2, maxLength: 100 },
            notes: { type: "string", maxLength: 1000 },
            items: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["product_id", "quantity"],
                properties: {
                  product_id: { type: "integer" },
                  quantity: { type: "integer", minimum: 1 },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const transaction = db.transaction((orderData) => {
        try {
          const {
            customer_name,
            customer_phone,
            customer_email,
            delivery_address,
            delivery_city,
            notes,
            items,
          } = orderData;

          // Генерируем номер заказа
          const order_number = `DF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

          // Получаем товары и считаем общую сумму
          let total_amount = 0;
          const orderItems = [];

          for (const item of items) {
            const product = db
              .prepare(
                "SELECT id, name, model, price, in_stock FROM products WHERE id = ?",
              )
              .get(item.product_id);

            if (!product) {
              throw new Error(`Товар с ID ${item.product_id} не найден`);
            }

            if (!product.in_stock) {
              throw new Error(`Товар "${product.name}" нет в наличии`);
            }

            const subtotal = product.price * item.quantity;
            total_amount += subtotal;

            orderItems.push({
              product_id: product.id,
              product_name: product.name,
              product_model: product.model,
              price: product.price,
              quantity: item.quantity,
              subtotal: subtotal,
            });
          }

          // Создаем заказ
          const insertOrder = db.prepare(`
          INSERT INTO orders (
            order_number, customer_name, customer_phone, customer_email,
            delivery_address, delivery_city, total_amount, notes, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
        `);

          const orderResult = insertOrder.run(
            order_number,
            customer_name,
            customer_phone,
            customer_email || null,
            delivery_address || null,
            delivery_city,
            total_amount,
            notes || null,
          );

          const order_id = orderResult.lastInsertRowid;

          // Добавляем товары в заказ
          const insertItem = db.prepare(`
          INSERT INTO order_items (
            order_id, product_id, product_name, product_model, price, quantity, subtotal
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

          for (const item of orderItems) {
            insertItem.run(
              order_id,
              item.product_id,
              item.product_name,
              item.product_model,
              item.price,
              item.quantity,
              item.subtotal,
            );
          }

          return {
            order_id,
            order_number,
            total_amount,
            items_count: orderItems.length,
          };
        } catch (error) {
          throw error;
        }
      });

      try {
        const result = transaction(request.body);

        fastify.log.info(`Новый заказ создан: ${result.order_number}`);

        return {
          success: true,
          message:
            "Заказ успешно создан! Мы свяжемся с вами в ближайшее время.",
          data: result,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(400).send({
          success: false,
          error: error.message || "Ошибка при создании заказа",
        });
      }
    },
  );

  // GET /api/orders/:id - Получить заказ по ID
  fastify.get("/orders/:id", async (request, reply) => {
    try {
      const { id } = request.params;

      const order = db
        .prepare(
          `
        SELECT * FROM orders WHERE id = ?
      `,
        )
        .get(id);

      if (!order) {
        return reply.code(404).send({
          success: false,
          error: "Заказ не найден",
        });
      }

      const items = db
        .prepare(
          `
        SELECT * FROM order_items WHERE order_id = ?
      `,
        )
        .all(id);

      return {
        success: true,
        data: {
          ...order,
          items,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении заказа",
      });
    }
  });

  // GET /api/orders/number/:order_number - Получить заказ по номеру
  fastify.get("/orders/number/:order_number", async (request, reply) => {
    try {
      const { order_number } = request.params;

      const order = db
        .prepare(
          `
        SELECT * FROM orders WHERE order_number = ?
      `,
        )
        .get(order_number);

      if (!order) {
        return reply.code(404).send({
          success: false,
          error: "Заказ не найден",
        });
      }

      const items = db
        .prepare(
          `
        SELECT * FROM order_items WHERE order_id = ?
      `,
        )
        .all(order.id);

      return {
        success: true,
        data: {
          ...order,
          items,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении заказа",
      });
    }
  });

  // GET /api/orders - Получить все заказы (для админки)
  fastify.get("/orders", async (request, reply) => {
    try {
      const { status, limit = 50, offset = 0 } = request.query;

      let query = "SELECT * FROM orders WHERE 1=1";
      const params = [];

      if (status) {
        query += " AND status = ?";
        params.push(status);
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const orders = db.prepare(query).all(...params);
      const { total } = db
        .prepare("SELECT COUNT(*) as total FROM orders")
        .get();

      return {
        success: true,
        data: orders,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении заказов",
      });
    }
  });

  // PATCH /api/orders/:id/status - Обновить статус заказа (для админки)
  fastify.patch(
    "/orders/:id/status",
    {
      schema: {
        body: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: [
                "new",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { status } = request.body;

        const update = db.prepare(`
        UPDATE orders
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

        const result = update.run(status, id);

        if (result.changes === 0) {
          return reply.code(404).send({
            success: false,
            error: "Заказ не найден",
          });
        }

        fastify.log.info(`Статус заказа ${id} изменен на ${status}`);

        return {
          success: true,
          message: "Статус заказа обновлен",
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          error: "Ошибка при обновлении статуса",
        });
      }
    },
  );
}
