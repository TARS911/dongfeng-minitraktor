#!/usr/bin/env python3
"""
Перемещает кнопку sidebar-desktop-toggle из начала header в блок modern-header__actions
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

# Новая кнопка для добавления в modern-header__actions
new_toggle_button = """                        <!-- Sidebar Toggle (Desktop only) -->
                        <button class="sidebar-desktop-toggle" onclick="toggleSidebarDesktop()" title="Свернуть/развернуть меню">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </button>

"""

for html_file in html_files:
    file_path = frontend_dir / html_file

    if not file_path.exists():
        print(f"⚠️  Пропускаем {html_file} - файл не найден")
        continue

    content = file_path.read_text(encoding="utf-8")
    original_content = content

    # 1. Удаляем старую кнопку sidebar-desktop-toggle из начала header
    # Паттерн для поиска старой кнопки (с различными вариантами SVG)
    old_button_pattern = r'\s*<!-- Кнопка переключения sidebar.*?-->\s*<button class="sidebar-desktop-toggle".*?</button>\s*\n'
    content = re.sub(old_button_pattern, "\n", content, flags=re.DOTALL)

    # 2. Добавляем новую кнопку в начало modern-header__actions
    # Ищем открывающий тег <div class="modern-header__actions">
    actions_pattern = r'(<div class="modern-header__actions">)\s*\n'

    if re.search(actions_pattern, content):
        # Заменяем, добавляя новую кнопку после открывающего тега
        content = re.sub(actions_pattern, r"\1\n" + new_toggle_button, content, count=1)
    else:
        print(f"⚠️  Не найден блок modern-header__actions в {html_file}")
        continue

    # 3. Проверяем, что изменения произошли
    if content != original_content:
        file_path.write_text(content, encoding="utf-8")
        print(f"✅ {html_file} - кнопка перемещена в header actions")
    else:
        print(f"ℹ️  {html_file} - изменений не требуется")

print("\n✨ Готово! Кнопка sidebar toggle перемещена во все страницы.")
print("🔍 Кнопка теперь находится в блоке modern-header__actions (рядом с иконками)")
print("📱 На мобильных устройствах кнопка скрыта через CSS")
