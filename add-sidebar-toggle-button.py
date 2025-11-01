#!/usr/bin/env python3
"""
Скрипт для добавления кнопки переключения sidebar на всех страницах
"""

import os
import re
from pathlib import Path

# Список всех HTML страниц
PAGES = [
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

FRONTEND_DIR = Path(__file__).parent / "frontend"

# HTML код кнопки переключения
TOGGLE_BUTTON_HTML = """                    <!-- Кнопка переключения sidebar (только на десктопе) -->
                    <button class="sidebar-desktop-toggle" onclick="toggleSidebarDesktop()" title="Скрыть/показать меню">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

"""


def update_page(page_name):
    """Добавить кнопку переключения на страницу"""
    file_path = FRONTEND_DIR / page_name

    if not file_path.exists():
        print(f"❌ Файл не найден: {page_name}")
        return False

    print(f"📄 Обрабатываю {page_name}...")

    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Проверяем что кнопки еще нет
    if "sidebar-desktop-toggle" in content:
        print(f"  ⏭️  Кнопка уже есть, пропускаю")
        return True

    # Ищем начало modern-header__main и добавляем кнопку
    pattern = r'(<div class="modern-header__main">)\s*\n'

    if re.search(pattern, content):
        content = re.sub(pattern, r"\1\n" + TOGGLE_BUTTON_HTML, content, count=1)
        print(f"  ✅ Добавлена кнопка переключения sidebar")
    else:
        print(f"  ⚠️  Не найдено место для вставки кнопки")
        return False

    # Сохраняем
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"  ✅ Сохранено")
    return True


def main():
    print("🎨 Начинаю добавление кнопки переключения sidebar...\n")

    success_count = 0
    failed_pages = []

    for page in PAGES:
        if update_page(page):
            success_count += 1
        else:
            failed_pages.append(page)
        print()

    print(f"\n{'=' * 60}")
    print(f"✅ Успешно обновлено: {success_count}/{len(PAGES)} страниц")

    if failed_pages:
        print(f"❌ Ошибки на страницах: {', '.join(failed_pages)}")
    else:
        print(f"🎉 Все страницы успешно обновлены!")

    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
