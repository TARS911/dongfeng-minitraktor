#!/usr/bin/env python3
"""
МНОГОПОТОЧНЫЙ парсер для МАКСИМАЛЬНОЙ СКОРОСТИ
Использует concurrent.futures для параллельного парсинга
"""

import subprocess
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

# ============================================================================
# СПИСОК ВСЕХ КАТЕГОРИЙ ДЛЯ ПАРСИНГА
# ============================================================================

ZIP_AGRO_TASKS = [
    # DongFeng
    ("https://zip-agro.ru/zapchasti-dongfeng-240-244", "zip-agro-dongfeng-240-244"),
    ("https://zip-agro.ru/zapchasti-dongfeng-354-404", "zip-agro-dongfeng-354-404"),
    ("https://zip-agro.ru/dongfeng", "zip-agro-dongfeng-all"),

    # Foton
    ("https://zip-agro.ru/foton", "zip-agro-foton-all"),

    # Jinma
    ("https://zip-agro.ru/jinma", "zip-agro-jinma-all"),

    # Xingtai (разные модели)
    ("https://zip-agro.ru/xt-120", "zip-agro-xingtai-xt-120"),
    ("https://zip-agro.ru/xt-180", "zip-agro-xingtai-xt-180"),

    # Универсальные запчасти
    ("https://zip-agro.ru/dvigateli", "zip-agro-engines"),
    ("https://zip-agro.ru/filtry", "zip-agro-filters"),
    ("https://zip-agro.ru/toplivnaya-sistema", "zip-agro-fuel-system"),
    ("https://zip-agro.ru/nasosy", "zip-agro-pumps"),
    ("https://zip-agro.ru/nasos-gidravlicheskij-toplivnyj-maslyanyj", "zip-agro-pumps-hydraulic-fuel"),

    # Двигатели по моделям
    ("https://zip-agro.ru/r180ne", "zip-agro-r180ne"),
    ("https://zip-agro.ru/r190ne", "zip-agro-r190ne"),
    ("https://zip-agro.ru/r195ne", "zip-agro-r195ne"),
    ("https://zip-agro.ru/zs1100-zs1115", "zip-agro-zs1100-1115"),
    ("https://zip-agro.ru/zn490bt", "zip-agro-zn490bt"),
    ("https://zip-agro.ru/km385-ll380", "zip-agro-km385-ll380"),
]

TATA_AGRO_TASKS = [
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-dongfeng/?limit=100", "tata-agro-dongfeng"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-foton/?limit=100", "tata-agro-foton"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-jinma/?limit=100", "tata-agro-jinma"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-xingtai/?limit=100", "tata-agro-xingtai"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-xingtai-24b/?limit=100", "tata-agro-xingtai-24b"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-shifeng/?limit=100", "tata-agro-shifeng"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-traktoram-zubr-16/?limit=100", "tata-agro-zubr-16"),
    ("https://tata-agro-moto.com/ru/zapchasti-k-sadovoj-tehnike/?limit=100", "tata-agro-garden"),
]

# ============================================================================
# ФУНКЦИИ ДЛЯ ПАРАЛЛЕЛЬНОГО ПАРСИНГА
# ============================================================================

def run_parser(task):
    """Запускает один парсер"""
    url, output_name = task

    if "zip-agro.ru" in url:
        parser_script = "scripts/parse-zip-agro-universal.py"
    else:
        parser_script = "scripts/parse-tata-agro-universal.py"

    start_time = time.time()

    try:
        result = subprocess.run(
            ["python3", parser_script, url, output_name],
            capture_output=True,
            text=True,
            timeout=600  # 10 минут на категорию
        )

        duration = time.time() - start_time

        # Извлекаем количество товаров из вывода
        product_count = 0
        for line in result.stdout.split('\n'):
            if 'Всего спарсено:' in line:
                try:
                    product_count = int(line.split(':')[1].split()[0])
                except:
                    pass

        if result.returncode == 0:
            return {
                'status': 'success',
                'name': output_name,
                'url': url,
                'products': product_count,
                'duration': duration
            }
        else:
            return {
                'status': 'error',
                'name': output_name,
                'url': url,
                'error': result.stderr[:200] if result.stderr else 'Unknown error',
                'duration': duration
            }

    except subprocess.TimeoutExpired:
        return {
            'status': 'timeout',
            'name': output_name,
            'url': url,
            'duration': 600
        }
    except Exception as e:
        return {
            'status': 'error',
            'name': output_name,
            'url': url,
            'error': str(e),
            'duration': time.time() - start_time
        }

def main():
    print("\n" + "="*80)
    print("🚀 МНОГОПОТОЧНЫЙ ПЕРЕПАРСИНГ ВСЕХ КАТЕГОРИЙ")
    print("="*80)
    print()

    all_tasks = ZIP_AGRO_TASKS + TATA_AGRO_TASKS
    total_tasks = len(all_tasks)

    print(f"📋 Всего категорий для парсинга: {total_tasks}")
    print(f"⚡ ZIP-AGRO: {len(ZIP_AGRO_TASKS)} категорий")
    print(f"⚡ TATA-AGRO: {len(TATA_AGRO_TASKS)} категорий")
    print(f"\n🔥 Используем 12 потоков для МАКСИМАЛЬНОЙ скорости!\n")

    start_time = time.time()

    # Используем 8 потоков для параллельного парсинга
    completed = 0
    total_products = 0
    errors = []

    with ThreadPoolExecutor(max_workers=12) as executor:
        # Запускаем все задачи
        futures = {executor.submit(run_parser, task): task for task in all_tasks}

        # Обрабатываем результаты по мере завершения
        for future in as_completed(futures):
            completed += 1
            result = future.result()

            if result['status'] == 'success':
                total_products += result['products']
                print(f"✅ [{completed}/{total_tasks}] {result['name']}: {result['products']} товаров ({result['duration']:.1f}с)")
            elif result['status'] == 'timeout':
                errors.append(result)
                print(f"⏱️  [{completed}/{total_tasks}] {result['name']}: TIMEOUT (>10 минут)")
            else:
                errors.append(result)
                print(f"❌ [{completed}/{total_tasks}] {result['name']}: ОШИБКА")

    duration = time.time() - start_time
    minutes = int(duration // 60)
    seconds = int(duration % 60)

    print("\n" + "="*80)
    print("✅ ПАРСИНГ ЗАВЕРШЕН!")
    print("="*80)
    print()
    print(f"⏱️  Время: {minutes}м {seconds}с")
    print(f"📦 Всего товаров: {total_products}")
    print(f"✅ Успешно: {total_tasks - len(errors)}/{total_tasks}")
    print(f"❌ Ошибок: {len(errors)}")

    if errors:
        print("\n" + "="*80)
        print("❌ ОШИБКИ:")
        print("="*80)
        for err in errors:
            print(f"\n{err['name']}:")
            print(f"  URL: {err['url']}")
            if 'error' in err:
                print(f"  Ошибка: {err['error']}")

    print()

if __name__ == "__main__":
    main()
