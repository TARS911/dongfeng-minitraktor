#!/usr/bin/env python3
"""
Перемещает кнопку sidebar-desktop-toggle в сам sidebar (выше кнопки КАТАЛОГ)
и удаляет её из header actions
"""

import re
from pathlib import Path

# Все HTML страницы
html_files = [
    "index.html",
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

# HTML блок кнопки для добавления в sidebar
toggle_block = """            <!-- Кнопка скрытия/показа sidebar (только десктоп) -->
            <div class="sidebar-collapse-toggle">
                <button class="sidebar-desktop-toggle" onclick="toggleSidebarDesktop()" title="Свернуть/развернуть меню">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
            </div>

"""

for html_file in html_files:
    file_path = frontend_dir / html_file

    if not file_path.exists():
        print(f"⚠️  Пропускаем {html_file} - файл не найден")
        continue

    content = file_path.read_text(encoding="utf-8")
    original_content = content

    # 1. Удаляем ВСЕ кнопки sidebar-desktop-toggle из header actions
    # Паттерн для поиска кнопки в header (любой вариант)
    header_button_pattern = r'\s*<!-- Sidebar Toggle.*?-->\s*<button\s+class="sidebar-desktop-toggle".*?</button>\s*\n'
    content = re.sub(header_button_pattern, "", content, flags=re.DOTALL)

    # 2. Проверяем, есть ли уже кнопка в sidebar
    if "sidebar-collapse-toggle" in content:
        print(f"ℹ️  {html_file} - кнопка уже в sidebar")
        continue

    # 3. Добавляем кнопку в sidebar ПЕРЕД навигацией
    # Ищем закрывающий тег </div> после sidebar-menu__close и перед <nav class="sidebar-menu__nav">
    nav_pattern = r"(</button>\s*</div>\s*)\n(\s*<!-- Навигация -->)"

    if re.search(nav_pattern, content):
        content = re.sub(nav_pattern, r"\1\n" + toggle_block + r"\2", content, count=1)
        print(f"✅ {html_file} - кнопка перемещена в sidebar")
    else:
        print(f"⚠️  Не найден блок навигации в {html_file}")
        continue

    # 4. Сохраняем изменения
    if content != original_content:
        file_path.write_text(content, encoding="utf-8")

print("\n✨ Готово! Кнопка sidebar toggle перемещена в sidebar на всех страницах.")
print("📍 Расположение: в самом sidebar, выше кнопки КАТАЛОГ")
print("📱 На мобильных устройствах кнопка скрыта через CSS")
