# Three-stage assemble (no apk here — everything is in the bases):
#   deps/build : kaminariad-mcp-base-dev (node + build tooling) install + tsup.
#   runtime    : kaminariad-mcp-base-prod (lean node + tini) COPYs prod node_modules + dist.
FROM 676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-dev:v1.1.0 AS deps

COPY --chown=kaminariad:kaminariad package.json package-lock.json .npmrc ./

RUN npm ci \
    --omit=dev \
    --ignore-scripts \
    --legacy-peer-deps

FROM 676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-dev:v1.1.0 AS build

COPY --chown=kaminariad:kaminariad package.json package-lock.json .npmrc ./

RUN npm ci \
    --ignore-scripts \
    --legacy-peer-deps

COPY --chown=kaminariad:kaminariad tsconfig.json tsconfig.build.json tsup.config.ts ./
COPY --chown=kaminariad:kaminariad src ./src

RUN npx tsup --config tsup.config.ts

FROM 676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-prod:v1.1.0 AS runtime

COPY --chown=kaminariad:kaminariad --from=deps /var/www/kaminariad-mcp/node_modules ./node_modules
COPY --chown=kaminariad:kaminariad --from=build /var/www/kaminariad-mcp/dist ./dist
COPY --chown=kaminariad:kaminariad package.json LICENSE README.md SECURITY.md ./

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/var/www/kaminariad-mcp/dist/bin.js", "--transport=http"]
