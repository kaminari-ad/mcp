import { describe, expect, it } from "vitest";

import { testCustomRulesBatchTool } from "../../../../src/application/tools/custom-rules/test-custom-rules-batch.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const SID = "00000000-0000-0000-0000-000000000aaa";
const RULE_ID = "00000000-0000-0000-0000-000000000bbb";

const oneRule = {
  rule_type: "stopword_content",
  config: { contains: ["casino"] },
  target: "page",
};

describe("testCustomRulesBatchTool", () => {
  it("is a separate read-only tool that tells the agent how to finish a partial batch", () => {
    expect(testCustomRulesBatchTool.name).toBe("test_custom_rules_batch");
    expect(testCustomRulesBatchTool.annotations.readOnlyHint).toBe(true);
    expect(testCustomRulesBatchTool.description).toContain("50 stored scans");
    expect(testCustomRulesBatchTool.description).toContain("deadline_exceeded");
  });

  it("accepts 20 rules on 50 scans", () => {
    const parsed = testCustomRulesBatchTool.inputSchema.safeParse({
      rules: Array.from({ length: 20 }, () => oneRule),
      scan_ids: Array.from({ length: 50 }, () => SID),
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects 51 scans or 21 rules before the gateway call", () => {
    const tooManyScans = testCustomRulesBatchTool.inputSchema.safeParse({
      rules: [oneRule],
      scan_ids: Array.from({ length: 51 }, () => SID),
    });
    const tooManyRules = testCustomRulesBatchTool.inputSchema.safeParse({
      rules: Array.from({ length: 21 }, () => oneRule),
      scan_ids: [SID],
    });
    expect(tooManyScans.success).toBe(false);
    expect(tooManyRules.success).toBe(false);
  });

  it("reports a batch already running for the organization as rate-limited", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testCustomRulesBatch = err(
      makeApiError("rate-limited", "A rule test batch is already running")
    );
    const result = await testCustomRulesBatchTool.handler(
      { rules: [{ ...oneRule, name: "Test Rule" }], scan_ids: [SID] },
      makeToolContext({ api })
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.kind).toBe("rate-limited");
  });

  it("rejects a bad pattern rule before the gateway call", async () => {
    const api = createFakeApiGateway();
    const result = await testCustomRulesBatchTool.handler(
      {
        rules: [{ rule_type: "regexp_request_url", config: {}, target: "page", name: "Test Rule" }],
        scan_ids: [SID],
      },
      makeToolContext({ api })
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.kind).toBe("invalid-input");
      expect(result.error.message).toContain("rules[0]");
    }
    expect(api.state.calls).toEqual([]);
  });

  it("sends one batch body and keeps a cell error on that cell", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testCustomRulesBatch = ok({
      results: [
        {
          index: 0,
          rule_id: RULE_ID,
          scan_id: SID,
          matched: false,
          tags: [],
          elapsed_ms: 0,
          error: "The batch ran out of time before this rule finished.",
          error_code: "deadline_exceeded",
        },
        {
          index: 1,
          rule_id: null,
          scan_id: SID,
          matched: true,
          tags: [{ tag_slug: "casino_kw", detail: "match" }],
          elapsed_ms: 4,
          error: null,
          error_code: null,
        },
      ],
      summary: { total: 2, matched: 1, failed: 1, deadline_exceeded: 1 },
    });

    const parsed = testCustomRulesBatchTool.inputSchema.parse({
      rules: [
        { ...oneRule, id: RULE_ID, name: "Casino wording" },
        { ...oneRule, rule_type: "stopword_url" },
      ],
      scan_ids: [SID],
    });
    const result = await testCustomRulesBatchTool.handler(parsed, makeToolContext({ api }));

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.results[0]?.error_code).toBe("deadline_exceeded");
      expect(result.value.results[1]?.matched).toBe(true);
      expect(result.value.summary).toEqual({
        total: 2,
        matched: 1,
        failed: 1,
        deadline_exceeded: 1,
      });
    }
    const call = api.state.calls[0];
    if (call?.method !== "testCustomRulesBatch") throw new Error("wrong");
    expect(call.body.scan_ids).toEqual([SID]);
    expect(call.body.rules).toHaveLength(2);
    expect(call.body.rules[0]).toEqual({ ...oneRule, id: RULE_ID, name: "Casino wording" });
    expect(call.body.rules[1]).toEqual({
      ...oneRule,
      rule_type: "stopword_url",
      name: "Test Rule",
    });
  });

  it("maps an upstream error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.testCustomRulesBatch = err(makeApiError("forbidden", "no"));
    const result = await testCustomRulesBatchTool.handler(
      { rules: [{ ...oneRule, name: "Test Rule" }], scan_ids: [SID] },
      makeToolContext({ api })
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) expect(result.error.kind).toBe("forbidden");
  });
});
