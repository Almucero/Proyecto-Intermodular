// Utility to deep-serialize Prisma results (Decimal -> number/string, Date -> ISO)
export function serializePrisma(value: any): any {
  if (value === null || value === undefined) return value;

  // Decimal from Prisma (decimal.js) typically has toNumber()
  if (typeof value === "object" && typeof value.toNumber === "function") {
    try {
      return value.toNumber();
    } catch {
      return value.toString();
    }
  }

  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) return value.map((v) => serializePrisma(v));

  if (typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value)) {
      out[k] = serializePrisma(value[k]);
    }
    return out;
  }

  return value;
}
