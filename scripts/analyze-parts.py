import os

from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Получаем ID категории "Запчасти"
categories = (
    supabase.table("categories").select("id, name, slug").eq("slug", "parts").execute()
)
parts_cat_id = categories.data[0]["id"]

print(f"Категория 'Запчасти': ID = {parts_cat_id}\n")
print("=" * 80)

# Получаем первые 50 товаров из категории "Запчасти"
products = (
    supabase.table("products")
    .select("id, name, category_id, manufacturer")
    .eq("category_id", parts_cat_id)
    .limit(50)
    .execute()
)

print(f"\n📦 Примеры товаров из категории 'Запчасти' (первые 50):\n")
for i, p in enumerate(products.data, 1):
    manufacturer = p.get("manufacturer") or "НЕТ БРЕНДА"
    print(f"{i}. [{p['id']}] {p['name']}")
    print(f"   Производитель: {manufacturer}")
    print()

# Статистика по производителям
manufacturers = {}
all_parts = []
offset = 0
while True:
    batch = (
        supabase.table("products")
        .select("id, name, manufacturer")
        .eq("category_id", parts_cat_id)
        .range(offset, offset + 999)
        .execute()
    )
    if not batch.data:
        break
    all_parts.extend(batch.data)
    offset += 1000

for p in all_parts:
    m = p.get("manufacturer") or "НЕТ БРЕНДА"
    if m not in manufacturers:
        manufacturers[m] = 0
    manufacturers[m] += 1

print("\n" + "=" * 80)
print("\n📊 Статистика по производителям в категории 'Запчасти':\n")
for m, count in sorted(manufacturers.items(), key=lambda x: -x[1]):
    print(f"{m}: {count} товаров")

print(f"\n\nВсего уникальных производителей: {len(manufacturers)}")
print(f"Всего товаров в категории: {len(all_parts)}")
