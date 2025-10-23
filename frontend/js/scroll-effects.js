/**
 * Scroll Reveal Effects - Современные анимации при прокрутке
 */

class ScrollEffects {
    constructor() {
        this.elements = document.querySelectorAll('.scroll-reveal');
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                this.observerOptions
            );

            this.elements.forEach(el => {
                this.observer.observe(el);
            });
        } else {
            // Fallback для старых браузеров
            this.elements.forEach(el => {
                el.classList.add('revealed');
            });
        }

        // Parallax эффект для элементов
        this.initParallax();

        // Smooth scroll для якорных ссылок
        this.initSmoothScroll();
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Отключаем наблюдение после появления (для производительности)
                this.observer.unobserve(entry.target);
            }
        });
    }

    initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length === 0) return;

        const handleParallax = () => {
            const scrollY = window.pageYOffset;

            parallaxElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                const yPos = -(scrollY * speed);
                el.style.transform = `translateY(${yPos}px)`;
            });
        };

        // Используем requestAnimationFrame для плавности
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleParallax();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                // Игнорируем пустые якоря
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    const headerOffset = 85; // Высота header
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // Метод для добавления новых элементов динамически
    observeNewElements(selector) {
        const newElements = document.querySelectorAll(selector);
        newElements.forEach(el => {
            if (!el.classList.contains('revealed')) {
                this.observer.observe(el);
            }
        });
    }
}

// Lazy loading для изображений
class LazyLoader {
    constructor() {
        this.images = document.querySelectorAll('img[data-src]');
        this.init();
    }

    init() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        observer.unobserve(img);
                    }
                });
            });

            this.images.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback
            this.images.forEach(img => this.loadImage(img));
        }
    }

    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Добавляем placeholder эффект
        img.classList.add('loading');

        img.src = src;
        
        img.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };

        img.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
        };
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    const scrollEffects = new ScrollEffects();
    const lazyLoader = new LazyLoader();

    // Экспортируем в глобальную область для доступа из других скриптов
    window.scrollEffects = scrollEffects;
});

// Анимация цифр (counter animation)
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16); // 60 FPS
    let current = start;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current).toLocaleString('ru-RU');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target.toLocaleString('ru-RU');
        }
    };

    updateCounter();
}

// Наблюдение за счетчиками
document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('[data-counter]');
    
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.counter);
                    animateCounter(entry.target, target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }
});
