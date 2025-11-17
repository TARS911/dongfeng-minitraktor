# CLAUDE.md - AI Assistant Guide for БелТехФермЪ Repository

**Last Updated:** November 17, 2025
**Project:** БелТехФермЪ - E-Commerce Platform for Mini-Tractors & Parts
**Stack:** Next.js 15 + React 19 + TypeScript + Supabase (PostgreSQL)
**Status:** ✅ Production Ready

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Core Development Rules](#core-development-rules)
3. [Repository Structure](#repository-structure)
4. [Technology Stack](#technology-stack)
5. [Development Workflows](#development-workflows)
6. [Code Conventions](#code-conventions)
7. [Database Guidelines](#database-guidelines)
8. [Testing Requirements](#testing-requirements)
9. [API Development](#api-development)
10. [Component Development](#component-development)
11. [Common Tasks](#common-tasks)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 PROJECT OVERVIEW

### What This Project Is

**БелТехФермЪ** is a full-stack e-commerce platform for selling mini-tractors, agricultural equipment, and spare parts. Built with Next.js 15 and Supabase, it serves 4,052 products across 107 categories from 21 brands.

### Key Statistics
- **Products:** 4,052 items (97.8% in stock)
- **Categories:** 107 active (brand × type combinations)
- **Brands:** 21 (DongFeng, Uralets, Universal, etc.)
- **Tech:** Next.js 15, React 19, TypeScript, Supabase PostgreSQL
- **Deployment:** Netlify (automated)
- **URL:** https://beltehferm.netlify.app

### Project Structure
```
dongfeng-minitraktor/
├── frontend/              # Next.js 15 application (main codebase)
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API Routes (serverless backend)
│   │   ├── catalog/      # Product catalog pages
│   │   ├── components/   # React components
│   │   ├── context/      # React Context providers
│   │   ├── lib/          # Utility libraries
│   │   └── [pages]/      # Other pages
│   ├── public/           # Static assets
│   └── tests/            # E2E tests (Playwright)
├── scripts/              # Python data migration scripts
├── docs/                 # Documentation
└── parsed_data/          # Scraped product data
```

---

## ⚡ CORE DEVELOPMENT RULES

### Communication
- **Language:** All responses in Russian (код на английском, комментарии на русском)
- **Environment:** Windows + WSL Ubuntu
- **Web Search:** Use 2025-relevant data

### Architecture Principles

#### ✅ DO (Best Practices)
1. **TDD Workflow:** Tests → Code → Run → Fix → Repeat
2. **Modularity:** Related functionality in one folder
3. **File Size Limit:** Max 500 lines per file (split if exceeded)
4. **Context Localization:** Everything related in one place
5. **Explicit Dependencies:** No hidden connections
6. **Isolated Testing:** Tests next to code in `tests/` subfolder
7. **Named Constants:** No magic numbers
8. **JSDoc Comments:** Document all functions and components

#### ❌ DON'T (Anti-patterns for AI)
1. **Global State:** Use React Context, not global variables
2. **Implicit Dependencies:** Always declare dependencies
3. **Deep Nesting:** Max 3 levels deep
4. **Hidden Logic:** No middleware/decorator magic
5. **Complex Patterns:** Avoid Observer, Strategy patterns
6. **Try-Catch Overuse:** No silent exceptions on async requests

### Critical Rules (FORBIDDEN)

#### ⛔ Strict Policy - Fail Fast
```typescript
// ❌ WRONG - Silent failures
const value = data?.field || 'default'
try { await fetch(...) } catch { /* silent */ }

// ✅ CORRECT - Explicit handling
if (!data?.field) {
  throw new Error('Missing required field')
}

const response = await fetch(...)
if (!response.ok) {
  throw new Error(`API error: ${response.statusText}`)
}
```

**Rules:**
1. ⛔ **No Fallbacks:** Do not invent default values to mask missing data
2. ⛔ **No Silent Try-Catch:** Especially on async requests
3. ⛔ **No Silent Exceptions:** Catch only expected exceptions, log, re-raise
4. ⛔ **No Chained Defaults:** `a || b || c` only for UI labels, never for business logic
5. ⛔ **No Hidden Retries:** Only if explicit, idempotent, bounded, logged
6. ✅ **Fail Fast:** Throw on invalid input/state
7. ✅ **Observability:** Always log failures with context

### Project Integrity

#### When Changing Structure
- [ ] Update navigation (Header, MegaMenu, breadcrumbs)
- [ ] Sync routing in all related files
- [ ] Remove outdated types, routes, props
- [ ] Analyze code for unused elements

#### UI Unification
- Reuse existing components (toast, pagination, modals)
- Extract navigation into components (no duplication)
- Follow existing patterns in `app/components/`

---

## 📁 REPOSITORY STRUCTURE

### Frontend Directory (`/frontend`)

```
frontend/app/
├── api/                              # Backend API Routes
│   ├── products/route.ts             # GET /api/products (pagination)
│   ├── categories/route.ts           # GET /api/categories
│   ├── search/route.ts               # GET /api/search?q=...
│   ├── import/                       # Import endpoints
│   └── health/route.ts               # Health check
│
├── catalog/                          # Product Pages
│   ├── page.tsx                      # Main catalog
│   ├── dongfeng/                     # Brand: DongFeng
│   ├── uralets/                      # Brand: Uralets
│   ├── mini-tractors/                # Category: Mini-tractors
│   ├── parts/                        # Parts catalog
│   │   └── [brand]/[type]/page.tsx   # Dynamic: /parts/dongfeng/filters
│   └── product/[slug]/page.tsx       # Product detail page
│
├── components/                       # React Components
│   ├── Header.tsx                    # Site header + nav
│   ├── Footer.tsx                    # Site footer
│   ├── MegaMenu.tsx                  # Complex dropdown nav
│   ├── ProductCard.tsx               # Product card (fully documented)
│   ├── ProductFilters.tsx            # Filter UI
│   ├── Breadcrumbs.tsx               # Breadcrumb nav
│   ├── GlobalSearch.tsx              # Search widget
│   ├── OptimizedImage.tsx            # Image optimization
│   ├── SkeletonCard.tsx              # Loading skeleton
│   ├── ErrorBoundary.tsx             # Error handling
│   └── Icons.tsx                     # SVG icons
│
├── context/                          # State Management (Context API)
│   ├── AuthContext.tsx               # Authentication state
│   ├── CartContext.tsx               # Shopping cart
│   ├── FavoritesContext.tsx          # Favorite products
│   ├── CompareContext.tsx            # Product comparison
│   └── ThemeContext.tsx              # Theme management
│
├── lib/                              # Utilities
│   ├── supabase.ts                   # Supabase client
│   ├── supabase-server.ts            # Server-side client
│   ├── validation.ts                 # Input validation
│   ├── sentry.ts                     # Error tracking
│   └── pushNotifications.ts          # Push notifications
│
├── hooks/                            # Custom Hooks
│   └── useSwipe.ts                   # Swipe gesture hook
│
├── data/                             # Static Data
│   └── menuStructure.ts              # Site navigation data
│
├── [feature-pages]/                  # Feature Pages
│   ├── cart/page.tsx                 # Shopping cart
│   ├── favorites/page.tsx            # Favorites
│   ├── compare/page.tsx              # Comparison
│   ├── auth/page.tsx                 # Login/signup
│   ├── about/page.tsx                # About page
│   ├── contacts/page.tsx             # Contact form
│   └── admin/                        # Admin panel
│
├── layout.tsx                        # Root layout
├── page.tsx                          # Homepage
└── sitemap.ts                        # Dynamic sitemap
```

### Important Files

| File | Purpose | Location |
|------|---------|----------|
| `next.config.js` | Next.js configuration | `/frontend/next.config.js` |
| `middleware.ts` | Rate limiting | `/frontend/middleware.ts` |
| `package.json` | Dependencies | `/frontend/package.json` |
| `.env.local` | Environment variables | `/frontend/.env.local` (not in git) |
| `supabase-schema.sql` | Database schema | `/docs/supabase-schema.sql` |
| `deploy.sh` | Deployment script | `/deploy.sh` |
| `netlify.toml` | Netlify config | `/netlify.toml` |

---

## 🛠️ TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.1.0 | React framework with App Router |
| React | 19.0.0 | UI library |
| TypeScript | 5.x | Type safety |
| CSS Modules | - | Styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js API Routes | 15.1.0 | Serverless functions |
| Supabase | - | PostgreSQL + REST API |
| @supabase/supabase-js | 2.79.0 | Database client |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| Jest | 30.2.0 | Unit testing |
| Playwright | 1.56.1 | E2E testing |
| @testing-library/react | 16.3.0 | Component testing |

### External Services
| Service | Purpose |
|---------|---------|
| Supabase | Database + Auth + Storage |
| Netlify | Hosting + CDN |
| Google Analytics | Analytics |
| Sentry | Error tracking |

---

## 🔄 DEVELOPMENT WORKFLOWS

### 1. Local Development Setup

```bash
# Clone repository
cd /home/user/dongfeng-minitraktor

# Install dependencies
cd frontend
npm install

# Setup environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Start dev server
npm run dev  # http://localhost:3000
```

### 2. Creating New Features

#### Step-by-Step Process
1. **Analyze Existing Code**
   ```bash
   # Find similar features
   grep -r "similar-feature" frontend/app
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/new-feature-name
   ```

3. **Write Tests First (TDD)**
   ```typescript
   // __tests__/NewFeature.test.tsx
   describe('NewFeature', () => {
     it('should render correctly', () => {
       // Test implementation
     })
   })
   ```

4. **Implement Feature**
   - Follow existing patterns in similar components
   - Use TypeScript interfaces
   - Add JSDoc comments
   - Keep files under 500 lines

5. **Run Tests**
   ```bash
   npm test                # Unit tests
   npm run test:e2e       # E2E tests
   ```

6. **Build & Verify**
   ```bash
   npm run build          # Production build
   npm run start          # Test production build
   ```

### 3. Working with Database

#### Reading Data
```typescript
// In API route or server component
import { createClient } from '@/app/lib/supabase-server'

const supabase = createClient()
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('in_stock', true)
  .order('created_at', { ascending: false })

if (error) throw error
```

#### Writing Data
```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'New Product',
    slug: 'new-product',
    price: 1999.99,
    category_id: 1
  })

if (error) throw error
```

### 4. Deployment Process

#### Automated (Netlify)
```bash
# Push to main branch
git add .
git commit -m "feat: description"
git push origin main

# Netlify automatically deploys
# Check status at: https://app.netlify.com
```

#### Manual
```bash
# Use deployment script
./deploy.sh

# Or Netlify CLI
netlify deploy --prod
```

---

## 📝 CODE CONVENTIONS

### TypeScript Guidelines

#### Interfaces & Types
```typescript
// ✅ CORRECT - Clear, exported interface
export interface Product {
  id: number
  name: string
  slug: string
  price: number
  old_price?: number
  in_stock: boolean
  category_id: number
  specifications?: Record<string, any>
}

// Component props
interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}
```

#### Function Documentation
```typescript
/**
 * Fetches products from Supabase with pagination and filters
 *
 * @param page - Page number (1-indexed)
 * @param limit - Items per page (max 100)
 * @param categoryId - Filter by category ID
 * @returns Promise with products array and pagination info
 * @throws Error if database query fails
 */
export async function fetchProducts(
  page: number = 1,
  limit: number = 20,
  categoryId?: number
): Promise<{ products: Product[], pagination: Pagination }> {
  // Implementation
}
```

### React Component Patterns

#### Client Components
```typescript
'use client'  // Required for hooks, events, browser APIs

import { useState, useEffect } from 'react'
import { useCart } from '@/app/context/CartContext'

/**
 * Product card component with cart functionality
 * Location: frontend/app/components/ProductCard.tsx:1
 */
export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isLoaded, setIsLoaded] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="product-card">
      {/* Component JSX */}
    </div>
  )
}
```

#### Server Components (Default)
```typescript
// No 'use client' directive = Server Component
// Can fetch data directly, no useState/useEffect

import { createClient } from '@/app/lib/supabase-server'

export default async function ProductsPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')

  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Context API Pattern

```typescript
// CartContext.tsx
'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (id: number) => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage (SSR-safe)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart')
      if (saved) setItems(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items))
    }
  }, [items])

  const addToCart = (product: Product) => {
    setItems(prev => [...prev, { ...product, quantity: 1 }])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
```

### Styling Conventions

```css
/* Component-specific CSS Module */
/* ProductCard.module.css */

.card {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  padding: 1rem;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

/* Mobile-first responsive design */
@media (min-width: 768px) {
  .card {
    flex-direction: row;
  }
}
```

---

## 🗄️ DATABASE GUIDELINES

### Schema Overview

#### Main Tables
```sql
categories (293 total, 107 active)
├── id: BIGSERIAL PRIMARY KEY
├── name: TEXT NOT NULL
├── slug: TEXT UNIQUE NOT NULL
├── description: TEXT
└── image_url: TEXT

products (4,052 items)
├── id: BIGSERIAL PRIMARY KEY
├── name: TEXT NOT NULL
├── slug: TEXT UNIQUE NOT NULL
├── price: NUMERIC(10,2) NOT NULL
├── category_id: BIGINT → categories(id)
├── in_stock: BOOLEAN DEFAULT true
└── specifications: JSONB

orders, order_items, customers, contacts
```

### Querying Best Practices

#### ✅ Efficient Queries
```typescript
// Use select() with specific columns
const { data } = await supabase
  .from('products')
  .select('id, name, price, image_url')  // Only needed columns
  .eq('in_stock', true)
  .limit(20)

// Use indexes
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('category_id', categoryId)  // Indexed column
```

#### ❌ Inefficient Queries
```typescript
// Don't fetch all columns if not needed
const { data } = await supabase
  .from('products')
  .select('*')  // Fetches everything including JSONB

// Don't fetch without limits
const { data } = await supabase
  .from('products')
  .select('*')  // Fetches all 4,052 products!
```

### Row Level Security (RLS)

```sql
-- Products are publicly readable
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

-- Only authenticated users can create orders
CREATE POLICY "Authenticated create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
```

### Migration Process

1. **Create Migration File**
   ```sql
   -- docs/migrations/new-feature.sql

   -- Add new column
   ALTER TABLE products
   ADD COLUMN featured_until TIMESTAMPTZ;

   -- Create index
   CREATE INDEX idx_products_featured
   ON products(featured_until)
   WHERE featured_until IS NOT NULL;
   ```

2. **Apply in Supabase**
   - Open Supabase Dashboard → SQL Editor
   - Copy migration file content
   - Run and verify

3. **Document Changes**
   - Update `docs/supabase-schema.sql`
   - Add migration notes to `MIGRATION_REPORT.md`

---

## ✅ TESTING REQUIREMENTS

### TDD Workflow

```
1. Write Test (Red)
   ↓
2. Write Code (Green)
   ↓
3. Refactor (Clean)
   ↓
4. Repeat
```

### Unit Testing (Jest)

#### Component Test Example
```typescript
// __tests__/ProductCard.test.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/app/components/ProductCard'
import { CartProvider } from '@/app/context/CartContext'

describe('ProductCard', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    slug: 'test-product',
    price: 1999.99,
    in_stock: true,
    category_id: 1
  }

  it('renders product information', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    )

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('1999.99 ₽')).toBeInTheDocument()
  })

  it('adds product to cart on button click', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    )

    const addButton = screen.getByText('В корзину')
    fireEvent.click(addButton)

    // Verify cart was updated
    expect(screen.getByText('В корзине')).toBeInTheDocument()
  })
})
```

#### Run Tests
```bash
npm test                          # All tests
npm test ProductCard             # Specific test
npm test -- --coverage           # With coverage
```

### E2E Testing (Playwright)

#### Test Example
```typescript
// tests/catalog.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Product Catalog', () => {
  test('should load and display products', async ({ page }) => {
    await page.goto('/catalog')

    // Wait for products to load
    await page.waitForSelector('.product-card')

    // Check product cards are visible
    const products = await page.locator('.product-card').count()
    expect(products).toBeGreaterThan(0)

    // Take screenshot
    await page.screenshot({ path: 'screenshots/catalog.png' })
  })

  test('should add product to cart', async ({ page }) => {
    await page.goto('/catalog')

    // Click first "Add to Cart" button
    await page.click('.product-card >> text=В корзину')

    // Verify cart badge updated
    const cartBadge = await page.locator('.cart-badge').textContent()
    expect(cartBadge).toBe('1')
  })
})
```

#### Run E2E Tests
```bash
npm run test:e2e                 # All browsers
npm run test:e2e -- --project=chromium  # Chrome only
npm run test:e2e -- --ui         # Debug UI
```

### Testing Checklist

When adding new features:
- [ ] Unit tests for components
- [ ] Unit tests for utilities/hooks
- [ ] Unit tests for API routes
- [ ] E2E test for user flow
- [ ] Test error cases
- [ ] Test loading states
- [ ] Test edge cases (empty data, invalid input)

---

## 🔌 API DEVELOPMENT

### API Route Structure

```
frontend/app/api/
├── products/
│   ├── route.ts              # GET /api/products (list)
│   └── [slug]/route.ts       # GET /api/products/[slug]
├── categories/
│   ├── route.ts              # GET /api/categories
│   └── [id]/route.ts         # GET/PUT/DELETE /api/categories/[id]
└── search/
    └── route.ts              # GET /api/search?q=...
```

### Creating New API Route

```typescript
// frontend/app/api/example/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase-server'

/**
 * GET /api/example
 * Example API endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')

    // Query database
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .limit(limit)

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/example
 * Create new resource
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('table_name')
      .insert(body)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      data
    }, { status: 201 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### API Best Practices

#### 1. Input Validation
```typescript
import { z } from 'zod'

const ProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  category_id: z.number().int().positive()
})

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Validate with Zod
  const validation = ProductSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.errors },
      { status: 400 }
    )
  }

  const validData = validation.data
  // Proceed with valid data
}
```

#### 2. Pagination
```typescript
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = (page - 1) * limit

  const { data, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      hasNextPage: offset + limit < count,
      hasPrevPage: page > 1
    }
  })
}
```

#### 3. Error Handling
```typescript
try {
  const { data, error } = await supabase
    .from('products')
    .select('*')

  if (error) {
    console.error('Database error:', error)
    throw new Error(`Database query failed: ${error.message}`)
  }

  return NextResponse.json({ data })

} catch (error) {
  // Log error with context
  console.error('API Error:', {
    endpoint: '/api/products',
    error: error.message,
    stack: error.stack
  })

  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    // Sentry.captureException(error)
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
```

#### 4. Rate Limiting
Rate limiting is handled by middleware (`frontend/middleware.ts`):
- **Regular pages:** 100 requests/minute
- **API routes:** 30 requests/minute
- **Per IP address** (respects X-Forwarded-For)

---

## 🎨 COMPONENT DEVELOPMENT

### Component Checklist

When creating a new component:
- [ ] Determine if it's Client or Server Component
- [ ] Add TypeScript interface for props
- [ ] Write JSDoc documentation
- [ ] Add proper file header comment
- [ ] Create CSS Module if needed
- [ ] Export from index.ts if in folder
- [ ] Write unit tests
- [ ] Add to Storybook (if available)

### Component Template

```typescript
/**
 * ExampleComponent - Brief description
 *
 * Longer description of what this component does.
 *
 * Location: frontend/app/components/ExampleComponent.tsx
 *
 * @example
 * <ExampleComponent
 *   title="Hello"
 *   onAction={() => console.log('clicked')}
 * />
 */

'use client'  // Only if needed

import { useState } from 'react'
import styles from './ExampleComponent.module.css'

/**
 * Props for ExampleComponent
 */
interface ExampleComponentProps {
  /** The title text to display */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Callback when action button is clicked */
  onAction?: () => void
}

/**
 * ExampleComponent implementation
 */
export default function ExampleComponent({
  title,
  subtitle,
  onAction
}: ExampleComponentProps) {
  const [isActive, setIsActive] = useState(false)

  const handleClick = () => {
    setIsActive(true)
    onAction?.()
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      <button
        className={styles.button}
        onClick={handleClick}
        aria-label="Action button"
      >
        Click Me
      </button>
    </div>
  )
}
```

### Common Component Patterns

#### 1. Loading State
```typescript
'use client'

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data)
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

#### 2. Error Boundary
```typescript
'use client'

import { ErrorBoundary } from '@/app/components/ErrorBoundary'

export default function Page() {
  return (
    <ErrorBoundary>
      <ComponentThatMightFail />
    </ErrorBoundary>
  )
}
```

#### 3. Hydration Safety
```typescript
'use client'

export default function ClientComponent() {
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch with localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>  // Server render
  }

  // Client-only code
  const savedData = localStorage.getItem('key')
  return <div>{savedData}</div>
}
```

---

## 🔧 COMMON TASKS

### Task 1: Add New Product Category

1. **Insert into Database**
```sql
INSERT INTO categories (name, slug, description)
VALUES (
  'Новая категория',
  'novaya-kategoriya',
  'Описание новой категории'
);
```

2. **Update Menu Structure**
```typescript
// frontend/app/data/menuStructure.ts
export const menuItems = [
  // ... existing items
  {
    label: 'Новая категория',
    href: '/catalog/novaya-kategoriya',
    subcategories: []
  }
]
```

3. **Create Dynamic Page (if needed)**
```typescript
// frontend/app/catalog/novaya-kategoriya/page.tsx
export default async function NovayaKategoriyaPage() {
  // Implementation
}
```

### Task 2: Add New API Endpoint

1. **Create Route File**
```typescript
// frontend/app/api/new-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' })
}
```

2. **Test Locally**
```bash
npm run dev
curl http://localhost:3000/api/new-endpoint
```

3. **Document in API.md**
```markdown
### New Endpoint
`GET /api/new-endpoint`
Description...
```

### Task 3: Fix TypeScript Errors

1. **Run Type Check**
```bash
cd frontend
npm run type-check  # or: npx tsc --noEmit
```

2. **Common Fixes**
```typescript
// Error: Property 'name' does not exist on type 'unknown'
// Fix: Add type annotation
const data = response.data as Product

// Error: Argument of type 'string | null' is not assignable
// Fix: Handle null case
const value = searchParams.get('id')
if (!value) return
const id = parseInt(value)
```

### Task 4: Optimize Performance

1. **Use Dynamic Imports**
```typescript
// Before
import HeavyComponent from './HeavyComponent'

// After
import dynamic from 'next/dynamic'
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false  // If client-only
})
```

2. **Optimize Images**
```typescript
import Image from 'next/image'

<Image
  src="/images/product.jpg"
  alt="Product"
  width={300}
  height={200}
  loading="lazy"
  placeholder="blur"
/>
```

3. **Memoize Expensive Calculations**
```typescript
import { useMemo } from 'react'

const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0)
}, [items])
```

### Task 5: Debug Production Issues

1. **Check Netlify Logs**
```bash
# Open Netlify dashboard
https://app.netlify.com

# Or use CLI
netlify logs
```

2. **Check Sentry (Error Tracking)**
```bash
# Errors are automatically sent to Sentry in production
# Check Sentry dashboard for stack traces
```

3. **Enable Debug Logging**
```typescript
// Add to API route
console.log('Debug:', {
  input: request.body,
  user: request.headers.get('authorization'),
  timestamp: new Date().toISOString()
})
```

---

## 🚨 TROUBLESHOOTING

### Build Errors

#### Error: "Module not found"
```bash
# Clear Next.js cache
rm -rf frontend/.next

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### Error: "Type error: Property does not exist"
```typescript
// Add proper TypeScript types
interface ApiResponse {
  data: Product[]
  error?: string
}

const response: ApiResponse = await fetch('/api/products').then(r => r.json())
```

### Runtime Errors

#### Error: "Hydration failed"
```typescript
// Cause: Server and client render differently
// Fix: Use useEffect for client-only code

'use client'
import { useState, useEffect } from 'react'

export default function Component() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null  // or <Skeleton />

  // Client-only code here
}
```

#### Error: "Supabase query failed"
```typescript
// Check RLS policies
// Ensure service role key for admin operations
// Use anon key for public operations

// In Supabase dashboard:
// Authentication → Policies → Check policies for table
```

### Database Issues

#### Migration Failed
```sql
-- Rollback migration
-- Check Supabase Dashboard → Database → Migrations

-- Reapply manually
-- SQL Editor → Run migration SQL

-- Verify
SELECT * FROM information_schema.columns
WHERE table_name = 'your_table';
```

#### Slow Queries
```sql
-- Add missing indexes
CREATE INDEX idx_products_category
ON products(category_id);

CREATE INDEX idx_products_in_stock
ON products(in_stock)
WHERE in_stock = true;

-- Check query plan
EXPLAIN ANALYZE
SELECT * FROM products WHERE category_id = 1;
```

### Deployment Issues

#### Netlify Build Failed
```bash
# Check build logs in Netlify dashboard

# Common fixes:
1. Check Node.js version (must be 20)
2. Verify environment variables are set
3. Check netlify.toml configuration
4. Clear build cache and retry
```

#### 404 on Dynamic Routes
```typescript
// Ensure dynamic route exports generateStaticParams or is truly dynamic

// frontend/app/catalog/[slug]/page.tsx
export const dynamic = 'force-dynamic'  // Force SSR

// OR generate static paths
export async function generateStaticParams() {
  const products = await fetchProducts()
  return products.map(p => ({ slug: p.slug }))
}
```

---

## 📚 ADDITIONAL RESOURCES

### Documentation Files
- **README.md** - Project overview
- **docs/API.md** - Complete API reference
- **docs/SETUP.md** - Detailed setup guide
- **MIGRATION_REPORT.md** - Database migration history
- **DATABASE_OPTIMIZATION.md** - Performance optimization guide

### External Resources
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Playwright Docs](https://playwright.dev)

### Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Production build
npm run start                  # Start production server

# Testing
npm test                       # Run unit tests
npm run test:e2e              # Run E2E tests
npm run test:coverage         # Test coverage

# Database
python scripts/generate-migration-report.py  # Check DB state

# Deployment
./deploy.sh                    # Auto deploy to Netlify
netlify deploy --prod         # Manual deploy

# Utilities
npm run type-check            # TypeScript check
npm run lint                  # Lint code
```

---

## 🎯 QUICK START FOR NEW AI ASSISTANTS

1. **Read this file first** to understand project structure
2. **Check recent commits** to understand latest changes
3. **Review existing similar code** before implementing new features
4. **Follow TDD workflow** - tests first, then implementation
5. **Use TypeScript strictly** - no implicit any
6. **Document everything** - JSDoc comments required
7. **Test locally** before committing
8. **Keep files under 500 lines**
9. **Ask for clarification** if requirements are unclear
10. **Fail fast** - explicit error handling, no silent failures

---

## ✅ CHECKLIST FOR COMMON TASKS

### Adding New Feature
- [ ] Create feature branch
- [ ] Write tests first (TDD)
- [ ] Implement feature following existing patterns
- [ ] Add TypeScript types/interfaces
- [ ] Write JSDoc documentation
- [ ] Test locally (unit + E2E)
- [ ] Update relevant documentation
- [ ] Run type check (`npm run type-check`)
- [ ] Build successfully (`npm run build`)
- [ ] Commit with clear message
- [ ] Push and verify deployment

### Bug Fix
- [ ] Reproduce bug locally
- [ ] Write failing test
- [ ] Fix bug
- [ ] Verify test passes
- [ ] Check for similar bugs elsewhere
- [ ] Test edge cases
- [ ] Document fix if non-obvious
- [ ] Commit and deploy

### Database Change
- [ ] Create migration SQL file
- [ ] Test migration on local DB
- [ ] Apply to Supabase Dashboard
- [ ] Verify data integrity
- [ ] Update TypeScript interfaces
- [ ] Update API routes if needed
- [ ] Document in MIGRATION_REPORT.md
- [ ] Update schema documentation

---

**Last Updated:** November 17, 2025
**Maintained by:** AI Assistants working on БелТехФермЪ project
**Status:** ✅ Production Ready

For questions or clarifications, refer to the documentation in `/docs` folder or recent git commits.