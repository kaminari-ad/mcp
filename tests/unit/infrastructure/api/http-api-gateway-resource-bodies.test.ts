import { gzipSync } from "node:zlib";

import { MockAgent } from "undici";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BearerToken } from "../../../../src/domain/value-objects/bearer-token.js";
import { newRequestId } from "../../../../src/domain/value-objects/request-id.js";
import { createHttpApiGateway } from "../../../../src/infrastructure/api/http-api-gateway.js";
import { createFakeLogger } from "../../../fakes/fake-logger.js";

const ORIGIN = "https://kaminari.test";
const SID = "00000000-0000-0000-0000-000000000777";

const ROWS = [
  {
    url: "https://cdn.example/tag.js",
    resource_type: "script",
    content_type: "application/javascript",
    size: 10,
    body: "var a = 1;",
  },
  {
    url: "https://cdn.example/big.js",
    resource_type: "script",
    content_type: "application/javascript",
    size: 2_000_000,
    skipped: "too_large",
  },
];
const GZ = gzipSync(ROWS.map((r) => JSON.stringify(r)).join("\n"));

function buildGateway(agent: MockAgent) {
  return createHttpApiGateway({
    baseUrl: ORIGIN,
    bearer: BearerToken.fromString("kad_test_token_value")!,
    requestId: newRequestId(),
    logger: createFakeLogger(),
    dispatcher: agent,
  });
}

describe("HttpApiGateway resource bodies", () => {
  let agent: MockAgent;

  beforeEach(() => {
    agent = new MockAgent();
    agent.disableNetConnect();
  });

  afterEach(async () => {
    await agent.close();
  });

  function serve(path: string, status = 200, body: Buffer | object = GZ): void {
    agent
      .get(ORIGIN)
      .intercept({ path, method: "GET" })
      .reply(status, body, { headers: { "content-type": "application/gzip" } });
  }

  it("lists a page's rows without their bodies", async () => {
    serve(`/api/v1/scans/${SID}/resource-bodies`);

    const result = await buildGateway(agent).listScanResources(SID, { kind: "page" });

    expect(result._unsafeUnwrap()).toEqual([
      {
        index: 0,
        url: "https://cdn.example/tag.js",
        resource_type: "script",
        content_type: "application/javascript",
        size: 10,
        skipped: null,
      },
      {
        index: 1,
        url: "https://cdn.example/big.js",
        resource_type: "script",
        content_type: "application/javascript",
        size: 2_000_000,
        skipped: "too_large",
      },
    ]);
  });

  it("reads one creative row with its body", async () => {
    serve(`/api/v1/scans/${SID}/creative-resource-bodies`);

    const result = await buildGateway(agent).getScanResourceBody(SID, { kind: "creative" }, 0);

    expect(result._unsafeUnwrap()).toMatchObject({ index: 0, body: "var a = 1;" });
  });

  it("answers null past the last landing row", async () => {
    serve(`/api/v1/scans/${SID}/landings/2/resource-bodies`);

    const result = await buildGateway(agent).getScanResourceBody(
      SID,
      { kind: "landing", ord: 2 },
      9
    );

    expect(result._unsafeUnwrap()).toBeNull();
  });

  it("maps an expired artifact to not-found", async () => {
    serve(`/api/v1/scans/${SID}/resource-bodies`, 404, { detail: "Scan not found" });

    const listed = await buildGateway(agent).listScanResources(SID, { kind: "page" });

    expect(listed._unsafeUnwrapErr().kind).toBe("not-found");
  });

  it("passes a not-found through the body read as well", async () => {
    serve(`/api/v1/scans/${SID}/resource-bodies`, 404, { detail: "Scan not found" });

    const read = await buildGateway(agent).getScanResourceBody(SID, { kind: "page" }, 0);

    expect(read._unsafeUnwrapErr().kind).toBe("not-found");
  });

  it("reports an artifact that is not gzip as upstream", async () => {
    serve(`/api/v1/scans/${SID}/resource-bodies`, 200, Buffer.from("not gzip"));

    const listed = await buildGateway(agent).listScanResources(SID, { kind: "page" });

    expect(listed._unsafeUnwrapErr()).toMatchObject({
      kind: "upstream",
      detail: "Captured contents are not a valid gzip file.",
    });
  });

  it("reports a malformed row from the body read as upstream", async () => {
    serve(`/api/v1/scans/${SID}/resource-bodies`, 200, gzipSync('{"url": 1}'));

    const read = await buildGateway(agent).getScanResourceBody(SID, { kind: "page" }, 0);

    expect(read._unsafeUnwrapErr()).toMatchObject({
      kind: "upstream",
      detail: "malformed resource row 0",
    });
  });
});
