#!/usr/bin/env python3
import os

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Получаем одну категорию
result = supabase.table("categories").select("*").limit(1).execute()

if result.data:
    print("🔍 Структура таблицы categories:")
    print("Поля:", list(result.data[0].keys()))
    print("\nПример категории:")
    for key, value in result.data[0].items():
        print(f"  {key}: {value}")
