#!/bin/bash
cd /home/ibm/dongfeng-minitraktor
export NEXT_PUBLIC_SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL frontend/.env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
export SUPABASE_SERVICE_ROLE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY frontend/.env.local | cut -d'=' -f2 | tr -d '"' | tr -d "'")
python3 scripts/migrate-parts-improved.py
