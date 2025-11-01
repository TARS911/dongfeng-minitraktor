#!/usr/bin/env python3
"""
Скрипт для применения вертикального меню ко всем страницам сайта
"""

import os
import re
from pathlib import Path

# Список всех HTML страниц для обновления
PAGES = [
    'index.html',
    'catalog.html',
    'cart.html',
    'compare.html',
    'favorites.html',
    'payment.html',
    'delivery.html',
    'warranty.html',
    'contacts.html',
    'media.html',
    'articles.html',
    'about.html',
    'terms.html',
    'privacy.html'
]

FRONTEND_DIR = Path(__file__).parent / 'frontend'

# HTML компонент вертикального меню (sidebar)
SIDEBAR_HTML = '''    <!-- Кнопка переключения sidebar (для мобильных) - СПРАВА ВВЕРХУ -->
    <button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Меню">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    </button>

    <!-- Overlay для мобильных устройств -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Вертикальное боковое меню -->
    <aside class="sidebar-menu" id="sidebarMenu">
        <!-- Заголовок с логотипом и кнопкой закрытия -->
        <div class="sidebar-menu__header">
            <div class="sidebar-menu__logo-container">
                <a href="index.html" class="sidebar-menu__logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                    </svg>
                    DONGFENG
                </a>
            </div>
            <button class="sidebar-menu__close" onclick="closeSidebar()" aria-label="Закрыть">
                ×
            </button>
        </div>

        <!-- Навигация -->
        <nav class="sidebar-menu__nav">
            <ul class="sidebar-menu__list">
                <!-- Кнопка каталога -->
                <li class="sidebar-menu__item">
                    <a href="catalog.html" class="sidebar-menu__link sidebar-menu__link--catalog">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        КАТАЛОГ
                    </a>
                </li>

                <!-- Главная -->
                <li class="sidebar-menu__item">
                    <a href="index.html" class="sidebar-menu__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        Главная
                    </a>
                </li>

                <!-- Оплата -->
                <li class="sidebar-menu__item">
                    <a href="payment.html" class="sidebar-menu__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                            <line x1="1" y1="10" x2="23" y2="10"></line>
                        </svg>
                        Оплата
                    </a>
                </li>

                <!-- Доставка -->
                <li class="sidebar-menu__item">
                    <a href="delivery.html" class="sidebar-menu__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="1" y="3" width="15" height="13"></rect>
                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                            <circle cx="5.5" cy="18.5" r="2.5"></circle>
                            <circle cx="18.5" cy="18.5" r="2.5"></circle>
                        </svg>
                        Доставка
                    </a>
                </li>

                <!-- Гарантия -->
                <li class="sidebar-menu__item">
                    <a href="warranty.html" class="sidebar-menu__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        Гарантия
                    </a>
                </li>

                <!-- Статьи -->
                <li class="sidebar-menu__item">
                    <a href="articles.html" class="sidebar-menu__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        Статьи
                    </a>
                </li>

                <!-- Контакты -->
                <li class="sidebar-menu__item">
                    <a href="contacts.html" class="sidebar-menu__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        Контакты
                    </a>
                </li>

                <!-- Медиа -->
                <li class="sidebar-menu__item">
                    <a href="media.html" class="sidebar-menu__link">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                            <line x1="7" y1="2" x2="7" y2="22"></line>
                            <line x1="17" y1="2" x2="17" y2="22"></line>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <line x1="2" y1="7" x2="7" y2="7"></line>
                            <line x1="2" y1="17" x2="7" y2="17"></line>
                            <line x1="17" y1="17" x2="22" y2="17"></line>
                            <line x1="17" y1="7" x2="22" y2="7"></line>
                        </svg>
                        Медиа
                    </a>
                </li>
            </ul>
        </nav>

        <!-- Селектор города внизу -->
        <div class="sidebar-city-selector">
            <button class="sidebar-city-selector__btn" onclick="toggleSidebarCitySelector()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                <span id="sidebarSelectedCity">Белгород</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
            <div class="sidebar-city-selector__dropdown" id="sidebarCityDropdown">
                <div class="sidebar-city-selector__title">Выберите ваш город:</div>
                <ul class="sidebar-city-selector__list">
                    <li onclick="selectSidebarCity('Белгород')">Белгород</li>
                    <li onclick="selectSidebarCity('Курск')">Курск</li>
                    <li onclick="selectSidebarCity('Воронеж')">Воронеж</li>
                    <li onclick="selectSidebarCity('Орёл')">Орёл</li>
                    <li onclick="selectSidebarCity('Тула')">Тула</li>
                    <li onclick="selectSidebarCity('Липецк')">Липецк</li>
                    <li onclick="selectSidebarCity('Брянск')">Брянск</li>
                </ul>
            </div>
        </div>
    </aside>

'''

# Мобильные элементы (кнопки)
MOBILE_ELEMENTS = '''
    <!-- Плавающая кнопка (видна только на мобильных) -->
    <button class="floating-action-btn" title="Быстрые действия">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    </button>

    <!-- Кнопка "Заказать звонок" внизу (видна только на мобильных) -->
    <div class="call-me-bottom-btn">
        <div class="call-me-bottom-btn__container">
            <a href="tel:+79699995668" class="call-me-bottom-btn__phone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +7 (969) 999-56-68
            </a>
            <button class="call-me-bottom-btn__button" onclick="alert('Форма заказа звонка')">
                Заказать звонок
            </button>
        </div>
    </div>
'''


def update_page(page_name):
    """Обновить одну страницу"""
    file_path = FRONTEND_DIR / page_name

    if not file_path.exists():
        print(f"❌ Файл не найден: {page_name}")
        return False

    print(f"📄 Обрабатываю {page_name}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_lines = len(content.split('\n'))

    # 1. Добавляем CSS файлы если их нет
    if 'vertical-menu.css' not in content:
        # Ищем где подключается cart-buttons-fix.css или другие CSS
        css_pattern = r'(<link rel="stylesheet" href="css/cart-buttons-fix\.css[^>]*>)'
        if re.search(css_pattern, content):
            content = re.sub(
                css_pattern,
                r'\1\n        <link rel="stylesheet" href="css/vertical-menu.css" />\n        <link rel="stylesheet" href="css/mobile-improvements.css" />',
                content
            )
            print(f"  ✅ Добавлены CSS файлы")
        else:
            print(f"  ⚠️  Не найдено место для CSS, пропускаю")

    # 2. Добавляем класс body
    if 'with-sidebar' not in content:
        content = re.sub(
            r'<body([^>]*)>',
            r'<body\1 class="with-sidebar">',
            content
        )
        print(f"  ✅ Добавлен класс body")

    # 3. Добавляем класс к header
    if 'modern-header--with-sidebar' not in content:
        content = re.sub(
            r'<header class="modern-header"',
            r'<header class="modern-header modern-header--with-sidebar"',
            content
        )
        print(f"  ✅ Добавлен класс header")

    # 4. Добавляем sidebar перед существующим header или в начало body
    if 'sidebar-menu' not in content:
        # Пытаемся вставить после открывающего <body>
        body_match = re.search(r'<body[^>]*>\s*', content)
        if body_match:
            insert_pos = body_match.end()
            content = content[:insert_pos] + '\n' + SIDEBAR_HTML + '\n' + content[insert_pos:]
            print(f"  ✅ Добавлен sidebar")

    # 5. Добавляем мобильные элементы перед закрывающим </body>
    if 'floating-action-btn' not in content:
        content = re.sub(
            r'(\s*)<script src="js/vertical-menu\.js">',
            MOBILE_ELEMENTS + r'\n\1<script src="js/vertical-menu.js">',
            content
        )
        print(f"  ✅ Добавлены мобильные кнопки")

    # 6. Добавляем JS файл vertical-menu.js если его нет
    if 'vertical-menu.js' not in content:
        # Вставляем перед modern-header.js
        content = re.sub(
            r'(<script src="js/modern-header\.js">)',
            r'<script src="js/vertical-menu.js"></script>\n        \1',
            content
        )
        print(f"  ✅ Добавлен vertical-menu.js")

    # Проверяем что не потеряли контент
    new_lines = len(content.split('\n'))
    line_diff = abs(new_lines - original_lines)

    if line_diff > 500:
        print(f"  ⚠️  ВНИМАНИЕ: Большая разница в строках ({line_diff}), проверяю...")
        return False

    # Сохраняем
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✅ Сохранено ({new_lines} строк, +{new_lines - original_lines})")
    return True


def main():
    print("🚀 Начинаю применение вертикального меню ко всем страницам...\n")

    success_count = 0
    failed_pages = []

    for page in PAGES:
        if update_page(page):
            success_count += 1
        else:
            failed_pages.append(page)
        print()

    print(f"\n{'='*60}")
    print(f"✅ Успешно обновлено: {success_count}/{len(PAGES)} страниц")

    if failed_pages:
        print(f"❌ Ошибки на страницах: {', '.join(failed_pages)}")
    else:
        print(f"🎉 Все страницы успешно обновлены!")

    print(f"{'='*60}\n")


if __name__ == '__main__':
    main()
