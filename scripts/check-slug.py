#!/usr/bin/env python3
import os
from urllib.parse import unquote

from supabase import Client, create_client

# Initialize Supabase client
url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# The failing URL slug (URL-encoded)
encoded_slug = "%D0%BD%D0%B5%D0%B8%D0%B7%D0%B2%D0%B5%D1%81%D1%82%D0%BD%D0%BE-uplotnitel-manzhety-gilzy-2-sht-r190-r195"
decoded_slug = unquote(encoded_slug)

print(f"Encoded slug: {encoded_slug}")
print(f"Decoded slug: {decoded_slug}")
print()

# Try to find the product by decoded slug
print("Looking for product with decoded slug...")
response = (
    supabase.table("products")
    .select("id,name,slug,manufacturer")
    .eq("slug", decoded_slug)
    .execute()
)
if response.data:
    print(f"✓ Found product: {response.data}")
else:
    print("✗ Not found with decoded slug")

print()

# Try to find products with similar name
print("Looking for products with 'уплотнитель' or 'uplotnitel'...")
response = (
    supabase.table("products")
    .select("id,name,slug,manufacturer")
    .or_("name.ilike.%уплотнитель%,name.ilike.%uplotnitel%")
    .limit(5)
    .execute()
)
if response.data:
    for p in response.data:
        print(f"  ID: {p['id']}, Slug: {p['slug']}, Name: {p['name'][:60]}")
else:
    print("✗ Not found")

print()

# Check for products with 'неизвестно' manufacturer
print("Looking for products with 'неизвестно' manufacturer...")
response = (
    supabase.table("products")
    .select("id,name,slug,manufacturer")
    .eq("manufacturer", "неизвестно")
    .limit(5)
    .execute()
)
if response.data:
    for p in response.data:
        print(f"  ID: {p['id']}, Slug: {p['slug']}, Manufacturer: {p['manufacturer']}")
else:
    print("✗ Not found")
