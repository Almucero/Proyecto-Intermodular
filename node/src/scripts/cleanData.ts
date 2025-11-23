import "dotenv/config";
import { prisma } from "../config/db.js";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Sanitize game title to create a valid folder name
 * (Duplicated from gameImages.service.ts to avoid dependency issues in scripts)
 */
function sanitizeFolderName(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Script para limpiar todos los datos de todas las tablas y Cloudinary.
 * Elimina todos los registros pero mantiene la estructura de la BD.
 * Usa: npm run clean:data
 */
async function cleanAllData() {
  try {
    console.log("🧹 Iniciando limpieza de datos...");

    console.log("  - Obteniendo imágenes para borrar de Cloudinary...");
    const allImages = await prisma.gameImage.findMany({
      where: { publicId: { not: null } },
      select: { publicId: true },
    });

    if (allImages.length > 0) {
      console.log(`  - Borrando ${allImages.length} imágenes de Cloudinary...`);
      const publicIds = allImages.map((img) => img.publicId!);
      const chunkSize = 100;
      for (let i = 0; i < publicIds.length; i += chunkSize) {
        const chunk = publicIds.slice(i, i + chunkSize);
        try {
          await cloudinary.api.delete_resources(chunk);
        } catch (e) {
          console.error("Error borrando chunk de imágenes en Cloudinary:", e);
        }
      }
    }

    console.log("  - Borrando carpetas de juegos en Cloudinary...");
    const allGames = await prisma.game.findMany({ select: { title: true } });
    for (const game of allGames) {
      const folderName = sanitizeFolderName(game.title);
      try {
        await cloudinary.api.delete_folder(folderName);
      } catch (error: any) {
        if (error?.error?.http_code !== 404) {
        }
      }
    }

    console.log("  - Eliminando GameImages...");
    await prisma.gameImage.deleteMany({});
    console.log("  - Eliminando Games...");
    await prisma.game.deleteMany({});
    console.log("  - Eliminando Genres...");
    await prisma.genre.deleteMany({});
    console.log("  - Eliminando Platforms...");
    await prisma.platform.deleteMany({});
    console.log("  - Eliminando Users (no admins)...");
    await prisma.user.deleteMany({
      where: { isAdmin: false },
    });
    console.log("  - Eliminando Developers...");
    await prisma.developer.deleteMany({});
    console.log("  - Eliminando Publishers...");
    await prisma.publisher.deleteMany({});

    console.log("  - Reseteando secuencias de IDs...");
    try {
      await prisma.$executeRawUnsafe(
        'ALTER SEQUENCE "Game_id_seq" RESTART WITH 1'
      );
      await prisma.$executeRawUnsafe(
        'ALTER SEQUENCE "GameImage_id_seq" RESTART WITH 1'
      );
      await prisma.$executeRawUnsafe(
        'ALTER SEQUENCE "Developer_id_seq" RESTART WITH 1'
      );
      await prisma.$executeRawUnsafe(
        'ALTER SEQUENCE "Publisher_id_seq" RESTART WITH 1'
      );
      await prisma.$executeRawUnsafe(
        'ALTER SEQUENCE "Genre_id_seq" RESTART WITH 1'
      );
      await prisma.$executeRawUnsafe(
        'ALTER SEQUENCE "Platform_id_seq" RESTART WITH 1'
      );
    } catch (e) {
      console.warn(
        "  ⚠️ No se pudieron resetear las secuencias (posiblemente no es PostgreSQL o ya están resetadas)."
      );
    }

    console.log("✅ Limpieza completada. Cloudinary y BD limpios.");
  } catch (err) {
    console.error("❌ Error durante la limpieza:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAllData().then(() => process.exit(0));
