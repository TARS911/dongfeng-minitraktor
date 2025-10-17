/**
 * Advanced Catalog Filters - Enhanced filtering, sorting and search
 * Расширенные фильтры каталога
 */

// === Глобальные переменные для фильтров ===
let currentFilters = {
    brands: [],
    priceMin: null,
    priceMax: null,
    powerRanges: [],
    drives: [],
    features: [],
    searchQuery: '',
    sortBy: 'default'
};

// === Применение фильтров ===
function applyFilters() {
    // Собрать все активные фильтры
    currentFilters.brands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(el => el.value);
    currentFilters.priceMin = parseInt(document.getElementById('priceMin')?.value) || null;
    currentFilters.priceMax = parseInt(document.getElementById('priceMax')?.value) || null;
    currentFilters.powerRanges = Array.from(document.querySelectorAll('input[name="power"]:checked')).map(el => el.value);
    currentFilters.drives = Array.from(document.querySelectorAll('input[name="drive"]:checked')).map(el => el.value);
    currentFilters.features = Array.from(document.querySelectorAll('input[name="features"]:checked')).map(el => el.value);

    // Фильтровать товары
    filterAndRenderProducts();

    // Обновить счетчик активных фильтров
    updateActiveFiltersCount();
}

// === Фильтрация и рендеринг ===
function filterAndRenderProducts() {
    let products = [...allProducts];

    // Поиск
    if (currentFilters.searchQuery) {
        const query = currentFilters.searchQuery.toLowerCase();
        products = products.filter(p => {
            return p.name.toLowerCase().includes(query) ||
                   p.model.toLowerCase().includes(query) ||
                   p.description?.toLowerCase().includes(query);
        });
    }

    // Фильтр по бренду
    if (currentFilters.brands.length > 0) {
        products = products.filter(p => {
            return currentFilters.brands.some(brand => {
                const brandMap = {
                    'df': ['DF-244', 'DF-404', 'DF-304', 'DF-354'],
                    'xingtai': ['Xingtai 244', 'Xingtai 304'],
                    'lovol': ['LOVOL TE-244', 'LOVOL TE-304'],
                    'russian': ['Кентавр 244', 'Русич 244', 'Скаут 244', 'Рустрак 244']
                };
                const models = brandMap[brand] || [];
                return models.some(model => p.model.includes(model));
            });
        });
    }

    // Фильтр по цене
    if (currentFilters.priceMin !== null) {
        products = products.filter(p => p.price >= currentFilters.priceMin);
    }
    if (currentFilters.priceMax !== null) {
        products = products.filter(p => p.price <= currentFilters.priceMax);
    }

    // Фильтр по мощности
    if (currentFilters.powerRanges.length > 0) {
        products = products.filter(p => {
            return currentFilters.powerRanges.some(range => {
                const power = parseInt(p.power);
                if (range === '20-30') return power >= 20 && power < 30;
                if (range === '30-40') return power >= 30 && power < 40;
                if (range === '40-50') return power >= 40 && power < 50;
                if (range === '50+') return power >= 50;
                return false;
            });
        });
    }

    // Фильтр по приводу
    if (currentFilters.drives.length > 0) {
        products = products.filter(p => {
            return currentFilters.drives.includes(p.drive);
        });
    }

    // Фильтр по дополнительным характеристикам
    if (currentFilters.features.length > 0) {
        products = products.filter(p => {
            return currentFilters.features.every(feature => {
                if (feature === 'cabin') return p.name.includes('с кабиной') || p.has_cabin;
                if (feature === 'in_stock') return p.in_stock;
                if (feature === 'hit') return p.is_hit;
                if (feature === 'new') return p.is_new;
                return true;
            });
        });
    }

    // Сортировка
    products = sortProductsArray(products, currentFilters.sortBy);

    // Обновить счетчик результатов
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.textContent = products.length;
    }

    // Рендеринг
    filteredProducts = products;
    renderProducts(products);
}

// === Сортировка товаров ===
function sortProducts(sortBy) {
    currentFilters.sortBy = sortBy;
    filterAndRenderProducts();
}

function sortProductsArray(products, sortBy) {
    const sorted = [...products];

    switch(sortBy) {
        case 'price_asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price_desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'power_asc':
            return sorted.sort((a, b) => parseInt(a.power) - parseInt(b.power));
        case 'power_desc':
            return sorted.sort((a, b) => parseInt(b.power) - parseInt(a.power));
        case 'popular':
            return sorted.sort((a, b) => (b.is_hit ? 1 : 0) - (a.is_hit ? 1 : 0));
        case 'new':
            return sorted.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        default:
            return sorted;
    }
}

// === Сброс фильтров ===
function resetFilters() {
    // Сбросить все чекбоксы
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(el => el.checked = false);

    // Сбросить поля цены
    const priceMin = document.getElementById('priceMin');
    const priceMax = document.getElementById('priceMax');
    if (priceMin) priceMin.value = '';
    if (priceMax) priceMax.value = '';

    // Сбросить сортировку
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';

    // Очистить фильтры
    currentFilters = {
        brands: [],
        priceMin: null,
        priceMax: null,
        powerRanges: [],
        drives: [],
        features: [],
        searchQuery: currentFilters.searchQuery, // Оставить поиск
        sortBy: 'default'
    };

    // Применить
    filterAndRenderProducts();
}

// === Переключение видимости фильтров ===
function toggleFilters() {
    const filtersPanel = document.getElementById('catalogFilters');
    const toggleBtn = document.querySelector('.catalog__filter-toggle');

    if (filtersPanel) {
        filtersPanel.classList.toggle('active');
        if (toggleBtn) {
            toggleBtn.classList.toggle('active');
        }
    }
}

// === Обновление счетчика активных фильтров ===
function updateActiveFiltersCount() {
    let count = 0;

    count += currentFilters.brands.length;
    count += currentFilters.powerRanges.length;
    count += currentFilters.drives.length;
    count += currentFilters.features.length;
    if (currentFilters.priceMin !== null || currentFilters.priceMax !== null) count++;

    const badge = document.getElementById('activeFiltersCount');
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// === Улучшенный поиск ===
function searchProducts(event) {
    const query = event.target.value.toLowerCase().trim();
    currentFilters.searchQuery = query;

    // Применить фильтры с учетом поиска
    filterAndRenderProducts();

    // Если есть запрос, прокрутить к каталогу
    if (query.length > 0) {
        const catalog = document.getElementById('catalog');
        if (catalog) {
            catalog.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// === Фильтрация по категории (для обратной совместимости) ===
function filterByCategory(category) {
    // Сбросить фильтры
    resetFilters();

    // Установить бренд
    if (category !== 'all') {
        const checkbox = document.querySelector(`input[name="brand"][value="${category}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
        currentFilters.brands = [category];
    }

    // Применить
    filterAndRenderProducts();

    // Прокрутка к каталогу
    const catalogGrid = document.querySelector('.catalog__grid');
    if (catalogGrid) {
        catalogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// === Фильтрация по бренду (для обратной совместимости) ===
function filterByBrand(brand) {
    filterByCategory(brand);
}

function showAllProducts() {
    filterByCategory('all');
}

// === Инициализация при загрузке ===
document.addEventListener('DOMContentLoaded', () => {
    // Инициализировать счетчик результатов
    setTimeout(() => {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount && allProducts) {
            resultsCount.textContent = allProducts.length;
        }
    }, 500);

    // Добавить обработчики для быстрых фильтров
    document.querySelectorAll('.catalog__tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Удалить active у всех
            document.querySelectorAll('.catalog__tab').forEach(t => t.classList.remove('active'));
            // Добавить active на текущий
            this.classList.add('active');
        });
    });
});
