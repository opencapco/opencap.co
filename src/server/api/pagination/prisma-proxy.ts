import {
  type FindManyPaginated,
  makeFindManyPaginated,
} from "./find-many.proxy";
import type { ProxyFunctions } from "./types";

/**
 * ProxyPrismaModel
 *
 * type of a prisma model with custom methods. to date, only findManyPaginated is implemented
 */
type ProxyPrismaModel<F extends ProxyFunctions> = F & FindManyPaginated<F>;

/**
 * ProxyPrismaModel
 *
 * the factory function that creates a ProxyPrismaModel. to date, only findManyPaginated is implemented.
 */
export function ProxyPrismaModel<F extends ProxyFunctions>(
  model: F,
): ProxyPrismaModel<F> {
  Reflect.set(model, "findManyPaginated", makeFindManyPaginated(model));
  // Reflect.set(model, 'anotherProxiedMethod', makeAnotherProxyMethod(model));
  // ...
  return model as ProxyPrismaModel<F>;
}
