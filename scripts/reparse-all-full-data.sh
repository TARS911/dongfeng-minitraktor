#!/bin/bash

# ============================================================================
# МАССОВЫЙ ПЕРЕПАРСИНГ ВСЕХ КАТЕГОРИЙ С ПОЛНЫМИ ДАННЫМИ
# ============================================================================

echo ""
echo "================================================================================"
echo "🔄 МАССОВЫЙ ПЕРЕПАРСИНГ ВСЕХ КАТЕГОРИЙ"
echo "================================================================================"
echo ""
echo "⚠️  Это займет ~1-2 часа"
echo "⚠️  Будет перепарсено 38 категорий (~4000+ товаров)"
echo ""

START_TIME=$(date +%s)

# ============================================================================
# ZIP-AGRO.RU (30 категорий)
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 ZIP-AGRO.RU (30 категорий)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# DongFeng
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-dongfeng-240-244" "zip-agro-dongfeng-240-244"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-dongfeng-354-404" "zip-agro-dongfeng-354-404"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-dongfeng-universalnye" "zip-agro-dongfeng-universal"

# Foton
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-foton-240-244" "zip-agro-foton-240-244"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-foton-250-254" "zip-agro-foton-250-254"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-foton-354-404" "zip-agro-foton-354-404"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-foton-universalnye" "zip-agro-foton-universal"

# Jinma
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-184" "zip-agro-jinma-184"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-204" "zip-agro-jinma-204"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-224" "zip-agro-jinma-224"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-244" "zip-agro-jinma-244"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-254" "zip-agro-jinma-254"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-264" "zip-agro-jinma-264"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-284" "zip-agro-jinma-284"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-304" "zip-agro-jinma-304"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-354" "zip-agro-jinma-354"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-404" "zip-agro-jinma-404"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-jinma-universalnye" "zip-agro-jinma-universal"

# Xingtai
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-xingtai-120-124" "zip-agro-xingtai-120-124"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-xingtai-150-154" "zip-agro-xingtai-150-154"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-xingtai-160-164" "zip-agro-xingtai-160-164"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-xingtai-180-184" "zip-agro-xingtai-180-184"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-xingtai-220-224" "zip-agro-xingtai-220-224"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/zapchasti-xingtai-universalnye" "zip-agro-xingtai-universal"

# Универсальные запчасти
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/dvigateli" "zip-agro-engines"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/filtry" "zip-agro-filters"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/toplivnaya-sistema" "zip-agro-fuel-system"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/nasosy" "zip-agro-pumps"
python3 scripts/parse-zip-agro-universal.py "https://zip-agro.ru/pochvofreza" "zip-agro-soil-cutter"

echo ""
echo "✅ ZIP-AGRO завершен"
echo ""

# ============================================================================
# TATA-AGRO-MOTO.COM (8 категорий)
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 TATA-AGRO-MOTO.COM (8 категорий)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-dongfeng/" "tata-agro-dongfeng"
python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-foton/" "tata-agro-foton"
python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-jinma/" "tata-agro-jinma"
python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-xingtai/" "tata-agro-xingtai"
python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-xingtai-24b/" "tata-agro-xingtai-24b"
python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-shifeng/" "tata-agro-shifeng"
python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-traktoram-zubr-16/" "tata-agro-zubr-16"
python3 scripts/parse-tata-agro-universal.py "https://tata-agro-moto.com/ru/zapchasti-k-sadovoj-tehnike/" "tata-agro-garden"

echo ""
echo "✅ TATA-AGRO завершен"
echo ""

# ============================================================================
# ИТОГИ
# ============================================================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo "================================================================================"
echo "✅ ВСЕ ГОТОВО!"
echo "================================================================================"
echo ""
echo "⏱️  Время выполнения: ${MINUTES}м ${SECONDS}с"
echo ""
echo "📊 Запускаю анализ данных..."
echo ""

python3 scripts/analyze-data.py

echo ""
echo "✅ ПЕРЕПАРСИНГ ЗАВЕРШЕН!"
echo ""
