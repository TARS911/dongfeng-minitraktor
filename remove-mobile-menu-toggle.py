#!/usr/bin/env python3
"""
Скрипт для удаления кнопки mobile-menu-toggle со всех HTML страниц.
Удаляет зеленую кнопку-гамбургер из мобильной версии.
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

    # Удаляем кнопку mobile-menu-toggle (многострочный паттерн)
    # Паттерн ищет всю кнопку от открывающего <button до закрывающего </button>
    pattern = r'\s*<!-- Mobile Menu Toggle -->\s*\n\s*<button\s+class="mobile-menu-toggle"[^>]*>.*?</button>\s*\n'
    content = re.sub(pattern, "\n", content, flags=re.DOTALL)

    # Если комментарий отсутствует, пробуем без него
    if len(content) == original_length:
        pattern = r'\s*<button\s+class="mobile-menu-toggle"[^>]*>.*?</button>\s*\n'
        content = re.sub(pattern, "\n", content, flags=re.DOTALL)

    # Проверяем, что изменения были сделаны
    if len(content) != original_length:
        # Записываем обратно
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"  ✅ Удалено {original_length - len(content)} символов")
    else:
        print(f"  ℹ️  Кнопка не найдена или уже удалена")

print("\n✨ Готово! Кнопка mobile-menu-toggle удалена со всех страниц.")
