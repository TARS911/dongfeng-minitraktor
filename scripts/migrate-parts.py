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
    "dongfeng-parts": [
        "dongfeng",
        "донгфенг",
        "дунфенг",
        "df-244",
        "df-404",
        "df 244",
        "df 404",
    ],
    "km-engines": ["км ", " км", "km "],
    "uralets": ["уралец"],
    "jinma": ["джинма", "jinma"],
    "xingtai": ["синтай", "xingtai"],
    "scout": ["скаут", "scout"],
    "foton": ["фотон", "foton", "lovol"],
    "rusich": ["русич"],
    "mtz": ["мтз", "mtz", "беларус", "belarus"],
    "t-series": ["т-40", "т-25", "т-16"],
    "shifeng": ["шифенг", "shifeng"],
    "catmann": ["кэтманн", "catmann", "кетманн"],
    "chuvashpiller": ["чувашпиллер"],
    "kentavr": ["кентавр", "kentavr"],
    "bulat": ["булат", "bulat"],
    "yto": ["yto"],
    "neva": ["нева", "нэва", "мб "],
    "dlh": ["dlh"],
    "perkins": ["perkins", "перкинс"],
    "wirax": ["wirax", "виракс"],
    "fayter": ["файтер", "fayter"],
    "rustrak": ["рустрак", "rustrak"],
}

# Маппинг типов запчастей (более специфичные паттерны первыми)
TYPE_PATTERNS = {
    "filters": ["фильтр"],
    "driveshafts": ["кардан", "карданный"],
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
    "wheels-tires": ["колесо", "колёс", "диск", "шина", "груз колесн", "грунтозацеп"],
    "hydraulics": ["гидравлик", "гидроцилиндр", "гидронасос", "нш ", "рулевой цилиндр"],
    "standard-parts": [
        "болт",
        "гайка",
        "шпилька",
        "прокладка",
        "кольцо уплотн",
        "кольцо стопорн",
        "шайба",
        "палец стопорн",
        "пружина",
    ],
    "tractor-parts": ["насос", "редуктор", "вал", "вом", "масляный", "топливный"],
    "universal-parts": ["универсальн", "комплект"],
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
}


def detect_brand(product_name):
    """Определяет бренд из названия товара"""
    name_lower = product_name.lower()

    # Проверяем специальные случаи первыми
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

print(f"✅ Загружено {len(all_parts)} товаров\n")
print("=" * 80)

# Анализируем и категоризируем
migration_plan = []
stats = {}
not_found_categories = {}

print("\n🔍 Анализ и подготовка миграции...\n")

for product in all_parts:
    brand = detect_brand(product["name"])
    part_type = detect_type(product["name"])

    # Формируем slug категории
    category_slug = f"{brand}-{part_type}"

    # Проверяем существование категории
    new_cat_id = categories_map.get(category_slug)

    if new_cat_id:
        migration_plan.append(
            {
                "product_id": product["id"],
                "old_category": parts_cat_id,
                "new_category": new_cat_id,
                "category_slug": category_slug,
            }
        )

        if category_slug not in stats:
            stats[category_slug] = 0
        stats[category_slug] += 1
    else:
        # Категория не найдена
        if category_slug not in not_found_categories:
            not_found_categories[category_slug] = []
        not_found_categories[category_slug].append(product["name"][:60])

print(f"✅ Проанализировано {len(all_parts)} товаров")
print(f"✅ Готово к миграции: {len(migration_plan)} товаров")
print(f"⚠️  Не найдены категории: {len(not_found_categories)}")

if not_found_categories:
    print("\n" + "=" * 80)
    print("\n❌ Категории, которые не найдены в БД:\n")
    for cat_slug, examples in not_found_categories.items():
        print(f"  {cat_slug}: {len(examples)} товаров")
        print(f"     Примеры: {examples[:3]}")
        print()

print("\n" + "=" * 80)
print("\n📊 План миграции по категориям (топ 20):\n")

for category_slug, count in sorted(stats.items(), key=lambda x: -x[1])[:20]:
    cat_id = categories_map[category_slug]
    print(f"  ✅ {category_slug}: {count} товаров → ID {cat_id}")

print(f"\n\nВсего категорий для миграции: {len(stats)}")
print(f"Всего товаров для миграции: {len(migration_plan)}")

# Спрашиваем подтверждение
print("\n" + "=" * 80)
response = input("\n🚀 Начать миграцию? (yes/no): ")

if response.lower() != "yes":
    print("\n❌ Миграция отменена")
    exit(0)

# Выполняем миграцию
print("\n🚀 Начинаем миграцию...")
print("=" * 80 + "\n")

success_count = 0
error_count = 0
batch_size = 100

for i in range(0, len(migration_plan), batch_size):
    batch = migration_plan[i : i + batch_size]

    for item in batch:
        try:
            supabase.table("products").update({"category_id": item["new_category"]}).eq(
                "id", item["product_id"]
            ).execute()
            success_count += 1

            if success_count % 100 == 0:
                progress = (success_count / len(migration_plan)) * 100
                print(
                    f"  ⏳ Прогресс: {success_count}/{len(migration_plan)} ({progress:.1f}%)"
                )
        except Exception as e:
            error_count += 1
            print(f"  ❌ Ошибка для товара {item['product_id']}: {e}")

print("\n" + "=" * 80)
print(f"\n✅ Миграция завершена!")
print(f"  Успешно: {success_count}")
print(f"  Ошибок: {error_count}")
print(f"  Всего: {len(migration_plan)}")

# Проверяем результат
print("\n📊 Проверка результатов...")
remaining = (
    supabase.table("products")
    .select("*", count="exact")
    .eq("category_id", parts_cat_id)
    .execute()
)
print(f"  Осталось товаров в категории 'Запчасти': {remaining.count}")
