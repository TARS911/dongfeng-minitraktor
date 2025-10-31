/**
 * Mobile Menu - JavaScript
 * Управление мобильным меню
 */

// Переключение мобильного меню
function toggleMobileMenu() {
    const burger = document.querySelector('.burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const body = document.body;

    // Переключаем классы
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    overlay.classList.toggle('active');

    // Блокируем скролл когда меню открыто
    if (mobileMenu.classList.contains('active')) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = '';
    }
}

// Закрытие меню
function closeMobileMenu() {
    const burger = document.querySelector('.burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const body = document.body;

    burger.classList.remove('active');
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    body.style.overflow = '';
}

// Закрытие по клику на overlay
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('mobileMenuOverlay');

    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }

    // Закрытие по клику на ссылку
    const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__catalog-link');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Закрываем меню при переходе по ссылке
            setTimeout(closeMobileMenu, 300);
        });
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenu = document.getElementById('mobileMenu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    });
});

// Экспорт функций для глобального использования
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
