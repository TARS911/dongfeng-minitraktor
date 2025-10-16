/**
 * Shopping Cart Module
 * Модуль корзины покупок с LocalStorage
 */

class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.init();
    }

    // Инициализация
    init() {
        this.updateCartCount();
        this.bindEvents();
    }

    // Загрузка корзины из LocalStorage
    loadCart() {
        try {
            const cart = localStorage.getItem('dongfeng_cart');
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error loading cart:', error);
            return [];
        }
    }

    // Сохранение корзины в LocalStorage
    saveCart() {
        try {
            localStorage.setItem('dongfeng_cart', JSON.stringify(this.items));
            this.updateCartCount();
            this.dispatchCartUpdate();
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    }

    // Добавить товар в корзину
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                model: product.model,
                price: product.price,
                image: product.image_url,
                quantity: 1
            });
        }

        this.saveCart();
        this.showNotification(`${product.name} добавлен в корзину`);
    }

    // Удалить товар из корзины
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Товар удален из корзины');
    }

    // Обновить количество товара
    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }

    // Очистить корзину
    clearCart() {
        this.items = [];
        this.saveCart();
        this.showNotification('Корзина очищена');
    }

    // Получить товары корзины
    getItems() {
        return this.items;
    }

    // Получить количество товаров
    getItemsCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Получить общую стоимость
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Обновить счетчик в header
    updateCartCount() {
        const cartCounts = document.querySelectorAll('.cart-count');
        const count = this.getItemsCount();

        cartCounts.forEach(element => {
            element.textContent = count;
            element.style.display = count > 0 ? 'flex' : 'none';
        });
    }

    // Dispatch custom event при обновлении корзины
    dispatchCartUpdate() {
        const event = new CustomEvent('cartUpdated', {
            detail: {
                items: this.items,
                count: this.getItemsCount(),
                total: this.getTotalPrice()
            }
        });
        window.dispatchEvent(event);
    }

    // Показать уведомление
    showNotification(message) {
        // Удаляем старые уведомления
        const existing = document.querySelector('.cart-notification');
        if (existing) {
            existing.remove();
        }

        // Создаем новое
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <div class="cart-notification__content">
                <span class="cart-notification__icon">✓</span>
                <span class="cart-notification__text">${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Анимация появления
        setTimeout(() => notification.classList.add('show'), 100);

        // Удаление через 3 секунды
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Bind events
    bindEvents() {
        // Кнопки "В корзину" на всех страницах
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="add-to-cart"]')) {
                e.preventDefault();
                const button = e.target.closest('[data-action="add-to-cart"]');
                const productData = {
                    id: parseInt(button.dataset.productId),
                    name: button.dataset.productName,
                    model: button.dataset.productModel,
                    price: parseInt(button.dataset.productPrice),
                    image_url: button.dataset.productImage
                };
                this.addItem(productData);
            }
        });

        // Обновление при изменении количества
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('cart-item-quantity')) {
                const productId = parseInt(e.target.dataset.productId);
                const quantity = parseInt(e.target.value);
                this.updateQuantity(productId, quantity);
            }
        });

        // Удаление товара
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="remove-from-cart"]')) {
                e.preventDefault();
                const button = e.target.closest('[data-action="remove-from-cart"]');
                const productId = parseInt(button.dataset.productId);
                this.removeItem(productId);

                // Обновляем страницу корзины если мы на ней
                if (window.location.pathname.includes('cart')) {
                    this.renderCartPage();
                }
            }
        });

        // Очистка корзины
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="clear-cart"]')) {
                e.preventDefault();
                if (confirm('Очистить корзину?')) {
                    this.clearCart();
                    if (window.location.pathname.includes('cart')) {
                        this.renderCartPage();
                    }
                }
            }
        });
    }

    // Отрисовка страницы корзины
    renderCartPage() {
        const container = document.getElementById('cart-items-container');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = `
                <div class="cart-empty">
                    <h2>Корзина пуста</h2>
                    <p>Добавьте товары из каталога</p>
                    <a href="/#catalog" class="btn btn--primary">Перейти в каталог</a>
                </div>
            `;
            return;
        }

        const itemsHTML = this.items.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item__image">
                    <img src="${item.image || '/images/placeholder.jpg'}" alt="${item.name}">
                </div>
                <div class="cart-item__info">
                    <h3 class="cart-item__name">${item.name}</h3>
                    <p class="cart-item__model">Модель: ${item.model}</p>
                </div>
                <div class="cart-item__quantity">
                    <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input
                        type="number"
                        class="cart-item-quantity"
                        data-product-id="${item.id}"
                        value="${item.quantity}"
                        min="1"
                    >
                    <button class="qty-btn" onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
                <div class="cart-item__price">
                    ${(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                </div>
                <button
                    class="cart-item__remove"
                    data-action="remove-from-cart"
                    data-product-id="${item.id}"
                    aria-label="Удалить"
                >
                    ×
                </button>
            </div>
        `).join('');

        container.innerHTML = itemsHTML;

        // Обновляем итого
        document.getElementById('cart-total').textContent =
            this.getTotalPrice().toLocaleString('ru-RU') + ' ₽';
    }
}

// Инициализация глобального экземпляра корзины
window.cart = new ShoppingCart();

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShoppingCart;
}
