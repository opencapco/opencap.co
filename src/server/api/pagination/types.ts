/**
 * Pagination information
 */
export type PaginationData = {
  limit?: number;
  cursor?: string | null;
};

/**
 * Proxy functions
 *
 * used to create custom methods for prisma models
 */
export type ProxyFunctions = {
  // biome-ignore lint/suspicious/noExplicitAny: <any is legal here>
  findMany: (params: unknown, pagination: PaginationData) => Promise<any>;
  count: (params: unknown) => Promise<number>;
};
