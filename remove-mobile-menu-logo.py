#!/usr/bin/env python3
"""
Скрипт для удаления логотипа DONGFENG из мобильного меню на всех страницах.
Удаляет <a> с логотипом из .mobile-menu__header
"""

import re
from pathlib import Path

# Список всех HTML файлов в frontend
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

for filename in html_files:
    filepath = frontend_dir / filename

    if not filepath.exists():
        print(f"⚠️  Файл не найден: {filepath}")
        continue

    print(f"Обработка: {filename}")

    # Читаем файл
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Сохраняем оригинальную длину
    original_length = len(content)

    # Удаляем блок с логотипом из мобильного меню
    # Ищем <a href="index.html"> с <img class="mobile-menu__logo">
    pattern = r'\s*<a href="index\.html">\s*<img[^>]*class="mobile-menu__logo"[^>]*/?>\s*</a>\s*\n'
    content = re.sub(pattern, "\n", content, flags=re.DOTALL)

    # Проверяем, что изменения были сделаны
    if len(content) != original_length:
        # Записываем обратно
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"  ✅ Удалено {original_length - len(content)} символов")
    else:
        print(f"  ℹ️  Логотип не найден или уже удален")

print("\n✨ Готово! Логотип удален из мобильного меню на всех страницах.")
