/**
 * СОВРЕМЕННЫЙ СЛАЙДЕР ИЗОБРАЖЕНИЙ
 * Автоматическая прокрутка, свайпы, keyboard navigation
 */

class ImageSlider {
    constructor(element, options = {}) {
        this.slider = element;
        this.track = element.querySelector('.image-slider__track');
        this.slides = Array.from(element.querySelectorAll('.image-slider__slide'));
        this.prevBtn = element.querySelector('.image-slider__nav--prev');
        this.nextBtn = element.querySelector('.image-slider__nav--next');
        this.dotsContainer = element.querySelector('.image-slider__dots');
        this.playPauseBtn = element.querySelector('.image-slider__play-pause');
        this.counter = element.querySelector('.image-slider__counter');
        this.progress = element.querySelector('.image-slider__progress');

        // Настройки
        this.options = {
            autoplay: options.autoplay !== false,
            interval: options.interval || 5000,
            loop: options.loop !== false,
            swipe: options.swipe !== false,
            keyboard: options.keyboard !== false,
            ...options
        };

        // Состояние
        this.currentIndex = 0;
        this.isPlaying = this.options.autoplay;
        this.autoplayTimer = null;
        this.isDragging = false;
        this.startPos = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        // Создать индикаторы
        this.createDots();

        // Показать первый слайд
        this.goToSlide(0);

        // Event listeners
        this.addEventListeners();

        // Запустить автопрокрутку
        if (this.isPlaying) {
            this.startAutoplay();
        }

        // Lazy load изображений
        this.lazyLoadImages();
    }

    createDots() {
        if (!this.dotsContainer) return;

        this.dotsContainer.innerHTML = '';
        this.slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('image-slider__dot');
            dot.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(index));
            this.dotsContainer.appendChild(dot);
        });
        this.dots = Array.from(this.dotsContainer.querySelectorAll('.image-slider__dot'));
    }

    addEventListeners() {
        // Кнопки навигации
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }

        // Кнопка play/pause
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }

        // Keyboard navigation
        if (this.options.keyboard) {
            document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        }

        // Свайпы (touch events)
        if (this.options.swipe) {
            this.addSwipeListeners();
        }

        // Пауза при hover
        this.slider.addEventListener('mouseenter', () => {
            if (this.isPlaying) {
                this.pauseAutoplay();
            }
        });

        this.slider.addEventListener('mouseleave', () => {
            if (this.isPlaying) {
                this.startAutoplay();
            }
        });

        // Pause/Resume при visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoplay();
            } else if (this.isPlaying) {
                this.startAutoplay();
            }
        });
    }

    addSwipeListeners() {
        // Touch events
        this.slider.addEventListener('touchstart', (e) => this.touchStart(e), { passive: true });
        this.slider.addEventListener('touchmove', (e) => this.touchMove(e), { passive: false });
        this.slider.addEventListener('touchend', () => this.touchEnd());

        // Mouse events для десктопа
        this.slider.addEventListener('mousedown', (e) => this.touchStart(e));
        this.slider.addEventListener('mousemove', (e) => this.touchMove(e));
        this.slider.addEventListener('mouseup', () => this.touchEnd());
        this.slider.addEventListener('mouseleave', () => this.touchEnd());
    }

    touchStart(e) {
        this.isDragging = true;
        this.startPos = this.getPositionX(e);
        this.slider.classList.add('dragging');
        this.pauseAutoplay();
    }

    touchMove(e) {
        if (!this.isDragging) return;

        const currentPosition = this.getPositionX(e);
        const diff = currentPosition - this.startPos;

        // Небольшое сопротивление на краях
        if ((this.currentIndex === 0 && diff > 0) ||
            (this.currentIndex === this.slides.length - 1 && diff < 0)) {
            this.currentTranslate = this.prevTranslate + diff * 0.3;
        } else {
            this.currentTranslate = this.prevTranslate + diff;
        }

        this.setSliderPosition();
    }

    touchEnd() {
        if (!this.isDragging) return;

        this.isDragging = false;
        this.slider.classList.remove('dragging');

        const movedBy = this.currentTranslate - this.prevTranslate;

        // Если свайп больше 50px - переключить слайд
        if (movedBy < -50 && this.currentIndex < this.slides.length - 1) {
            this.next();
        } else if (movedBy > 50 && this.currentIndex > 0) {
            this.prev();
        } else {
            this.goToSlide(this.currentIndex);
        }

        if (this.isPlaying) {
            this.startAutoplay();
        }
    }

    getPositionX(e) {
        return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    }

    setSliderPosition() {
        this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }

    handleKeyboard(e) {
        if (e.key === 'ArrowLeft') {
            this.prev();
        } else if (e.key === 'ArrowRight') {
            this.next();
        }
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;

        this.currentIndex = index;
        this.currentTranslate = -index * this.slider.clientWidth;
        this.prevTranslate = this.currentTranslate;

        // Обновить позицию
        this.track.style.transform = `translateX(-${index * 100}%)`;

        // Обновить активные классы
        this.slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        if (this.dots) {
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        // Обновить счетчик
        this.updateCounter();

        // Обновить кнопки
        this.updateNavButtons();
    }

    next() {
        if (this.currentIndex < this.slides.length - 1) {
            this.goToSlide(this.currentIndex + 1);
        } else if (this.options.loop) {
            this.goToSlide(0);
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.goToSlide(this.currentIndex - 1);
        } else if (this.options.loop) {
            this.goToSlide(this.slides.length - 1);
        }
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayTimer = setInterval(() => {
            this.next();
        }, this.options.interval);

        this.slider.classList.add('autoplay');
    }

    pauseAutoplay() {
        this.stopAutoplay();
        this.slider.classList.remove('autoplay');
    }

    stopAutoplay() {
        if (this.autoplayTimer) {
            clearInterval(this.autoplayTimer);
            this.autoplayTimer = null;
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            this.startAutoplay();
            this.updatePlayPauseButton(true);
        } else {
            this.pauseAutoplay();
            this.updatePlayPauseButton(false);
        }
    }

    updatePlayPauseButton(isPlaying) {
        if (!this.playPauseBtn) return;

        const icon = isPlaying
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>';

        this.playPauseBtn.innerHTML = icon;
        this.playPauseBtn.setAttribute('aria-label', isPlaying ? 'Пауза' : 'Воспроизвести');
    }

    updateCounter() {
        if (!this.counter) return;

        this.counter.innerHTML = `
            <span class="image-slider__counter-current">${this.currentIndex + 1}</span>
            <span> / ${this.slides.length}</span>
        `;
    }

    updateNavButtons() {
        if (!this.options.loop) {
            if (this.prevBtn) {
                this.prevBtn.disabled = this.currentIndex === 0;
            }
            if (this.nextBtn) {
                this.nextBtn.disabled = this.currentIndex === this.slides.length - 1;
            }
        }
    }

    lazyLoadImages() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                        img.parentElement.classList.remove('loading');
                    });
                    observer.unobserve(img);
                }
            });
        });

        this.slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (img && img.dataset.src) {
                slide.classList.add('loading');
                imageObserver.observe(img);
            }
        });
    }

    destroy() {
        this.stopAutoplay();
        // Удалить все event listeners (упрощенная версия)
        this.slider.innerHTML = this.slider.innerHTML;
    }
}

// Инициализация всех слайдеров на странице
function initImageSliders() {
    const sliders = document.querySelectorAll('.image-slider');
    sliders.forEach(slider => {
        new ImageSlider(slider, {
            autoplay: true,
            interval: 5000,
            loop: true,
            swipe: true,
            keyboard: true
        });
    });
}

// Запуск при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageSliders);
} else {
    initImageSliders();
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImageSlider;
}
