#!/usr/bin/env python3
"""
Правильно удаляет старый header и добавляет modern header из index.html
БЕЗ потери контента страниц
"""

import re
from pathlib import Path

# Все HTML страницы (кроме index.html)
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

# Читаем modern header из index.html
index_path = frontend_dir / "index.html"
index_content = index_path.read_text(encoding="utf-8")

# Извлекаем modern header из index.html (от <!-- Modern Header --> до </header>)
header_match = re.search(
    r"(<!-- Modern Header -->.*?</header>)", index_content, re.DOTALL
)

if not header_match:
    print("❌ Не найден modern header в index.html")
    exit(1)

modern_header = header_match.group(1)

# Удаляем логотип из modern header (как просил пользователь)
modern_header = re.sub(
    r'\s*<a href="index\.html" class="modern-header__logo"\s*>DONGFENG</a\s*>\s*\n',
    "",
    modern_header,
)
modern_header = modern_header.replace(
    "<!-- Left Section: Logo + City + Catalog -->",
    "<!-- Left Section: City + Catalog -->",
)

print(f"✅ Modern header подготовлен ({len(modern_header)} символов, БЕЗ логотипа)")

for html_file in html_files:
    file_path = frontend_dir / html_file

    if not file_path.exists():
        print(f"⚠️  Пропускаем {html_file} - файл не найден")
        continue

    content = file_path.read_text(encoding="utf-8")
    original_content = content
    original_lines = len(content.split("\n"))

    # Ищем конец sidebar (</aside>) и начало контента страницы
    # Удаляем ВСЁ между </aside> и началом основного контента
    # Паттерны для начала контента: <section, <div class="page, <div class="content, <main

    pattern = r'(</aside>\s*\n)(.*?)((?:<section|<div class="(?:contacts-page|delivery|media|payment|warranty|about|cart|compare|favorites|terms|privacy)|<main|<footer))'

    replacement = modern_header.replace("\\", "\\\\")  # Экранируем обратные слеши
    content = re.sub(
        pattern,
        r"\1\n        " + replacement + r"\n\n        \3",
        content,
        flags=re.DOTALL,
    )

    # Исправляем дублирование class в body (если есть)
    content = re.sub(
        r'<body([^>]*) class="with-sidebar" class="with-sidebar">',
        r'<body\1 class="with-sidebar">',
        content,
    )

    content = re.sub(
        r'<body class="with-sidebar" class="with-sidebar">',
        r'<body class="with-sidebar">',
        content,
    )

    # Сохраняем изменения
    new_lines = len(content.split("\n"))

    if content != original_content:
        file_path.write_text(content, encoding="utf-8")
        lines_diff = new_lines - original_lines
        print(
            f"✅ {html_file} - обработан (строк: {original_lines} → {new_lines}, изменение: {lines_diff:+d})"
        )
    else:
        print(f"ℹ️  {html_file} - изменений не требуется")

print("\n✨ Готово! Старый header удален, modern header добавлен БЕЗ логотипа.")
print("✅ Контент страниц сохранен!")
