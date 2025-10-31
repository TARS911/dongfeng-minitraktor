import { supabase } from "../config/supabase.js";

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
      try {
        const {
          customer_name,
          customer_phone,
          customer_email,
          delivery_address,
          delivery_city,
          notes,
          items,
        } = request.body;

        // Генерируем номер заказа
        const order_number = `DF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

        // Получаем товары и считаем общую сумму
        let total_amount = 0;
        const orderItems = [];

        for (const item of items) {
          const { data: product, error: productError } = await supabase
            .from("products")
            .select("id, name, model, price, in_stock")
            .eq("id", item.product_id)
            .single();

          if (productError || !product) {
            return reply.code(400).send({
              success: false,
              error: `Товар с ID ${item.product_id} не найден`,
            });
          }

          if (!product.in_stock) {
            return reply.code(400).send({
              success: false,
              error: `Товар "${product.name}" нет в наличии`,
            });
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
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .insert({
            order_number,
            customer_name,
            customer_phone,
            customer_email: customer_email || null,
            delivery_address: delivery_address || null,
            delivery_city,
            total_amount,
            notes: notes || null,
            status: "new",
          })
          .select()
          .single();

        if (orderError) {
          throw orderError;
        }

        // Добавляем товары в заказ
        const itemsToInsert = orderItems.map((item) => ({
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product_name,
          product_model: item.product_model,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal,
        }));

        const { error: itemsError } = await supabase
          .from("order_items")
          .insert(itemsToInsert);

        if (itemsError) {
          // Откатываем заказ если не удалось добавить товары
          await supabase.from("orders").delete().eq("id", order.id);
          throw itemsError;
        }

        fastify.log.info(`Новый заказ создан: ${order.order_number}`);

        return {
          success: true,
          message:
            "Заказ успешно создан! Мы свяжемся с вами в ближайшее время.",
          data: {
            order_id: order.id,
            order_number: order.order_number,
            total_amount,
            items_count: orderItems.length,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
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

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({
          success: false,
          error: "Заказ не найден",
        });
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (itemsError) {
        throw itemsError;
      }

      return {
        success: true,
        data: {
          ...order,
          items: items || [],
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

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", order_number)
        .single();

      if (orderError || !order) {
        return reply.code(404).send({
          success: false,
          error: "Заказ не найден",
        });
      }

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (itemsError) {
        throw itemsError;
      }

      return {
        success: true,
        data: {
          ...order,
          items: items || [],
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

      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data: orders, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: orders || [],
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

        const { data, error } = await supabase
          .from("orders")
          .update({ status, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();

        if (error || !data) {
          return reply.code(404).send({
            success: false,
            error: "Заказ не найден",
          });
        }

        fastify.log.info(`Статус заказа ${id} изменен на ${status}`);

        return {
          success: true,
          message: "Статус заказа обновлен",
          data,
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
