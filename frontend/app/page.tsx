import Header from './components/Header';
import { supabase } from './lib/supabase';
import styles from './page.module.css';

export default async function Home() {
  // Загружаем товары из Supabase
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('in_stock', true)
    .limit(4);

  return (
    <>
      <Header />

      <main className={styles.main}>
        {/* CATEGORIES SCROLL */}
        <div className={styles.categoriesScroll}>
          <div className={styles.categoryChip}>Все</div>
          <div className={styles.categoryChip}>Тракторы</div>
          <div className={styles.categoryChip}>Навесное</div>
          <div className={styles.categoryChip}>Запчасти</div>
          <div className={styles.categoryChip}>Акции</div>
        </div>

        {/* BANNER */}
        <div className={styles.banner}>
          <h1>Техника для фермеров</h1>
          <p>Белгород • Курск • Орёл • Воронеж • Брянск • Тула</p>
          <a href="#" className={styles.bannerBtn}>
            Смотреть каталог
          </a>
        </div>

        {/* PRODUCTS */}
        <h2 className={styles.sectionTitle}>Популярные модели</h2>
        <div className={styles.productsGrid}>
          {products && products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImage}>
                  🚜
                  {product.is_new && (
                    <div className={styles.productBadge}>НОВИНКА</div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <div className={styles.productTitle}>{product.name}</div>
                  <div className={styles.productSpecs}>
                    {product.power && (
                      <div>
                        <span>Мощность</span>
                        <span>{product.power} л.с.</span>
                      </div>
                    )}
                    {product.drive && (
                      <div>
                        <span>Привод</span>
                        <span>{product.drive}</span>
                      </div>
                    )}
                    {product.transmission && (
                      <div>
                        <span>Коробка</span>
                        <span>{product.transmission}</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.productPrice}>
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className={styles.productActions}>
                    <button className={styles.btnBuy}>В корзину</button>
                    <button className={styles.btnDetails}>→</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>Загрузка товаров...</p>
          )}
        </div>

        {/* INFO BLOCKS */}
        <h2 className={styles.sectionTitle}>Наши преимущества</h2>
        <div className={styles.infoBlocks}>
          <div className={styles.infoBlock}>
            <div className={styles.infoIcon}>💰</div>
            <h3>Лучшая цена</h3>
            <p>Работаем напрямую с заводами. Гарантия низкой цены</p>
          </div>
          <div className={styles.infoBlock}>
            <div className={styles.infoIcon}>🔧</div>
            <h3>Сервис</h3>
            <p>Гарантийное обслуживание в 6 городах ЦФО</p>
          </div>
          <div className={styles.infoBlock}>
            <div className={styles.infoIcon}>🚚</div>
            <h3>Доставка</h3>
            <p>Быстрая доставка по всему региону</p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>Каталог</h4>
            <ul>
              <li>
                <a href="#">Мини-тракторы</a>
              </li>
              <li>
                <a href="#">Навесное</a>
              </li>
              <li>
                <a href="#">Запчасти</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Покупателям</h4>
            <ul>
              <li>
                <a href="#">Доставка</a>
              </li>
              <li>
                <a href="#">Оплата</a>
              </li>
              <li>
                <a href="#">Гарантия</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Компания</h4>
            <ul>
              <li>
                <a href="#">О нас</a>
              </li>
              <li>
                <a href="#">Сервис</a>
              </li>
              <li>
                <a href="#">Контакты</a>
              </li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Контакты</h4>
            <ul>
              <li>📞 8 (800) 555-99-99</li>
              <li>✉️ info@beltehferm.ru</li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          © 2025 БелТехФермЪ. Все права защищены
        </div>
      </footer>
    </>
  );
}
