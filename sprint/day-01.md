# Day 1: Foundation, SQLite Database & Songbook Ingestion Engine
**Sprint:** 7-Day PinoyVideoke Implementation  
**Phase:** Phase 1 – Core Backend & Database Setup  
**Focus:** Project Scaffolding, SQLite Architecture, Knex Migrations, REST API & Git Hygiene  
**Referenced Skills:** `backend-architect`, `database-optimizer`, `setup-pre-commit`, `andrej-karpathy-skill`, `tdd`

---

## 1. Day 1 Objectives & Architectural Goal
The primary objective of Day 1 is to build the bedrock of the entire application:
1. Establish a clean, maintainable monorepo workspace for **Node.js (Backend)** and **React (Frontend)**.
2. Setup Git safety rails, Husky pre-commit hooks, and a clean GitHub workflow.
3. Design and migrate the relational database schema using SQLite and Knex.
4. Populate the database with classic Filipino Videoke (OPM) tracks and English staples.
5. Build and verify high-performance REST API endpoints for 5-digit song code resolution and fuzzy search.

---

## 2. In-Depth Learning Module: Node.js & React Concepts

### 2.1 Node.js Deep Dive: The Express Middleware Pipeline & Async Handlers
In Node.js, Express operates as a pipeline of functions called **middleware**. Every incoming HTTP request flows sequentially through this chain:
```
Request ──► [cors()] ──► [express.json()] ──► [Route Handler] ──► Response
                                                     │
                                             (Throws Error)
                                                     ▼
                                          [Global Error Middleware]
```
- **Why this matters for PinoyVideoke:** 
  In a videoke machine, song lookups must execute in under 30ms. We configure `express.json()` with reasonable payload limits, enable `cors` specifically for our local network, and avoid blocking the Node.js single-threaded event loop by keeping database operations strictly asynchronous.
- **Async/Await & Unhandled Rejections:**
  In Express 4, unhandled promise rejections inside async route handlers can cause the process to hang or crash if not caught. We implement an `asyncHandler` wrapper:
  ```typescript
  export const asyncHandler = (fn: Function) => 
    (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  ```

### 2.2 Database Architecture: SQLite & Indexing Strategies (Skill: `database-optimizer`)
We choose **SQLite** because it is zero-config, embedded, and lightning fast for local party setups (stored as a single file, e.g., `pinoyvideoke.sqlite3`).
- **The B-Tree Index on 5-Digit Codes:**
  Filipino videoke depends on rapid 5-digit number entry (e.g. typing `04521` on a remote).
  Without an index, querying `SELECT * FROM songs WHERE code = '04521'` requires a **Full Table Scan** ($O(N)$). By placing a unique B-Tree index on `code`, queries resolve in $O(\log N)$ time, typically $<2\text{ms}$.
- **Fuzzy Search Indexing:**
  Users searching "Huling El Bimbo" or "Eraserheads" will query `title` and `artist`. We write Knex queries utilizing SQL `LIKE` with wildcards (`%query%`) and lowercase normalization.

### 2.3 React & Vite Scaffolding Deep Dive (Skill: `frontend-developer`)
- **Why Vite instead of Create React App?**
  Vite leverages native ES Modules (ESM) in modern browsers during development. It starts instantly and reloads hot modules (HMR) in milliseconds, which is critical when we start tuning lyric animations and audio pitch canvas on Days 4 and 5.
- **Client/Server Monorepo Organization:**
  ```
  Karaoke/
  ├── package.json           # Root workspace script runner
  ├── .husky/                # Git commit hooks (Husky v9)
  ├── .lintstagedrc          # Auto-formatting on staged files
  ├── server/                # Node.js + Express + Knex + Socket.io
  │   ├── src/
  │   │   ├── db/            # Knex config, migrations, seeds
  │   │   ├── routes/        # /api/songs, /api/lyrics
  │   │   ├── index.ts       # Server entry point
  │   └── tsconfig.json
  └── client/                # React 18 + Vite + Tailwind CSS
      ├── src/
      │   ├── api/           # Typed API fetchers
      │   ├── App.tsx
      └── vite.config.ts
  ```

---

## 3. Step-by-Step Implementation Tasks

### Task 1: Initialize Git Guardrails & Pre-commit Hooks (Skill: `setup-pre-commit`)
1. Create `.gitignore` to prevent committing `node_modules`, `.env`, SQLite database files, and build outputs.
2. Configure Prettier:
   ```json
   // .prettierrc
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5"
   }
   ```
3. Initialize Husky and `lint-staged`:
   ```bash
   npm install -D husky lint-staged prettier
   npx husky init
   ```
4. Create `.husky/pre-commit`:
   ```bash
   npx lint-staged
   npm run typecheck --workspaces --if-present
   ```

### Task 2: Backend Scaffolding & Database Migrations (Skill: `backend-architect`)
1. Initialize `/server`:
   ```bash
   cd server
   npm init -y
   npm install express cors dotenv knex sqlite3
   npm install -D typescript tsx @types/express @types/cors @types/node
   ```
2. Configure `knexfile.ts`:
   ```typescript
   import type { Knex } from 'knex';
   import path from 'path';

   const config: Knex.Config = {
     client: 'sqlite3',
     connection: {
       filename: path.resolve(__dirname, 'data/videoke.sqlite3')
     },
     useNullAsDefault: true,
     migrations: {
       directory: path.resolve(__dirname, 'src/db/migrations')
     },
     seeds: {
       directory: path.resolve(__dirname, 'src/db/seeds')
     }
   };

   export default config;
   ```
3. Create migration `20261001_create_songs_and_queue.ts`:
   - `songs`: `id`, `code` (string, unique index), `title`, `artist`, `language`, `youtube_id`, `lrc_content`, `key_offset`, `duration`.
   - `queue_items`: `id` (uuid), `room_code`, `song_id`, `singer_name`, `position`, `status`.

### Task 3: Seed Classic OPM & English Videoke Hits
Create `src/db/seeds/01_songs.ts` with authentic Filipino karaoke favorites:
- `01001` - "Anak" by Freddie Aguilar (`youtubeId: "n4RjJKxrfSg"`)
- `01002` - "Ang Huling El Bimbo" by Eraserheads (`youtubeId: "WjK3rL4-s_4"`)
- `01003` - "Tala" by Sarah Geronimo (`youtubeId: "kF5A11eC4y0"`)
- `01004` - "Bakit Pa" by Jessa Zaragoza (`youtubeId: "5_zPzE4nQwQ"`)
- `01005` - "My Way" by Frank Sinatra (`youtubeId: "qQzdAsjWGPg"`)
- `01006` - "Harana" by Parokya ni Edgar (`youtubeId: "5q-Xb3t54hI"`)
- Include synchronized LRC strings for test tracks.

### Task 4: Song REST API Endpoints
Implement:
- `GET /api/songs?search=...&lang=...`: Returns matching tracks with pagination.
- `GET /api/songs/code/:code`: Returns song payload by exact 5-digit code or 404 if not found.
- `GET /api/lyrics/sync?songId=...`: Returns LRC string for lyric synchronization.

---

## 4. Git Version Control & GitHub Workflow

### Branch Strategy
Create and checkout a dedicated feature branch:
```bash
git checkout -b feat/day-1-foundation-songbook
```

### Atomic Commit Plan (Conventional Commits)
Follow this commit sequence to ensure clean history:
1. `chore: initialize monorepo workspace, tsconfig, and gitignore`
2. `chore: setup husky pre-commit hooks, prettier, and lint-staged`
3. `feat(server): setup knex with sqlite3 and create songs and queue migrations`
4. `feat(server): add seed data for iconic OPM and English videoke hits`
5. `feat(server): implement /api/songs and /api/songs/code/:code endpoints`
6. `test(server): add integration tests for 5-digit song code resolution`

### Pre-commit Verification
Before committing:
```bash
npx lint-staged
npm run typecheck
```

---

## 5. Karpathy Verification & Definition of Done (DoD)

Apply the **Four Checks** (`andrej-karpathy-skill`):
1. **Assumption:** SQLite handles local single-file concurrency adequately for home party workloads.
2. **Changed:** Backend foundation, database migrations, seed data, and REST endpoints.
3. **Verified:**
   - [ ] Run `npx knex migrate:latest` -> Migrations execute without error.
   - [ ] Run `npx knex seed:run` -> 30+ tracks seeded into SQLite.
   - [ ] Test via curl or browser:
     ```bash
     curl http://localhost:5000/api/songs/code/01001
     ```
     Returns `"Anak"` by `"Freddie Aguilar"`.
   - [ ] Test fuzzy search:
     ```bash
     curl http://localhost:5000/api/songs?search=Bimbo
     ```
     Returns `"Ang Huling El Bimbo"`.
4. **Remaining Risk:** YouTube video IDs must be active and embeddable (we will validate embedding on Day 4).
