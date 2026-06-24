# Stage 1: Prune
FROM node:20-alpine AS pruner
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune @repo/worker --docker

# Stage 2: Install dependencies
FROM node:20-alpine AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json .
RUN npm ci

# Stage 3: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY --from=installer /app .
COPY --from=pruner /app/out/full/ .
# Generate prisma client (needed before building ts files)
RUN npx prisma@6.0.0 generate --schema=packages/db/prisma/schema.prisma
RUN npm run build --filter=@repo/worker

# Stage 4: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Add user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 workerjs
USER workerjs

COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json
COPY --from=builder /app/packages/db ./packages/db

CMD ["node", "apps/worker/dist/index.js"]
