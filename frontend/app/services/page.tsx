export default function ServicesPage() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "20px", color: "#333" }}>Услуги</h1>

      <div style={{ lineHeight: "1.8", color: "#555" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Наши услуги</h2>
          <p style={{ marginBottom: "15px" }}>
            БелТехФермЪ предлагает полный спектр услуг по обслуживанию и ремонту сельскохозяйственной техники.
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Основные услуги</h2>

          <div style={{ marginBottom: "20px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>🔧 Техническое обслуживание</h3>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Регулярное ТО</li>
              <li>Замена масла и фильтров</li>
              <li>Диагностика систем</li>
              <li>Проверка всех узлов и агрегатов</li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>🛠️ Ремонт техники</h3>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Ремонт двигателей</li>
              <li>Ремонт трансмиссии</li>
              <li>Ремонт гидравлики</li>
              <li>Электроремонт</li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>🎓 Обучение операторов</h3>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Обучение работе с техникой</li>
              <li>Инструктаж по технике безопасности</li>
              <li>Консультации по эксплуатации</li>
            </ul>
          </div>

          <div style={{ marginBottom: "20px", padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>🚚 Выездной сервис</h3>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Выезд специалиста на место</li>
              <li>Диагностика на месте</li>
              <li>Мелкий ремонт на выезде</li>
            </ul>
          </div>

          <div style={{ padding: "20px", background: "#f8f9fa", borderRadius: "8px" }}>
            <h3 style={{ fontSize: "20px", marginBottom: "10px", color: "#0066cc" }}>📦 Поставка запчастей</h3>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Оригинальные запчасти</li>
              <li>Быстрая доставка</li>
              <li>Гарантия качества</li>
            </ul>
          </div>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Гарантии</h2>
          <p style={{ marginBottom: "15px" }}>
            На все выполненные работы и установленные запчасти предоставляется гарантия.
            Мы используем только качественные материалы и запасные части.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "24px", marginBottom: "15px", color: "#0066cc" }}>Заказать услугу</h2>
          <p style={{ marginBottom: "10px" }}>📞 Телефон: 8 (800) 555-99-99</p>
          <p style={{ marginBottom: "10px" }}>✉️ Email: info@beltehferm.ru</p>
          <p style={{ marginBottom: "10px" }}>⏰ Режим работы: Ежедневно с 8:00 до 20:00</p>
        </section>
      </div>
    </div>
  );
}
