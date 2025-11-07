# Core Rules
- Responses in Russian
- Environment: Windows + WSL Ubuntu
- Web search: use data relevant for 2025

# AI-Optimized Architecture
- TDD: tests → code → run → fix → repeat
- Modularity: related functionality in one folder
- Limit: max 500 lines per file (split if exceeded)
- Context localization: everything related in one place
- Explicit dependencies: no hidden connections
- Isolated testing: tests next to code

## Anti-patterns for AI
- Global state
- Implicit dependencies
- Deep nesting (>3 levels)
- Hidden logic in middleware/decorators
- Complex patterns (Observer, Strategy)

## Forbidden
- !!!!No fallbacks strict policy!!!: do not invent default values to mask missing data.
- !!no try catch except on asynchronous requests!!!
- No silent except: catch only expected exceptions, log with context, then re-raise.
- No chained defaults in business logic: a or b or c only for UI labels; never for required config/data.
- No hidden retries: allowed only if explicitly requested, idempotent, transient errors, bounded attempts, logged.
- Fail fast: on invalid input or state — raise; do not continue with partial results.
- Observability: include structured logging on failure; do not downgrade severity (no silent warning where error is due).

# Project Integrity
## When changing structure
- Update navigation (menu, header, footer, breadcrumbs)
- Sync routing in all related files
- Remove outdated types, routes, props
- Analyze code for unused elements after each change

## UI Unification
- Reuse existing components (toast, WYSIWYG, pagination, modals)
- Extract navigation elements into components (no duplication)

# Development
## Code Documentation
- JSDoc at file start with methods list and line numbers
- Comments for complex algorithms and non-obvious logic

## Library Versions
- Use Context7 MCP for up-to-date documentation
- Install only latest stable versions

## Security
- Check authorization when adding new pages
- Instructions for external integrations (OAuth, API keys)

## Constants
- Named constants instead of magic numbers
- Store at file start or separate module

# Testing

## TDD Workflow
- Create `tests` subfolder next to module

## Playwright (E2E)
- Headless mode + screenshots on completion
- Test: interactive elements + DB changes
- Analyze screenshots even on successful tests

## Jest (Unit)
- Test components: render, props, actions
- Test hooks: states and side effects

## Mocks
- For all external APIs and services
- Test all scenarios: success, errors, timeouts, retry
- Store mocks in separate folder

## Database
- Test migrations (table/column creation)
- Verify security policies and access rights
- Priority: local DB
