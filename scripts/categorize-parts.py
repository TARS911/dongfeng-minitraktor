import os
import re

from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Загружаем все категории
all_categories = supabase.table("categories").select("id, name, slug").execute()
categories_map = {cat["slug"]: cat["id"] for cat in all_categories.data}

# Маппинг брендов (как они встречаются в названиях товаров)
BRAND_PATTERNS = {
    "uralets": ["уралец", "uralets"],
    "jinma": ["джинма", "jinma"],
    "xingtai": ["синтай", "xingtai", "синтай-504"],
    "dongfeng": [
        "dongfeng",
        "донгфенг",
        "дунфенг",
        "dongfeng 244",
        "dongfeng 404",
        "df-244",
        "df-404",
    ],
    "scout": ["скаут", "scout", "т-18", "t-18", "т-25", "t-25"],
    "foton": ["фотон", "foton", "lovol"],
    "rusich": ["русич", "rusich"],
    "mtz": ["мтз", "mtz", "беларус", "belarus"],
    "t-series": ["т-серия", "t-series", "т-40", "т-25", "т-16"],
    "shifeng": ["шифенг", "shifeng"],
    "catmann": ["кэтманн", "catmann", "кетманн"],
    "chuvashpiller": ["чувашпиллер", "chuvashpiller"],
    "kentavr": ["кентавр", "kentavr", "т-15", "t-15", "т-18", "t-18", "т-224", "t-224"],
    "bulat": ["булат", "bulat"],
    "yto": ["yto"],
    "neva": ["нева", "neva", "мб"],
    "dlh": ["dlh"],
    "perkins": ["perkins", "перкинс"],
    "wirax": ["wirax", "виракс"],
    "fayter": ["файтер", "fayter", "т-15", "t-15"],
    "km-engines": ["км", "km"],
    "rustrak": ["рустрак", "rustrak"],
}

# Маппинг типов запчастей
TYPE_PATTERNS = {
    "other-parts": [
        "прочие",
        "прочее",
        "навесное",
        "оборудование",
        "крепление",
        "кронштейн",
        "адаптер",
        "кабина",
        "крыло",
        "зеркало",
        "колпак",
        "ковш",
        "борт",
        "фаркоп",
    ],
    "filters": ["фильтр"],
    "diesel-engines": [
        "двигатель",
        "двигателя",
        "поршень",
        "поршневые",
        "цилиндр",
        "гбц",
        "головка блока",
        "глушитель",
        "коллектор",
    ],
    "starters-generators": ["стартер", "генератор"],
    "universal-parts": ["универсальн", "комплект"],
    "seats": ["сиденье", "сидение", "кресло"],
    "spare-parts-kit": ["зип", "ремкомплект", "ремонтный комплект"],
    "equipment-parts": [
        "картофелекопалка",
        "косилка",
        "окучник",
        "плуг",
        "борона",
        "фреза",
        "снегоуборщик",
        "прицеп",
        "погрузчик",
        "пресс-подборщик",
    ],
    "tractor-parts": [
        "трактор",
        "масляный",
        "топливный",
        "насос",
        "редуктор",
        "вал",
        "вом",
    ],
    "wheels-tires": ["колесо", "колёс", "диск", "шина", "груз", "грунтозацеп"],
    "standard-parts": [
        "болт",
        "гайка",
        "шпилька",
        "прокладка",
        "кольцо",
        "шайба",
        "палец",
        "пружина",
        "стопорн",
    ],
    "hydraulics": ["гидравлик", "гидроцилиндр", "гидронасос", "нш", "рулевой цилиндр"],
    "driveshafts": ["кардан", "карданный вал"],
}


def detect_brand(product_name):
    """Определяет бренд из названия товара"""
    name_lower = product_name.lower()

    for brand_key, patterns in BRAND_PATTERNS.items():
        for pattern in patterns:
            if pattern.lower() in name_lower:
                return brand_key

    return "universal"


def detect_type(product_name):
    """Определяет тип запчасти из названия товара"""
    name_lower = product_name.lower()

    # Проверяем в порядке приоритета (более специфичные типы первыми)
    for type_key, patterns in TYPE_PATTERNS.items():
        for pattern in patterns:
            if pattern.lower() in name_lower:
                return type_key

    return "other-parts"


# Получаем все товары из категории "Запчасти"
print("📦 Загрузка товаров из категории 'Запчасти'...")
parts_cat_id = 2
all_parts = []
offset = 0
while True:
    batch = (
        supabase.table("products")
        .select("id, name, category_id")
        .eq("category_id", parts_cat_id)
        .range(offset, offset + 999)
        .execute()
    )
    if not batch.data:
        break
    all_parts.extend(batch.data)
    offset += 1000
    print(f"  Загружено {len(all_parts)} товаров...")

print(f"\n✅ Всего товаров: {len(all_parts)}\n")
print("=" * 80)

# Анализируем и категоризируем
categorization = {}
stats = {}

print("\n🔍 Анализ товаров...\n")

for product in all_parts[:100]:  # Сначала проверим на первых 100 товарах
    brand = detect_brand(product["name"])
    part_type = detect_type(product["name"])

    # Формируем slug категории
    category_slug = f"{brand}-{part_type}"

    if category_slug not in stats:
        stats[category_slug] = 0
    stats[category_slug] += 1

    categorization[product["id"]] = category_slug

    # Выводим первые 20 примеров
    if len([k for k in categorization.keys()]) <= 20:
        cat_id = categories_map.get(category_slug, "НЕ НАЙДЕНА")
        print(f"[{product['id']}] {product['name'][:80]}")
        print(f"  → Бренд: {brand} | Тип: {part_type}")
        print(f"  → Категория: {category_slug} (ID: {cat_id})")
        print()

print("\n" + "=" * 80)
print("\n📊 Статистика категоризации (первые 100 товаров):\n")

for category_slug, count in sorted(stats.items(), key=lambda x: -x[1]):
    cat_id = categories_map.get(category_slug, "НЕ НАЙДЕНА")
    status = "✅" if cat_id != "НЕ НАЙДЕНА" else "❌"
    print(f"{status} {category_slug}: {count} товаров (ID: {cat_id})")

print(f"\n\n💡 Найдено уникальных категорий: {len(stats)}")
print(f"🔍 Проверено товаров: 100 из {len(all_parts)}")
