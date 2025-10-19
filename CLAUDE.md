# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack e-commerce website for selling DONGFENG minitractors, built with Fastify backend (Node.js), SQLite database, and vanilla JavaScript frontend. Optimized for Russian/CIS market with SEO-focused design.

## Key Technologies

- **Backend**: Fastify (ES modules), better-sqlite3
- **Database**: SQLite with JSON fields for specifications
- **Frontend**: Vanilla JS, CSS variables, component-based architecture
- **Deployment**: Render.com (Blueprint via render.yaml), Railway, or VPS

## Common Commands

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Initialize database (creates tables)
npm run init-db

# Seed database with test data (11 tractors)
npm run seed-db

# Start production server (port 3000)
npm start

# Development mode with hot reload
npm run dev

# Run tests
npm test
```

### Testing API Endpoints

```bash
# Health check
curl http://localhost:3000/api/health

# Get all products
curl http://localhost:3000/api/products

# Search products
curl "http://localhost:3000/api/products?search=dongfeng&in_stock=true"

# Get single product by slug
curl http://localhost:3000/api/products/df-244-s-kabinoy

# Get categories
curl http://localhost:3000/api/categories

# Submit contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Тест","phone":"+79991234567","message":"Тестовая заявка"}'
```

### Deployment

```bash
# Deploy to Render (auto-deploys from GitHub main branch)
# Uses render.yaml blueprint - no manual commands needed

# Deploy to Railway
railway init
railway up

# VPS deployment with PM2
pm2 start backend/server.js --name dongfeng-api
pm2 save
```

## Architecture Overview

### Backend Structure

- **server.js**: Main Fastify server with CORS, static file serving, error handling, and graceful shutdown
- **routes/**: API endpoints organized by domain
  - `products.js`: Product listing with filtering, sorting, pagination; single product fetch; categories
  - `forms.js`: Contact form and delivery calculator submissions
  - `orders.js`: Shopping cart order creation and retrieval
  - `admin.js`: Admin endpoints (e.g., database rebuild)
- **database/**: SQLite database management
  - `init.js`: Creates tables (categories, products, contacts, delivery_requests, orders, order_items)
  - `seed.js`: Seeds 11 tractors (3 categories) with Cloudinary-hosted images
  - `dongfeng.db`: SQLite database file (auto-created)
- **config/database.js**: better-sqlite3 connection setup

### Frontend Structure

- **index.html**: Main SPA with Schema.org microdata, Open Graph tags, Yandex.Metrika integration
- **css/**: Modular CSS with component-based design
  - `variables.css`: CSS custom properties (colors, spacing, breakpoints)
  - `reset.css`: Browser normalization
  - `components.css`: Reusable UI components (buttons, cards, forms)
  - `main.css`: Layout and page-specific styles
  - `catalog-filters.css`: Product filtering UI
  - `header-new.css`, `catalog-modals.css`, `modal.css`, `cart.css`: Feature-specific styles
- **js/**: Frontend logic
  - `app.js`: Main application logic, API integration, form handling
  - `catalog.js`: Product catalog rendering, filtering, modals
  - `catalog-filters.js`: Filter state management and UI
  - `cart.js`: Shopping cart functionality
- **cart.html**: Shopping cart page

### Database Schema

**products**: 11 columns including `slug` (unique), `price`, `power`, `drive`, `transmission`, `in_stock`, `is_hit`, `is_new`, `image_url`, `specifications` (JSON)

**categories**: `name`, `slug`, `description`

**contacts**: Contact form submissions with `status` field

**delivery_requests**: Delivery calculation requests

**orders** & **order_items**: Shopping cart orders with items

Indexes on: `products.slug`, `products.category_id`, `products.in_stock`, `categories.slug`

## Important Patterns

### API Response Format

All API endpoints return JSON with `success` field:
```javascript
{ success: true, data: {...}, pagination: {...} }  // Success
{ success: false, error: "Error message" }          // Error
```

### Product Specifications

Products store detailed specs in JSON format in the `specifications` column:
```javascript
{
  engine: { type, cylinders, displacement, cooling, start },
  transmission: { type, gears, clutch },
  hydraulics: { lift_capacity, connections },
  cabin: { heating, ventilation, windows },  // Optional
  dimensions: { length, width, height, clearance }
}
```

### Image Hosting

Product images are hosted on Cloudinary CDN. URLs follow pattern:
```
https://res.cloudinary.com/drenz1aia/image/upload/v1760698080/dongfeng-minitraktor/{filename}.jpg
```

Scripts `upload-to-cloudinary.js` and `upload-to-imgbb.js` can upload images to CDN.

### Frontend-Backend Integration

- Backend serves frontend static files from `../frontend` directory
- API endpoints prefixed with `/api/`
- SPA routing: non-API 404s return `index.html`
- CORS configured for development (`FRONTEND_URL` env var)

### Environment Variables

Backend `.env` file:
```
PORT=3000
HOST=0.0.0.0
DB_PATH=./database/dongfeng.db
FRONTEND_URL=http://localhost:8000
NODE_ENV=development
```

On Render, `DB_PATH` should point to persistent disk: `/opt/render/project/src/backend/database/dongfeng.db`

## Development Workflow

1. **Database Changes**: Modify `database/init.js` for schema changes, `database/seed.js` for test data, then run `npm run init-db && npm run seed-db`

2. **Adding Products**: Edit `database/seed.js` products array, ensure Cloudinary image URLs are valid, re-seed database

3. **API Changes**: Edit route files in `routes/`, Fastify validates requests via schema definitions

4. **Frontend Changes**: Edit HTML/CSS/JS directly in `frontend/`, server auto-serves static files

5. **Testing**: Start backend with `npm start` or `npm run dev`, test API with curl/Postman, open `http://localhost:3000` in browser

6. **Deployment**: Push to GitHub main branch → Render auto-deploys via render.yaml blueprint

## Deployment Notes

- **render.yaml** defines Web Service with build command that initializes DB and persistent disk for SQLite
- **GitHub Actions** (`.github/workflows/deploy.yml`) runs tests and triggers Render deploy
- Backend runs on port 10000 on Render (free tier)
- Database persists on Render disk mounted at `/opt/render/project/src/backend/database`
- Live site: https://dongfeng-minitraktor.onrender.com

## SEO Configuration

- Russian-language meta tags and descriptions
- Schema.org Product markup for tractors
- Open Graph tags for VK/Telegram/Odnoklassniki
- Yandex.Metrika integration (ID: `YOUR_METRIKA_ID` - needs replacement)
- Geo-targeting for Russia (`content="ru_RU"`)
- Sitemap.xml and robots.txt configured

## Key Files Reference

- `backend/server.js:48-54` - Health check endpoint
- `backend/routes/products.js:6-150` - Product filtering/search logic
- `backend/database/seed.js:34-570` - Product data definitions
- `frontend/js/app.js` - Main frontend application logic
- `frontend/css/variables.css` - Design tokens (colors: `--brand-primary: #2a9d4e`, `--brand-accent: #ff5b1a`)
- `render.yaml` - Render.com deployment blueprint
- `DEPLOY.md` - Comprehensive deployment guide for all platforms
