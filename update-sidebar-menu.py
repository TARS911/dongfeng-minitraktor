#!/usr/bin/env python3
"""
Обновляет меню sidebar на всех страницах:
- Новый порядок пунктов
- Каталог оранжевый, Акции зеленый
- Добавлены новые пункты
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

# Читаем новое меню из index.html
index_path = frontend_dir / "index.html"
index_content = index_path.read_text(encoding="utf-8")

# Извлекаем блок навигации
nav_match = re.search(r"(<!-- Навигация -->.*?</nav>)", index_content, re.DOTALL)

if not nav_match:
    print("❌ Не найден блок навигации в index.html")
    exit(1)

new_nav = nav_match.group(1)
print(f"✅ Новое меню извлечено из index.html ({len(new_nav)} символов)")

for html_file in html_files:
    file_path = frontend_dir / html_file

    if not file_path.exists():
        print(f"⚠️  Пропускаем {html_file} - файл не найден")
        continue

    content = file_path.read_text(encoding="utf-8")
    original_content = content

    # Заменяем блок навигации
    content = re.sub(r"<!-- Навигация -->.*?</nav>", new_nav, content, flags=re.DOTALL)

    # Сохраняем изменения
    if content != original_content:
        file_path.write_text(content, encoding="utf-8")
        print(f"✅ {html_file} - меню обновлено")
    else:
        print(f"ℹ️  {html_file} - изменений не требуется")

print("\n✨ Готово! Новое меню применено ко всем страницам.")
print(
    "📋 Порядок: Главная, Каталог (🟠), Оплата, Доставка, Гарантия, Акции (🟢), Лизинг, Медиа, О нас, Лизинг и Гранты, Покупателям, Отгрузки, Отзывы, Блог"
)
