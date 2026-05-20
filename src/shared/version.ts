/**
 * Package version and name. Hard-coded as constants here, asserted to
 * match `package.json` by a unit test.
 *
 * Why not import `package.json`: it would force JSON-module support at
 * runtime and tsup-bundling would inline the entire manifest. Two
 * constants + one assertion test is simpler and gives the same safety.
 */

export const NAME = "@kaminari-ad/mcp";
export const VERSION = "0.3.0";
