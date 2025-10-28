/**
 * Global Cart, Favorites & Compare - Работает на всех страницах
 * Легкая версия без функций каталога
 */

// === Глобальные переменные ===
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let compare = JSON.parse(localStorage.getItem("compare") || "[]");

// === Инициализация при загрузке страницы ===
document.addEventListener("DOMContentLoaded", () => {
  updateCounters();
});

// === Обновление счетчиков ===
function updateCounters() {
  // Корзина
  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.setAttribute("data-hidden", totalItems === 0 ? "true" : "false");
  }

  // Избранное
  const favoritesCount = document.getElementById("favoritesCount");
  if (favoritesCount) {
    favoritesCount.textContent = favorites.length;
    favoritesCount.setAttribute(
      "data-hidden",
      favorites.length === 0 ? "true" : "false",
    );
  }

  // Сравнение
  const compareCount = document.getElementById("compareCount");
  if (compareCount) {
    compareCount.textContent = compare.length;
    compareCount.setAttribute(
      "data-hidden",
      compare.length === 0 ? "true" : "false",
    );
  }
}

// === Корзина ===
function openCart() {
  const modal = document.getElementById("cartModal");
  if (!modal) {
    createCartModal();
  }

  renderCartModal();
  document.getElementById("cartModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function createCartModal() {
  const modal = document.createElement("div");
  modal.id = "cartModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal modal--large">
            <button class="modal__close" onclick="closeModal('cartModal')" aria-label="Закрыть">×</button>
            <div class="modal__content">
                <h2 class="modal__title">Корзина</h2>
                <div id="cartContent"></div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  // Закрытие по клику на overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal("cartModal");
    }
  });
}

function renderCartModal() {
  const content = document.getElementById("cartContent");
  if (!content) return;

  if (cart.length === 0) {
    content.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M9 2L7 7H21L19 2H9Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 7H21L19 17H9L7 7Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="10" cy="21" r="1" fill="currentColor"/>
                    <circle cx="18" cy="21" r="1" fill="currentColor"/>
                </svg>
                <h3>Корзина пуста</h3>
                <p>Добавьте товары из каталога</p>
                <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
            </div>
        `;
    return;
  }

  let totalPrice = 0;
  const itemsHTML = cart
    .map((item) => {
      const subtotal = item.product.price * item.quantity;
      totalPrice += subtotal;

      return `
            <div class="cart-item">
                <img src="${item.product.image_url}" alt="${item.product.name}" class="cart-item__image">
                <div class="cart-item__info">
                    <h4 class="cart-item__title">${item.product.name}</h4>
                    <p class="cart-item__specs">${item.product.power} л.с. • ${item.product.drive}</p>
                </div>
                <div class="cart-item__quantity">
                    <button onclick="updateCartQuantity(${item.id}, -1)" class="quantity-btn">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                </div>
                <div class="cart-item__price">${subtotal.toLocaleString("ru-RU")} ₽</div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn" title="Удалить">Удалить</button>
            </div>
        `;
    })
    .join("");

  content.innerHTML = `
        <div class="cart-items">${itemsHTML}</div>
        <div class="cart-total">
            <span class="cart-total__label">Итого:</span>
            <span class="cart-total__price">${totalPrice.toLocaleString("ru-RU")} ₽</span>
        </div>
        <div class="modal__actions">
            <button class="btn btn--outline" onclick="closeModal('cartModal')">Продолжить покупки</button>
            <a href="cart.html" class="btn btn--primary">Оформить заказ</a>
        </div>
    `;
}

function updateCartQuantity(productId, change) {
  const item = cart.find((i) => i.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCounters();
      renderCartModal();
      // Update cart page if we're on it
      if (typeof renderCartPage === "function") {
        renderCartPage();
        updateCartSummary();
      }
    }
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCounters();
  renderCartModal();
  showNotification("Товар удален из корзины");
  // Update cart page if we're on it
  if (typeof renderCartPage === "function") {
    renderCartPage();
    updateCartSummary();
  }
}

// === Избранное ===
function openFavorites() {
  const modal = document.getElementById("favoritesModal");
  if (!modal) {
    createFavoritesModal();
  }

  renderFavoritesModal();
  document.getElementById("favoritesModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function createFavoritesModal() {
  const modal = document.createElement("div");
  modal.id = "favoritesModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal modal--large">
            <button class="modal__close" onclick="closeModal('favoritesModal')" aria-label="Закрыть">×</button>
            <div class="modal__content">
                <h2 class="modal__title">Избранное</h2>
                <div id="favoritesContent">Загрузка...</div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal("favoritesModal");
    }
  });
}

async function renderFavoritesModal() {
  const content = document.getElementById("favoritesContent");
  if (!content) return;

  if (favorites.length === 0) {
    content.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
                <h3>Список избранного пуст</h3>
                <p>Добавляйте понравившиеся товары</p>
                <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
            </div>
        `;
    return;
  }

  // Загрузка товаров
  try {
    const response = await fetch(`${window.API_URL}/api/products`);
    const data = await response.json();

    if (data.success && data.data) {
      const favoriteProducts = data.data.filter((p) =>
        favorites.includes(p.id),
      );

      const itemsHTML = favoriteProducts
        .map(
          (product) => `
                <div class="favorites-item">
                    <img src="${product.image_url}" alt="${product.name}" class="favorites-item__image">
                    <div class="favorites-item__info">
                        <h4 class="favorites-item__title">${product.name}</h4>
                        <p class="favorites-item__specs">${product.power} л.с. • ${product.drive}</p>
                        <div class="favorites-item__price">${product.price.toLocaleString("ru-RU")} ₽</div>
                    </div>
                    <button onclick="toggleFavorite(${product.id}); renderFavoritesModal();" class="remove-btn">Удалить</button>
                </div>
            `,
        )
        .join("");

      content.innerHTML = `
                <div class="favorites-items">${itemsHTML}</div>
                <div class="modal__actions">
                    <button class="btn btn--outline" onclick="closeModal('favoritesModal')">Закрыть</button>
                    <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
                </div>
            `;
    }
  } catch (error) {
    console.error("Ошибка загрузки избранного:", error);
    content.innerHTML = "<p>Ошибка загрузки товаров</p>";
  }
}

function toggleFavorite(productId) {
  const index = favorites.indexOf(productId);

  if (index > -1) {
    favorites.splice(index, 1);
    showNotification("Удалено из избранного");
  } else {
    favorites.push(productId);
    showNotification("Добавлено в избранное");
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateCounters();
}

// === Сравнение ===
function openCompare() {
  const modal = document.getElementById("compareModal");
  if (!modal) {
    createCompareModal();
  }

  renderCompareModal();
  document.getElementById("compareModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function createCompareModal() {
  const modal = document.createElement("div");
  modal.id = "compareModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
        <div class="modal modal--large">
            <button class="modal__close" onclick="closeModal('compareModal')" aria-label="Закрыть">×</button>
            <div class="modal__content">
                <h2 class="modal__title">Сравнение товаров</h2>
                <div id="compareContent">Загрузка...</div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal("compareModal");
    }
  });
}

async function renderCompareModal() {
  const content = document.getElementById("compareContent");
  if (!content) return;

  if (compare.length === 0) {
    content.innerHTML = `
            <div class="empty-state">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                    <path d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H9M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15M9 3V21M15 3V21" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>Нет товаров для сравнения</h3>
                <p>Добавьте товары для сравнения характеристик</p>
                <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
            </div>
        `;
    return;
  }

  // Загрузка товаров
  try {
    const response = await fetch(`${window.API_URL}/api/products`);
    const data = await response.json();

    if (data.success && data.data) {
      const compareProducts = data.data.filter((p) => compare.includes(p.id));

      const tableHTML = `
                <div class="compare-table-wrapper">
                    <table class="compare-table">
                        <tr>
                            <th>Фото</th>
                            ${compareProducts.map((p) => `<td><img src="${p.image_url}" alt="${p.name}"></td>`).join("")}
                        </tr>
                        <tr>
                            <th>Модель</th>
                            ${compareProducts.map((p) => `<td><strong>${p.name}</strong></td>`).join("")}
                        </tr>
                        <tr>
                            <th>Цена</th>
                            ${compareProducts.map((p) => `<td><strong>${p.price.toLocaleString("ru-RU")} ₽</strong></td>`).join("")}
                        </tr>
                        <tr>
                            <th>Мощность</th>
                            ${compareProducts.map((p) => `<td>${p.power} л.с.</td>`).join("")}
                        </tr>
                        <tr>
                            <th>Привод</th>
                            ${compareProducts.map((p) => `<td>${p.drive}</td>`).join("")}
                        </tr>
                        <tr>
                            <th>КПП</th>
                            ${compareProducts.map((p) => `<td>${p.transmission}</td>`).join("")}
                        </tr>
                        <tr>
                            <th></th>
                            ${compareProducts.map((p) => `<td><button onclick="toggleCompare(${p.id}); renderCompareModal();" class="btn btn--outline" style="width: 100%; margin-top: 8px;">Удалить</button></td>`).join("")}
                        </tr>
                    </table>
                </div>
                <div class="modal__actions">
                    <button class="btn btn--outline" onclick="closeModal('compareModal')">Закрыть</button>
                </div>
            `;

      content.innerHTML = tableHTML;
    }
  } catch (error) {
    console.error("Ошибка загрузки сравнения:", error);
    content.innerHTML = "<p>Ошибка загрузки товаров</p>";
  }
}

function toggleCompare(productId) {
  const index = compare.indexOf(productId);

  if (index > -1) {
    compare.splice(index, 1);
    showNotification("Удалено из сравнения");
  } else {
    if (compare.length >= 4) {
      showNotification("Можно сравнить не более 4 товаров");
      return;
    }
    compare.push(productId);
    showNotification("Добавлено к сравнению");
  }

  localStorage.setItem("compare", JSON.stringify(compare));
  updateCounters();
}

// === Закрытие модального окна ===
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// === Уведомления ===
function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: #2a9d4e;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// === Закрытие по ESC ===
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal("cartModal");
    closeModal("favoritesModal");
    closeModal("compareModal");
  }
});

// === Экспорт функций в глобальную область ===
window.cart = cart;
window.favorites = favorites;
window.compare = compare;
window.openCart = openCart;
window.openFavorites = openFavorites;
window.openCompare = openCompare;
window.closeModal = closeModal;
window.toggleFavorite = toggleFavorite;
window.toggleCompare = toggleCompare;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.updateCounters = updateCounters;

// === Добавление в корзину (для кнопок на страницах) ===
async function addToCart(productId) {
  try {
    // Загрузить все товары из API
    const response = await fetch(`${window.API_URL}/api/products`);
    const data = await response.json();

    if (data.success && data.data) {
      // Найти нужный товар по ID
      const product = data.data.find((p) => p.id === productId);

      if (!product) {
        showNotification("Товар не найден");
        return;
      }

      // Проверить, есть ли уже в корзине
      const existingItem = cart.find((item) => item.id === productId);

      if (existingItem) {
        existingItem.quantity += 1;
        showNotification("Количество товара увеличено");
      } else {
        cart.push({
          id: productId,
          product: product,
          quantity: 1,
        });
        showNotification("Товар добавлен в корзину");
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      updateCounters();
    }
  } catch (error) {
    console.error("Ошибка добавления в корзину:", error);
    showNotification("Ошибка добавления товара");
  }
}

// Экспорт функции
window.addToCart = addToCart;

// === Render Cart Page (для cart.html) ===
function renderCartPage() {
  const container = document.getElementById("cart-items-container");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 80px 20px;">
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" style="margin: 0 auto 30px; color: #d4d4d4;">
                    <path d="M9 2L7 7H21L19 2H9Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M7 7H21L19 17H9L7 7Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="10" cy="21" r="1" fill="currentColor"/>
                    <circle cx="18" cy="21" r="1" fill="currentColor"/>
                </svg>
                <h3 style="font-size: 28px; margin-bottom: 16px; color: #404040;">Корзина пуста</h3>
                <p style="font-size: 18px; color: #737373; margin-bottom: 40px;">Добавьте товары из каталога</p>
                <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
            </div>
        `;
    return;
  }

  const itemsHTML = cart
    .map(
      (item) => `
            <div class="cart-item" data-product-id="${item.id}">
                <img src="${item.product.image_url}" alt="${item.product.name}" class="cart-item__image">
                <div class="cart-item__info">
                    <h4 class="cart-item__title">${item.product.name}</h4>
                    <p class="cart-item__specs">${item.product.power} л.с. • ${item.product.drive}</p>
                </div>
                <div class="cart-item__quantity">
                    <button onclick="updateCartQuantity(${item.id}, -1)" class="quantity-btn">−</button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button onclick="updateCartQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                </div>
                <div class="cart-item__price">${(item.product.price * item.quantity).toLocaleString("ru-RU")} ₽</div>
                <button onclick="removeFromCart(${item.id})" class="remove-btn" title="Удалить">×</button>
            </div>
        `,
    )
    .join("");

  container.innerHTML = itemsHTML;
}

// Получить количество товаров
function getItemsCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

// Получить общую стоимость
function getTotalPrice() {
  return cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
}

// Очистить корзину
function clearCart() {
  if (confirm("Очистить корзину?")) {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCounters();
    renderCartPage();
    updateCartSummary();
    showNotification("Корзина очищена");
  }
}

// Обновить summary на странице корзины
function updateCartSummary() {
  const itemsCountEl = document.getElementById("cart-items-count");
  const totalEl = document.getElementById("cart-total");

  if (itemsCountEl) {
    itemsCountEl.textContent = getItemsCount();
  }

  if (totalEl) {
    totalEl.textContent = getTotalPrice().toLocaleString("ru-RU") + " ₽";
  }
}

// Экспорт функций для cart.html
window.renderCartPage = renderCartPage;
window.getItemsCount = getItemsCount;
window.getTotalPrice = getTotalPrice;
window.clearCart = clearCart;
window.updateCartSummary = updateCartSummary;
