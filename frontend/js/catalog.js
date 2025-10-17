/**
 * Catalog Functions - Search, Filter, Cart, Favorites, Compare
 * Функции каталога товаров
 */

// === Глобальные переменные ===
let allProducts = [];
let filteredProducts = [];
let currentBrand = 'all';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let compare = JSON.parse(localStorage.getItem('compare') || '[]');

// === Инициализация ===
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    updateCounters();
    initializeCatalog();
});

// === Загрузка товаров ===
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data.success && data.data) {
            allProducts = data.data;
            filteredProducts = [...allProducts];
            renderProducts(filteredProducts);
        }
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
    }
}

// === Поиск товаров ===
function searchProducts(event) {
    const query = event.target.value.toLowerCase().trim();

    if (query.length === 0) {
        filteredProducts = currentBrand === 'all'
            ? [...allProducts]
            : filterProductsByBrand(currentBrand);
        renderProducts(filteredProducts);
        return;
    }

    // Поиск по названию и модели
    filteredProducts = allProducts.filter(product => {
        const name = product.name.toLowerCase();
        const model = product.model.toLowerCase();
        return name.includes(query) || model.includes(query);
    });

    renderProducts(filteredProducts);
}

function performSearch() {
    const input = document.getElementById('searchInput');
    if (input && input.value.trim()) {
        searchProducts({ target: input });

        // Прокрутка к каталогу
        const catalog = document.getElementById('catalog');
        if (catalog) {
            catalog.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// === Фильтрация по бренду ===
function filterByBrand(brand) {
    currentBrand = brand;

    if (brand === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = filterProductsByBrand(brand);
    }

    renderProducts(filteredProducts);

    // Закрыть dropdown
    const dropdown = document.getElementById('catalogDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }

    // Прокрутка к каталогу
    const catalog = document.getElementById('catalog');
    if (catalog) {
        catalog.scrollIntoView({ behavior: 'smooth' });
    }
}

function filterProductsByBrand(brand) {
    const brandMap = {
        'df': ['DF-244', 'DF-404'],
        'xingtai': ['Xingtai 244'],
        'lovol': ['LOVOL TE-244'],
        'russian': ['Кентавр 244', 'Русич 244', 'Скаут 244', 'Рустрак 244']
    };

    const models = brandMap[brand] || [];
    return allProducts.filter(product => {
        return models.some(model => product.model.includes(model));
    });
}

function showAllProducts() {
    filterByBrand('all');
}

// === Отображение товаров ===
function renderProducts(products) {
    const catalogGrid = document.querySelector('.catalog__grid');
    if (!catalogGrid) return;

    if (products.length === 0) {
        catalogGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <p style="font-size: 18px; color: #666;">
                    По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска.
                </p>
            </div>
        `;
        return;
    }

    catalogGrid.innerHTML = products.map(product => createProductCardHTML(product)).join('');

    // Re-init scroll reveal
    if (typeof initScrollReveal === 'function') {
        initScrollReveal();
    }
}

function createProductCardHTML(product) {
    const isFavorite = favorites.includes(product.id);
    const isInCompare = compare.includes(product.id);
    const badges = [];

    if (product.is_hit) badges.push('<div class="product-card__badge">Хит продаж</div>');
    if (product.is_new) badges.push('<div class="product-card__badge badge--new">Новинка</div>');

    return `
        <article class="product-card" itemscope itemtype="https://schema.org/Product" data-product-id="${product.id}">
            <div class="product-card__image">
                <img src="${product.image_url}" alt="${product.name}" itemprop="image" loading="lazy">
                ${badges.join('')}
                <div class="product-card__actions-overlay">
                    <button class="action-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite(${product.id})" title="${isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="${isFavorite ? 'currentColor' : 'none'}">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                    </button>
                    <button class="action-btn ${isInCompare ? 'active' : ''}" onclick="toggleCompare(${product.id})" title="${isInCompare ? 'Удалить из сравнения' : 'Добавить к сравнению'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M9 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H9M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15M9 3V21M15 3V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="product-card__content">
                <h3 class="product-card__title" itemprop="name">${product.name}</h3>
                <div class="product-card__specs">
                    <div class="spec">
                        <span class="spec__label">Мощность:</span>
                        <span class="spec__value">${product.power} л.с.</span>
                    </div>
                    <div class="spec">
                        <span class="spec__label">Привод:</span>
                        <span class="spec__value">${product.drive}</span>
                    </div>
                    <div class="spec">
                        <span class="spec__label">КПП:</span>
                        <span class="spec__value">${product.transmission}</span>
                    </div>
                </div>
                <div class="product-card__price" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <span class="price__current" itemprop="price" content="${product.price}">${product.price.toLocaleString('ru-RU')} ₽</span>
                    <meta itemprop="priceCurrency" content="RUB">
                    <link itemprop="availability" href="https://schema.org/${product.in_stock ? 'InStock' : 'OutOfStock'}">
                </div>
                <div class="product-card__actions">
                    <button class="btn btn--primary btn--block" onclick="addToCart(${product.id})">
                        В корзину
                    </button>
                    <button class="btn btn--outline btn--block" onclick="showDetails('${product.model}')">
                        Подробнее
                    </button>
                </div>
            </div>
        </article>
    `;
}

// === Корзина ===
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1,
            product: product
        });
    }

    saveCart();
    updateCounters();
    showNotification(`${product.name} добавлен в корзину`);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function openCart() {
    // TODO: Открыть модальное окно корзины
    alert(`В корзине ${cart.length} товаров`);
}

// === Избранное ===
function toggleFavorite(productId) {
    const index = favorites.indexOf(productId);

    if (index > -1) {
        favorites.splice(index, 1);
        showNotification('Удалено из избранного');
    } else {
        favorites.push(productId);
        showNotification('Добавлено в избранное');
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateCounters();

    // Обновить иконку на карточке
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
        const btn = card.querySelector('.action-btn');
        const svg = btn.querySelector('svg path');
        if (index > -1) {
            btn.classList.remove('active');
            svg.setAttribute('fill', 'none');
        } else {
            btn.classList.add('active');
            svg.setAttribute('fill', 'currentColor');
        }
    }
}

function openFavorites() {
    // TODO: Показать избранные товары
    alert(`У вас ${favorites.length} товаров в избранном`);
}

// === Сравнение ===
function toggleCompare(productId) {
    const index = compare.indexOf(productId);

    if (index > -1) {
        compare.splice(index, 1);
        showNotification('Удалено из сравнения');
    } else {
        if (compare.length >= 4) {
            showNotification('Можно сравнить не более 4 товаров');
            return;
        }
        compare.push(productId);
        showNotification('Добавлено к сравнению');
    }

    localStorage.setItem('compare', JSON.stringify(compare));
    updateCounters();

    // Обновить иконку на карточке
    const card = document.querySelector(`[data-product-id="${productId}"]`);
    if (card) {
        const buttons = card.querySelectorAll('.action-btn');
        const btn = buttons[1]; // Второя кнопка
        if (index > -1) {
            btn.classList.remove('active');
        } else {
            btn.classList.add('active');
        }
    }
}

function openCompare() {
    // TODO: Показать страницу сравнения
    alert(`Сравнение: ${compare.length} товаров`);
}

// === Обновление счетчиков ===
function updateCounters() {
    // Корзина
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Избранное
    const favoritesCount = document.getElementById('favoritesCount');
    if (favoritesCount) {
        favoritesCount.textContent = favorites.length;
    }

    // Сравнение
    const compareCount = document.getElementById('compareCount');
    if (compareCount) {
        compareCount.textContent = compare.length;
    }
}

// === Уведомления ===
function showNotification(message) {
    // Простое уведомление (можно заменить на более красивое)
    const notification = document.createElement('div');
    notification.className = 'notification';
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
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// === Переключение меню каталога ===
function toggleCatalogMenu() {
    const dropdown = document.getElementById('catalogDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

// Закрытие dropdown при клике вне его
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('catalogDropdown');
    const catalogBtn = document.querySelector('.nav__catalog-btn');

    if (dropdown && catalogBtn) {
        if (!dropdown.contains(e.target) && !catalogBtn.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    }
});

// === Инициализация ===
function initializeCatalog() {
    // Загрузить все товары при загрузке страницы
    renderProducts(allProducts);
}

// Добавить CSS для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .action-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        color: #666;
    }

    .action-btn:hover {
        background: white;
        color: #2a9d4e;
        transform: scale(1.1);
    }

    .action-btn.active {
        background: #2a9d4e;
        color: white;
    }

    .product-card__actions-overlay {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        gap: 8px;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .product-card:hover .product-card__actions-overlay {
        opacity: 1;
    }
`;
document.head.appendChild(style);
