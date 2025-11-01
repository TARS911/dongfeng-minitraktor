#!/usr/bin/env python3
"""
Добавляет вертикальное меню (sidebar) на все страницы сайта
"""

import re
from pathlib import Path

# Все HTML страницы (кроме index.html, где sidebar уже есть)
html_files = [
    "catalog.html",
    "cart.html",
    "compare.html",
    "favorites.html",
    "payment.html",
    "delivery.html",
    "warranty.html",
    "contacts.html",
    "media.html",
    "articles.html",
    "about.html",
    "terms.html",
    "privacy.html",
]

frontend_dir = Path("frontend")

# HTML блок sidebar (копируется из index.html)
sidebar_html = """        <!-- Кнопка переключения sidebar (для мобильных) - СПРАВА ВВЕРХУ -->
        <button
            class="sidebar-toggle"
            onclick="toggleSidebar()"
            aria-label="Меню"
        >
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
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
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
                            />
                        </svg>
                        DONGFENG
                    </a>
                </div>
                <button
                    class="sidebar-menu__close"
                    onclick="closeSidebar()"
                    aria-label="Закрыть"
                >
                    ×
                </button>
            </div>

            <!-- Кнопка скрытия/показа sidebar (только десктоп) -->
            <div class="sidebar-collapse-toggle">
                <button
                    class="sidebar-desktop-toggle"
                    onclick="toggleSidebarDesktop()"
                    title="Свернуть/развернуть меню"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- Навигация -->
            <nav class="sidebar-menu__nav">
                <ul class="sidebar-menu__list">
                    <!-- Кнопка каталога -->
                    <li class="sidebar-menu__item">
                        <a
                            href="catalog.html"
                            class="sidebar-menu__link sidebar-menu__link--catalog"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
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
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                                ></path>
                                <polyline
                                    points="9 22 9 12 15 12 15 22"
                                ></polyline>
                            </svg>
                            Главная
                        </a>
                    </li>

                    <!-- Оплата -->
                    <li class="sidebar-menu__item">
                        <a href="payment.html" class="sidebar-menu__link">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <rect
                                    x="1"
                                    y="4"
                                    width="22"
                                    height="16"
                                    rx="2"
                                    ry="2"
                                ></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                            Оплата
                        </a>
                    </li>

                    <!-- Доставка -->
                    <li class="sidebar-menu__item">
                        <a href="delivery.html" class="sidebar-menu__link">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <rect x="1" y="3" width="15" height="13"></rect>
                                <polygon
                                    points="16 8 20 8 23 11 23 16 16 16 16 8"
                                ></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                            </svg>
                            Доставка
                        </a>
                    </li>

                    <!-- Гарантия -->
                    <li class="sidebar-menu__item">
                        <a href="warranty.html" class="sidebar-menu__link">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                                ></path>
                            </svg>
                            Гарантия
                        </a>
                    </li>

                    <!-- Статьи -->
                    <li class="sidebar-menu__item">
                        <a href="articles.html" class="sidebar-menu__link">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                ></path>
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
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <path
                                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                                ></path>
                            </svg>
                            Контакты
                        </a>
                    </li>

                    <!-- Медиа -->
                    <li class="sidebar-menu__item">
                        <a href="media.html" class="sidebar-menu__link">
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                            >
                                <rect
                                    x="2"
                                    y="2"
                                    width="20"
                                    height="20"
                                    rx="2.18"
                                    ry="2.18"
                                ></rect>
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
                <button
                    class="sidebar-city-selector__btn"
                    onclick="toggleSidebarCitySelector()"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                        />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span id="sidebarSelectedCity">Белгород</span>
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
                <div
                    class="sidebar-city-selector__dropdown"
                    id="sidebarCityDropdown"
                >
                    <div class="sidebar-city-selector__title">
                        Выберите ваш город:
                    </div>
                    <ul class="sidebar-city-selector__list">
                        <li onclick="selectSidebarCity('Белгород')">
                            Белгород
                        </li>
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

"""

for html_file in html_files:
    file_path = frontend_dir / html_file

    if not file_path.exists():
        print(f"⚠️  Пропускаем {html_file} - файл не найден")
        continue

    content = file_path.read_text(encoding="utf-8")
    original_content = content

    # Проверяем, есть ли уже sidebar
    if 'id="sidebarMenu"' in content:
        print(f"ℹ️  {html_file} - sidebar уже добавлен")
        continue

    # 1. Добавляем class="with-sidebar" к <body>
    content = re.sub(r"<body([^>]*)>", r'<body\1 class="with-sidebar">', content)

    # 2. Добавляем sidebar ПОСЛЕ <body>
    content = re.sub(
        r"(<body[^>]*>)\s*\n", r"\1\n" + sidebar_html + "\n", content, count=1
    )

    # 3. Добавляем класс modern-header--with-sidebar к header (если его нет)
    if "modern-header--with-sidebar" not in content:
        content = re.sub(
            r'<header class="modern-header"',
            r'<header class="modern-header modern-header--with-sidebar"',
            content,
        )

    # 4. Добавляем CSS для sidebar и vertical-menu (если их нет)
    css_links = [
        '<link rel="stylesheet" href="css/vertical-menu.css" />',
        '<link rel="stylesheet" href="css/mobile-improvements.css" />',
    ]

    for css_link in css_links:
        if css_link not in content:
            # Добавляем перед </head>
            content = re.sub(
                r"(\s*)</head>", f"\n        {css_link}\n\\1</head>", content
            )

    # 5. Добавляем JS для sidebar (если его нет)
    js_scripts = ['<script src="js/vertical-menu.js"></script>']

    for js_script in js_scripts:
        if js_script not in content:
            # Добавляем перед </body>
            content = re.sub(
                r"(\s*)</body>", f"\n        {js_script}\n\\1</body>", content
            )

    # Сохраняем изменения
    if content != original_content:
        file_path.write_text(content, encoding="utf-8")
        print(f"✅ {html_file} - sidebar добавлен")
    else:
        print(f"ℹ️  {html_file} - изменений не требуется")

print("\n✨ Готово! Вертикальное меню добавлено на все страницы.")
print("📍 Sidebar находится слева, кнопка toggle справа вверху на мобильных")
print("🎨 Добавлены CSS: vertical-menu.css, mobile-improvements.css")
print("🔧 Добавлен JS: vertical-menu.js")
