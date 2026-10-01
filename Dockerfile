# ---- base ----
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache openssl libc6-compat

# ---- deps ----
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts --no-audit --no-fund; else npm install --ignore-scripts --no-audit --no-fund; fi

# ---- builder ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# DATABASE_URL is required at build time for Prisma generate/collecting routes.
# A dummy value is enough; the real one is injected at runtime.
ARG DATABASE_URL=postgresql://admin:admin@localhost:5432/chronicle
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate && npm run build

# ---- runner ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

# 👇 NEW: give the nextjs user write access so `prisma migrate deploy` can
# download/write its query engine at container start.
RUN chown -R nextjs:nodejs /app/node_modules

USER nextjs
EXPOSE 3000

# Apply migrations then start the standalone server.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]