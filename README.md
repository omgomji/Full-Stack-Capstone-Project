# Full-Stack RBAC Capstone

Fine-grained Role-Based Access Control (RBAC) demonstration built on the MERN stack. The platform showcases how Admin, Editor, and Viewer roles shape both API behavior and client capabilities through JWT-based authentication, ownership-aware data filters, and UI guards.

## Problem Statement

Design and implement fine-grained RBAC in a MERN application where Admin, Editor, and Viewer roles govern API actions and UI capabilities. The solution must:

- Embed role claims in JWT access tokens and enforce authorization with Express middleware.
- Apply MongoDB query filters for row-level ownership (Editors manage only their content, Admins manage all).
- Reflect effective permissions in React by guarding routes/components and disabling restricted actions.
- Seed demo users and data to validate common RBAC flows end to end.
- Provide auditing, logging, security hardening, and automated tests covering middleware and role-specific scenarios.

## Repository Structure

```
Full-Stack-Capstone-Project/
├─ backend/
│  ├─ app.js                    # Express app wiring
│  ├─ server.js                 # HTTP/bootstrap entrypoint
│  ├─ Dockerfile
│  ├─ package.json
│  ├─ config/                   # Environment + permission matrix
│  ├─ controllers/              # Auth, post, user, audit controllers
│  ├─ middleware/               # Auth, permission, logging, error, etc.
│  ├─ models/                   # Mongoose schemas (User, Post, AuditLog)
│  ├─ routes/                   # Express routers with permission guards
│  ├─ services/                 # Token + audit helpers
│  ├─ seed/                     # Seed script for demo users/content
│  ├─ tests/                    # Jest E2E RBAC tests
│  └─ utils/                    # Logger + correlation utilities
├─ frontend/
│  ├─ package.json
│  ├─ vite.config.js            # Dev server proxy to backend
│  ├─ src/
│  │  ├─ App.jsx                # Route definitions + guards
│  │  ├─ components/            # Layout, RoleGuard, PermissionGate
│  │  ├─ context/               # Auth provider with token refresh logic
│  │  ├─ pages/                 # Dashboard, Posts, Editor, Audit, Users
│  │  ├─ services/              # Axios API client with refresh workflow
│  │  └─ __tests__/             # Vitest coverage for RoleGuard
│  └─ public/
├─ Screenshots/                 # Application screenshots
├─ docker-compose.yml           # API + MongoDB orchestration
└─ README.md                    # Project documentation
```

## Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop (optional but recommended for local MongoDB)

## Environment Variables

Backend configuration lives in `backend/config/index.js`. Override defaults via a `.env` file in `backend/` or environment variables:

```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/rbac_capstone
JWT_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGIN=http://localhost:5173
```

The frontend expects the API at `/api`; Vite’s dev server proxies to `http://localhost:4000` by default.

## Running with Docker Compose

```pwsh
cd FSproject
docker compose up --build
```

Services:

- `rbac-mongo` on `27017`
- `rbac-api` on `4000`

Visit the frontend at `http://localhost:5173` (run separately with `npm run dev` in `frontend/`).

## Manual Setup

### Backend API

```pwsh
cd FSproject\backend
npm install
npm run dev
```

The API starts on `http://localhost:4000`. Default rate limits, CORS, and security headers are already configured.

### Frontend (Vite + React)

```pwsh
cd FSproject\frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` requests to the backend.

## Seeding Demo Data

Create seeded Admin, Editor, and Viewer accounts plus sample posts:

```pwsh
cd FSproject\backend
npm run dev            # or ensure Mongo is reachable
node seed/seed.js
```

Seeded users:

| Role   | Email                | Password          |
|--------|----------------------|-------------------|
| Admin  | admin@example.com    | AdminPass123!     |
| Editor | editor@example.com   | EditorPass123!    |
| Viewer | viewer@example.com   | ViewerPass123!    |

## Testing

### Backend (Jest + Supertest)

```pwsh
cd FSproject\backend
npm test
```

Covers RBAC flows, permission denials, and ownership checks against an in-memory MongoDB.

### Frontend (Vitest + React Testing Library)

```pwsh
cd FSproject\frontend
npm test
```

Currently validates `RoleGuard` behavior; expand with additional UI permission tests as needed.

## Key Features

- **Role & Permission Matrix**: Defined once in `backend/config/permissions.js` and mirrored on the client for consistent enforcement.
- **JWT Authentication**: Short-lived access tokens (Bearer header) plus HttpOnly refresh tokens with hash storage for rotation.
- **Authorization Middleware**: `permission.can()` enforces route-level access, records denials, and exposes metrics.
- **Ownership Enforcement**: Controllers scope queries and mutations (e.g., editors restricted to their `authorId`).
- **UI Guarding**: React context supplies `can()` checks to `ProtectedRoute`, `RoleGuard`, and `PermissionGate`, toggling routes and controls.
- **Administration Panel**: Admin-only pages manage users, assign roles, and review audit logs.
- **Security Enhancements**: Helmet, rate limiting, structured error responses, and server-side validation via Joi.
- **Observability**: Correlation IDs propagate through requests; audit service captures who changed what and when.

## API Overview

Base path: `/api`

| Method | Route                 | Description                                 | Guard                                  |
|--------|-----------------------|---------------------------------------------|----------------------------------------|
| POST   | `/auth/login`         | Authenticate and issue access/refresh tokens| Public                                  |
| POST   | `/auth/refresh`       | Rotate refresh token / issue new access     | Authenticated via cookie               |
| POST   | `/auth/logout`        | Invalidate refresh token                    | Requires valid access token            |
| GET    | `/auth/me`            | Return current user payload                 | Authenticated                           |
| CRUD   | `/posts`              | Create/read/update/delete posts             | Permission-scoped, ownership enforced  |
| CRUD   | `/users`              | Manage users and roles                      | Admin-only actions                     |
| GET    | `/audit`              | Fetch audit trail                           | Admin                                  |
| GET    | `/audit/metrics`      | Permission denial metrics                   | Admin                                  |

Refer to controller files under `backend/controllers/` for field-level validation details.

## Frontend Highlights

- Session bootstrap refreshes access tokens on load; Axios interceptor queues refreshes to avoid stampede.
- Dashboard aggregates post/user metrics scoped to the viewer’s role.
- Posts table and editor gracefully degrade UI affordances based on permission checks.
- Audit page surfaces recent privileged actions with correlation IDs for tracing.

## Additional Documentation

- Entity relationship diagrams live in `docs/er-diagrams.md` (Mermaid syntax).
- Permission matrix is documented in both backend and frontend config folders.

## Contributing

1. Fork and clone the repository.
2. Create a feature branch.
3. Run backend and frontend tests before submitting PRs.
4. Keep permission definitions synchronized between backend and frontend configs.

## License

MIT License © 2025 omgomji
