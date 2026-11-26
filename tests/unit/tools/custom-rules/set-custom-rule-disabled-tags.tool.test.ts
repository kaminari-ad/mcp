import { describe, expect, it } from "vitest";

import { setCustomRuleDisabledTagsTool } from "../../../../src/application/tools/custom-rules/set-custom-rule-disabled-tags.tool.js";
import { createFakeApiGateway, err, makeApiError, ok } from "../../../fakes/fake-api-gateway.js";
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
    expect(() => schema.parse({ rule_id: RID, slugs: Array(201).fill("a") })).toThrow();
    expect(schema.parse({ rule_id: RID, slugs: Array(200).fill("a") }).slugs).toHaveLength(200);
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

  it("i15: returns disabled_tags and tag_disable_impact of the rule", async () => {
    const api = createFakeApiGateway();
    const impact = { casino: [{ id: RID, name: "Gambling combo" }] };
    const base = (await api.getCustomRule(RID))._unsafeUnwrap();
    api.state.responses.setCustomRuleDisabledTags = ok({
      ...base,
      disabled_tags: ["bingo"],
      tag_disable_impact: impact,
    });
    const r = await setCustomRuleDisabledTagsTool.handler(
      { rule_id: RID, slugs: ["bingo"] },
      makeToolContext({ api })
    );
    const rule = r._unsafeUnwrap();
    expect(rule.disabled_tags).toEqual(["bingo"]);
    expect(rule.tag_disable_impact).toEqual(impact);
  });

  it("i15: keeps the API error code of an unknown tag", async () => {
    const api = createFakeApiGateway();
    api.state.responses.setCustomRuleDisabledTags = err(
      makeApiError("invalid-input", "Not a tag of this rule: nope", "checking.unknown_rule_tag")
    );
    const r = await setCustomRuleDisabledTagsTool.handler(
      { rule_id: RID, slugs: ["nope"] },
      makeToolContext({ api })
    );
    expect(r.isErr()).toBe(true);
    expect(JSON.stringify(r._unsafeUnwrapErr())).toContain("checking.unknown_rule_tag");
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
