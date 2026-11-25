import { describe, expect, it } from "vitest";

import { setCustomRuleDisabledTagsTool } from "../../../../src/application/tools/custom-rules/set-custom-rule-disabled-tags.tool.js";
import { createFakeApiGateway, err, makeApiError } from "../../../fakes/fake-api-gateway.js";
import { makeToolContext } from "../../../fakes/make-tool-context.js";

const RID = "00000000-0000-0000-0000-000000000bbb";

describe("setCustomRuleDisabledTagsTool", () => {
  it("i15: name and input bounds", () => {
    const schema = setCustomRuleDisabledTagsTool.inputSchema;
    expect(setCustomRuleDisabledTagsTool.name).toBe("set_custom_rule_disabled_tags");
    expect(() => schema.parse({ rule_id: "x", slugs: [] })).toThrow();
    expect(() => schema.parse({ rule_id: RID })).toThrow();
    expect(() => schema.parse({ rule_id: RID, slugs: [""] })).toThrow();
    expect(() => schema.parse({ rule_id: RID, slugs: ["a".repeat(101)] })).toThrow();
    expect(schema.parse({ rule_id: RID, slugs: [] }).slugs).toEqual([]);
  });

  it("i15: sends the full off-set to the gateway and returns the rule", async () => {
    const api = createFakeApiGateway();
    const r = await setCustomRuleDisabledTagsTool.handler(
      { rule_id: RID, slugs: ["casino", "bingo"] },
      makeToolContext({ api })
    );
    expect(r.isOk()).toBe(true);
    expect(r._unsafeUnwrap().id).toBeTruthy();
    expect(api.state.calls).toEqual([
      { method: "setCustomRuleDisabledTags", id: RID, slugs: ["casino", "bingo"] },
    ]);
  });

  it("i15: maps an API error", async () => {
    const api = createFakeApiGateway();
    api.state.responses.setCustomRuleDisabledTags = err(makeApiError("not-found", "x"));
    const r = await setCustomRuleDisabledTagsTool.handler(
      { rule_id: RID, slugs: ["nope"] },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
  });
});
