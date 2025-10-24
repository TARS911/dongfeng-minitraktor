import supabase from "../config/supabase.js";
import * as telegram from "../utils/telegram.js";
import * as email from "../utils/email.js";

export default async function formRoutes(fastify, options) {
  // POST /api/contact - Форма обратной связи
  fastify.post(
    "/contact",
    {
      schema: {
        body: {
          type: "object",
          required: ["name", "phone"],
          properties: {
            name: { type: "string", minLength: 2, maxLength: 100 },
            phone: { type: "string", minLength: 10, maxLength: 20 },
            email: { type: "string", format: "email" },
            message: { type: "string", maxLength: 1000 },
            product_model: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, phone, email, message, product_model } = request.body;

        const { data, error } = await supabase
          .from("contacts")
          .insert({
            name,
            phone,
            email: email || null,
            message: message || null,
            product_model: product_model || null,
            status: "new",
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        fastify.log.info(`Новая заявка от ${name}, ID: ${data.id}`);

        // Отправляем уведомления (не блокируем ответ)
        const requestData = { name, phone, email, message, product_model };
        Promise.all([
          telegram.notifyNewContact(requestData, data.id),
          email.notifyNewContact(requestData, data.id),
        ]).catch((err) =>
          fastify.log.error("Ошибка при отправке уведомлений:", err),
        );

        return {
          success: true,
          message: "Ваша заявка принята! Мы свяжемся с вами в ближайшее время.",
          data: {
            id: data.id,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          error: "Ошибка при отправке заявки",
        });
      }
    },
  );

  // POST /api/delivery-calculator - Калькулятор доставки
  fastify.post(
    "/delivery-calculator",
    {
      schema: {
        body: {
          type: "object",
          required: ["city", "product_model", "phone"],
          properties: {
            city: { type: "string", minLength: 2, maxLength: 100 },
            product_model: { type: "string", minLength: 2, maxLength: 50 },
            phone: { type: "string", minLength: 10, maxLength: 20 },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { city, product_model, phone } = request.body;

        // Простой расчет доставки (можно усложнить логику)
        const deliveryCosts = {
          москва: { cost: 3000, days: "1-2" },
          "санкт-петербург": { cost: 5000, days: "2-3" },
          екатеринбург: { cost: 8000, days: "5-7" },
          новосибирск: { cost: 10000, days: "7-10" },
          казань: { cost: 6000, days: "3-5" },
          "нижний новгород": { cost: 5000, days: "3-4" },
          default: { cost: 7000, days: "5-10" },
        };

        const cityLower = city.toLowerCase().trim();
        const delivery = deliveryCosts[cityLower] || deliveryCosts["default"];

        // Сохраняем запрос в БД
        const { data, error } = await supabase
          .from("delivery_requests")
          .insert({
            city,
            product_model,
            phone,
            estimated_cost: delivery.cost,
            estimated_days: delivery.days,
            status: "new",
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        fastify.log.info(`Расчет доставки в ${city}, модель ${product_model}`);

        // Отправляем уведомления (не блокируем ответ)
        const requestData = {
          city,
          product_model,
          phone,
          estimated_cost: delivery.cost,
          estimated_days: delivery.days,
        };
        Promise.all([
          telegram.notifyDeliveryRequest(requestData, data.id),
          email.notifyDeliveryRequest(requestData, data.id),
        ]).catch((err) =>
          fastify.log.error("Ошибка при отправке уведомлений:", err),
        );

        return {
          success: true,
          message: "Расчет доставки выполнен",
          data: {
            city,
            product_model,
            estimated_cost: delivery.cost,
            estimated_days: delivery.days,
            request_id: data.id,
            note: "Точную стоимость и сроки уточнит менеджер при звонке",
          },
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({
          success: false,
          error: "Ошибка при расчете доставки",
        });
      }
    },
  );

  // GET /api/contacts - Получить все заявки (для админки)
  fastify.get("/contacts", async (request, reply) => {
    try {
      const { status, limit = 50, offset = 0 } = request.query;

      let query = supabase
        .from("contacts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data: contacts, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: contacts,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении заявок",
      });
    }
  });

  // GET /api/delivery-requests - Получить все запросы на доставку (для админки)
  fastify.get("/delivery-requests", async (request, reply) => {
    try {
      const { status, limit = 50, offset = 0 } = request.query;

      let query = supabase
        .from("delivery_requests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq("status", status);
      }

      const { data: requests, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: requests,
        pagination: {
          total: count || 0,
          limit,
          offset,
        },
      };
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: "Ошибка при получении запросов",
      });
    }
  });
}
