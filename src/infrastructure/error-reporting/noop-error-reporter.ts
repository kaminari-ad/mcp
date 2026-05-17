/**
 * Default OSS {@link ErrorReporter} adapter — does nothing.
 *
 * Operators who want telemetry swap this for their own adapter at
 * deployment time. The OSS package ships with no telemetry by design;
 * see CONTRIBUTING.md "Tenant isolation" §15.
 */

import type { ErrorReporter } from "../../domain/ports/error-reporter.js";

/**
 * Returns a no-op `ErrorReporter`.
 */
export function createNoopErrorReporter(): ErrorReporter {
  return {
    capture(_error, _extra): void {
      // intentional no-op
    },
  };
}
