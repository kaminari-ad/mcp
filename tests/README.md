# Tests

Three suites, each its own CI job:

| Suite                | Purpose                                                                                |
| -------------------- | -------------------------------------------------------------------------------------- |
| `tests/unit/`        | Pure logic, no I/O. Uses `tests/fakes/` (recording-spy fakes, one per port).           |
| `tests/integration/` | Full MCP server in stdio + HTTP, with `undici` MockAgent for the API. Real transports. |
| `tests/isolation/`   | Multi-tenant safety regression — see [`isolation/README.md`](isolation/README.md).     |

## Fakes

One fake per port, in `tests/fakes/fake-<port>.ts`. Fakes are recording spies: they return preconfigured data and record every call. **No business logic in fakes.** If you find yourself reimplementing matching/filtering logic in a fake, the fake is wrong — the test should assert on what the system-under-test does with the recorded calls, not on what the fake "would do".

## Coverage

`vitest.config.ts` enforces 100% lines / 100% functions / 100% statements / 95% branches. To raise (never lower!), update `vitest.config.ts` after adding tests.

## Running

```bash
make test            # full suite, all three buckets
make test-unit
make test-integration
make test-isolation
make test-cov        # with coverage report; CI uses this
```

Run a single file:

```bash
docker compose run --rm mcp npx vitest run tests/unit/tools/account/get-me.tool.test.ts
```
