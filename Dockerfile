# syntax=docker/dockerfile:1.7

# =====================================================
# Stage 1 — deps
# =====================================================
FROM node:20-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* .npmrc ./
COPY prisma ./prisma

# NOTE: do NOT use `--omit=optional`. `sharp` (which optimizes gallery uploads)
# installs its platform binaries through its own optionalDependencies; skipping
# optional packages leaves the image without sharp's native binary and
# /api/admin/gallery/upload fails at runtime.
RUN npm ci || npm install

# =====================================================
# Stage 2 — builder
# =====================================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Next evaluates the auth routes during a production build. The real
# NEXTAUTH_SECRET is supplied at runtime by Compose; the value below is not a
# secret baked into the image and exists only to satisfy the build check.
ENV NEXTAUTH_SECRET=build-only-placeholder-not-a-runtime-secret-2026

# Next inlines `NEXT_PUBLIC_*` values into the client bundle AT BUILD TIME, so
# supplying them only at runtime is not enough. The brand and contact details
# are therefore taken as build args and written into the build environment.
# Compose passes them through `build.args` (see docker-compose.yml).
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_SITE_NAME
ARG NEXT_PUBLIC_SITE_SHORT_NAME
ARG NEXT_PUBLIC_SITE_DESCRIPTION
ARG NEXT_PUBLIC_SITE_ALT_URL
ARG NEXT_PUBLIC_OPERATOR
ARG NEXT_PUBLIC_PHONE
ARG NEXT_PUBLIC_WHATSAPP
ARG NEXT_PUBLIC_EMAIL
ARG NEXT_PUBLIC_CONTACTS
ARG NEXT_PUBLIC_INSTAGRAM
ARG NEXT_PUBLIC_FACEBOOK
ARG NEXT_PUBLIC_YOUTUBE

ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_NAME=$NEXT_PUBLIC_SITE_NAME
ENV NEXT_PUBLIC_SITE_SHORT_NAME=$NEXT_PUBLIC_SITE_SHORT_NAME
ENV NEXT_PUBLIC_SITE_DESCRIPTION=$NEXT_PUBLIC_SITE_DESCRIPTION
ENV NEXT_PUBLIC_SITE_ALT_URL=$NEXT_PUBLIC_SITE_ALT_URL
ENV NEXT_PUBLIC_OPERATOR=$NEXT_PUBLIC_OPERATOR
ENV NEXT_PUBLIC_PHONE=$NEXT_PUBLIC_PHONE
ENV NEXT_PUBLIC_WHATSAPP=$NEXT_PUBLIC_WHATSAPP
ENV NEXT_PUBLIC_EMAIL=$NEXT_PUBLIC_EMAIL
ENV NEXT_PUBLIC_CONTACTS=$NEXT_PUBLIC_CONTACTS
ENV NEXT_PUBLIC_INSTAGRAM=$NEXT_PUBLIC_INSTAGRAM
ENV NEXT_PUBLIC_FACEBOOK=$NEXT_PUBLIC_FACEBOOK
ENV NEXT_PUBLIC_YOUTUBE=$NEXT_PUBLIC_YOUTUBE

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Production build (output: standalone)
RUN npm run build

# =====================================================
# Stage 3 — runner
# =====================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Gallery videos are transcoded to browser-compatible H.264 MP4.
RUN apk add --no-cache libc6-compat openssl tini ffmpeg

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

# Copy the standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# For Prisma (when a migration/deploy is needed)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
