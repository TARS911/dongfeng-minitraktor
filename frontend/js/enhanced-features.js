/**
 * Enhanced Frontend Features
 * Современные фичи для улучшения UX
 */

// === Lazy Loading для изображений ===
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// === Scroll Reveal Animations ===
function initScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal, .product-card, .advantage-card');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => {
            el.classList.add('scroll-reveal');
            revealObserver.observe(el);
        });
    } else {
        // Fallback для старых браузеров
        elements.forEach(el => el.classList.add('revealed'));
    }
}

// === Smooth Scroll ===
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const targetElement = document.querySelector(href);
            if (!targetElement) return;

            e.preventDefault();

            const headerOffset = 85;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Закрыть мобильное меню если открыто
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
    });
}

// === Header Scroll Effect ===
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.pageYOffset;

                // Добавляем класс при скролле
                if (currentScroll > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }

                // Скрываем header при скролле вниз, показываем при скролле вверх
                if (currentScroll > 200) {
                    if (currentScroll > lastScroll) {
                        header.classList.add('header--hidden');
                    } else {
                        header.classList.remove('header--hidden');
                    }
                }

                lastScroll = currentScroll;
                ticking = false;
            });

            ticking = true;
        }
    });
}

// === Parallax Effect для Hero ===
function initParallax() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroHeight = hero.offsetHeight;

        if (scrolled < heroHeight) {
            const shapes = hero.querySelectorAll('.hero__shape');
            shapes.forEach((shape, index) => {
                const speed = 0.3 + (index * 0.1);
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }
    });
}

// === Search Enhancement ===
let searchTimeout;
function enhancedSearch(query) {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
        if (query.length < 2) {
            showAllProducts();
            return;
        }

        const products = document.querySelectorAll('.product-card');
        let foundCount = 0;

        products.forEach(product => {
            const title = product.querySelector('.product-card__title')?.textContent.toLowerCase();
            const specs = product.querySelector('.product-card__specs')?.textContent.toLowerCase();

            if (title?.includes(query.toLowerCase()) || specs?.includes(query.toLowerCase())) {
                product.style.display = '';
                product.classList.add('search-highlight');
                setTimeout(() => product.classList.remove('search-highlight'), 1000);
                foundCount++;
            } else {
                product.style.display = 'none';
            }
        });

        updateResultsCount(foundCount);
    }, 300);
}

function showAllProducts() {
    const products = document.querySelectorAll('.product-card');
    products.forEach(product => {
        product.style.display = '';
    });
    updateResultsCount(products.length);
}

function updateResultsCount(count) {
    const counter = document.getElementById('resultsCount');
    if (counter) {
        counter.textContent = count;
        counter.parentElement.classList.add('pulse');
        setTimeout(() => counter.parentElement.classList.remove('pulse'), 500);
    }
}

// === Улучшенная валидация форм ===
function enhanceFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            // Валидация в реальном времени
            input.addEventListener('blur', () => validateInput(input));
            input.addEventListener('input', () => {
                if (input.classList.contains('invalid')) {
                    validateInput(input);
                }
            });
        });

        form.addEventListener('submit', (e) => {
            let isValid = true;

            inputs.forEach(input => {
                if (input.hasAttribute('required') && !validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                e.preventDefault();
                showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            }
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    let isValid = true;
    let message = '';

    // Проверка required
    if (input.hasAttribute('required') && !value) {
        isValid = false;
        message = 'Это поле обязательно для заполнения';
    }

    // Проверка email
    if (input.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Введите корректный email';
        }
    }

    // Проверка телефона
    if (input.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
            isValid = false;
            message = 'Введите корректный номер телефона';
        }
    }

    // Показ ошибки
    if (!isValid) {
        input.classList.add('invalid');
        showInputError(input, message);
    } else {
        input.classList.remove('invalid');
        hideInputError(input);
    }

    return isValid;
}

function showInputError(input, message) {
    let error = input.nextElementSibling;
    if (!error || !error.classList.contains('input-error')) {
        error = document.createElement('div');
        error.className = 'input-error';
        input.parentNode.insertBefore(error, input.nextSibling);
    }
    error.textContent = message;
}

function hideInputError(input) {
    const error = input.nextElementSibling;
    if (error && error.classList.contains('input-error')) {
        error.remove();
    }
}

// === Уведомления ===
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__icon">${getNotificationIcon(type)}</div>
        <div class="notification__message">${message}</div>
        <button class="notification__close" onclick="this.parentElement.remove()">×</button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// === Product Card Actions ===
function addToFavorites(productId) {
    // Логика добавления в избранное
    showNotification('Товар добавлен в избранное', 'success');
    updateFavoritesCount();
}

function addToCompare(productId) {
    // Логика добавления к сравнению
    showNotification('Товар добавлен к сравнению', 'success');
    updateCompareCount();
}

function quickView(productId) {
    // Открыть быстрый просмотр товара
    console.log('Quick view:', productId);
}

function updateFavoritesCount() {
    const badge = document.getElementById('favoritesCount');
    if (badge) {
        const count = parseInt(badge.textContent) || 0;
        badge.textContent = count + 1;
        badge.style.display = count >= 0 ? 'flex' : 'none';
    }
}

function updateCompareCount() {
    const badge = document.getElementById('compareCount');
    if (badge) {
        const count = parseInt(badge.textContent) || 0;
        badge.textContent = count + 1;
        badge.style.display = count >= 0 ? 'flex' : 'none';
    }
}

// === Инициализация ===
document.addEventListener('DOMContentLoaded', () => {
    initLazyLoading();
    initScrollReveal();
    initSmoothScroll();
    initHeaderScroll();
    initParallax();
    enhanceFormValidation();

    console.log('🚀 Enhanced features initialized');
});

// === Экспорт функций для глобального использования ===
window.enhancedSearch = enhancedSearch;
window.addToFavorites = addToFavorites;
window.addToCompare = addToCompare;
window.quickView = quickView;
window.showNotification = showNotification;
