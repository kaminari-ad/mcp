/**
 * Re-export of `neverthrow` Result types and constructors, plus a few
 * project-specific helpers. Importing from this barrel (rather than
 * directly from `neverthrow`) keeps a single seam if we ever swap the
 * library.
 *
 * Discipline note: domain and application code uses `Result<T, E>` for
 * expected errors. Throwing is reserved for programmer errors. The
 * transport layer is the only place a `Result.Err` is mapped to an MCP
 * error envelope.
 */

export {
  type Err,
  err,
  errAsync,
  fromAsyncThrowable,
  fromPromise,
  fromSafePromise,
  fromThrowable,
  type Ok,
  ok,
  okAsync,
  Result,
  ResultAsync,
} from "neverthrow";
