#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Настройка GitHub Secrets для автодеплоя${NC}"
echo ""

# GitHub репозиторий
REPO="TARS911/dongfeng-minitraktor"

echo -e "${GREEN}Откройте эту ссылку для добавления secrets:${NC}"
echo "https://github.com/$REPO/settings/secrets/actions"
echo ""

echo -e "${BLUE}Добавьте следующие secrets (Name → Secret → Add secret):${NC}"
echo ""

echo "1. NETLIFY_SITE_ID"
echo "   c4d60067-5286-434d-af09-9f6306468925"
echo ""

echo "2. NETLIFY_AUTH_TOKEN"
echo "   nfp_xt53Y8bdp5KnnFNGKDJFEXVApYaGY7PE393a"
echo ""

echo "3. NEXT_PUBLIC_SUPABASE_URL"
echo "   https://wbfhvcmvkyjsjvqkbxpz.supabase.co"
echo ""

echo "4. NEXT_PUBLIC_SUPABASE_ANON_KEY"
cat .env.local | grep NEXT_PUBLIC_SUPABASE_ANON_KEY | cut -d '=' -f2
echo ""

echo "5. SUPABASE_SERVICE_ROLE_KEY"
cat .env.local | grep SUPABASE_SERVICE_ROLE_KEY | cut -d '=' -f2
echo ""

echo -e "${GREEN}После добавления всех secrets запустите деплой:${NC}"
echo "git commit --allow-empty -m '🚀 Deploy to Netlify'"
echo "git push"
echo ""
echo "Или перейдите на: https://github.com/$REPO/actions"
