import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";

/**
 * Genera administradores usando las variables de entorno:
 * - ADMIN_EMAILS (obligatoria): separada por comas o punto y coma
 * - ADMIN_PASSWORDS (opcional): separada por comas o punto y coma, se alinea por índice con los correos
 * - ADMIN_NAMES (opcional): separada por comas o punto y coma, se alinea por índice con los correos
 *
 * Sincroniza la lista de administradores: crea o actualiza los administradores incluidos en ADMIN_EMAILS,
 * y elimina cualquier administrador que NO esté en ADMIN_EMAILS.
 * Esto asegura que los administradores estén siempre sincronizados con las variables de entorno.
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
      "No admin emails provided. Set ADMIN_EMAILS in your environment.",
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

  const expectedAdminEmails = emails.map((e) => e.toLowerCase());

  const existingAdmins = await prisma.user.findMany({
    where: { isAdmin: true },
  } as any);

  const adminsToDelete = existingAdmins.filter(
    (admin) => !expectedAdminEmails.includes(admin.email.toLowerCase()),
  );

  if (adminsToDelete.length > 0) {
    console.log(
      `Eliminando ${adminsToDelete.length} admin(s) que no están en ADMIN_EMAILS:`,
    );
    for (const admin of adminsToDelete) {
      await prisma.user.delete({
        where: { id: admin.id },
      });
      console.log(`  Eliminado: ${admin.email}`);
    }
  }

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    const password = passwords[i] || "ChangeMe123!";
    const name = names[i] || "Admin";
    const passwordHash = await bcrypt.hash(password, saltRounds);
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
    "Seed completado. Admins sincronizados con ADMIN_EMAILS en el environment.",
  );
}

crearAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
