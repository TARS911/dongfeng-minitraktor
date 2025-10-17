/**
 * Email уведомления
 * Отправка заявок на почту через nodemailer
 */

import nodemailer from 'nodemailer';

/**
 * Создать транспорт для отправки писем
 * @returns {nodemailer.Transporter|null}
 */
function createTransport() {
  const EMAIL_HOST = process.env.EMAIL_HOST;
  const EMAIL_PORT = process.env.EMAIL_PORT || 587;
  const EMAIL_USER = process.env.EMAIL_USER;
  const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

  // Если настройки не заданы - пропускаем
  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASSWORD) {
    console.warn('⚠️  Email не настроен. Пропускаем отправку.');
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT == 465, // true для 465, false для других портов
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });
}

/**
 * Отправить email
 * @param {string} subject - Тема письма
 * @param {string} html - HTML содержимое
 * @returns {Promise<boolean>}
 */
export async function sendEmail(subject, html) {
  const transporter = createTransport();

  if (!transporter) {
    return false;
  }

  const EMAIL_TO = process.env.EMAIL_TO || process.env.EMAIL_USER;

  try {
    const info = await transporter.sendMail({
      from: `"DONGFENG Сайт" <${process.env.EMAIL_USER}>`,
      to: EMAIL_TO,
      subject: subject,
      html: html,
    });

    console.log('✅ Email отправлен:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Ошибка при отправке email:', error.message);
    return false;
  }
}

/**
 * Форматировать заявку "Обратная связь" для Email
 * @param {Object} data - Данные заявки
 * @param {number} id - ID заявки в БД
 * @returns {string} - HTML письмо
 */
export function formatContactEmail(data, id) {
  const { name, phone, email, message, product_model } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #2a9d4e;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 0 0 8px 8px;
    }
    .field {
      margin-bottom: 15px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .label {
      font-weight: bold;
      color: #2a9d4e;
      margin-bottom: 5px;
    }
    .value {
      color: #333;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">🔔 Новая заявка с сайта #${id}</h2>
    <p style="margin: 5px 0 0 0;">DONGFENG Минитрактора</p>
  </div>

  <div class="content">
    <div class="field">
      <div class="label">👤 Имя клиента:</div>
      <div class="value">${name}</div>
    </div>

    <div class="field">
      <div class="label">📞 Телефон:</div>
      <div class="value"><a href="tel:${phone}">${phone}</a></div>
    </div>

    ${email ? `
    <div class="field">
      <div class="label">📧 Email:</div>
      <div class="value"><a href="mailto:${email}">${email}</a></div>
    </div>
    ` : ''}

    ${product_model ? `
    <div class="field">
      <div class="label">🚜 Интересующая модель:</div>
      <div class="value">${product_model}</div>
    </div>
    ` : ''}

    ${message ? `
    <div class="field">
      <div class="label">💬 Сообщение:</div>
      <div class="value">${message.replace(/\n/g, '<br>')}</div>
    </div>
    ` : ''}

    <div class="field">
      <div class="label">⏰ Время поступления:</div>
      <div class="value">${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}</div>
    </div>
  </div>

  <div class="footer">
    <p>Заявка получена с сайта: <a href="https://dongfeng-minitraktor.onrender.com">dongfeng-minitraktor.onrender.com</a></p>
    <p>Это автоматическое уведомление</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Форматировать запрос "Расчет доставки" для Email
 * @param {Object} data - Данные запроса
 * @param {number} id - ID запроса в БД
 * @returns {string} - HTML письмо
 */
export function formatDeliveryEmail(data, id) {
  const { city, product_model, phone, estimated_cost, estimated_days } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: #ff9800;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 0 0 8px 8px;
    }
    .field {
      margin-bottom: 15px;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .label {
      font-weight: bold;
      color: #ff9800;
      margin-bottom: 5px;
    }
    .value {
      color: #333;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .highlight {
      background: #fff3e0;
      padding: 15px;
      border-left: 4px solid #ff9800;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin: 0;">🚚 Запрос расчета доставки #${id}</h2>
    <p style="margin: 5px 0 0 0;">DONGFENG Минитрактора</p>
  </div>

  <div class="content">
    <div class="field">
      <div class="label">📞 Телефон клиента:</div>
      <div class="value"><a href="tel:${phone}">${phone}</a></div>
    </div>

    <div class="field">
      <div class="label">📍 Город доставки:</div>
      <div class="value">${city}</div>
    </div>

    <div class="field">
      <div class="label">🚜 Модель трактора:</div>
      <div class="value">${product_model}</div>
    </div>

    <div class="highlight">
      <div style="margin-bottom: 10px;">
        <strong>💰 Примерная стоимость:</strong> ${estimated_cost.toLocaleString('ru-RU')} ₽
      </div>
      <div>
        <strong>⏱ Примерный срок:</strong> ${estimated_days} дней
      </div>
    </div>

    <div class="field">
      <div class="label">⏰ Время запроса:</div>
      <div class="value">${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}</div>
    </div>
  </div>

  <div class="footer">
    <p>Запрос получен с сайта: <a href="https://dongfeng-minitraktor.onrender.com">dongfeng-minitraktor.onrender.com</a></p>
    <p>Это автоматическое уведомление. Свяжитесь с клиентом для уточнения деталей.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Отправить уведомление о новой заявке "Обратная связь"
 * @param {Object} data - Данные заявки
 * @param {number} id - ID заявки в БД
 * @returns {Promise<boolean>}
 */
export async function notifyNewContact(data, id) {
  const subject = `🔔 Новая заявка #${id} - ${data.name}`;
  const html = formatContactEmail(data, id);
  return await sendEmail(subject, html);
}

/**
 * Отправить уведомление о расчете доставки
 * @param {Object} data - Данные запроса
 * @param {number} id - ID запроса в БД
 * @returns {Promise<boolean>}
 */
export async function notifyDeliveryRequest(data, id) {
  const subject = `🚚 Расчет доставки #${id} - ${data.city}`;
  const html = formatDeliveryEmail(data, id);
  return await sendEmail(subject, html);
}
