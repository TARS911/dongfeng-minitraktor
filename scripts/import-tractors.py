#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Скрипт импорта мини-тракторов из HTML/XLS файлов в Supabase
"""

import json
import os
import re
import sys
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# Supabase credentials
SUPABASE_URL = os.getenv(
    "NEXT_PUBLIC_SUPABASE_URL", "https://dpsykseeqloturowdyzf.supabase.co"
)
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_KEY:
    print("❌ ОШИБКА: Не найден SUPABASE_SERVICE_ROLE_KEY в переменных окружения")
    sys.exit(1)

# Пути к файлам
CATALOG_DIR = Path("/media/ibm/ICP25/каталог BTF")
FILES = {
    "dongfeng": CATALOG_DIR / "DF.xls",
    "lovol": CATALOG_DIR / "Lovol Foton.xls",
    "xingtai": CATALOG_DIR / "Xingtai Синтай .xls",
    "rustrak": CATALOG_DIR / "рустрак.xls",
}

# Маппинг брендов
BRAND_MAPPING = {
    "dongfeng": "DongFeng",
    "lovol": "Lovol (Foton)",
    "xingtai": "Xingtai",
    "rustrak": "Рустрак",
}


def create_slug(text):
    """Создает slug из текста"""
    # Транслитерация русских букв
    translit = {
        "а": "a",
        "б": "b",
        "в": "v",
        "г": "g",
        "д": "d",
        "е": "e",
        "ё": "e",
        "ж": "zh",
        "з": "z",
        "и": "i",
        "й": "y",
        "к": "k",
        "л": "l",
        "м": "m",
        "н": "n",
        "о": "o",
        "п": "p",
        "р": "r",
        "с": "s",
        "т": "t",
        "у": "u",
        "ф": "f",
        "х": "h",
        "ц": "ts",
        "ч": "ch",
        "ш": "sh",
        "щ": "sch",
        "ъ": "",
        "ы": "y",
        "ь": "",
        "э": "e",
        "ю": "yu",
        "я": "ya",
    }

    text = text.lower().strip()
    result = []

    for char in text:
        if char in translit:
            result.append(translit[char])
        elif char.isalnum() or char in ["-", "_"]:
            result.append(char)
        elif char in [" ", "/", "|", "(", ")"]:
            result.append("-")

    slug = "".join(result)
    slug = re.sub(r"-+", "-", slug)  # Удаляем повторяющиеся дефисы
    slug = slug.strip("-")  # Убираем дефисы в начале и конце

    return slug


def extract_model(name, brand):
    """Извлекает модель из названия"""
    # Убираем префиксы типа "Трактор", "Минитрактор"
    clean_name = re.sub(
        r"^(Трактор|Минитрактор|Мини-трактор|трактор)\s+", "", name, flags=re.IGNORECASE
    )

    # Извлекаем модель после бренда
    brand_pattern = re.escape(brand)
    match = re.search(
        rf"{brand_pattern}[\/\|]?\s*([A-Za-z0-9\-\s\(\)]+)", clean_name, re.IGNORECASE
    )

    if match:
        model = match.group(1).strip()
        # Очищаем модель от лишних слов
        model = re.sub(
            r"\s*(с кабиной|дуга безопасности|навес|Generation|NEW VERSION|реверс).*$",
            "",
            model,
            flags=re.IGNORECASE,
        )
        return model.strip()

    return clean_name


def parse_xls_file(file_path, brand_key):
    """Парсит HTML/XLS файл (экспортированный из 1C-Bitrix) и возвращает список товаров"""
    print(f"\n📂 Обработка файла: {file_path.name}")

    try:
        # Читаем HTML файл (это XLS в формате HTML от 1C-Bitrix)
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        soup = BeautifulSoup(html_content, "html.parser")
        table = soup.find("table")

        if not table:
            raise ValueError("Таблица не найдена в файле")

        products = []
        brand = BRAND_MAPPING[brand_key]

        # Получаем все строки таблицы
        rows = table.find_all("tr")

        if not rows:
            raise ValueError("Строки не найдены в таблице")

        # Первая строка - заголовки
        headers = [td.get_text(strip=True) for td in rows[0].find_all("td")]

        # Парсим строки данных
        for row in rows[1:]:
            cells = row.find_all("td")
            if not cells or len(cells) < len(headers):
                continue

            # Создаем словарь из строки
            row_values = [cell.get_text(strip=True) for cell in cells]
            row_dict = dict(zip(headers, row_values))

            name = str(row_dict.get("Название", "")).strip()
            if not name or name == "None":
                continue

            active = str(row_dict.get("Активность", "")).strip() == "Да"
            external_id = (
                str(row_dict.get("Внешний код", "")).strip()
                if row_dict.get("Внешний код")
                else None
            )
            sort_order = row_dict.get("Сорт.", "500")

            # Пропускаем неактивные товары
            if not active:
                continue

            # Извлекаем модель
            model = extract_model(name, brand)

            # Создаем slug
            slug = create_slug(f"{brand} {model}")

            # Определяем описание
            description = f"Мини-трактор {brand} {model}"
            if "с кабиной" in name.lower():
                description += " с кабиной"
            if "дуга безопасности" in name.lower() or "навес" in name.lower():
                description += " с дугой безопасности и солнцезащитным навесом"

            # Преобразуем sort_order в число
            try:
                sort_order_int = int(float(sort_order)) if sort_order else 500
            except:
                sort_order_int = 500

            product = {
                "name": name,
                "slug": slug,
                "description": description,
                "price": 0,  # Цена по запросу
                "manufacturer": brand,
                "model": model,
                "in_stock": active,
                "featured": False,
                "specifications": {
                    "external_id": external_id,
                    "sort_order": sort_order_int,
                },
            }

            products.append(product)

        print(f"✅ Найдено товаров: {len(products)}")
        return products

    except Exception as e:
        print(f"❌ Ошибка при чтении файла: {e}")
        import traceback

        traceback.print_exc()
        return []


def get_category_id(category_slug):
    """Получает ID категории по slug"""
    url = f"{SUPABASE_URL}/rest/v1/categories"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    params = {"slug": f"eq.{category_slug}", "select": "id"}

    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        data = response.json()
        if data and len(data) > 0:
            return data[0]["id"]

    return None


def create_category(name, slug, description=None):
    """Создает новую категорию"""
    url = f"{SUPABASE_URL}/rest/v1/categories"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }

    data = {"name": name, "slug": slug, "description": description}

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 201:
        result = response.json()
        print(f"✅ Создана категория: {name} (ID: {result[0]['id']})")
        return result[0]["id"]
    else:
        print(f"❌ Ошибка создания категории {name}: {response.text}")
        return None


def import_products(products, category_id):
    """Импортирует товары в Supabase"""
    url = f"{SUPABASE_URL}/rest/v1/products"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=representation",
    }

    success_count = 0
    error_count = 0
    skip_count = 0

    for product in products:
        product["category_id"] = category_id

        # Проверяем, существует ли товар с таким slug
        check_url = f"{url}?slug=eq.{product['slug']}"
        check_response = requests.get(check_url, headers=headers)

        if check_response.status_code == 200 and len(check_response.json()) > 0:
            skip_count += 1
            print(
                f"⚠️  Товар уже существует: {product['name']} (slug: {product['slug']})"
            )
            continue

        # Импортируем товар
        response = requests.post(url, headers=headers, json=product)

        if response.status_code == 201:
            success_count += 1
            print(f"✅ Импортирован: {product['name']}")
        else:
            error_count += 1
            print(f"❌ Ошибка импорта {product['name']}: {response.text}")

    return success_count, error_count, skip_count


def main():
    """Основная функция"""
    print("=" * 60)
    print("🚜 ИМПОРТ МИНИ-ТРАКТОРОВ В SUPABASE")
    print("=" * 60)

    # Получаем ID категории "Мини-тракторы"
    category_id = get_category_id("mini-tractors")

    if not category_id:
        print("\n❌ Категория 'mini-tractors' не найдена!")
        sys.exit(1)

    print(f"\n✅ Категория 'Мини-тракторы' найдена (ID: {category_id})")

    # Создаем подкатегории для брендов (опционально)
    print("\n📁 Создание подкатегорий для брендов...")
    brand_categories = {}

    for brand_key, brand_name in BRAND_MAPPING.items():
        slug = create_slug(brand_name)
        description = f"Мини-тракторы {brand_name}"

        # Проверяем, существует ли категория
        existing_id = get_category_id(slug)

        if existing_id:
            print(f"✅ Категория '{brand_name}' уже существует (ID: {existing_id})")
            brand_categories[brand_key] = existing_id
        else:
            cat_id = create_category(brand_name, slug, description)
            if cat_id:
                brand_categories[brand_key] = cat_id

    # Парсим все файлы
    all_products = []

    for brand_key, file_path in FILES.items():
        if not file_path.exists():
            print(f"\n⚠️  Файл не найден: {file_path}")
            continue

        products = parse_xls_file(file_path, brand_key)
        all_products.extend(products)

    print(f"\n📊 Всего товаров для импорта: {len(all_products)}")

    # Импортируем все товары в основную категорию
    print("\n📦 Импорт товаров в Supabase...")
    success, errors, skipped = import_products(all_products, category_id)

    print("\n" + "=" * 60)
    print("📊 РЕЗУЛЬТАТЫ ИМПОРТА")
    print("=" * 60)
    print(f"✅ Успешно импортировано: {success}")
    print(f"⚠️  Пропущено (дубликаты): {skipped}")
    print(f"❌ Ошибок: {errors}")
    print(f"📦 Всего обработано: {len(all_products)}")
    print("=" * 60)


if __name__ == "__main__":
    main()
