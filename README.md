# WatchBox Monorepo

Full-stack movie discovery web application based on the WatchBox SDD v0.2.

## Workspaces

- `shared/` (`@watchbox/shared`): Reusable Zod validation schemas and inferred TypeScript types.
- `server/` (`@watchbox/server`): Express backend with MongoDB Atlas, session-based auth, and TMDB proxy.
- `client/` (`@watchbox/client`): React + Vite frontend with Tailwind CSS v4, Motion, and TanStack Query.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

- Copy `server/.env.example` to `server/.env` and provide your MongoDB URI and TMDB API key.
- Copy `client/.env.example` to `client/.env`.

### 3. Build Shared Packages

```bash
npm run build:shared
```

### 4. Run Development Servers

```bash
npm run dev
```

### 5. Run Tests

```bash
npm test
```
