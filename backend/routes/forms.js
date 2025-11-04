/**
 * FORMS ROUTES - МАРШРУТЫ ФОРМ
 *
 * API endpoints для работы с формами обратной связи и калькулятором доставки.
 *
 * Endpoints:
 * - POST /api/contact - Форма обратной связи
 * - POST /api/delivery-calculator - Калькулятор доставки
 * - GET /api/contacts - Список заявок (админка)
 * - GET /api/delivery-requests - Список запросов доставки (админка)
 *
 * Функциональность:
 * - Сохранение заявок в Supabase
 * - Отправка уведомлений в Telegram
 * - Отправка email уведомлений
 * - Расчет стоимости доставки по городам
 *
 * @author DONGFENG Team
 * @version 2.0.0
 */

import { supabase } from "../config/supabase.js";
import * as telegram from "../utils/telegram.js";
import * as email from "../utils/email.js";

/**
 * Регистрирует маршруты для работы с формами
 * @param {FastifyInstance} fastify - Инстанс Fastify
 * @param {Object} options - Опции (например, prefix)
 */
export default async function formRoutes(fastify, options) {
  // ============================================
  // POST /api/contact - ФОРМА ОБРАТНОЙ СВЯЗИ
  // ============================================
  /**
   * Обработка формы обратной связи.
   *
   * Клиент может отправить заявку на:
   * - Консультацию
   * - Обратный звонок
   * - Вопрос о товаре
   * - Общий вопрос
   *
   * Процесс:
   * 1. Валидация данных (Fastify schema)
   * 2. Сохранение в БД (таблица contacts)
   * 3. Отправка уведомлений в Telegram и Email (асинхронно)
   * 4. Возврат подтверждения клиенту
   *
   * @param {string} name - Имя клиента (обязательно, 2-100 символов)
   * @param {string} phone - Телефон (обязательно, 10-20 символов)
   * @param {string} email - Email (опционально)
   * @param {string} message - Сообщение (опционально, до 1000 символов)
   * @param {string} product_model - Модель товара (опционально)
   *
   * @returns {Object} - { success, message, data: { id } }
   *
   * Пример запроса:
   * POST /api/contact
   * {
   *   "name": "Иван Петров",
   *   "phone": "+79991234567",
   *   "email": "ivan@example.com",
   *   "message": "Интересует трактор DONGFENG DF-244",
   *   "product_model": "DF-244"
   * }
   */
  fastify.post(
    "/contact",
    {
      // Схема валидации body
      schema: {
        body: {
          type: "object",
          required: ["name", "phone"], // Обязательные поля
          properties: {
            name: {
              type: "string",
              minLength: 2, // Минимум 2 символа
              maxLength: 100, // Максимум 100 символов
            },
            phone: {
              type: "string",
              minLength: 10, // Минимум 10 цифр
              maxLength: 20, // Максимум 20 символов (с кодом страны)
            },
            email: {
              type: "string",
              format: "email", // Валидация email формата
            },
            message: {
              type: "string",
              maxLength: 1000, // Ограничение на длину сообщения
            },
            product_model: {
              type: "string", // Модель товара, о котором спрашивают
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, phone, email, message, product_model } = request.body;

        // ========================================
        // СОХРАНЕНИЕ В БАЗУ ДАННЫХ
        // ========================================

        /**
         * Вставляем новую заявку в таблицу contacts.
         *
         * Поля:
         * - name, phone, email, message, product_model - данные клиента
         * - status: "new" - начальный статус (потом можно изменить на "processed", "closed")
         * - created_at - автоматически добавляется Supabase
         *
         * .select().single() - возвращаем вставленную запись
         */
        const { data, error } = await supabase
          .from("contacts")
          .insert({
            name,
            phone,
            email: email || null, // null если не указан
            message: message || null, // null если не указано
            product_model: product_model || null,
            status: "new", // Начальный статус
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Логируем успешное сохранение
        fastify.log.info(`Новая заявка от ${name}, ID: ${data.id}`);

        // ========================================
        // ОТПРАВКА УВЕДОМЛЕНИЙ (АСИНХРОННО)
        // ========================================

        /**
         * Отправляем уведомления в Telegram и Email.
         *
         * Promise.all - выполняем параллельно (быстрее)
         * .catch() - перехватываем ошибки, но не блокируем ответ клиенту
         *
         * Важно: Уведомления НЕ блокируют ответ клиенту!
         * Даже если Telegram/Email недоступны, клиент получит успешный ответ.
         */
        const requestData = { name, phone, email, message, product_model };
        Promise.all([
          telegram.notifyNewContact(requestData, data.id),
          email.notifyNewContact(requestData, data.id),
        ]).catch((err) =>
          fastify.log.error("Ошибка при отправке уведомлений:", err),
        );

        // Возвращаем успешный ответ клиенту
        return {
          success: true,
          message: "Ваша заявка принята! Мы свяжемся с вами в ближайшее время.",
          data: {
            id: data.id, // ID заявки для отслеживания
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

  // ============================================
  // POST /api/delivery-calculator - КАЛЬКУЛЯТОР ДОСТАВКИ
  // ============================================
  /**
   * Расчет стоимости и сроков доставки.
   *
   * Клиент вводит:
   * - Город доставки
   * - Модель товара
   * - Телефон для связи
   *
   * Получает примерную стоимость и сроки.
   * Менеджер потом уточнит детали при звонке.
   *
   * @param {string} city - Город доставки (обязательно)
   * @param {string} product_model - Модель товара (обязательно)
   * @param {string} phone - Телефон для связи (обязательно)
   *
   * @returns {Object} - { success, message, data: { estimated_cost, estimated_days, ... } }
   *
   * Пример запроса:
   * POST /api/delivery-calculator
   * {
   *   "city": "Москва",
   *   "product_model": "DONGFENG DF-244",
   *   "phone": "+79991234567"
   * }
   */
  fastify.post(
    "/delivery-calculator",
    {
      // Схема валидации body
      schema: {
        body: {
          type: "object",
          required: ["city", "product_model", "phone"],
          properties: {
            city: {
              type: "string",
              minLength: 2,
              maxLength: 100,
            },
            product_model: {
              type: "string",
              minLength: 2,
              maxLength: 50,
            },
            phone: {
              type: "string",
              minLength: 10,
              maxLength: 20,
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { city, product_model, phone } = request.body;

        // ========================================
        // РАСЧЕТ СТОИМОСТИ ДОСТАВКИ
        // ========================================

        /**
         * Простая таблица стоимости доставки по городам.
         *
         * В реальном проекте можно:
         * - Интегрировать с API транспортных компаний (СДЭК, ПЭК)
         * - Учитывать вес и габариты товара
         * - Рассчитывать расстояние через API карт
         * - Добавить страховку и доп. услуги
         *
         * Формат:
         * {
         *   "город": { cost: цена_в_рублях, days: "сроки_в_днях" }
         * }
         */
        const deliveryCosts = {
          москва: { cost: 3000, days: "1-2" },
          "санкт-петербург": { cost: 5000, days: "2-3" },
          екатеринбург: { cost: 8000, days: "5-7" },
          новосибирск: { cost: 10000, days: "7-10" },
          казань: { cost: 6000, days: "3-5" },
          "нижний новгород": { cost: 5000, days: "3-4" },
          default: { cost: 7000, days: "5-10" }, // Для остальных городов
        };

        // Нормализуем название города (lowercase, trim)
        const cityLower = city.toLowerCase().trim();

        // Получаем стоимость или используем default
        const delivery = deliveryCosts[cityLower] || deliveryCosts["default"];

        // ========================================
        // СОХРАНЕНИЕ В БАЗУ ДАННЫХ
        // ========================================

        /**
         * Сохраняем запрос на расчет доставки.
         * Менеджер потом может:
         * - Просмотреть все запросы в админке
         * - Позвонить клиенту для уточнения
         * - Обновить статус заявки
         */
        const { data, error } = await supabase
          .from("delivery_requests")
          .insert({
            city,
            product_model,
            phone,
            estimated_cost: delivery.cost, // Расчетная стоимость
            estimated_days: delivery.days, // Расчетные сроки
            status: "new", // Начальный статус
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Логируем расчет
        fastify.log.info(`Расчет доставки в ${city}, модель ${product_model}`);

        // ========================================
        // ОТПРАВКА УВЕДОМЛЕНИЙ (АСИНХРОННО)
        // ========================================

        /**
         * Уведомляем менеджеров о новом запросе на расчет доставки.
         * Асинхронно, не блокируем ответ клиенту.
         */
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

        // Возвращаем расчет клиенту
        return {
          success: true,
          message: "Расчет доставки выполнен",
          data: {
            city,
            product_model,
            estimated_cost: delivery.cost, // Примерная стоимость
            estimated_days: delivery.days, // Примерные сроки
            request_id: data.id, // ID заявки
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

  // ============================================
  // GET /api/contacts - СПИСОК ЗАЯВОК (АДМИНКА)
  // ============================================
  /**
   * Получить список всех заявок обратной связи.
   *
   * Используется в админ-панели для:
   * - Просмотра всех заявок
   * - Фильтрации по статусу
   * - Пагинации
   *
   * Query параметры:
   * @param {string} status - Фильтр по статусу: "new", "processed", "closed"
   * @param {number} limit - Количество заявок на странице (default: 50)
   * @param {number} offset - Смещение для пагинации (default: 0)
   *
   * @returns {Object} - { success, data, pagination }
   *
   * Примеры:
   * - GET /api/contacts - Все заявки
   * - GET /api/contacts?status=new - Только новые
   * - GET /api/contacts?limit=20&offset=40 - Страница 3 (по 20 шт)
   */
  fastify.get("/contacts", async (request, reply) => {
    try {
      const { status, limit = 50, offset = 0 } = request.query;

      // Базовый запрос с подсчетом и сортировкой
      let query = supabase
        .from("contacts")
        .select("*", { count: "exact" }) // Подсчет общего кол-ва
        .order("created_at", { ascending: false }) // Новые сначала
        .range(offset, offset + limit - 1); // Пагинация

      // Фильтр по статусу (если указан)
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

  // ============================================
  // GET /api/delivery-requests - СПИСОК ЗАПРОСОВ ДОСТАВКИ (АДМИНКА)
  // ============================================
  /**
   * Получить список всех запросов на расчет доставки.
   *
   * Используется в админ-панели для:
   * - Просмотра всех запросов
   * - Фильтрации по статусу
   * - Пагинации
   *
   * Query параметры аналогичны /api/contacts
   *
   * @returns {Object} - { success, data, pagination }
   */
  fastify.get("/delivery-requests", async (request, reply) => {
    try {
      const { status, limit = 50, offset = 0 } = request.query;

      // Базовый запрос
      let query = supabase
        .from("delivery_requests")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Фильтр по статусу
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
