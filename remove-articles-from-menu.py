#!/usr/bin/env python3
"""
Удаляет "Статьи" из всех меню (sidebar, header, mobile) на всех страницах
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

for html_file in html_files:
    file_path = frontend_dir / html_file

    if not file_path.exists():
        print(f"⚠️  Пропускаем {html_file} - файл не найден")
        continue

    content = file_path.read_text(encoding="utf-8")
    original_content = content

    # 1. Удаляем "Статьи" из sidebar меню
    content = re.sub(
        r"\s*<!-- Статьи -->.*?</li>\s*\n\s*\n", "\n\n", content, flags=re.DOTALL
    )

    # 2. Удаляем "СТАТЬИ" из header навигации
    content = re.sub(
        r'\s*<li><a href="articles\.html">СТАТЬИ</a></li>\s*\n', "\n", content
    )

    # 3. Удаляем из mobile меню (если есть)
    content = re.sub(
        r'\s*<li class="mobile-menu__item">\s*<a href="articles\.html"[^>]*>.*?</a>\s*</li>\s*\n',
        "",
        content,
        flags=re.DOTALL,
    )

    # Сохраняем изменения
    if content != original_content:
        file_path.write_text(content, encoding="utf-8")
        print(f"✅ {html_file} - 'Статьи' удалены из меню")
    else:
        print(f"ℹ️  {html_file} - 'Статьи' уже удалены или не найдены")

print("\n✨ Готово! 'Статьи' удалены из всех меню на всех страницах.")
