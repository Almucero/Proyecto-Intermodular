import "dotenv/config";
import { prisma } from "../config/db.js";

/**
 * Script para limpiar todos los datos de todas las tablas.
 * Elimina todos los registros pero mantiene la estructura de la BD.
 * Usa: npm run clean:data
 */
async function cleanAllData() {
  try {
    console.log("🧹 Iniciando limpieza de datos...");

    console.log("  - Eliminando Games...");
    await prisma.game.deleteMany({});

    console.log("  - Eliminando Users...");
    await prisma.user.deleteMany({
      where: { isAdmin: false },
    });

    console.log("  - Eliminando Developers...");
    await prisma.developer.deleteMany({});

    console.log("  - Eliminando Publishers...");
    await prisma.publisher.deleteMany({});

    console.log("✅ Limpieza completada. Todas las tablas están vacías.");
  } catch (err) {
    console.error("❌ Error durante la limpieza:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllData().then(() => process.exit(0));
