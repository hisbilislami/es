import { prisma } from "~/utils/db.server";

type SafeQueryResult<T> = Promise<T[]>;

/**
 * Tagged template literal SQL builder with typed result and typed params
 */
export function createRawQuery<
  T = unknown,
  V extends readonly unknown[] = unknown[],
>(strings: TemplateStringsArray, ...values: V): SafeQueryResult<T> {
  // Convert template to $1, $2, $3... and join it into a final query
  const textParts = strings.map((str, i) => `${str}$${i + 1}`);
  const finalQuery = textParts.join("").trim();

  return prisma.$queryRawUnsafe(finalQuery, ...values) as SafeQueryResult<T>;
}
