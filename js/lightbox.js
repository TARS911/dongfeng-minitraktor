/**
 * Lightbox Gallery - JavaScript
 * Галерея для просмотра изображений
 */

let lightboxImages = [];
let currentImageIndex = 0;

// Создание lightbox элемента
function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox__content">
            <button class="lightbox__close" onclick="closeLightbox()" aria-label="Закрыть">×</button>
            <button class="lightbox__nav lightbox__nav--prev" onclick="previousImage()" aria-label="Предыдущее">‹</button>
            <button class="lightbox__nav lightbox__nav--next" onclick="nextImage()" aria-label="Следующее">›</button>
            <img class="lightbox__image" id="lightboxImage" src="" alt="">
            <div class="lightbox__caption" id="lightboxCaption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);

    // Закрытие по клику на overlay
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
        if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
            previousImage();
        }
        if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
            nextImage();
        }
    });
}

// Открыть lightbox
function openLightbox(imageSrc, imageAlt, allImages = []) {
    let lightbox = document.getElementById('lightbox');

    if (!lightbox) {
        createLightbox();
        lightbox = document.getElementById('lightbox');
    }

    // Сохранить все изображения для навигации
    if (allImages.length > 0) {
        lightboxImages = allImages;
        currentImageIndex = allImages.findIndex(img => img.src === imageSrc);
    } else {
        lightboxImages = [{ src: imageSrc, alt: imageAlt }];
        currentImageIndex = 0;
    }

    // Показать изображение
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');

    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt;
    lightboxCaption.textContent = imageAlt;

    // Показать/скрыть навигацию
    const prevBtn = document.querySelector('.lightbox__nav--prev');
    const nextBtn = document.querySelector('.lightbox__nav--next');

    if (lightboxImages.length > 1) {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }

    // Показать lightbox
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Закрыть lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Предыдущее изображение
function previousImage() {
    if (lightboxImages.length <= 1) return;

    currentImageIndex--;
    if (currentImageIndex < 0) {
        currentImageIndex = lightboxImages.length - 1;
    }

    const image = lightboxImages[currentImageIndex];
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
}

// Следующее изображение
function nextImage() {
    if (lightboxImages.length <= 1) return;

    currentImageIndex++;
    if (currentImageIndex >= lightboxImages.length) {
        currentImageIndex = 0;
    }

    const image = lightboxImages[currentImageIndex];
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxCaption.textContent = image.alt;
}

// Добавить click handlers к изображениям товаров
function initProductImageLightbox() {
    // Подождать пока товары загрузятся
    setTimeout(() => {
        const productCards = document.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const image = card.querySelector('.product-card__image img');

            if (image) {
                image.style.cursor = 'zoom-in';
                image.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    const imageSrc = image.src;
                    const imageAlt = image.alt;

                    // Собрать все изображения товаров для навигации
                    const allProductImages = Array.from(document.querySelectorAll('.product-card__image img')).map(img => ({
                        src: img.src,
                        alt: img.alt
                    }));

                    openLightbox(imageSrc, imageAlt, allProductImages);
                });
            }
        });
    }, 500);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initProductImageLightbox();
});

// Экспортировать функции для глобального использования
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.previousImage = previousImage;
window.nextImage = nextImage;
window.initProductImageLightbox = initProductImageLightbox;
