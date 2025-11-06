# Project Setup Guide

## DONGFENG Minitractors E-commerce Platform

Complete guide for setting up and running the project locally or in production.

---

## 📋 Table of Contents

1. [Requirements](#requirements)
2. [Local Development Setup](#local-development-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Requirements

### Software Required

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+ (comes with Node.js)
- **PostgreSQL** 13+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Recommended

- **Visual Studio Code** - Code editor
- **Postman** - API testing tool
- **pgAdmin** - PostgreSQL GUI (optional)
- **Docker** - For containerized development

### System Requirements

- **OS**: Linux, macOS, or Windows (with WSL2)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 2GB minimum

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/dongfeng-minitraktor.git
cd dongfeng-minitraktor
```

### 2. Install Node.js

Download and install from [nodejs.org](https://nodejs.org/). Verify installation:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
```

### 3. Install PostgreSQL

#### On macOS (with Homebrew):
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### On Ubuntu/Debian:
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

#### On Windows:
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 4. Verify PostgreSQL

```bash
psql --version
psql -U postgres  # Should connect to PostgreSQL
```

---

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Create `.env` File

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

FRONTEND_URL=http://localhost:3000

# PostgreSQL Connection
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://postgres:password@localhost:5432/dongfeng_dev

JWT_SECRET=your-super-secret-key-change-in-production
```

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dongfeng_dev;

# Exit
\q
```

Or using command line:
```bash
createdb -U postgres dongfeng_dev
```

### 4. Run Migrations

Migrations create all necessary tables:

```bash
npm run migrate
```

You should see:
```
✅ Connected to PostgreSQL: { now: '2024-01-01T12:00:00.000Z' }
⏳ Applying migration: 001_init
✅ Migration applied: 001_init
⏳ Applying migration: 002_indexes
✅ Migration applied: 002_indexes
✅ All migrations completed
```

### 5. Verify Backend

```bash
npm run dev
```

Should output:
```
✅ Server running!

📡 API URL: http://localhost:5000
🏠 Health check: http://localhost:5000/api/health

Environment: development
CORS enabled for: http://localhost:3000
```

Test health endpoint:
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{"status":"ok","timestamp":"2024-01-01T12:00:00Z","environment":"development"}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Create `.env.local` File

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_YANDEX_ID=YOUR_METRIKA_ID
```

### 3. Verify Frontend

```bash
npm run dev
```

Should output:
```
  ▲ Next.js 16.0.1
  - Local:        http://localhost:3000
  - Environments: .env.local

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Setup

### Create Test User (Admin)

```bash
psql -U postgres -d dongfeng_dev
```

```sql
-- Create admin user
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@example.com', 'hashed_password', 'Admin', 'User', 'admin');
```

### Create Test Category

```sql
INSERT INTO categories (name, slug, description)
VALUES ('Мини-тракторы', 'mini-tractors', 'Компактные тракторы для фермерских хозяйств');
```

### Create Test Product

```sql
INSERT INTO products (name, slug, description, price, image_url, category_id, in_stock, is_new, is_featured, power, drive, transmission)
VALUES (
  'DONGFENG DF-244',
  'df-244',
  'Мини-трактор с кабиной, 4WD, 24 л.с.',
  850000,
  'https://via.placeholder.com/400x300?text=DF-244',
  1,
  true,
  true,
  true,
  24,
  '4WD',
  'manual'
);
```

### View Data

```sql
SELECT * FROM categories;
SELECT * FROM products;
SELECT * FROM users;
\q
```

---

## Running the Application

### Terminal 1 - Backend

```bash
cd backend
npm run dev
# Server running on http://localhost:5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# Next.js running on http://localhost:3000
```

### Terminal 3 - Database (Optional)

Keep PostgreSQL running:

```bash
# macOS
brew services start postgresql@15

# Ubuntu/Debian
sudo service postgresql start

# Windows - PostgreSQL runs as service automatically
```

---

## Testing the Application

### 1. Test Health Check

```bash
curl http://localhost:5000/api/health
```

### 2. Test Products API

```bash
curl http://localhost:5000/api/products
curl http://localhost:5000/api/products?limit=10&page=1
curl http://localhost:5000/api/products/df-244
```

### 3. Test Contact Form

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+79991234567",
    "message": "Интересует модель DF-244"
  }'
```

### 4. Test in Browser

Visit [http://localhost:3000](http://localhost:3000) and test:
- Homepage loads
- Click on products
- Try search functionality
- Submit contact form

---

## Production Deployment

### Deploy to Render.com

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### Step 2: Create Render Service

1. Go to [render.com](https://render.com)
2. Sign up or log in
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Configure:
   - **Name**: `dongfeng-api`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

#### Step 3: Add Environment Variables

In Render dashboard, add:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host/db  # From Render PostgreSQL
JWT_SECRET=your-production-secret-key
FRONTEND_URL=https://yourdomain.com
```

#### Step 4: Create PostgreSQL Database

1. In Render dashboard → "New +" → "PostgreSQL"
2. Name: `dongfeng-db`
3. Copy connection string to `DATABASE_URL`

#### Step 5: Run Migrations

In Render dashboard, use Web Service console:

```bash
npm run migrate
```

### Deploy Frontend to Vercel

#### Step 1: Push to GitHub

```bash
cd frontend
git add .
git commit -m "Frontend setup"
git push origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import GitHub repository
4. Configure:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Step 3: Add Environment Variables

```env
NEXT_PUBLIC_API_URL=https://dongfeng-api.render.com
NEXT_PUBLIC_YANDEX_ID=YOUR_METRIKA_ID
```

#### Step 4: Deploy

Click "Deploy" - Vercel handles everything automatically!

---

## Troubleshooting

### Problem: "Cannot connect to PostgreSQL"

**Solution:**
```bash
# Check if PostgreSQL is running
psql -U postgres

# If not running, start it
brew services start postgresql@15  # macOS
sudo service postgresql start       # Linux

# Check DATABASE_URL in .env
echo $DATABASE_URL
```

### Problem: "Port 5000 already in use"

**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Problem: "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Ensure Node version is correct
node --version  # Should be 18+
```

### Problem: "CORS error" from frontend

**Solution:**
```bash
# Check .env variables
FRONTEND_URL=http://localhost:3000  # Development
FRONTEND_URL=https://yourdomain.com # Production

# Verify backend is running
curl http://localhost:5000/api/health
```

### Problem: "Type errors" in TypeScript

**Solution:**
```bash
# Check TypeScript compilation
npm run type-check

# Fix errors or update types
npm install @types/node
```

### Problem: Migrations fail

**Solution:**
```bash
# Check database connection
psql $DATABASE_URL

# Run migrations again
npm run migrate

# Check migration status
npm run migrate:status

# If stuck, check migrations table
psql $DATABASE_URL -c "SELECT * FROM migrations;"
```

### Problem: "JWT_SECRET not set" error

**Solution:**
```bash
# Generate secure secret
openssl rand -base64 32

# Add to .env
JWT_SECRET=<generated-key>

# Restart backend
npm run dev
```

---

## Development Commands

### Backend

```bash
npm run dev           # Start development server with hot reload
npm run build         # Compile TypeScript to JavaScript
npm start             # Run production build
npm run type-check    # Check TypeScript errors
npm run migrate       # Run database migrations
npm run migrate:status # Show applied migrations
```

### Frontend

```bash
npm run dev           # Start Next.js dev server
npm run build         # Build for production
npm start             # Start production server
npm run lint          # Run ESLint
npm run type-check    # Check TypeScript errors
```

---

## Project Structure

```
dongfeng-minitraktor/
├── frontend/                # Next.js frontend
│   ├── src/
│   │   ├── app/            # Next.js pages and layouts
│   │   ├── components/     # Reusable components
│   │   ├── lib/            # Utilities (API client)
│   │   ├── types/          # TypeScript types
│   │   └── styles/         # CSS files
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── .env.local         # Frontend environment variables
│
├── backend/                 # Fastify backend
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   ├── routes/         # API routes
│   │   ├── database/       # Database code
│   │   ├── types/          # TypeScript types
│   │   └── middleware/     # Middleware
│   ├── package.json
│   ├── tsconfig.json
│   └── .env               # Backend environment variables
│
└── docs/                    # Documentation
    ├── README.md           # Project overview
    ├── API.md              # API documentation
    └── SETUP.md            # This file
```

---

## Next Steps

1. **Add Authentication** - User login/registration
2. **Add Admin Panel** - Manage products, orders, contacts
3. **Add Checkout** - Payment processing
4. **Add Email Notifications** - Order confirmations
5. **Add Analytics** - Track user behavior
6. **Add Search** - Full-text search
7. **Add Reviews** - Product reviews and ratings

---

## Support

### Getting Help

1. **Check Documentation**
   - [Next.js Docs](https://nextjs.org/docs)
   - [Fastify Docs](https://www.fastify.io/)
   - [PostgreSQL Docs](https://www.postgresql.org/docs/)

2. **Review Examples**
   - Check `frontend/src/pages` for page examples
   - Check `backend/src/routes` for API examples

3. **Debug Issues**
   - Check terminal/console output
   - Use browser DevTools (F12)
   - Check server logs: `npm run dev` output

4. **Report Issues**
   - Create GitHub issue
   - Include error message and steps to reproduce

---

## Useful Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Fastify Framework](https://www.fastify.io/)
- [PostgreSQL Tutorials](https://www.postgresql.org/docs/current/index.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [REST API Design](https://restfulapi.net/)

---

**Last Updated:** January 2024
**Maintainers:** Your Team
**License:** MIT
