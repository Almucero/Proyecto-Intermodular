import { PrismaClient } from "@prisma/client";
import { serializePrisma } from "../utils/serialize";

export const prisma = new PrismaClient();

export function prismaToJSON<T>(value: T): any {
  return serializePrisma(value);
}
