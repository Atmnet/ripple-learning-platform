# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ripple Learning Platform (学员日常管理平台) - A student daily management platform with daily reports, assignment management, and document sharing.

**Tech Stack:**
- Frontend: Vue 3.5+ + TypeScript 5.9+ + Vite 7.3+ + Element Plus 2.3+ + Pinia 2.1+
- Backend: Node.js 18+ + Express 4.18+ + TypeScript 5.3+ + MySQL 8.0
- File Storage: Baidu Cloud BOS (百度云对象存储) with local fallback
- Auth: JWT-based with role-based access (admin/student)

## Common Commands

### Development

```bash
# Start backend (http://localhost:3001)
cd backend && npm run dev

# Start frontend (http://localhost:5173)
cd frontend && npm run dev

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

### Docker Deployment

```bash
cd docker
docker-compose up -d
```

### Deployment to Remote Server (106.12.76.61)

```bash
# Build first
npm run build --prefix backend
npm run build --prefix frontend

# Deploy (via rsync or scp)
rsync -av --delete frontend/dist/ user@106.12.76.61:/path/to/public/
rsync -av backend/dist/ user@106.12.76.61:/path/to/backend/

# Restart backend service
ssh user@106.12.76.61 "pm2 restart all"  # or restart manually
```

## Architecture

### Backend Structure (`backend/src/`)

- **index.ts** - Express app entry point, route registration, middleware setup
- **config/database.ts** - MySQL connection pool and auto-initialization of tables
- **config/bos.ts** - Baidu Cloud BOS configuration
- **middleware/auth.ts** - JWT authentication (`authenticateToken`) and admin guard (`requireAdmin`)
- **models/** - Database models using raw SQL with mysql2 (e.g., `User.ts`, `Assignment.ts`)
- **controllers/** - Route handlers, one per domain entity
- **routes/** - Express route definitions, imported in index.ts
- **utils/bosUploader.ts** - BOS upload utilities with local fallback

**Key Pattern:** Models encapsulate SQL queries. Controllers use `AuthRequest` type for authenticated routes (access user via `req.user!`).

### Frontend Structure (`frontend/src/`)

- **api/index.ts** - Axios instance with interceptors for auth headers and error handling (ElMessage)
- **stores/auth.ts** - Pinia store for authentication, token stored in localStorage
- **router/index.ts** - Vue Router with navigation guards (`requiresAuth`, `requiresAdmin`)
- **views/** - Page components; admin pages have `requiresAdmin: true` meta
- **components/** - Reusable components (e.g., AppHeader.vue)

**Auth Flow:** Router guard checks `authStore.isAuthenticated` → redirects to /login if needed. Admin pages check `authStore.user?.role !== 'admin'`.

### Database

Auto-initialized on server startup (`initDatabase()` in database.ts). Tables:
- `users` - Authentication and user info
- `daily_reports` - Daily student reports
- `assignments` - Homework/assignments
- `assignment_submissions` - Student submissions with grades
- `documents` - Shared documents

Default admin account: `admin` / `password`

### File Upload Architecture

1. Frontend uploads to `/api/upload` endpoint
2. Backend stores to Baidu Cloud BOS if configured, otherwise local filesystem (`backend/uploads/`)
3. File URLs stored in database; BOS URLs are publicly accessible
4. **Multiple files:** Stored as JSON array string (e.g., `["url1", "url2"]`)

BOS config in `backend/.env` (optional - falls back to local if not set):
```
BOS_ENDPOINT=http://bj.bcebos.com
BOS_ACCESS_KEY=...
BOS_SECRET_KEY=...
BOS_BUCKET=...
```

## Important Patterns & Gotchas

### Vue 3 <script setup> Template Usage

**IMPORTANT:** In Vue 3 `<script setup>`, template refs must be used WITHOUT `.value`:
- Template: `<div>{{ submitForm.file_infos }}</div>` (NO .value)
- Script: `submitForm.value.file_infos.push(...)` (WITH .value)

**Common error:** `Cannot read properties of undefined` often means using `.value` in template.

### Backend Error Handling

Always wrap database queries in try-catch to prevent 500 errors:
```typescript
async findAll(page?: number, limit?: number) {
  try {
    const [rows] = await pool.execute(query)
    return { data: rows || [], total: countResult?.[0]?.total || 0 }
  } catch (error) {
    console.error('findAll error:', error)
    return { data: [], total: 0 }
  }
}
```

### Multiple File Storage

When storing multiple file URLs, use JSON string format:
- Frontend sends: `JSON.stringify(["url1", "url2"])`
- Backend stores: `"[\"url1\",\"url2\"]"` in database
- Frontend parses: `JSON.parse(response.data.file_url)` (handle both array and string)

### File Upload Filename Encoding

Multer receives Chinese filenames in latin1 encoding, convert to UTF-8:
```typescript
const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8')
```

### SQL LIMIT/OFFSET with MySQL2

MySQL2's `execute()` has issues with LIMIT parameters. Use `query()` for pagination:
```typescript
// Use pool.query instead of pool.execute for LIMIT
const [rows] = await pool.query<AssignmentRow[]>(query)
```

### File Download Logic

Support both BOS (http URLs) and local storage:
```typescript
if (fileUrl.startsWith('http')) {
  // Direct download from BOS
  window.open(fileUrl, '_blank')
} else {
  // Use backend API proxy for local files
  api.get(`/submissions/${submissionId}/download`)
}
```

### API Response Formats

- List endpoints return: `{ data: [...], total: number }`
- Single entity returns: The entity object directly
- Errors return: `{ error: "message" }`

## API Conventions

- All API routes under `/api/*`
- Auth routes: `/api/auth/*`
- JWT in Authorization header: `Bearer <token>`
- Error responses: `{ error: "message" }`
- Success responses: entity object or array directly

### Key API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/assignments` | Get assignment list (paginated) | No |
| POST | `/api/assignments` | Create assignment | Admin |
| GET | `/api/assignments/:id` | Get assignment detail | No |
| POST | `/api/assignments/:id/submit` | Submit homework | Student |
| GET | `/api/submissions/:id/download` | Download submission file | Required |
| POST | `/api/upload` | Upload file | Required |
| GET | `/api/documents` | Get document list | No |

### Environment Variables

**Backend (`backend/.env`):**
```
PORT=3001
JWT_SECRET=your-secret-key
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ripple_learning
DB_USER=root
DB_PASSWORD=...
```

**Frontend (`frontend/.env`):**
```
VITE_API_BASE_URL=/api
```
