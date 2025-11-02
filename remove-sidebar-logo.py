#!/usr/bin/env python3
"""
Удаляет логотип DONGFENG из sidebar header на всех страницах
"""

import re
from pathlib import Path

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

    # Удаляем блок с логотипом из sidebar header
    content = re.sub(
        r"<!-- Заголовок с логотипом и кнопкой закрытия -->",
        r"<!-- Заголовок с кнопкой закрытия -->",
        content,
    )

    content = re.sub(
        r'\s*<div class="sidebar-menu__logo-container">.*?</div>\s*\n',
        "\n",
        content,
        flags=re.DOTALL,
    )

    # Сохраняем изменения
    if content != original_content:
        file_path.write_text(content, encoding="utf-8")
        print(f"✅ {html_file} - логотип удален из sidebar")
    else:
        print(f"ℹ️  {html_file} - логотип уже удален")

print("\n✨ Готово! Логотип DONGFENG удален из sidebar на всех страницах.")
