# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

БелТехФермЪ (BelTechFerm) - E-commerce platform for mini-tractors, agricultural equipment, and spare parts. Built with Next.js 15 + React 19 (frontend) and Supabase PostgreSQL (backend).

**Live Site:** Deployed on Vercel
**Database:** Supabase Cloud (PostgreSQL 15+)
**Product Count:** ~5,800 products from 3 suppliers

## Key Architecture Decisions

1. **Full-Stack Next.js**: API routes (`/api/*`) serve as backend, eliminating need for separate server
2. **Context API over Redux**: Lightweight state management sufficient for app complexity (cart, favorites, compare, auth)
3. **localStorage Persistence**: Cart/favorites persisted client-side for instant UX, no database calls
4. **SSR-Safe Patterns**: All client-specific code uses hydration-safe patterns to prevent mismatches
5. **ISR Revalidation**: Product pages use Incremental Static Regeneration (1 hour revalidation)
6. **Slug-Based Routing**: Products use `/catalog/product/[slug]` instead of numeric IDs for SEO
7. **JSONB Specifications**: Flexible product specs without schema changes

## Development Commands

### Frontend Development
```bash
cd frontend

# Development server (http://localhost:3000)
npm run dev

# Production build & run
npm run build
npm start

# Testing
npm test                    # Jest unit tests
npm run test:watch         # Jest watch mode
npm run test:e2e           # Playwright E2E tests
npm run test:e2e:ui        # E2E with interactive UI

# Code quality
npm run lint               # ESLint (Next.js config)
npm run type-check         # TypeScript type checking
```

### Data Processing (Python)
```bash
cd scripts

# Setup environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Parse supplier data
python3 parse-agrodom-complete.py          # Web scraper
python3 categorize-universal-products.py   # Auto-categorization
python3 assign-category-ids.py             # Map to DB categories

# Database analysis
python3 analyze-db-simple.py               # Product statistics
python3 check-category-stats.py            # Category distribution
```

### Database Operations
```bash
# Apply migrations in Supabase SQL Editor:
# 1. Navigate to https://supabase.com/dashboard/project/[project-id]/sql
# 2. Run files in order:
#    - migrations/001_init.sql
#    - migrations/002_fix_rls_security.sql
#    - migrations/CREATE-PARTS-SUBCATEGORIES.sql
```

## Project Structure

```
dongfeng-minitraktor/
├── frontend/                    # Next.js 15 application
│   ├── app/
│   │   ├── api/                # Backend API routes
│   │   │   ├── products/       # GET /api/products (pagination, search, filter)
│   │   │   ├── categories/     # GET /api/categories
│   │   │   ├── orders/         # POST /api/orders
│   │   │   └── search/         # GET /api/search
│   │   ├── catalog/            # Product catalog pages
│   │   │   ├── mini-tractors/
│   │   │   ├── parts/
│   │   │   └── product/[slug]/ # Dynamic product pages
│   │   ├── context/            # React Context API state
│   │   │   ├── CartContext.tsx
│   │   │   ├── FavoritesContext.tsx
│   │   │   ├── CompareContext.tsx
│   │   │   └── AuthContext.tsx
│   │   └── components/         # Reusable components
│   └── package.json
│
├── scripts/                     # Python data processing
│   ├── parse-agrodom-complete.py
│   ├── categorize-universal-products.py
│   └── assign-category-ids.py
│
├── parsed_data/                 # Scraped supplier data
│   ├── agrodom/
│   ├── tata-agro/
│   └── zip-agro/
│
└── migrations/                  # Database schema migrations
    ├── 001_init.sql
    └── 002_fix_rls_security.sql
```

## Database Schema

### Core Tables

**products** - Main inventory (5,800+ items)
```sql
id BIGSERIAL PRIMARY KEY
name TEXT                         -- Product name
slug TEXT UNIQUE                  -- URL-friendly identifier
description TEXT
price NUMERIC(10,2)
old_price NUMERIC(10,2)          -- For discounts
image_url TEXT
category_id BIGINT → categories(id)
manufacturer TEXT                 -- Brand (Dongfeng, Foton, etc.)
model TEXT
in_stock BOOLEAN DEFAULT true
featured BOOLEAN                  -- Homepage featured products
specifications JSONB              -- Flexible product specs
created_at, updated_at TIMESTAMPTZ
```

**categories** - Product taxonomy
```sql
id BIGSERIAL PRIMARY KEY
name TEXT
slug TEXT UNIQUE
description TEXT
image_url TEXT
created_at, updated_at TIMESTAMPTZ
```

**orders** - Purchase records
```sql
id BIGSERIAL PRIMARY KEY
customer_id BIGINT → customers(id)
total_amount NUMERIC(10,2)
status TEXT ('pending', 'processing', 'shipped', 'delivered')
shipping_address JSONB
notes TEXT
created_at, updated_at TIMESTAMPTZ
```

**order_items** - Line items in orders
```sql
id BIGSERIAL PRIMARY KEY
order_id BIGINT → orders(id) ON DELETE CASCADE
product_id BIGINT → products(id)
quantity INTEGER
price NUMERIC(10,2)              -- Price at order time
created_at TIMESTAMPTZ
```

### Key Indexes
```sql
idx_products_category    -- Fast category filtering
idx_products_slug        -- Unique product lookup
idx_products_in_stock    -- Filter available products
idx_orders_customer      -- Customer order history
```

## Data Flow

```
CSV Files (Supplier Data)
    ↓
Python Scripts (Scraping + Processing)
    ├── Web scraping (BeautifulSoup, Requests)
    ├── Data cleaning & normalization
    ├── Category assignment (ML-based)
    └── Duplicate detection
    ↓
Parsed JSON/CSV Files
    ↓
Supabase API Import
    ↓
PostgreSQL Database
    ↓
Next.js API Routes
    ↓
React Components
    ↓
User Browser (localStorage caching)
```

## Critical Patterns

### 1. Hydration-Safe Client Components
```typescript
// Pattern used in ProductCard, Header, etc.
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
  setIsLoaded(true);  // Render client-specific content after mount
}, []);

if (!isLoaded) return null;  // Skip SSR
```

**Why:** Prevents mismatches when server renders differently than client (e.g., localStorage access).

### 2. SSR-Safe localStorage Access
```typescript
useEffect(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(CART_KEY);
    setCart(JSON.parse(saved));
  }
}, []);
```

### 3. Context Provider Wrapping
```typescript
// layout.tsx wraps entire app
<CartProvider>
  <FavoritesProvider>
    <CompareProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </CompareProvider>
  </FavoritesProvider>
</CartProvider>
```

### 4. ISR (Incremental Static Regeneration)
```typescript
export const revalidate = 3600;  // Revalidate every 1 hour
```

Product pages pre-render at build time, then re-render on-demand up to every hour.

### 5. API Route Validation
```typescript
// Input validation before database query
if (isNaN(page) || page < 1) {
  return NextResponse.json(
    { error: "Invalid page" },
    { status: 400 }
  );
}

// Supabase parameterized queries prevent SQL injection
query = query.eq("category_id", parseInt(category, 10));
```

## Environment Configuration

Required environment variables (see `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxx    # Server-side only
NODE_ENV=production
```

## API Routes

### GET /api/products
**Query Params:**
- `page` (default: 1)
- `limit` (1-100, default: 20)
- `category` (category_id)
- `search` (text search in name/description)
- `sort` (price_asc, price_desc, name, newest)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5800,
    "totalPages": 290
  }
}
```

### POST /api/orders
**Body:**
```json
{
  "customer": { "name": "...", "email": "...", "phone": "..." },
  "items": [{ "product_id": 1, "quantity": 2, "price": 100.00 }],
  "shipping_address": { "city": "...", "address": "..." },
  "total_amount": 200.00,
  "notes": "..."
}
```

## Component Architecture

### Key Components

**ProductCard** (`components/ProductCard.tsx`)
- Fully documented with JSDoc
- Handles add-to-cart, favorites, compare
- Lazy-loaded with dynamic import
- Prevents hydration mismatch

**Header** (`components/Header.tsx`)
- Mobile sidebar with swipe gestures
- Navigation with mega menu
- Real-time cart/favorites/compare badges
- Search integration

**GlobalSearch** (`components/GlobalSearch.tsx`)
- Debounced search (300ms)
- Calls `/api/search` endpoint
- Displays results with product cards

### Context APIs

**CartContext**
- Shopping cart state
- localStorage persistence
- Methods: `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`

**FavoritesContext**
- Wishlist functionality
- localStorage persistence
- Methods: `addFavorite`, `removeFavorite`, `clearFavorites`

**CompareContext**
- Product comparison (max 4 items)
- FIFO queue when exceeding limit
- Methods: `addToCompare`, `removeFromCompare`, `clearCompare`

**AuthContext**
- Supabase authentication
- User session management
- Methods: `signIn`, `signUp`, `signOut`, `resetPassword`

## Build & Deployment

### Vercel Deployment
1. Push to GitHub
2. Vercel CI/CD triggered automatically
3. Build command: `npm run build` (in frontend/)
4. Environment variables injected from Vercel settings
5. Deploy to production domain

### Docker Support
```bash
docker-compose up --build
```

Configuration in `docker-compose.yml` and `Dockerfile`.
Next.js config uses `output: "standalone"` for optimized container images.

## Testing

### Unit Tests (Jest)
```bash
npm test                  # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

**Location:** `__tests__/` directories alongside components

### E2E Tests (Playwright)
```bash
npm run test:e2e         # Headless mode
npm run test:e2e:ui      # Interactive UI
npm run test:e2e:headed  # Browser mode
```

**Location:** `e2e/` directory

## Performance Optimizations

1. **Standalone Output**: Optimized bundle size for production
2. **Image Optimization**: WebP + AVIF formats via Next.js Image component
3. **Database Indexes**: Strategic indexes on category_id, slug, in_stock
4. **Pagination**: Limit results to 1-100 per request
5. **ISR**: Pre-render popular pages, revalidate every hour
6. **Dynamic Imports**: Lazy-load heavy components (ProductCard)
7. **localStorage Caching**: Cart/favorites cached locally

## Security

### Headers (next.config.js)
- Content-Security-Policy (XSS protection)
- X-Frame-Options: DENY (clickjacking protection)
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HTTPS enforcement)
- Permissions-Policy

### Authentication
- Supabase Auth with JWT tokens
- Row Level Security (RLS) on database tables
- httpOnly cookies for session storage

### Input Validation
- Query parameter validation in API routes
- Supabase parameterized queries (SQL injection prevention)
- Type checking with TypeScript

## Common Tasks

### Adding a New Product
1. Add to supplier CSV or parse new supplier with Python script
2. Run categorization script: `python3 categorize-universal-products.py`
3. Assign category IDs: `python3 assign-category-ids.py`
4. Import to Supabase via API or SQL
5. Product appears automatically on frontend (ISR revalidation)

### Creating a New Category
1. Add to `categories` table in Supabase
2. Update frontend category pages if needed (`app/catalog/*/page.tsx`)
3. Run `assign-category-ids.py` to map products

### Debugging API Routes
1. Check logs in Vercel dashboard or terminal (`npm run dev`)
2. Verify Supabase query in Supabase dashboard SQL editor
3. Test endpoint directly: `curl http://localhost:3000/api/products?page=1`
4. Check environment variables are set correctly

### Database Migrations
1. Create SQL file in `migrations/` directory
2. Run in Supabase SQL Editor (project dashboard)
3. Test locally with Supabase CLI if available
4. Document migration in file header comments

## Known Limitations

- Cart persists locally only (no server-side sync for logged-in users)
- No real-time inventory updates (could use Supabase realtime subscriptions)
- Product images from external suppliers (consider CDN migration)
- Limited SEO (could add XML sitemap, enhanced structured data)

## Troubleshooting

### Hydration Mismatch Errors
- Ensure client-specific code uses `useEffect` + `isLoaded` pattern
- Check for `typeof window !== 'undefined'` guards
- Verify no localStorage access during SSR

### Build Failures
- Run `npm run type-check` to catch TypeScript errors
- Check `next.config.js` for syntax errors
- Verify environment variables are set in Vercel

### Database Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check Supabase project status (not paused)
- Test connection: `curl https://xxx.supabase.co/rest/v1/products?limit=1`

### Slow Queries
- Check indexes exist: `SELECT * FROM pg_indexes WHERE tablename = 'products'`
- Use `EXPLAIN ANALYZE` in Supabase SQL editor
- Verify query uses indexed columns (category_id, slug, etc.)

## File Naming Conventions

- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx` (root and nested layouts)
- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Contexts**: PascalCase + "Context" suffix (e.g., `CartContext.tsx`)
- **API Routes**: `route.ts` in directory named after endpoint
- **Scripts**: kebab-case (e.g., `parse-agrodom-complete.py`)
- **Database Files**: SCREAMING_SNAKE_CASE for SQL (e.g., `001_INIT.sql`)

## Important File Locations

### Frontend
- Homepage: `frontend/app/page.tsx`
- Products API: `frontend/app/api/products/route.ts`
- Cart state: `frontend/app/context/CartContext.tsx`
- Navigation: `frontend/app/components/Header.tsx`
- Build config: `frontend/next.config.js`

### Database
- Schema: `docs/supabase-schema.sql`
- Initial migration: `migrations/001_init.sql`
- Security policies: `migrations/002_fix_rls_security.sql`

### Data Processing
- Web scraper: `scripts/parse-agrodom-complete.py`
- Categorization: `scripts/categorize-universal-products.py`
- CSV exports: `parsed_data/agrodom/csv/`

### Documentation
- Project README: `README.md`
- API docs: `docs/API.md`
- Setup guide: `docs/SETUP.md`
