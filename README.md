# Code Pro - Competitive Programming Platform

## Monorepo Structure (Turborepo + npm workspaces)

```text
CODE_PRO/
├── apps/
│   ├── web/              # Next.js 16 Frontend & NextAuth
│   └── api/              # Express Backend API
├── packages/
│   └── db/               # Prisma schema + generated client (shared)
├── scripts/              # Problem-setting & seed utilities
├── docker-compose.yml    # Judge0 CE + Redis (Local infrastructure)
├── turbo.json            # Turborepo pipeline
└── package.json          # Root workspace
```

## Architecture & Database Schema
View the interactive System Architecture, Entity-Relationship, and Code Execution Sequence diagrams here: [CodePro Architecture Diagrams](https://app.eraser.io/workspace/96aW9eTwjO2aArt9LhlO)

## Getting Started

### 1. Prerequisites
- Node.js >= 18
- Docker Desktop (for Judge0 + PostgreSQL)

### 2. Install dependencies
```bash
npm install
```

### 3. Copy env and fill in Google OAuth credentials
```bash
cp .env.example apps/web/.env.local
```

### 4. Start infrastructure (Judge0 + PostgreSQL + Redis)
```bash
docker-compose up -d
```

### 5. Push database schema
```bash
npm run db:push
```

### 6. Seed sample data
```bash
npm run db:seed
```

### 7. Start dev server
```bash
npm run dev
```

App runs at: http://localhost:3000
Judge0 API at: http://localhost:2358

## Judge0 Language IDs
- C++ (G++ 9.2.0) → 54
- JavaScript (Node.js 12) → 63
- Rust → 73
