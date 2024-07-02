// credit https://github.com/unkeyed/unkey/blob/main/packages/error/src/error-handling.ts

import type { BaseError } from "./errors/base";

type OkResult<V> = {
  val: V;
  err?: never;
};

type ErrResult<E extends BaseError> = {
  val?: never;
  err: E;
};

export type Result<V, E extends BaseError = BaseError> =
  | OkResult<V>
  | ErrResult<E>;

export function Ok(): OkResult<never>;
export function Ok<V>(val: V): OkResult<V>;
export function Ok<V>(val?: V): OkResult<V> {
  return { val } as OkResult<V>;
}
export function Err<E extends BaseError>(err: E): ErrResult<E> {
  return { err };
}

/**
 * wrap catches thrown errors and returns a `Result`
 */
export async function wrap<T, E extends BaseError>(
  p: Promise<T>,
  errorFactory: (err: Error) => E,
): Promise<Result<T, E>> {
  try {
    return Ok(await p);
  } catch (e) {
    return Err(errorFactory(e as Error));
  }
}

// credit https://github.com/remix-run/remix/blob/58ac1e98f0768ba775fbda885f8cc36bbf51f78e/packages/remix-dev/invariant.ts#L1

export function invariant(value: boolean, message?: string): asserts value;

export function invariant<T>(
  value: T | null | undefined,
  message?: string,
): asserts value is T;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function invariant(value: any, message?: string) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}
