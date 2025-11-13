import os

from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Получаем все категории
categories = supabase.table("categories").select("id, name, slug").execute()
print("Все категории:")
for cat in categories.data:
    print(f"  {cat['id']}: {cat['name']} ({cat['slug']})")

print("\n" + "=" * 50)

# Находим категорию "parts"
parts_cat = [cat for cat in categories.data if cat["slug"] == "parts"]
if parts_cat:
    parts_id = parts_cat[0]["id"]
    print(f"\nКатегория 'Запчасти': ID = {parts_id}")

    # Считаем товары в этой категории
    result = (
        supabase.table("products")
        .select("*", count="exact")
        .eq("category_id", parts_id)
        .execute()
    )
    print(f"Всего товаров в категории 'Запчасти': {result.count}")

    # Считаем товары в наличии
    in_stock = (
        supabase.table("products")
        .select("*", count="exact")
        .eq("category_id", parts_id)
        .eq("in_stock", True)
        .execute()
    )
    print(f"Товаров в наличии: {in_stock.count}")
else:
    print("Категория 'parts' не найдена!")

print("\n" + "=" * 50)
print("\nОбщая статистика по всем товарам:")
all_products = supabase.table("products").select("*", count="exact").execute()
print(f"Всего товаров в БД: {all_products.count}")

all_in_stock = (
    supabase.table("products").select("*", count="exact").eq("in_stock", True).execute()
)
print(f"Товаров в наличии: {all_in_stock.count}")

# Статистика по категориям
print("\n" + "=" * 50)
print("\nТовары по категориям:")
for cat in categories.data:
    count = (
        supabase.table("products")
        .select("*", count="exact")
        .eq("category_id", cat["id"])
        .execute()
    )
    in_stock_count = (
        supabase.table("products")
        .select("*", count="exact")
        .eq("category_id", cat["id"])
        .eq("in_stock", True)
        .execute()
    )
    print(f"{cat['name']}: {count.count} товаров (в наличии: {in_stock_count.count})")
