## Brief — what this repo is

Monorepo-style Next.js frontend that contains both UI and backend (Next API routes) and uses Supabase (Postgres) as the canonical datastore. Key paths: `frontend/app/` (app routes + `app/api/*` endpoints), `docs/supabase-schema.sql` for DB schema/migrations.

## Immediate developer workflows (how to run & test locally)
- Start dev: cd frontend && npm install && npm run dev (Next runs on :3000).
- Typecheck: `npm run type-check` (tsc --noEmit).
- Unit tests: `npm run test` (Jest). E2E tests: `npm run test:e2e` (Playwright).
- DB setup: this repo uses Supabase. Create a Supabase project, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` (see `.env.local.example`), then paste SQL from `docs/supabase-schema.sql` into Supabase SQL editor to create tables + policies.

## Architecture & conventions AI agents need to know
- Single Next.js (app/) project — frontend pages/components + API routes live together. Use `app/api/<name>/route.ts` files for server endpoints (example: `app/api/products/route.ts`).
- Database communication uses `@supabase/supabase-js` client — look at `app/lib/*` for `supabase` client and helpers.
- Input validation and security helpers are in `app/lib/validation.ts` — call these for sanitization and strict validation (validateId, validateSlug, validateEmail, sanitizeString).
- UI state is managed with React contexts under `app/context/` (AuthContext, CartContext, FavoritesContext, CompareContext). Reuse these where appropriate.

## Error handling & coding patterns found here
- Prefer fail-fast input validation. Avoid inventing default values to mask missing data (this repo expects explicit failures on invalid input).
- Do not swallow errors silently. Log context and re-raise or return explicit error responses (see `app/api/*/route.ts`).
- Keep server logic shallow in API routes; shared logic and DB calls live in `app/lib/`.

## Files to reference when making changes
- API examples: `frontend/app/api/products/route.ts`, `frontend/app/api/categories/route.ts`.
- Validation & helpers: `frontend/app/lib/validation.ts`, `frontend/app/lib/supabase.ts`.
- DB schema: `docs/supabase-schema.sql` (use for migrations / local DB setup).
- Tests: `frontend/__tests__` and Playwright config at `frontend/playwright.config.ts`.

## Agent behaviour rules specific to this repo
- Use Russian for user-facing text and PR descriptions (code comments may remain English as present).
- Before making code changes: find existing components/helpers under `app/` and reuse them — avoid creating duplicate UI or validation logic.
- When modifying routes or data shapes, update any relevant pages, API routes, types and tests together (search `slug`, `price`, `specifications` fields across `app/`).

## Where to look next
- `README.md` and `QUICK_START.md` at project root — practical step-by-step setup.
- `docs/agents copy.md` and `docs/claude copy.md` — project-specific agent rules already collected; follow them where they apply.

If anything here is unclear or you'd like the instructions rewritten in English instead of Russian, tell me which parts to expand and I'll iterate. ✅
