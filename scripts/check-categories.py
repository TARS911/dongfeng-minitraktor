import os

from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Получаем все категории
all_cats = supabase.table("categories").select("id, name, slug").execute()

# Группируем по брендам
brands = {}
for cat in all_cats.data:
    slug = cat["slug"]
    # Извлекаем бренд из slug
    if "-" in slug:
        brand = slug.split("-")[0]
        if brand not in brands:
            brands[brand] = []
        brands[brand].append(cat)

print("📦 Структура категорий по брендам:\n")
print("=" * 80)

# Показываем только бренды с подкатегориями запчастей
parts_brands = [
    "uralets",
    "jinma",
    "xingtai",
    "dongfeng",
    "scout",
    "foton",
    "rusich",
    "mtz",
    "shifeng",
    "catmann",
    "chuvashpiller",
    "kentavr",
    "bulat",
    "yto",
    "neva",
    "dlh",
    "perkins",
    "universal",
    "wirax",
    "fayter",
    "km",
]

for brand in sorted(parts_brands):
    if brand in brands:
        print(f"\n🏷️  {brand.upper()}:")
        for cat in brands[brand]:
            print(f"  [{cat['id']:3}] {cat['slug']}")
