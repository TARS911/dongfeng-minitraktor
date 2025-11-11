export default function DeliveryPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#333" }}>Доставка</h1>

      <div style={{ lineHeight: "1.8", color: "#555" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Условия доставки</h2>
          <p style={{ marginBottom: "15px" }}>
            Мы осуществляем доставку техники по всей территории России. Доставка производится транспортными компаниями
            или собственным транспортом компании.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Регионы доставки</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li style={{ marginBottom: "10px" }}>Белгород и Белгородская область</li>
            <li style={{ marginBottom: "10px" }}>Курск и Курская область</li>
            <li style={{ marginBottom: "10px" }}>Орёл и Орловская область</li>
            <li style={{ marginBottom: "10px" }}>Воронеж и Воронежская область</li>
            <li style={{ marginBottom: "10px" }}>Брянск и Брянская область</li>
            <li style={{ marginBottom: "10px" }}>Тула и Тульская область</li>
            <li style={{ marginBottom: "10px" }}>Другие регионы России (по согласованию)</li>
          </ul>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Стоимость доставки</h2>
          <p style={{ marginBottom: "15px" }}>
            Стоимость доставки рассчитывается индивидуально в зависимости от региона и габаритов техники.
            Для уточнения стоимости свяжитесь с нашими менеджерами.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Контакты для оформления доставки</h2>
          <p style={{ marginBottom: "10px" }}>📞 Телефон: 8 (800) 555-99-99</p>
          <p style={{ marginBottom: "10px" }}>✉️ Email: info@beltehferm.ru</p>
          <p style={{ marginBottom: "10px" }}>⏰ Режим работы: Ежедневно с 8:00 до 20:00</p>
        </section>
      </div>
    </div>
  );
}
