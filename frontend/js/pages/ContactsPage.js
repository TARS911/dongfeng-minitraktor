/**
 * CONTACTS PAGE - Страница контактов
 */

import { API_URL } from '../config.js';

export const ContactsPage = {
  async render() {
    return `
      <section class="contacts-page">
        <div class="container">
          <h1>Контакты</h1>

          <div class="contacts-grid">
            <div class="contacts-info">
              <h3>Наш офис</h3>
              <p><strong>Адрес:</strong> г. Москва, ул. Примерная, д. 123</p>
              <p><strong>Телефон:</strong> <a href="tel:+78001234567">+7 (800) 123-45-67</a></p>
              <p><strong>Email:</strong> <a href="mailto:info@dongfeng.ru">info@dongfeng.ru</a></p>
              <p><strong>Режим работы:</strong> Пн-Пт: 9:00-18:00, Сб-Вс: выходной</p>
            </div>

            <div class="contact-form">
              <h3>Отправить сообщение</h3>
              <form id="contact-form">
                <input type="text" name="name" placeholder="Ваше имя*" required>
                <input type="tel" name="phone" placeholder="Телефон*" required>
                <input type="email" name="email" placeholder="Email">
                <textarea name="message" placeholder="Сообщение" rows="5"></textarea>
                <button type="submit" class="btn btn-primary">Отправить</button>
              </form>
            </div>
          </div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const form = document.getElementById('contact-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
          const response = await fetch(`${API_URL}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });

          const result = await response.json();

          if (result.success) {
            alert('Сообщение отправлено!');
            form.reset();
          } else {
            alert('Ошибка отправки');
          }
        } catch (error) {
          console.error(error);
          alert('Ошибка отправки');
        }
      });
    }
  }
};
