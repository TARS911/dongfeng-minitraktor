import db from '../config/database.js';

export default async function formRoutes(fastify, options) {

  // POST /api/contact - Форма обратной связи
  fastify.post('/contact', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'phone'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100 },
          phone: { type: 'string', minLength: 10, maxLength: 20 },
          email: { type: 'string', format: 'email' },
          message: { type: 'string', maxLength: 1000 },
          product_model: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name, phone, email, message, product_model } = request.body;

      const insert = db.prepare(`
        INSERT INTO contacts (name, phone, email, message, product_model, status)
        VALUES (?, ?, ?, ?, ?, 'new')
      `);

      const result = insert.run(
        name,
        phone,
        email || null,
        message || null,
        product_model || null
      );

      fastify.log.info(`Новая заявка от ${name}, ID: ${result.lastInsertRowid}`);

      return {
        success: true,
        message: 'Ваша заявка принята! Мы свяжемся с вами в ближайшее время.',
        data: {
          id: result.lastInsertRowid
        }
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Ошибка при отправке заявки'
      });
    }
  });

  // POST /api/delivery-calculator - Калькулятор доставки
  fastify.post('/delivery-calculator', {
    schema: {
      body: {
        type: 'object',
        required: ['city', 'product_model', 'phone'],
        properties: {
          city: { type: 'string', minLength: 2, maxLength: 100 },
          product_model: { type: 'string', minLength: 2, maxLength: 50 },
          phone: { type: 'string', minLength: 10, maxLength: 20 }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { city, product_model, phone } = request.body;

      // Простой расчет доставки (можно усложнить логику)
      const deliveryCosts = {
        'москва': { cost: 3000, days: '1-2' },
        'санкт-петербург': { cost: 5000, days: '2-3' },
        'екатеринбург': { cost: 8000, days: '5-7' },
        'новосибирск': { cost: 10000, days: '7-10' },
        'казань': { cost: 6000, days: '3-5' },
        'нижний новгород': { cost: 5000, days: '3-4' },
        'default': { cost: 7000, days: '5-10' }
      };

      const cityLower = city.toLowerCase().trim();
      const delivery = deliveryCosts[cityLower] || deliveryCosts['default'];

      // Сохраняем запрос в БД
      const insert = db.prepare(`
        INSERT INTO delivery_requests (city, product_model, phone, estimated_cost, estimated_days, status)
        VALUES (?, ?, ?, ?, ?, 'new')
      `);

      const result = insert.run(
        city,
        product_model,
        phone,
        delivery.cost,
        delivery.days
      );

      fastify.log.info(`Расчет доставки в ${city}, модель ${product_model}`);

      return {
        success: true,
        message: 'Расчет доставки выполнен',
        data: {
          city,
          product_model,
          estimated_cost: delivery.cost,
          estimated_days: delivery.days,
          request_id: result.lastInsertRowid,
          note: 'Точную стоимость и сроки уточнит менеджер при звонке'
        }
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Ошибка при расчете доставки'
      });
    }
  });

  // GET /api/contacts - Получить все заявки (для админки)
  fastify.get('/contacts', async (request, reply) => {
    try {
      const { status, limit = 50, offset = 0 } = request.query;

      let query = 'SELECT * FROM contacts WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const contacts = db.prepare(query).all(...params);
      const { total } = db.prepare('SELECT COUNT(*) as total FROM contacts').get();

      return {
        success: true,
        data: contacts,
        pagination: {
          total,
          limit,
          offset
        }
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Ошибка при получении заявок'
      });
    }
  });

  // GET /api/delivery-requests - Получить все запросы на доставку (для админки)
  fastify.get('/delivery-requests', async (request, reply) => {
    try {
      const { status, limit = 50, offset = 0 } = request.query;

      let query = 'SELECT * FROM delivery_requests WHERE 1=1';
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const requests = db.prepare(query).all(...params);
      const { total } = db.prepare('SELECT COUNT(*) as total FROM delivery_requests').get();

      return {
        success: true,
        data: requests,
        pagination: {
          total,
          limit,
          offset
        }
      };

    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send({
        success: false,
        error: 'Ошибка при получении запросов'
      });
    }
  });

}
