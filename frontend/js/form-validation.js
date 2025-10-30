/**
 * Form Validation & Enhancement
 * Улучшенная валидация форм с анимациями
 */

// Конфигурация валидации
const validationRules = {
    name: {
        minLength: 2,
        maxLength: 50,
        pattern: /^[а-яА-ЯёЁa-zA-Z\s-]+$/,
        message: 'Имя должно содержать только буквы (2-50 символов)'
    },
    phone: {
        pattern: /^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/,
        message: 'Введите корректный номер телефона'
    },
    email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Введите корректный email'
    },
    message: {
        minLength: 10,
        maxLength: 500,
        message: 'Сообщение должно быть от 10 до 500 символов'
    }
};

// Форматирование телефона при вводе
function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');

    if (value.startsWith('8')) {
        value = '7' + value.slice(1);
    }

    if (value.startsWith('7')) {
        value = '+7 (' + value.slice(1, 4) + ') ' +
                value.slice(4, 7) + '-' +
                value.slice(7, 9) + '-' +
                value.slice(9, 11);
    }

    input.value = value;
}

// Валидация поля
function validateField(input) {
    const fieldName = input.name || input.id;
    const rule = validationRules[fieldName];

    if (!rule) return true;

    const value = input.value.trim();

    // Проверка минимальной длины
    if (rule.minLength && value.length < rule.minLength) {
        showError(input, rule.message);
        return false;
    }

    // Проверка максимальной длины
    if (rule.maxLength && value.length > rule.maxLength) {
        showError(input, rule.message);
        return false;
    }

    // Проверка по регулярному выражению
    if (rule.pattern && !rule.pattern.test(value)) {
        showError(input, rule.message);
        return false;
    }

    showSuccess(input);
    return true;
}

// Показать ошибку
function showError(input, message) {
    const formGroup = input.closest('.form-group') || input.parentElement;

    // Удалить предыдущие сообщения
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Добавить класс ошибки
    input.classList.add('error');
    input.classList.remove('success');

    // Создать сообщение об ошибке
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #f44336;
        font-size: 12px;
        margin-top: 4px;
        animation: shake 0.5s;
    `;

    formGroup.appendChild(errorDiv);
}

// Показать успех
function showSuccess(input) {
    const formGroup = input.closest('.form-group') || input.parentElement;

    // Удалить сообщения об ошибке
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Добавить класс успеха
    input.classList.remove('error');
    input.classList.add('success');
}

// Инициализация валидации для всех форм
function initFormValidation() {
    const forms = document.querySelectorAll('form');

    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, textarea');

        inputs.forEach(input => {
            // Валидация при потере фокуса
            input.addEventListener('blur', () => {
                if (input.value.trim()) {
                    validateField(input);
                }
            });

            // Живая валидация при вводе (с задержкой)
            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (input.value.trim()) {
                        validateField(input);
                    }
                }, 500);
            });

            // Форматирование телефона
            if (input.type === 'tel' || input.name === 'phone') {
                input.addEventListener('input', () => formatPhone(input));
            }
        });

        // Валидация при отправке формы
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            let isValid = true;
            const formInputs = form.querySelectorAll('input:not([type="submit"]), textarea');

            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                // Показать уведомление
                showNotification('Пожалуйста, исправьте ошибки в форме', 'error');

                // Прокрутить к первой ошибке
                const firstError = form.querySelector('.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                return;
            }

            // Форма валидна - отправляем
            await submitForm(form);
        });
    });
}

// Отправка формы
async function submitForm(form) {
    const submitBtn = form.querySelector('[type="submit"]');
    const originalText = submitBtn.textContent;

    // Показать загрузку
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Отправка...';

    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Здесь будет реальная отправка на сервер
        // const response = await fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });

        // Симуляция отправки
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Успех
        showNotification('Спасибо! Ваше сообщение отправлено', 'success');
        form.reset();

        // Убрать классы валидации
        form.querySelectorAll('.success, .error').forEach(el => {
            el.classList.remove('success', 'error');
        });

    } catch (error) {
        showNotification('Ошибка отправки. Попробуйте позже', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        font-weight: 500;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initFormValidation);

// Scroll reveal анимация
function initScrollReveal() {
    const reveals = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => observer.observe(reveal));
}

document.addEventListener('DOMContentLoaded', initScrollReveal);

// Экспорт функций
window.validateField = validateField;
window.showNotification = showNotification;
