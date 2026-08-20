FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma
RUN npm run build --filter=@repo/worker

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app .
CMD ["node", "apps/worker/dist/index.js"]

