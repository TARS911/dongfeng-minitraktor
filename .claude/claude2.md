# DongFeng Mini-Tractor E-Commerce Project

## Project Overview
- **Name**: DongFeng Mini-Tractor Shop
- **Type**: E-commerce website for mini-tractors and spare parts
- **Target**: Russian market (Belarus, Kazakhstan)
- **Brands**: DongFeng, Foton, Jinma, Xingtai, Universal parts
- **Production**: https://frontend-e3j8bav75-iskanders-projects-7d563bb7.vercel.app

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Analytics**: Vercel Speed Insights
- **Mode**: Dynamic SSR (standalone output)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **API**: Supabase REST API + Server Actions

### Data Sources
- **Parsed data**: `parsed_data/` folder
  - `zip-agro/` - primary source (2,323 products)
  - `tata-agro/` - secondary source (1,932 products)
  - `agrodom/` - additional source
- **Total products**: 10,952 in database

## Project Structure

```
/home/ibm/dongfeng-minitraktor/
├── frontend/              # Next.js application
│   ├── app/              # App Router pages
│   │   ├── catalog/      # Product catalog
│   │   │   ├── parts/    # Spare parts categories
│   │   │   └── [brand]/  # Brand-specific pages
│   │   ├── about/        # About pages
│   │   ├── delivery/     # Delivery info
│   │   └── contacts/     # Contact page
│   ├── components/       # React components
│   ├── lib/             # Utilities and Supabase client
│   └── public/          # Static assets
├── scripts/             # Python data management scripts
│   ├── import-*.py      # Import scripts for products
│   ├── check-watermarks.py  # Image watermark detection
│   ├── cleanup-and-normalize.py  # Database cleanup
│   ├── optimize-database.py  # Full optimization workflow
│   ├── supabase-tools.py  # CLI for database queries
│   └── create-indexes.sql  # Performance indexes
├── parsed_data/         # Source data (JSON files)
└── .claude/             # Claude Code configuration
```

## Database Schema (Supabase)

### Main Tables
- **products** - All products (tractors + parts)
  - `id` (uuid, primary key)
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Product description
  - `price` (numeric) - Price in rubles
  - `manufacturer` (text) - Brand (DONGFENG, FOTON, JINMA, XINGTAI, UNIVERSAL)
  - `category_id` (int) - Foreign key to categories
  - `image_url` (text) - Product image URL
  - `in_stock` (boolean) - Availability
  - `specifications` (jsonb) - Technical specs including:
    - `part_type` - Type of part (filters, engines, pumps, etc.)
    - `has_watermark` - Flag for images with watermarks
    - `watermark_source` - Detection method
  - `created_at`, `updated_at` (timestamps)

- **categories** - Product categories (28 total)
  - Standard hierarchy for spare parts

### Key Constraints
- **Unique slug**: Each product must have unique slug
- **RLS enabled**: Row-Level Security policies active
- **Service Role Key**: Required for bulk operations

## Environment Variables

### Required (.env.local)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For scripts only!

# Vercel (auto-configured in deployment)
VERCEL_PROJECT_ID=your-project-id
VERCEL_ORG_ID=your-org-id
```

## Development Workflow

### 1. Data Import
```bash
# Import brand-specific products
python3 scripts/import-all-brands.py

# Import remaining universal parts
python3 scripts/import-all-remaining.py

# Full database optimization
python3 scripts/optimize-database.py
```

### 2. Database Management
```bash
# Interactive cleanup tool
python3 scripts/cleanup-and-normalize.py

# CLI for filtering/searching
python3 scripts/supabase-tools.py

# Check for watermarked images
python3 scripts/check-watermarks.py

# Generate statistics
python3 scripts/db-stats-and-indexes.py
```

### 3. Frontend Development
```bash
cd frontend
npm install
npm run dev          # Development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
```

### 4. Deployment
```bash
cd frontend
vercel --prod --yes  # Deploy to Vercel production
```

## Database Statistics (Current)

- **Total products**: 10,952
- **With images**: 10,903 (99.6%)
- **Without images**: 49 (mostly Rustrak brand)
- **Need watermark check**: 4,255 (from zip-agro.ru, tata-agro-moto.com)

### By Brand
- UNIVERSAL: 6,097 (55.7%)
- XINGTAI: 1,190 (10.9%)
- JINMA: 1,122 (10.2%)
- DONGFENG: 1,081 (9.9%)
- FOTON: 777 (7.1%)
- Other: 685 (6.3%)

### Known Issues
- **10,155 products** in generic category (ID=2) - needs redistribution
- **2,231 duplicate products** detected - pending removal
- **SQL indexes** not yet applied - needs manual execution

## Data Management Tools

### Import Scripts
- `import-dongfeng.py` - DongFeng products only
- `import-all-brands.py` - Foton, Jinma, Xingtai
- `import-all-remaining.py` - Universal parts and remaining data
- Auto-generates unique slugs with counters
- Detects brands from product names
- Batch processing (100 items per batch)

### Optimization Tools
- `cleanup-and-normalize.py` - Interactive menu:
  1. Find duplicates
  2. Remove duplicates (keeps cheapest)
  3. Normalize brand names
  4. Detect part types
- `optimize-database.py` - One-click full optimization
- `check-watermarks.py` - Watermark detection and marking

### Query Tools
- `supabase-tools.py` - CLI for:
  - Filter by brand
  - Filter by part_type
  - Search by name
  - Price range filter
  - Export to JSON
  - Brand statistics

### Performance
- `create-indexes.sql` - Production indexes:
  - Single-column indexes (manufacturer, in_stock, price, category_id)
  - Composite indexes (manufacturer + in_stock)
  - Full-text search (Russian language)
  - Materialized view for catalog

## Important Rules

### Data Integrity
- **Always use SERVICE_ROLE_KEY** for bulk operations (bypasses RLS)
- **Never use ANON_KEY** for imports - will fail with 42501 error
- **Generate unique slugs** - use counter system for duplicates
- **Validate before import** - check for existing products by name

### Code Style (Python Scripts)
- Use `supabase-py` library (not Node.js client)
- Load env from `frontend/.env.local`
- Batch processing for large operations
- Print progress every 100 items
- Use descriptive variable names
- Add comments for complex logic

### Frontend Rules
- **No hardcoded data** - fetch from Supabase
- **Server Components by default** - use 'use client' only when needed
- **Error boundaries** - handle loading and error states
- **Responsive design** - mobile-first approach
- **Russian language** - all content in Russian
- **SEO optimized** - metadata, Open Graph, structured data

### Database Operations
- **Never clear RLS policies** - use SERVICE_ROLE_KEY instead
- **Test in development first** - avoid production mistakes
- **Backup before bulk changes** - Supabase auto-backup enabled
- **Check constraints** - respect unique slugs and foreign keys

## Pending Tasks

### High Priority
1. **Wait for category structure** - User will provide mindmap (miro/tangent)
2. **Redistribute products** - Move 10,155 items from generic category
3. **Apply SQL indexes** - Execute create-indexes.sql in Supabase Dashboard
4. **Remove duplicates** - Confirm with user, then run cleanup script

### Medium Priority
1. **Replace watermarked images** - 4,255 products need verification
2. **Add missing images** - 49 products (Rustrak brand)
3. **Improve part type detection** - More keywords for classification
4. **Category tree UI** - Frontend component for browsing

### Low Priority
1. **Admin panel** - Product management interface
2. **Search functionality** - Full-text search implementation
3. **Filters** - Price range, brand, availability
4. **Cart & checkout** - E-commerce functionality

## Documentation Files

- `DATABASE_OPTIMIZATION.md` - Database management guide
- `WATERMARKS_CHECK.md` - Image watermark detection guide
- `.claude/claude.md` - Core development rules
- `.claude/agents.md` - AI agent guidelines
- `.claude/claude2.md` - This file (project-specific rules)

## Git Workflow

### Branch Strategy
- `main` - production branch (auto-deploys to Vercel)
- No feature branches currently (direct commits to main)

### Commit Message Format
```
🎯 Short description

- Detailed changes
- Impact on system
- Related files

Stats: (if applicable)
- Metrics and numbers

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Common Emoji Prefixes
- 🎯 Feature/Enhancement
- 🔧 Configuration/Tools
- 🐛 Bug fix
- 📚 Documentation
- 🔍 Search/Detection
- 💾 Data/Database
- 🚀 Deployment
- ⚡ Performance

## Useful Commands Reference

### Supabase CLI (if installed)
```bash
supabase login
supabase db dump > backup.sql
supabase db reset --linked
```

### Database Queries (psql or Supabase Dashboard)
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

### Python Virtual Environment (if needed)
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

## Contact & Support

- **Developer**: IBM (user)
- **AI Assistant**: Claude Code
- **Repository**: TARS911/dongfeng-minitraktor (GitHub)
- **Deployment**: Vercel (automatic from main branch)

## Notes

- **Environment**: Windows + WSL Ubuntu
- **Responses**: Always in Russian
- **No fallbacks**: Fail fast on errors (see claude.md)
- **No silent errors**: Log everything, re-raise exceptions
- **Modularity**: Max 500 lines per file
- **Test-driven**: Write tests when adding features