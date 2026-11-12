# Three-stage assemble (no apk here — everything is in the bases):
#   deps/builder : kaminariad-mcp-base-builder (node + build tooling) install + tsup.
#   runtime      : kaminariad-mcp-base-runtime (lean node + tini) COPYs prod node_modules + dist.
# ARG defaults are the ECR images CodeBuild pulls. GitLab CI passes the same
# bases from the GitLab registry with --build-arg: that job has no AWS credentials.
ARG BUILDER_BASE=676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-builder:v1.3.0
ARG RUNTIME_BASE=676206925995.dkr.ecr.eu-central-1.amazonaws.com/kaminariad-mcp-base-runtime:v1.3.0
FROM ${BUILDER_BASE} AS deps

COPY --chown=kaminariad:kaminariad package.json package-lock.json .npmrc ./

RUN npm ci \
    --omit=dev \
    --ignore-scripts \
    --legacy-peer-deps

FROM ${BUILDER_BASE} AS builder

COPY --chown=kaminariad:kaminariad package.json package-lock.json .npmrc ./

RUN npm ci \
    --ignore-scripts \
    --legacy-peer-deps

COPY --chown=kaminariad:kaminariad tsconfig.json tsconfig.build.json tsup.config.ts ./
COPY --chown=kaminariad:kaminariad src ./src

RUN npx tsup --config tsup.config.ts

FROM ${RUNTIME_BASE} AS runtime

COPY --chown=kaminariad:kaminariad --from=deps /var/www/kaminariad-mcp/node_modules ./node_modules
COPY --chown=kaminariad:kaminariad --from=builder /var/www/kaminariad-mcp/dist ./dist
COPY --chown=kaminariad:kaminariad package.json LICENSE README.md SECURITY.md ./

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/var/www/kaminariad-mcp/dist/bin.js", "--transport=http"]
