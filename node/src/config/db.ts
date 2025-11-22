import { PrismaClient } from "@prisma/client";
import { serializePrisma } from "../utils/serialize.js";

export const prisma = new PrismaClient();

/**
 * Helper to convert Prisma results (Decimals, Dates) into JSON-safe values.
 * Use in places where you need to serialize Prisma results outside of Express responses.
 */
export function prismaToJSON<T>(value: T): any {
  return serializePrisma(value);
}
