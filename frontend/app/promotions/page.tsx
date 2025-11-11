export default function PromotionsPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#333" }}>Акции и спецпредложения</h1>

      <div style={{ lineHeight: "1.8", color: "#555" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Актуальные акции</h2>
          <p style={{ marginBottom: "15px" }}>
            Следите за нашими специальными предложениями! Мы регулярно проводим акции и предлагаем выгодные условия
            на покупку техники и запасных частей.
          </p>
        </section>

        <section style={{ marginBottom: "30px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>🎁 Сезонная распродажа</h3>
          <p style={{ marginBottom: "10px" }}>Скидки до 15% на выбранные модели мини-тракторов</p>
          <p style={{ fontSize: "14px", color: "#666" }}>Срок действия: уточняйте у менеджеров</p>
        </section>

        <section style={{ marginBottom: "30px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>🔧 Бесплатное ТО</h3>
          <p style={{ marginBottom: "10px" }}>Первое техническое обслуживание в подарок при покупке техники</p>
          <p style={{ fontSize: "14px", color: "#666" }}>Условия: при покупке нового трактора</p>
        </section>

        <section style={{ marginBottom: "30px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>💰 Рассрочка 0%</h3>
          <p style={{ marginBottom: "10px" }}>Беспроцентная рассрочка на 6 месяцев</p>
          <p style={{ fontSize: "14px", color: "#666" }}>Условия: минимальная сумма покупки от 200 000 руб.</p>
        </section>

        <section>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Узнать подробности</h2>
          <p style={{ marginBottom: "10px" }}>📞 Телефон: 8 (800) 555-99-99</p>
          <p style={{ marginBottom: "10px" }}>✉️ Email: info@beltehferm.ru</p>
          <p style={{ marginTop: "20px", padding: "15px", background: "#e3f2fd", borderRadius: "8px" }}>
            💡 Подпишитесь на наши новости, чтобы первыми узнавать о новых акциях и специальных предложениях!
          </p>
        </section>
      </div>
    </div>
  );
}
