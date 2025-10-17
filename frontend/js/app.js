/**
 * Main JavaScript - Interactive Features & Animations
 * Современная функциональность с плавными анимациями
 */

// === Инициализация ===
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initSmoothScroll();
    initHeaderScroll();
    initFormValidation();
});

// === Scroll Reveal Animation ===
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.product-card, .advantage-card');

    const revealOnScroll = () => {
        revealElements.forEach((element, index) => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;

            if (elementTop < window.innerHeight - elementVisible) {
                setTimeout(() => {
                    element.classList.add('reveal', 'active');
                }, index * 100); // Staggered animation
            }
        });
    };

    // Initial check
    revealOnScroll();

    // On scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(revealOnScroll);
    });
}

// === Smooth Scroll для якорных ссылок ===
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerOffset = 80; // Высота header
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// === Header Scroll Effect ===
function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.08)';
        }

        lastScroll = currentScroll;
    });
}

// === Mobile Menu Toggle ===
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const burger = document.querySelector('.burger');

    if (nav && burger) {
        nav.classList.toggle('nav--active');
        burger.classList.toggle('burger--active');

        // Prevent body scroll when menu is open
        document.body.classList.toggle('menu-open');
    }
}

// === Modal Functions ===
function openCallbackModal() {
    const modal = document.getElementById('callbackModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку

        // Отправка события в Яндекс.Метрику
        if (typeof ym !== 'undefined') {
            ym(YOUR_METRIKA_ID, 'reachGoal', 'callback_click');
        }
    }
}

function closeCallbackModal() {
    const modal = document.getElementById('callbackModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Разблокируем прокрутку

        // Сброс формы
        const form = document.getElementById('callbackForm');
        if (form) {
            form.reset();
            form.style.display = 'block';
        }

        // Скрыть success сообщение
        const success = modal.querySelector('.modal__success');
        if (success) {
            success.style.display = 'none';
        }
    }
}

// Закрытие по клику на overlay
document.addEventListener('click', (e) => {
    const modal = document.getElementById('callbackModal');
    if (modal && e.target === modal) {
        closeCallbackModal();
    }
});

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeCallbackModal();
    }
});

// === Callback Modal Form Submit ===
async function submitCallbackForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Validate all inputs
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');

    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        return;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    // Отправка на backend
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email') || null,
                message: formData.get('message') || null
            })
        });

        const data = await response.json();

        if (data.success) {
            // Скрыть форму
            form.style.display = 'none';

            // Показать success сообщение
            const success = document.querySelector('.modal__success');
            if (success) {
                success.style.display = 'block';
            }

            // Яндекс.Метрика
            if (typeof ym !== 'undefined') {
                ym(YOUR_METRIKA_ID, 'reachGoal', 'callback_form_submit');
            }
        } else {
            alert('Ошибка при отправке заявки. Попробуйте еще раз или позвоните нам: +7 (969) 999-56-68');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при отправке заявки. Попробуйте еще раз или позвоните нам: +7 (969) 999-56-68');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

function openCatalog() {
    const catalogSection = document.querySelector('#catalog');
    if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function openCalculator() {
    const deliverySection = document.querySelector('#delivery');
    if (deliverySection) {
        deliverySection.scrollIntoView({ behavior: 'smooth' });
    }
}

// === Product Functions ===
function requestPrice(model) {
    console.log(`Price request for: ${model}`);

    alert(`Запрос цены на ${model}\n\nОткроется форма обратной связи с предзаполненной моделью`);

    // Отправка события в Яндекс.Метрику
    if (typeof ym !== 'undefined') {
        ym(YOUR_METRIKA_ID, 'reachGoal', 'price_request', {
            model: model
        });
    }
}

function showDetails(model) {
    console.log(`Show details for: ${model}`);

    // Переход на страницу товара
    // window.location.href = `/catalog/${model.toLowerCase()}.html`;

    alert(`Детальная информация о ${model}\n\nБудет создана отдельная страница товара`);
}

// === Load All Products ===
async function loadAllProducts() {
    const catalogGrid = document.querySelector('.catalog__grid');
    const loadButton = event.target;

    // Show loading state
    const originalText = loadButton.textContent;
    loadButton.disabled = true;
    loadButton.textContent = 'Загрузка...';

    try {
        const response = await fetch('/api/products');
        const data = await response.json();

        if (data.success && data.data) {
            // Clear existing products
            catalogGrid.innerHTML = '';

            // Render all products
            data.data.forEach(product => {
                const productCard = createProductCard(product);
                catalogGrid.appendChild(productCard);
            });

            // Hide the button after loading
            document.querySelector('.catalog__more').style.display = 'none';

            // Re-init scroll reveal for new products
            initScrollReveal();

            // Яндекс.Метрика
            if (typeof ym !== 'undefined') {
                ym(YOUR_METRIKA_ID, 'reachGoal', 'load_all_products');
            }
        } else {
            throw new Error('Failed to load products');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        alert('Ошибка при загрузке товаров. Попробуйте обновить страницу.');
        loadButton.disabled = false;
        loadButton.textContent = originalText;
    }
}

// Create product card HTML
function createProductCard(product) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.setAttribute('itemscope', '');
    article.setAttribute('itemtype', 'https://schema.org/Product');

    const badges = [];
    if (product.is_hit) badges.push('<div class="product-card__badge">Хит продаж</div>');
    if (product.is_new) badges.push('<div class="product-card__badge badge--new">Новинка</div>');

    article.innerHTML = `
        <div class="product-card__image">
            <img src="${product.image_url}" alt="${product.name}" itemprop="image" loading="lazy">
            ${badges.join('')}
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
                <button class="btn btn--primary btn--block" onclick="requestPrice('${product.model}')">
                    Узнать цену
                </button>
                <button class="btn btn--outline btn--block" onclick="showDetails('${product.model}')">
                    Подробнее
                </button>
            </div>
        </div>
    `;

    return article;
}

// === Form Handlers ===
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateInput(input);
            });

            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateInput(input);
                }
            });
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();

    if (!value) {
        showError(input, 'Это поле обязательно для заполнения');
        return false;
    }

    // Email validation
    if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showError(input, 'Введите корректный email');
            return false;
        }
    }

    // Phone validation (Russian format)
    if (input.type === 'tel') {
        // Удаляем все символы кроме цифр
        const digitsOnly = value.replace(/\D/g, '');

        // Проверяем длину (российский формат: 10-11 цифр)
        // 10 цифр: 9XXXXXXXXX (без кода страны)
        // 11 цифр: 7XXXXXXXXXX или 8XXXXXXXXXX
        if (digitsOnly.length < 10 || digitsOnly.length > 11) {
            showError(input, 'Введите корректный номер телефона (10-11 цифр)');
            return false;
        }

        // Если 11 цифр - проверяем что начинается с 7 или 8
        if (digitsOnly.length === 11) {
            if (digitsOnly[0] !== '7' && digitsOnly[0] !== '8') {
                showError(input, 'Номер должен начинаться с +7 или 8');
                return false;
            }
        }

        // Если 10 цифр - проверяем что начинается с 9 (мобильный без кода страны)
        if (digitsOnly.length === 10) {
            if (digitsOnly[0] !== '9') {
                showError(input, 'Введите корректный российский номер');
                return false;
            }
        }
    }

    clearError(input);
    return true;
}

function showError(input, message) {
    input.classList.add('error');
    input.style.borderColor = '#f44336';

    // Удаляем предыдущее сообщение об ошибке
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Добавляем новое сообщение
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = '#f44336';
    errorDiv.style.fontSize = '14px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

function clearError(input) {
    input.classList.remove('error');
    input.style.borderColor = '';

    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// === Contact Form Submit ===
function submitContactForm(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Validate all inputs
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required]');

    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        return;
    }

    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
        console.log('Form submitted:', Object.fromEntries(formData));

        // Success message
        alert('Спасибо! Ваша заявка отправлена.\nМы свяжемся с вами в ближайшее время.');

        // Reset form
        form.reset();

        // Restore button
        submitButton.disabled = false;
        submitButton.textContent = originalText;

        // Яндекс.Метрика
        if (typeof ym !== 'undefined') {
            ym(YOUR_METRIKA_ID, 'reachGoal', 'contact_form_submit');
        }
    }, 1500);
}

// === Delivery Calculator ===
function calculateDelivery(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    // Validate
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required]');

    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });

    if (!isValid) {
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Расчет...';

    // Simulate calculation
    setTimeout(() => {
        const city = formData.get('city') || 'указанный город';
        const model = form.querySelector('select').selectedOptions[0].text;

        alert(`Стоимость доставки в ${city}:\n\nМодель: ${model}\nДоставка: от 5 000 ₽\nСрок: 3-7 дней\n\nТочную стоимость уточнит менеджер`);

        submitButton.disabled = false;
        submitButton.textContent = originalText;

        // Яндекс.Метрика
        if (typeof ym !== 'undefined') {
            ym(YOUR_METRIKA_ID, 'reachGoal', 'delivery_calculation');
        }
    }, 1000);
}

// === Phone Mask ===
document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');

        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                value = '7' + value.substring(1);
            } else if (value[0] !== '7') {
                value = '7' + value;
            }

            let formattedValue = '+7';

            if (value.length > 1) {
                formattedValue += ' (' + value.substring(1, 4);
            }
            if (value.length >= 5) {
                formattedValue += ') ' + value.substring(4, 7);
            }
            if (value.length >= 8) {
                formattedValue += '-' + value.substring(7, 9);
            }
            if (value.length >= 10) {
                formattedValue += '-' + value.substring(9, 11);
            }

            e.target.value = formattedValue;
        }
    });
});

// === Utility Functions ===

// Throttle function for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === Console welcome message ===
console.log(
    '%c🚜 DONGFENG Минитрактора',
    'color: #2a9d4e; font-size: 20px; font-weight: bold;'
);
console.log(
    '%cОфициальный дилер в России',
    'color: #666; font-size: 14px;'
);
