# ── Builder ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api

RUN pnpm --filter api prisma generate
RUN pnpm --filter api build

# ── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm
RUN addgroup --system jothi && adduser --system --ingroup jothi jothi

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

USER jothi
EXPOSE 4000
CMD ["node", "apps/api/dist/main"]
