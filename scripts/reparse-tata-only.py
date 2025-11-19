#!/usr/bin/env python3
"""
Быстрый перепарсинг ТОЛЬКО TATA-AGRO с многопоточностью
"""

import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

TATA_TASKS = [
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-dongfeng/?limit=100", "tata-agro-dongfeng"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-foton/?limit=100", "tata-agro-foton"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-jinma/?limit=100", "tata-agro-jinma"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-xingtai/?limit=100", "tata-agro-xingtai"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-xingtai-24b/?limit=100", "tata-agro-xingtai-24b"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-shifeng/?limit=100", "tata-agro-shifeng"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-zubr-16/?limit=100", "tata-agro-zubr-16"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-sadovoj-tehnike/?limit=100", "tata-agro-garden"),
]

def run_parser(task):
    url, output_name = task
    start_time = time.time()

    try:
        result = subprocess.run(
            ["python3", "scripts/parse-tata-agro-universal.py", url, output_name],
            capture_output=True,
            text=True,
            timeout=300
        )

        duration = time.time() - start_time

        product_count = 0
        for line in result.stdout.split('\n'):
            if 'Всего спарсено:' in line:
                try:
                    product_count = int(line.split(':')[1].split()[0])
                except:
                    pass

        return {
            'name': output_name,
            'products': product_count,
            'duration': duration,
            'success': result.returncode == 0
        }
    except Exception as e:
        return {
            'name': output_name,
            'products': 0,
            'duration': time.time() - start_time,
            'success': False,
            'error': str(e)
        }

print("\n" + "="*70)
print("🚀 ПЕРЕПАРСИНГ TATA-AGRO (8 категорий)")
print("="*70 + "\n")

start_time = time.time()
total_products = 0

with ThreadPoolExecutor(max_workers=4) as executor:
    futures = {executor.submit(run_parser, task): task for task in TATA_TASKS}

    for future in as_completed(futures):
        result = future.result()
        if result['success']:
            total_products += result['products']
            print(f"✅ {result['name']}: {result['products']} товаров ({result['duration']:.1f}с)")
        else:
            print(f"❌ {result['name']}: ОШИБКА")

duration = time.time() - start_time
print(f"\n✅ ГОТОВО за {duration:.1f}с! Всего: {total_products} товаров\n")
