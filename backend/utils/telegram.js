/**
 * Telegram уведомления
 * Отправка заявок в Telegram через Bot API
 */

/**
 * Отправить сообщение в Telegram
 * @param {string} message - Текст сообщения
 * @returns {Promise<boolean>} - Успешность отправки
 */
export async function sendTelegramMessage(message) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Если токен или chat_id не настроены - пропускаем отправку
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('⚠️  Telegram не настроен. Пропускаем отправку.');
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Сообщение отправлено в Telegram');
      return true;
    } else {
      console.error('❌ Ошибка Telegram API:', data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Ошибка при отправке в Telegram:', error.message);
    return false;
  }
}

/**
 * Форматировать заявку "Обратная связь" для Telegram
 * @param {Object} data - Данные заявки
 * @param {number} id - ID заявки в БД
 * @returns {string} - Форматированное сообщение
 */
export function formatContactMessage(data, id) {
  const { name, phone, email, message, product_model } = data;

  return `
🔔 <b>НОВАЯ ЗАЯВКА #${id}</b>

👤 <b>Имя:</b> ${name}
📞 <b>Телефон:</b> ${phone}
${email ? `📧 <b>Email:</b> ${email}\n` : ''}${product_model ? `🚜 <b>Модель:</b> ${product_model}\n` : ''}${message ? `💬 <b>Сообщение:</b>\n${message}\n` : ''}
⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}

<i>Сайт: dongfeng-minitraktor.onrender.com</i>
`.trim();
}

/**
 * Форматировать запрос "Расчет доставки" для Telegram
 * @param {Object} data - Данные запроса
 * @param {number} id - ID запроса в БД
 * @returns {string} - Форматированное сообщение
 */
export function formatDeliveryMessage(data, id) {
  const { city, product_model, phone, estimated_cost, estimated_days } = data;

  return `
🚚 <b>РАСЧЕТ ДОСТАВКИ #${id}</b>

👤 <b>Телефон:</b> ${phone}
📍 <b>Город:</b> ${city}
🚜 <b>Модель:</b> ${product_model}

💰 <b>Примерная стоимость:</b> ${estimated_cost} ₽
⏱ <b>Примерный срок:</b> ${estimated_days} дней

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}

<i>Сайт: dongfeng-minitraktor.onrender.com</i>
`.trim();
}

/**
 * Отправить уведомление о новой заявке "Обратная связь"
 * @param {Object} data - Данные заявки
 * @param {number} id - ID заявки в БД
 * @returns {Promise<boolean>}
 */
export async function notifyNewContact(data, id) {
  const message = formatContactMessage(data, id);
  return await sendTelegramMessage(message);
}

/**
 * Отправить уведомление о расчете доставки
 * @param {Object} data - Данные запроса
 * @param {number} id - ID запроса в БД
 * @returns {Promise<boolean>}
 */
export async function notifyDeliveryRequest(data, id) {
  const message = formatDeliveryMessage(data, id);
  return await sendTelegramMessage(message);
}
