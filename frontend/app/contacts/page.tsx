export default function ContactsPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#333" }}>Контакты</h1>

      <div style={{ lineHeight: "1.8", color: "#555" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Свяжитесь с нами</h2>
          <p style={{ marginBottom: "15px" }}>
            Наши специалисты готовы ответить на все ваши вопросы и помочь с выбором техники.
          </p>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "30px", marginBottom: "40px" }}>
          <section style={{ padding: "25px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#0066cc" }}>📞 Телефон</h2>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#333", marginBottom: "10px" }}>
              8 (800) 555-99-99
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>Бесплатный звонок по России</p>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              Ежедневно с 8:00 до 20:00
            </p>
          </section>

          <section style={{ padding: "25px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#0066cc" }}>✉️ Email</h2>
            <p style={{ fontSize: "18px", marginBottom: "5px" }}>
              <a href="mailto:info@beltehferm.ru" style={{ color: "#0066cc", textDecoration: "none" }}>
                info@beltehferm.ru
              </a>
            </p>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>Общие вопросы</p>
            <p style={{ fontSize: "18px", marginBottom: "5px" }}>
              <a href="mailto:sales@beltehferm.ru" style={{ color: "#0066cc", textDecoration: "none" }}>
                sales@beltehferm.ru
              </a>
            </p>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "10px" }}>Отдел продаж</p>
            <p style={{ fontSize: "18px", marginBottom: "5px" }}>
              <a href="mailto:service@beltehferm.ru" style={{ color: "#0066cc", textDecoration: "none" }}>
                service@beltehferm.ru
              </a>
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>Сервисный центр</p>
          </section>

          <section style={{ padding: "25px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h2 style={{ fontSize: "20px", marginBottom: "15px", color: "#0066cc" }}>📍 Адрес</h2>
            <p style={{ fontSize: "16px", marginBottom: "10px" }}>г. Белгород</p>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
              Точный адрес уточняйте по телефону
            </p>
            <p style={{ fontSize: "14px", color: "#666" }}>
              <strong>Режим работы офиса:</strong><br />
              Пн-Пт: 8:00 - 18:00<br />
              Сб: 9:00 - 15:00<br />
              Вс: выходной
            </p>
          </section>
        </div>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>💬 Мессенджеры</h2>
          <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 20px",
                background: "#25D366",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "500"
              }}
            >
              WhatsApp
            </a>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 20px",
                background: "#0088cc",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "500"
              }}
            >
              Telegram
            </a>
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 20px",
                background: "#0077ff",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontWeight: "500"
              }}
            >
              VK
            </a>
          </div>
        </section>

        <section style={{ padding: "25px", background: "#e3f2fd", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Регионы обслуживания</h2>
          <p style={{ marginBottom: "10px" }}>Мы работаем по всей России, с особым вниманием к регионам:</p>
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            <li>Белгородская область</li>
            <li>Курская область</li>
            <li>Орловская область</li>
            <li>Воронежская область</li>
            <li>Брянская область</li>
            <li>Тульская область</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
