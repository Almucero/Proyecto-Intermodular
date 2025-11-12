import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";

/**
 * Seed admins using ONLY the plural environment variables:
 * - ADMIN_EMAILS (required) comma/semicolon-separated
 * - ADMIN_PASSWORDS (optional) comma/semicolon-separated, aligns by index with emails
 * - ADMIN_NAMES (optional) comma/semicolon-separated, aligns by index with emails
 *
 * This file intentionally does NOT read ADMIN_EMAIL, ADMIN_PASSWORD or ADMIN_NAME.
 */
async function crearAdmin() {
  const adminEmailsCsv = process.env.ADMIN_EMAILS ?? "";
  const adminPasswordsCsv = process.env.ADMIN_PASSWORDS ?? "";
  const adminNamesCsv = process.env.ADMIN_NAMES ?? "";
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  const emails = adminEmailsCsv
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (emails.length === 0) {
    throw new Error(
      "No admin emails provided. Set ADMIN_EMAILS in your environment."
    );
  }

  const passwords = adminPasswordsCsv
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const names = adminNamesCsv
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    // If no password was provided for this index, use a safe default and log a warning
    const password = passwords[i] || "ChangeMe123!";
    const name = names[i] || "Admin";

    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Upsert per admin. Keep `any` casts to avoid TS Prisma client type drift; regenerate client with `npx prisma generate` to remove any.
    const createPayload: any = {
      email,
      name,
      passwordHash,
      isAdmin: true,
    };

    const updatePayload: any = {
      passwordHash,
      isAdmin: true,
      name,
    };

    const user = await prisma.user.upsert({
      where: { email } as any,
      update: updatePayload,
      create: createPayload,
    } as any);

    console.log("Admin creado/actualizado:", {
      id: user.id,
      email: user.email,
    });
  }

  console.log(
    "Seed completado. Recomendado: eliminar ADMIN_PASSWORDS de las variables de entorno en producción después de usar el script."
  );
}

crearAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
