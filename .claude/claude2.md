# Project rules
- AI Hub - a web application for automatic news collection with subsequent rewriting and publishing on the website, as well as in Telegram bot and Telegram channel.
- Main mechanism - a processing pipeline with 5 stages (parsing, sorting, AI rewrite, quality assessment, publishing), some stages have sub-stages.
- All processing except the parsing stage is done using AI, connected to the project AI Providers (OpenRouter, Qwen, Grok, Kilo Code). Currently working only with OpenRouter.

## Task Execution Order

### 1. Analysis Phase
- Study the current implementation and documentation
- Ask clarifying questions to understand:
  - Project-specific features and constraints
  - Potential impact on other system components
  - Edge cases and dependencies

### 2. Implementation Phase
- Write new or edit existing code
- After each file edit, run the linter to check for errors
- Fix any linter errors immediately before proceeding

### 3. Quality Assurance Phase
**IMPORTANT: Subagents must be launched strictly sequentially. The next subagent is only started after receiving a complete report from the previous one.**

- Run the `code-reviewer` agent to ensure code quality
  - Wait for completion and report delivery
- Run the `test-engineer` agent to verify functionality
  - Wait for completion and report delivery
- Run the `docs-updater` agent to keep documentation synchronized
  - Wait for completion and report delivery

### 4. Final Verification
- Perform final linter check across all modified files
- Fix any remaining errors immediately

## Code Search
- **Hybrid Search**: Use `mcp__claude-context__search_code` tool to search code across the entire codebase
  - **Search methods**: Combines BM25 (keyword matching) + Dense Vector (semantic understanding) for optimal results
  - **Natural language**: "Find authentication logic", "Where is RSS parsing implemented", "Show AI processing pipeline"
  - **Exact keywords**: `TelegramAuthService`, `processArticleStage`, `handleCallback`
  - **Mixed queries**: "функция для retry механизма в AI processing", "JWT token generation in auth"
  - **Multilingual**: Works with both Russian and English queries
  - **Filtering**: Use `extensionFilter` parameter to search only specific file types (e.g., `['.ts', '.js']`)
- **Auto-sync**: Index automatically updates when files change (Merkle tree-based incremental indexing)
- **Parameters**: `path` (absolute), `query` (any format), `limit` (default 10, max 50), `extensionFilter` (optional)
- **⛔ CRITICALLY FORBIDDEN**: NEVER use `mcp__claude-context__clear_index` command - clearing the index takes hours to rebuild. Indexing continues automatically in background.

## Project rules
- User authorization is done through Telegram.
- Production version is located at https://aihubnews.ru/ in the /opt/aihub folder
- Test admin for frontend and backend login `test@example.com` password `12345678`
- There is a page for test authorization of regular users without Telegram /dev
- Do not create any credentials, administrators and users without my permission
- We store and update documents strictly in the `docs/` folder
- Every time you create new code, or fix broken code, refer to MCP Context7 to get best practices and examples of ready-made code

### Technology Stack:
- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, PM2
- **Database**: PostgreSQL
- **Queues**: Redis + Bull/BullMQ
- **Integrations**: Telegram Bot API, RSS/Web parsing

### 📋 Main Documents:
- `docs/project_architecture.md` - **Project Architecture** (actual implemented architecture of all components)
  - **UPDATED 2025-10-31**: Dual authentication system details (Admin + User), Bearer tokens in development

### 🗄️ Technical Documentation:
- `docs/database_schema.md` - **Database Schema** (PostgreSQL structure with models, indexes and retry system)
- `docs/api_endpoints.md` - **API Documentation** (REST endpoints, centralized API client, monitoring and retry statistics)
  - **UPDATED 2025-10-31**: Complete admin authentication endpoints (/login, /me, /refresh, /logout) with error codes and cookie configuration
- `docs/ai_architecture.md` - **AI Architecture** (content processing system through AI with smart retry)
- `docs/search_system.md` - **Search System** (description of algorithms and technologies for news search)
- `docs/logging_system.md` - **Logging System** (categorized logs, performance monitoring)
- `docs/socks_proxy_integration.md` - **SOCKS Proxy Integration** (bypassing regional restrictions of AI providers)
- `docs/seo_optimization.md` - **SEO Optimization** (structured data JSON-LD, Open Graph, sitemap, robots.txt configuration)
- `docs/security_authentication.md` - **Security & Authentication** (dual admin/user JWT system, httpOnly cookies, CSRF, rate limiting, headers)
  - **UPDATED 2025-10-31**: Dual authentication architecture with environment-specific strategies (production vs development), token lifecycle, frontend integration details

### 📱 Additional Documentation:
- `docs/todo.md` - **Current Tasks** (list of actual tasks and priorities)

## 📱 Logging:
  - Production (Docker): /app/logs/ inside container
  - Development: /home/nyx/projects/aihub/logs/

## Testing
- Main tool: Playwright for all E2E tests
- If you create any test or temporary files, delete them after completing checks
- When creating any new code, always create tests for it
- Do not add excessive logging to the code, only what is really needed for debugging or tracking the application state

## Working with Documentation
- We store documents strictly in the `docs/` folder
- Do not create any new documentation after completing tasks unless I explicitly ask for it in the request
- Documentation is written only for the AI Agent, we write briefly and only the data needed for the AI agent.
- **CRITICALLY IMPORTANT**: After any changes in the API or project logic, always update the documentation, and important note that you don't need to write about improvements or fixes, you need to make changes to existing documentation sections about how the project currently works
- **CRITICALLY IMPORTANT**: After completing any task, check if there is a need to update the API or project architecture documentation
- **AUTOMATIC CHECK**: In each response, forcibly check the relevance of all documentation in the `/docs/` folder
- **MANDATORY AGENT RUN**: After completing any development task, ALWAYS run the docs-updater agent through the Task tool to check documentation
- Additionally, briefly describe at the beginning of each file referring to the necessary methods and functions, to clearly know on which lines which method or function is located, to quickly access them without reading the entire file and don't forget about the general recommended file length limit in lines (up to 500 lines), in case of file updates, also update the documentation built into them.

## Development Commands

### 🎯 AUTOMATIC START (recommended):
```bash
# Full project start with one command
./start.sh

# Stop all services (Docker remains)
./stop.sh

# Stop all services including Docker
./stop.sh --docker

# Help for stop.sh
./stop.sh --help
```

### 🔍 Health Checks:
- **Backend**: http://localhost:3001/health
- **Frontend**: http://localhost:3000
- **Admin panel**: http://localhost:3000/admin
- **MeiliSearch**: http://localhost:7700/health
- **PostgreSQL**: `PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d aihub -c "SELECT 1;"`
- **Redis**: `docker exec redis-aihub redis-cli ping`
