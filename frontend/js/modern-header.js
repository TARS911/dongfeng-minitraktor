/**
 * Modern Header JavaScript
 * Управление выбором города, каталогом, авторизацией
 */

// Список городов
const cities = [
    'Белгород',
    'Курск',
    'Воронеж',
    'Орёл',
    'Тула',
    'Липецк',
    'Брянск'
];

// Текущий выбранный город (из localStorage или по умолчанию)
let selectedCity = localStorage.getItem('selectedCity') || 'Белгород';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initCitySelector();
    initCartCounter();
    initFavoritesCounter();
    initCompareCounter();
    updateAuthButton();
});

// === City Selector ===
function initCitySelector() {
    const cityButton = document.getElementById('selectedCity');
    if (cityButton) {
        cityButton.textContent = selectedCity;
    }
}

function toggleCitySelector() {
    const dropdown = document.getElementById('cityDropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
    }
}

function selectCity(city) {
    selectedCity = city;
    localStorage.setItem('selectedCity', city);

    // Обновить отображение
    const cityButton = document.getElementById('selectedCity');
    if (cityButton) {
        cityButton.textContent = city;
    }

    // Закрыть dropdown
    const dropdown = document.getElementById('cityDropdown');
    if (dropdown) {
        dropdown.classList.remove('active');
    }

    // Показать уведомление
    if (typeof showNotification === 'function') {
        showNotification(`Ваш город: ${city}`, 'success');
    }

    // Обновить информацию для города (телефон, адрес и т.д.)
    updateCityInfo(city);
}

function updateCityInfo(city) {
    // Здесь можно обновить контактную информацию в зависимости от города
    console.log(`Информация обновлена для города: ${city}`);

    // TODO: Обновить телефон, адрес магазина и т.д.
}

// Закрытие dropdown при клике вне его
document.addEventListener('click', (e) => {
    const citySelector = document.querySelector('.city-selector-modern');
    const dropdown = document.getElementById('cityDropdown');

    if (citySelector && dropdown && !citySelector.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// === Catalog Menu ===
function toggleCatalogMenu() {
    const catalogDropdown = document.getElementById('catalogDropdown');
    if (catalogDropdown) {
        catalogDropdown.classList.toggle('active');
    }
}

// === Cart Counter ===
function initCartCounter() {
    updateCartCounter();
}

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    const cartBadge = document.getElementById('cartCount');
    if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'flex' : 'none';
    }
}

// === Favorites Counter ===
function initFavoritesCounter() {
    updateFavoritesCounter();
}

function updateFavoritesCounter() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favCount = favorites.length;

    const favBadge = document.getElementById('favoritesCount');
    if (favBadge) {
        favBadge.textContent = favCount;
        favBadge.style.display = favCount > 0 ? 'flex' : 'none';
    }
}

// === Compare Counter ===
function initCompareCounter() {
    updateCompareCounter();
}

function updateCompareCounter() {
    const compare = JSON.parse(localStorage.getItem('compare')) || [];
    const compareCount = compare.length;

    const compareBadge = document.getElementById('compareCount');
    if (compareBadge) {
        compareBadge.textContent = compareCount;
        compareBadge.style.display = compareCount > 0 ? 'flex' : 'none';
    }
}

// === Authentication ===
function updateAuthButton() {
    const user = JSON.parse(localStorage.getItem('user'));
    const authBtn = document.querySelector('.action-btn--auth');

    if (authBtn && user) {
        authBtn.querySelector('span').textContent = user.name || 'Профиль';
    }
}

function handleAuth() {
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        // Пользователь авторизован - переход в профиль
        window.location.href = 'profile.html';
    } else {
        // Показать модальное окно авторизации
        showAuthModal();
    }
}

function showAuthModal() {
    // TODO: Реализовать модальное окно авторизации
    if (typeof showNotification === 'function') {
        showNotification('Функция авторизации в разработке', 'info');
    } else {
        alert('Функция авторизации в разработке');
    }
}

// === Mobile Menu ===
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (mobileMenu) {
        mobileMenu.classList.toggle('active');
    }

    if (toggle) {
        toggle.classList.toggle('active');
    }
}

// === Экспорт функций в глобальную область ===
window.toggleCitySelector = toggleCitySelector;
window.selectCity = selectCity;
window.toggleCatalogMenu = toggleCatalogMenu;
window.updateCartCounter = updateCartCounter;
window.updateFavoritesCounter = updateFavoritesCounter;
window.updateCompareCounter = updateCompareCounter;
window.handleAuth = handleAuth;
window.toggleMobileMenu = toggleMobileMenu;

// === Обновление счётчиков при изменениях в localStorage ===
window.addEventListener('storage', (e) => {
    if (e.key === 'cart') {
        updateCartCounter();
    } else if (e.key === 'favorites') {
        updateFavoritesCounter();
    } else if (e.key === 'compare') {
        updateCompareCounter();
    } else if (e.key === 'user') {
        updateAuthButton();
    }
});

// Периодическое обновление счётчиков (на случай изменений в той же вкладке)
setInterval(() => {
    updateCartCounter();
    updateFavoritesCounter();
    updateCompareCounter();
}, 2000);
