/**
 * CART PAGE - Страница корзины
 */

export const CartPage = {
  async render() {
    // Получаем корзину из localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    if (cart.length === 0) {
      return `
        <section class="cart-page">
          <div class="container">
            <h1>Корзина пуста</h1>
            <p>Добавьте товары из каталога</p>
            <a href="/catalog" data-link class="btn btn-primary">Перейти в каталог</a>
          </div>
        </section>
      `;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return `
      <section class="cart-page">
        <div class="container">
          <h1>Корзина</h1>

          <div class="cart-items">
            ${cart.map(item => `
              <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item__info">
                  <h3>${item.name}</h3>
                  <div class="cart-item__price">${item.price.toLocaleString()} ₽</div>
                </div>
                <div class="cart-item__quantity">
                  <button onclick="window.updateCartQuantity(${item.id}, -1)">-</button>
                  <span>${item.quantity}</span>
                  <button onclick="window.updateCartQuantity(${item.id}, 1)">+</button>
                </div>
                <button onclick="window.removeFromCart(${item.id})" class="cart-item__remove">
                  Удалить
                </button>
              </div>
            `).join('')}
          </div>

          <div class="cart-total">
            <h3>Итого: ${total.toLocaleString()} ₽</h3>
            <a href="/checkout" data-link class="btn btn-primary">Оформить заказ</a>
          </div>
        </div>
      </section>
    `;
  }
};
