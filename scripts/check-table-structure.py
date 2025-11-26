#!/usr/bin/env python3
"""
Проверка структуры таблицы products
"""

import os
from supabase import Client, create_client

url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

print("=" * 80)
print("🔍 ПРОВЕРКА СТРУКТУРЫ ТАБЛИЦЫ PRODUCTS")
print("=" * 80 + "\n")

# Получаем один товар для проверки структуры
result = supabase.table("products").select("*").limit(1).execute()

if result.data:
    product = result.data[0]
    print("📋 Доступные колонки:\n")
    
    for key in sorted(product.keys()):
        value = product[key]
        value_type = type(value).__name__
        
        # Показываем первые 50 символов значения
        if isinstance(value, (dict, list)):
            value_str = str(value)[:50] + "..." if len(str(value)) > 50 else str(value)
        else:
            value_str = str(value)[:50] if value else "NULL"
        
        print(f"  • {key:20} ({value_type:10}) = {value_str}")

print("\n" + "=" * 80)
