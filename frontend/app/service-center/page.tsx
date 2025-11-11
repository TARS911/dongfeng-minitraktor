export default function ServiceCenterPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#333" }}>Сервисный Центр</h1>

      <div style={{ lineHeight: "1.8", color: "#555" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>О нашем сервисном центре</h2>
          <p style={{ marginBottom: "15px" }}>
            Сервисный центр БелТехФермЪ оснащен современным оборудованием и укомплектован квалифицированными специалистами.
            Мы выполняем полный спектр работ по техническому обслуживанию и ремонту сельскохозяйственной техники.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Виды работ</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginBottom: "20px" }}>
            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#0066cc" }}>⚙️ Диагностика</h3>
              <p style={{ fontSize: "14px" }}>Компьютерная и визуальная диагностика всех систем техники</p>
            </div>

            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#0066cc" }}>🔧 Ремонт</h3>
              <p style={{ fontSize: "14px" }}>Капитальный и текущий ремонт двигателей, трансмиссий, гидросистем</p>
            </div>

            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#0066cc" }}>🛠️ ТО</h3>
              <p style={{ fontSize: "14px" }}>Регулярное техническое обслуживание по регламенту производителя</p>
            </div>

            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#0066cc" }}>⚡ Электрика</h3>
              <p style={{ fontSize: "14px" }}>Ремонт электрооборудования, стартеров, генераторов</p>
            </div>

            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#0066cc" }}>💧 Гидравлика</h3>
              <p style={{ fontSize: "14px" }}>Ремонт и настройка гидравлических систем</p>
            </div>

            <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "18px", marginBottom: "10px", color: "#0066cc" }}>🔩 Сварка</h3>
              <p style={{ fontSize: "14px" }}>Сварочные работы любой сложности</p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Наши преимущества</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li style={{ marginBottom: "10px" }}>✓ Квалифицированные мастера с опытом работы от 5 лет</li>
            <li style={{ marginBottom: "10px" }}>✓ Современное диагностическое оборудование</li>
            <li style={{ marginBottom: "10px" }}>✓ Оригинальные запчасти на складе</li>
            <li style={{ marginBottom: "10px" }}>✓ Гарантия на все виды работ</li>
            <li style={{ marginBottom: "10px" }}>✓ Выездное обслуживание</li>
            <li style={{ marginBottom: "10px" }}>✓ Доступные цены</li>
          </ul>
        </section>

        <section style={{ marginBottom: "30px", padding: "20px", background: "#e3f2fd", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Запись на обслуживание</h2>
          <p style={{ marginBottom: "15px" }}>
            Для записи в сервисный центр свяжитесь с нами по телефону или оставьте заявку на сайте.
            Мы подберем удобное для вас время.
          </p>
          <p style={{ marginBottom: "10px" }}>📞 Телефон: 8 (800) 555-99-99</p>
          <p style={{ marginBottom: "10px" }}>✉️ Email: service@beltehferm.ru</p>
          <p style={{ marginBottom: "10px" }}>⏰ Режим работы: Пн-Пт 8:00-18:00, Сб 9:00-15:00</p>
          <p>📍 Адрес: г. Белгород</p>
        </section>

        <section>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Гарантия качества</h2>
          <p style={{ marginBottom: "15px" }}>
            Мы предоставляем гарантию на все выполненные работы и установленные запасные части.
            В случае возникновения проблем, мы оперативно устраним их в рамках гарантийных обязательств.
          </p>
        </section>
      </div>
    </div>
  );
}
