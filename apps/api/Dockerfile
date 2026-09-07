# ── Builder ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY apps/api ./apps/api

RUN cd apps/api && npx prisma generate --schema=./prisma/schema.prisma
RUN pnpm --filter api build

# ── Production image ─────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl
RUN addgroup --system jothi && adduser --system --ingroup jothi jothi

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

COPY apps/api/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh && chown -R jothi:jothi /app

USER jothi
EXPOSE 4000
CMD ["./entrypoint.sh"]
