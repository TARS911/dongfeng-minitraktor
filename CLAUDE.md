# CLAUDE.md - AI Assistant Guide for DongFeng Mini-Tractor E-Commerce

## Project Overview

**Name**: DongFeng Mini-Tractor Shop (BelTehFerm)
**Type**: E-commerce website for mini-tractors and spare parts
**Target Market**: Russia, Belarus, Kazakhstan
**Brands**: DongFeng, Foton, Jinma, Xingtai, Universal parts
**Language**: All user-facing content in Russian

---

## Quick Start Commands

```bash
# Frontend development
cd frontend
npm install
npm run dev          # Start dev server on http://localhost:3000

# Testing
npm run test         # Jest unit tests
npm run test:ci      # Jest with coverage
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Playwright with UI

# Code quality
npm run lint         # ESLint
npm run type-check   # TypeScript check

# Build & Deploy
npm run build        # Production build
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.9
- **React**: 19.0
- **Styling**: CSS Modules + globals.css
- **Deployment**: Vercel (auto-deploy from main branch)
- **Analytics**: Vercel Speed Insights, Sentry

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (images)
- **API**: Next.js API Routes + Supabase REST API

### Testing
- **Unit Tests**: Jest 30 + React Testing Library
- **E2E Tests**: Playwright (Chromium, Firefox, WebKit)
- **Coverage**: v8 provider via Jest

---

## Project Structure

```
dongfeng-minitraktor/
├── frontend/                    # Next.js application
│   ├── app/                     # App Router (pages + API)
│   │   ├── api/                 # API routes
│   │   │   ├── products/        # GET /api/products
│   │   │   ├── categories/      # GET /api/categories, /api/categories/[id]
│   │   │   ├── orders/          # POST /api/orders
│   │   │   ├── search/          # GET /api/search
│   │   │   ├── health/          # GET /api/health
│   │   │   └── import/          # Import endpoints
│   │   ├── catalog/             # Product catalog pages
│   │   │   ├── parts/           # Spare parts by brand/type
│   │   │   ├── mini-tractors/   # Mini-tractors category
│   │   │   └── product/[slug]/  # Product detail page
│   │   ├── components/          # React components
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.tsx
│   │   │   ├── CartContext.tsx
│   │   │   ├── FavoritesContext.tsx
│   │   │   └── CompareContext.tsx
│   │   ├── lib/                 # Utilities and helpers
│   │   │   ├── supabase.ts      # Supabase client
│   │   │   ├── validation.ts    # Input validation/sanitization
│   │   │   ├── seo.ts           # SEO configuration
│   │   │   └── schema.ts        # JSON-LD structured data
│   │   ├── hooks/               # Custom React hooks
│   │   └── data/                # Static data (menu structure)
│   ├── __tests__/               # Jest unit tests
│   ├── tests/                   # Playwright E2E tests
│   ├── public/                  # Static assets
│   └── package.json
├── scripts/                     # Python data management scripts
│   ├── import-*.py              # Product import scripts
│   ├── parse-*.py               # Data parsing scripts
│   ├── check-*.py               # Validation scripts
│   ├── optimize-database.py     # DB optimization
│   └── supabase-tools.py        # CLI for DB queries
├── parsed_data/                 # Source data (JSON/CSV)
│   ├── zip-agro/                # Primary data source
│   ├── tata-agro/               # Secondary data source
│   └── agrodom/                 # Additional data source
├── migrations/                  # SQL migrations
├── .github/workflows/           # CI/CD (test.yml, deploy.yml)
└── .claude/                     # Legacy Claude configs
```

---

## Database Schema (Supabase PostgreSQL)

### Main Tables

**products**
- `id` (uuid, PK)
- `name` (text) - Product name
- `slug` (text, unique) - URL-friendly identifier
- `description` (text)
- `price` (numeric) - Price in RUB
- `manufacturer` (text) - Brand name (DONGFENG, FOTON, JINMA, XINGTAI, UNIVERSAL)
- `category_id` (int, FK -> categories)
- `image_url` (text)
- `in_stock` (boolean)
- `specifications` (jsonb) - Technical specs, includes:
  - `part_type` - Type of part (filters, engines, pumps, etc.)
  - `has_watermark` - Flag for watermarked images
- `created_at`, `updated_at` (timestamps)

**categories**
- `id` (int, PK)
- `name` (text)
- `slug` (text, unique)
- `parent_id` (int, self-reference)
- `sort_order` (int)

**orders**, **order_items**, **customers**, **contacts** - E-commerce tables

### Security
- Row Level Security (RLS) enabled on all tables
- Use `SERVICE_ROLE_KEY` for bulk operations (bypasses RLS)
- Use `ANON_KEY` for client-side operations

---

## Environment Variables

```bash
# Required in frontend/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# For scripts and server-side (never expose to client!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Development Rules

### Code Quality Standards

1. **No Fallbacks Policy**
   - Never invent default values to mask missing data
   - Fail fast on invalid input - raise errors, don't continue with partial results
   - Log with context, then re-raise

2. **Error Handling**
   - No try-catch except on async requests
   - No silent except blocks - catch only expected exceptions
   - Include structured logging on failures

3. **File Size Limit**
   - Maximum 500 lines per file (split if exceeded)
   - Keep related functionality in one folder

4. **TypeScript**
   - Use strict typing
   - Prefer interfaces over types
   - Use generics where appropriate

### Security Requirements

1. **Input Validation**
   - Use `app/lib/validation.ts` helpers:
     - `validateId()`, `validateSlug()`, `validateEmail()`
     - `sanitizeString()`, `escapeHtml()`
   - Validate all user input on server-side

2. **Authentication**
   - Check authorization when adding new pages
   - Use Supabase Auth for user management

3. **Database**
   - Never disable RLS policies
   - Use parameterized queries
   - Test migrations before production

### Testing (TDD Workflow)

1. **Unit Tests (Jest)**
   - Location: `frontend/__tests__/`
   - Test components: render, props, actions
   - Test hooks: states and side effects
   - Store mocks in `__mocks__/` folder

2. **E2E Tests (Playwright)**
   - Location: `frontend/tests/`
   - Use headless mode
   - Take screenshots on test completion
   - Test interactive elements + DB changes

3. **Coverage Requirements**
   - Run `npm run test:ci` for coverage report
   - Coverage uploaded to Codecov in CI

---

## UI/Component Guidelines

### State Management
- Use React Context API (not Redux)
- Available contexts:
  - `useAuth()` - Authentication state
  - `useCart()` - Shopping cart (localStorage-persisted)
  - `useFavorites()` - Favorite products
  - `useCompare()` - Product comparison (max 4 items)

### Component Reuse
- Check `app/components/` before creating new components
- Existing components:
  - `Header.tsx` - Site header with navigation
  - `ProductCard.tsx` - Product display card
  - `Breadcrumbs.tsx` - Navigation breadcrumbs
  - `GlobalSearch.tsx` - Site-wide search
  - `ErrorBoundary.tsx` - Error handling
  - `OptimizedImage.tsx` - Lazy-loaded images
  - `SkeletonCard.tsx`, `SkeletonTable.tsx` - Loading states

### SSR Considerations
- Use `typeof window !== 'undefined'` for localStorage access
- Use `isLoaded` flags to prevent hydration mismatch
- Default to Server Components; add `'use client'` only when needed

---

## API Routes Pattern

```typescript
// Example: frontend/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { validateId } from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  // Validate input
  if (id && !validateId(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  // Query database
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(20);

  if (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

---

## Python Scripts (Data Management)

### Import Scripts
```bash
# Import products by brand
python3 scripts/import-all-brands.py

# Import remaining universal parts
python3 scripts/import-all-remaining.py

# Full database optimization
python3 scripts/optimize-database.py
```

### Data Management
```bash
# Interactive cleanup tool
python3 scripts/cleanup-and-normalize.py

# CLI for database queries
python3 scripts/supabase-tools.py

# Check for watermarked images
python3 scripts/check-watermarks.py
```

### Script Requirements
- Load env from `frontend/.env.local`
- Use `supabase-py` library
- Batch processing (100 items per batch)
- Print progress every 100 items
- Use SERVICE_ROLE_KEY for bulk operations

---

## Git Workflow

### Branch Strategy
- `main` - Production (auto-deploys to Vercel)
- Feature branches: `claude/*` for AI-assisted development

### Commit Message Format
```
<emoji> <Short description>

- Detailed change 1
- Detailed change 2

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Emoji Prefixes
- `🎯` Feature/Enhancement
- `🔧` Configuration/Tools
- `🐛` Bug fix
- `📚` Documentation
- `🔍` Search/Detection
- `💾` Data/Database
- `🚀` Deployment
- `⚡` Performance
- `🗃️` Database schema changes
- `🔒` Security fixes

---

## CI/CD Pipeline

### GitHub Actions (.github/workflows/)

**test.yml** - Runs on push/PR to main/develop:
1. **Unit Tests**: Jest with coverage
2. **E2E Tests**: Playwright with HTML report
3. **Lint & Type Check**: ESLint + TypeScript

**deploy.yml** - Deployment workflow

### Required Secrets
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Anti-Patterns to Avoid

1. **Global State** - Use Context or local state
2. **Implicit Dependencies** - Be explicit about imports
3. **Deep Nesting** - Max 3 levels
4. **Hidden Logic** - Avoid complex middleware/decorators
5. **Complex Patterns** - Skip Observer, Strategy unless necessary
6. **Chained Defaults** - `a || b || c` only for UI labels
7. **Hidden Retries** - Only if explicitly requested, idempotent, bounded, logged
8. **Hardcoded Data** - Fetch from Supabase

---

## When Making Changes

### Navigation Updates
When changing structure, update:
- Menu in `app/data/menuStructure.ts`
- Header navigation
- Breadcrumbs
- Footer links
- Sitemap (`app/sitemap.ts`)

### Adding New Pages
1. Create route in `app/` directory
2. Add metadata for SEO
3. Include breadcrumbs
4. Check authorization if needed
5. Update sitemap

### Database Changes
1. Write migration SQL
2. Test in development first
3. Apply via Supabase Dashboard SQL Editor
4. Update TypeScript types if needed

---

## Useful SQL Queries

```sql
-- Product count by brand
SELECT manufacturer, COUNT(*) as count
FROM products
GROUP BY manufacturer
ORDER BY count DESC;

-- Products without images
SELECT id, name, manufacturer
FROM products
WHERE image_url IS NULL OR image_url = '';

-- Duplicate detection
SELECT name, COUNT(*) as count
FROM products
GROUP BY LOWER(name)
HAVING COUNT(*) > 1;

-- Category distribution
SELECT c.name, COUNT(p.id) as product_count
FROM categories c
LEFT JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY product_count DESC;
```

---

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Supabase Client | `frontend/app/lib/supabase.ts` |
| Validation Helpers | `frontend/app/lib/validation.ts` |
| SEO Config | `frontend/app/lib/seo.ts` |
| Schema.org Data | `frontend/app/lib/schema.ts` |
| Products API | `frontend/app/api/products/route.ts` |
| Categories API | `frontend/app/api/categories/route.ts` |
| Jest Config | `frontend/jest.config.mjs` |
| Playwright Config | `frontend/playwright.config.ts` |
| Menu Structure | `frontend/app/data/menuStructure.ts` |
| Main Layout | `frontend/app/layout.tsx` |

---

## Contact & Repository

- **Repository**: TARS911/dongfeng-minitraktor (GitHub)
- **Deployment**: Vercel (automatic from main)
- **Database**: Supabase Cloud
