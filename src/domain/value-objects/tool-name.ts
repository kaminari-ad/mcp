/**
 * Canonical MCP tool name. Snake_case, lowercase, ASCII.
 *
 * Validated at construction so the registry can't accidentally accept a
 * name that won't appear correctly in agent UIs (no spaces, no caps,
 * no leading digits).
 */

const TOOL_NAME_RE = /^[a-z][a-z0-9_]{1,63}$/;

declare const toolNameBrand: unique symbol;

export type ToolName = string & { readonly [toolNameBrand]: never };

/**
 * Parses a raw string as a {@link ToolName}. Returns `undefined` if the
 * input violates the snake_case rule.
 */
export function parseToolName(raw: string): ToolName | undefined {
  return TOOL_NAME_RE.test(raw) ? (raw as ToolName) : undefined;
}

/**
 * Like {@link parseToolName} but throws on invalid input. For use at
 * MCP-server boot, where an invalid name is a programmer error and
 * should crash the process.
 */
export function toolNameOrThrow(raw: string): ToolName {
  const result = parseToolName(raw);
  if (result === undefined) {
    throw new Error(`Invalid tool name: "${raw}". Must match ${TOOL_NAME_RE.source}.`);
  }
  return result;
}
