export default function AboutPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#333" }}>О компании</h1>

      <div style={{ lineHeight: "1.8", color: "#555" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>БелТехФермЪ</h2>
          <p style={{ marginBottom: "15px" }}>
            Компания БелТехФермЪ — надежный поставщик качественной сельскохозяйственной и коммунальной техники.
            Мы специализируемся на продаже мини-тракторов, коммунальной техники и запасных частей.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Наши преимущества</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li style={{ marginBottom: "10px" }}>✓ Официальная гарантия на всю технику</li>
            <li style={{ marginBottom: "10px" }}>✓ Доставка по всей России</li>
            <li style={{ marginBottom: "10px" }}>✓ Собственный сервисный центр</li>
            <li style={{ marginBottom: "10px" }}>✓ Консультации опытных специалистов</li>
            <li style={{ marginBottom: "10px" }}>✓ Конкурентные цены</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Контактная информация</h2>
          <p style={{ marginBottom: "10px" }}>📞 Телефон: 8 (800) 555-99-99</p>
          <p style={{ marginBottom: "10px" }}>✉️ Email: info@beltehferm.ru</p>
          <p>📍 Адрес: г. Белгород</p>
        </section>
      </div>
    </div>
  );
}
