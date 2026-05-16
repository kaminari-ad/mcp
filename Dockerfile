# syntax=docker/dockerfile:1.7
#
# @kaminari-ad/mcp — multi-stage production image.
#
# Stages:
#   1. base      pinned node:22-alpine with build deps
#   2. deps      installs production dependencies only
#   3. build     installs all deps, compiles dist/
#   4. runtime   minimal final image; non-root user; read-only filesystem-friendly
#

# ── 1. base ──────────────────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini=~0.19
ENV NODE_ENV=production \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# ── 2. deps (production only) ────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
COPY .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --ignore-scripts

# ── 3. build (all deps + tsup) ───────────────────────────────────────
FROM base AS build
COPY package.json package-lock.json ./
COPY .npmrc ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npx tsup --config tsup.config.ts

# ── 4. runtime ───────────────────────────────────────────────────────
FROM node:22-alpine AS runtime
WORKDIR /app

# Run as non-root. The node:alpine image ships a `node` user (uid 1000).
USER node

# tini = PID 1 for clean SIGTERM handling
COPY --from=base /sbin/tini /sbin/tini
ENTRYPOINT ["/sbin/tini", "--"]

ENV NODE_ENV=production \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_UPDATE_NOTIFIER=false \
    LOG_LEVEL=info \
    HTTP_PORT=8080

COPY --chown=node:node --from=deps   /app/node_modules ./node_modules
COPY --chown=node:node --from=build  /app/dist         ./dist
COPY --chown=node:node package.json LICENSE README.md SECURITY.md ./

# Healthcheck — Docker compose probes this.
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${HTTP_PORT}/healthz" || exit 1

EXPOSE 8080

CMD ["node", "dist/bin.js", "--transport=http"]
