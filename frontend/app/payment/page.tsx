export default function PaymentPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#333" }}>Оплата</h1>

      <div style={{ lineHeight: "1.8", color: "#555" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Способы оплаты</h2>
          <p style={{ marginBottom: "15px" }}>
            Мы предлагаем удобные и безопасные способы оплаты для вашего комфорта:
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Доступные варианты</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li style={{ marginBottom: "10px" }}>💳 Банковские карты (Visa, MasterCard, МИР)</li>
            <li style={{ marginBottom: "10px" }}>💰 Наличный расчет в офисе или при получении</li>
            <li style={{ marginBottom: "10px" }}>🏦 Безналичный расчет для юридических лиц</li>
            <li style={{ marginBottom: "10px" }}>📱 Электронные платежные системы</li>
            <li style={{ marginBottom: "10px" }}>📋 Рассрочка и кредит (по согласованию)</li>
          </ul>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Безопасность платежей</h2>
          <p style={{ marginBottom: "15px" }}>
            Все онлайн-платежи проходят через защищенное соединение. Мы гарантируем безопасность ваших данных
            и конфиденциальность информации.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Документы</h2>
          <p style={{ marginBottom: "15px" }}>
            После оплаты вы получите все необходимые документы:
          </p>
          <ul style={{ paddingLeft: "20px" }}>
            <li style={{ marginBottom: "10px" }}>Кассовый чек</li>
            <li style={{ marginBottom: "10px" }}>Договор купли-продажи</li>
            <li style={{ marginBottom: "10px" }}>Гарантийный талон</li>
            <li style={{ marginBottom: "10px" }}>Инструкция по эксплуатации</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Вопросы по оплате</h2>
          <p style={{ marginBottom: "10px" }}>📞 Телефон: 8 (800) 555-99-99</p>
          <p style={{ marginBottom: "10px" }}>✉️ Email: info@beltehferm.ru</p>
        </section>
      </div>
    </div>
  );
}
