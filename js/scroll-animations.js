/**
 * Scroll Animations - Intersection Observer
 * Современные анимации появления элементов при скролле
 */

(function() {
    'use strict';

    // Проверка поддержки Intersection Observer
    if (!('IntersectionObserver' in window)) {
        console.warn('Intersection Observer не поддерживается');
        // Показываем все элементы без анимации
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.classList.add('is-visible');
        });
        return;
    }

    // Конфигурация наблюдателя
    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px 0px -100px 0px', // Триггер чуть раньше появления
        threshold: 0.1 // 10% элемента должно быть видимо
    };

    // Callback для наблюдателя
    const handleIntersection = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;

                // Добавляем класс для анимации
                element.classList.add('is-visible');

                // Перестаем наблюдать за элементом (анимация только раз)
                observer.unobserve(element);

                // Триггерим кастомное событие
                element.dispatchEvent(new CustomEvent('animated', {
                    bubbles: true,
                    detail: { element }
                }));
            }
        });
    };

    // Создаем наблюдателя
    const observer = new IntersectionObserver(handleIntersection, observerOptions);

    // Функция инициализации
    const initScrollAnimations = () => {
        // Находим все элементы с атрибутом data-animate
        const animatedElements = document.querySelectorAll('[data-animate]');

        if (animatedElements.length === 0) {
            return;
        }

        // Начинаем наблюдать за каждым элементом
        animatedElements.forEach((element, index) => {
            // Добавляем задержку для каскадного эффекта
            if (element.dataset.animateDelay) {
                element.style.animationDelay = element.dataset.animateDelay;
            } else if (!element.hasAttribute('data-no-delay')) {
                // Автоматическая задержка (если не указана другая)
                const delay = (index % 4) * 0.1; // Группами по 4
                element.style.animationDelay = `${delay}s`;
            }

            observer.observe(element);
        });
    };

    // Дополнительные утилиты для анимаций

    /**
     * Добавить анимацию к элементу программно
     * @param {HTMLElement} element
     * @param {string} animationType - 'fade', 'scale', 'left', 'right' или пустая строка для 'fadeInUp'
     */
    window.addScrollAnimation = function(element, animationType = '') {
        if (!element) return;

        element.setAttribute('data-animate', animationType);
        observer.observe(element);
    };

    /**
     * Удалить анимацию и сделать элемент видимым
     * @param {HTMLElement} element
     */
    window.removeScrollAnimation = function(element) {
        if (!element) return;

        element.classList.add('is-visible');
        observer.unobserve(element);
    };

    /**
     * Сбросить анимации (для динамического контента)
     */
    window.resetScrollAnimations = function() {
        // Находим все элементы с is-visible
        const visibleElements = document.querySelectorAll('[data-animate].is-visible');

        visibleElements.forEach(element => {
            element.classList.remove('is-visible');
            observer.observe(element);
        });
    };

    /**
     * Анимация элементов в контейнере с каскадным эффектом
     * @param {string} containerSelector
     * @param {string} itemsSelector
     * @param {number} delayStep - задержка между элементами в мс
     */
    window.animateChildren = function(containerSelector, itemsSelector, delayStep = 100) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        const items = container.querySelectorAll(itemsSelector);
        items.forEach((item, index) => {
            item.setAttribute('data-animate', 'fade');
            item.style.animationDelay = `${index * delayStep}ms`;
            observer.observe(item);
        });
    };

    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        initScrollAnimations();
    }

    // Ре-инициализация для динамически добавленных элементов
    const mutationObserver = new MutationObserver((mutations) => {
        let hasNewAnimatedElements = false;

        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    // Проверяем сам элемент
                    if (node.hasAttribute && node.hasAttribute('data-animate')) {
                        observer.observe(node);
                        hasNewAnimatedElements = true;
                    }

                    // Проверяем дочерние элементы
                    if (node.querySelectorAll) {
                        const children = node.querySelectorAll('[data-animate]');
                        if (children.length > 0) {
                            children.forEach(child => observer.observe(child));
                            hasNewAnimatedElements = true;
                        }
                    }
                }
            });
        });

        if (hasNewAnimatedElements) {
            console.log('🎬 Новые анимированные элементы добавлены');
        }
    });

    // Наблюдаем за изменениями в DOM
    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Экспортируем для глобального использования
    window.ScrollAnimations = {
        init: initScrollAnimations,
        add: window.addScrollAnimation,
        remove: window.removeScrollAnimation,
        reset: window.resetScrollAnimations,
        animateChildren: window.animateChildren
    };

    // Debug режим
    if (window.location.search.includes('debug-animations')) {
        console.log('🎬 Scroll Animations initialized');
        console.log('📊 Animated elements:', document.querySelectorAll('[data-animate]').length);

        // Подсветка анимированных элементов
        document.querySelectorAll('[data-animate]').forEach(el => {
            el.style.outline = '2px dashed rgba(255, 0, 0, 0.5)';
        });

        // Лог событий анимации
        document.addEventListener('animated', (e) => {
            console.log('✨ Animated:', e.detail.element);
        });
    }
})();
