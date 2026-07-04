# Three-stage assemble (no apk here — everything is in the bases):
#   deps/builder : kaminariad-mcp-base-builder (node + build tooling) install + tsup.
#   runtime      : kaminariad-mcp-base-runtime (lean node + tini) COPYs prod node_modules + dist.
FROM 676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-builder:v1.1.0 AS deps

COPY --chown=kaminariad:kaminariad package.json package-lock.json .npmrc ./

RUN npm ci \
    --omit=dev \
    --ignore-scripts \
    --legacy-peer-deps

FROM 676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-builder:v1.1.0 AS builder

COPY --chown=kaminariad:kaminariad package.json package-lock.json .npmrc ./

RUN npm ci \
    --ignore-scripts \
    --legacy-peer-deps

COPY --chown=kaminariad:kaminariad tsconfig.json tsconfig.build.json tsup.config.ts ./
COPY --chown=kaminariad:kaminariad src ./src

RUN npx tsup --config tsup.config.ts

FROM 676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-runtime:v1.1.0 AS runtime

COPY --chown=kaminariad:kaminariad --from=deps /var/www/kaminariad-mcp/node_modules ./node_modules
COPY --chown=kaminariad:kaminariad --from=builder /var/www/kaminariad-mcp/dist ./dist
COPY --chown=kaminariad:kaminariad package.json LICENSE README.md SECURITY.md ./

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/var/www/kaminariad-mcp/dist/bin.js", "--transport=http"]
