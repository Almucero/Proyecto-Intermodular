import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../config/db.js";

/**
 * Script para insertar datos iniciales de prueba.
 * Crea 10 entradas en cada tabla con datos realistas.
 * Limpia datos existentes (excepto admins) antes de insertar.
 * Usa: npm run seed:data
 */
async function seedData() {
  try {
    console.log("🌱 Iniciando seed de datos...");

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

    // Crear 10 Developers
    console.log("  - Creando 10 Developers...");
    const developers = await Promise.all([
      prisma.developer.create({
        data: { name: "Kojima Productions" },
      }),
      prisma.developer.create({
        data: { name: "FromSoftware" },
      }),
      prisma.developer.create({
        data: { name: "Bethesda Game Studios" },
      }),
      prisma.developer.create({
        data: { name: "Rockstar Games" },
      }),
      prisma.developer.create({
        data: { name: "Naughty Dog" },
      }),
      prisma.developer.create({
        data: { name: "CD Projekt Red" },
      }),
      prisma.developer.create({
        data: { name: "Insomniac Games" },
      }),
      prisma.developer.create({
        data: { name: "Capcom" },
      }),
      prisma.developer.create({
        data: { name: "Square Enix" },
      }),
      prisma.developer.create({
        data: { name: "Ubisoft Toronto" },
      }),
    ]);

    // Crear 10 Publishers
    console.log("  - Creando 10 Publishers...");
    const publishers = await Promise.all([
      prisma.publisher.create({
        data: { name: "Sony Interactive Entertainment" },
      }),
      prisma.publisher.create({
        data: { name: "Microsoft Game Studios" },
      }),
      prisma.publisher.create({
        data: { name: "Nintendo" },
      }),
      prisma.publisher.create({
        data: { name: "Valve" },
      }),
      prisma.publisher.create({
        data: { name: "Take-Two Interactive" },
      }),
      prisma.publisher.create({
        data: { name: "Activision Blizzard" },
      }),
      prisma.publisher.create({
        data: { name: "Electronic Arts" },
      }),
      prisma.publisher.create({
        data: { name: "Ubisoft" },
      }),
      prisma.publisher.create({
        data: { name: "Bandai Namco" },
      }),
      prisma.publisher.create({
        data: { name: "Sega" },
      }),
    ]);

    // Crear 10 Games
    console.log("  - Creando 10 Games...");
    const games = await Promise.all([
      prisma.game.create({
        data: {
          title: "Metal Gear Solid V",
          description: "Un juego de sigilo épico con mecánicas innovadoras",
          price: 49.99,
          releaseDate: new Date("2015-09-01"),
          genres: ["Sigilo", "Acción"],
          developerId: developers[0].id,
          publisherId: publishers[0].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "Elden Ring",
          description: "RPG de acción desafiante en mundo abierto",
          price: 59.99,
          releaseDate: new Date("2022-02-25"),
          genres: ["RPG", "Acción"],
          developerId: developers[1].id,
          publisherId: publishers[4].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "The Elder Scrolls V: Skyrim",
          description: "Épico RPG de fantasía medieval en mundo abierto",
          price: 59.99,
          releaseDate: new Date("2011-11-11"),
          genres: ["RPG", "Fantasía"],
          developerId: developers[2].id,
          publisherId: publishers[1].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "Grand Theft Auto V",
          description: "Juego de acción y crimen en ciudad abierta",
          price: 69.99,
          releaseDate: new Date("2013-09-17"),
          genres: ["Acción", "Crimen"],
          developerId: developers[3].id,
          publisherId: publishers[4].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "The Last of Us",
          description:
            "Juego de acción y supervivencia en mundo post-apocalíptico",
          price: 59.99,
          releaseDate: new Date("2013-06-14"),
          genres: ["Acción", "Aventura"],
          developerId: developers[4].id,
          publisherId: publishers[0].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "Cyberpunk 2077",
          description: "RPG de acción en un futuro distópico",
          price: 59.99,
          releaseDate: new Date("2020-12-10"),
          genres: ["RPG", "Ciencia Ficción"],
          developerId: developers[5].id,
          publisherId: publishers[8].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "Spider-Man: Miles Morales",
          description: "Juego de superhéroes de acción en Nueva York",
          price: 49.99,
          releaseDate: new Date("2020-11-12"),
          genres: ["Acción", "Aventura"],
          developerId: developers[6].id,
          publisherId: publishers[0].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "Resident Evil 4",
          description: "Juego de horror de acción con tensión constante",
          price: 39.99,
          releaseDate: new Date("2023-03-24"),
          genres: ["Horror", "Acción"],
          developerId: developers[7].id,
          publisherId: publishers[8].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "Final Fantasy XVI",
          description: "RPG épico de fantasía con combate dinámico",
          price: 69.99,
          releaseDate: new Date("2023-06-22"),
          genres: ["RPG", "Fantasía"],
          developerId: developers[8].id,
          publisherId: publishers[0].id,
        },
      }),
      prisma.game.create({
        data: {
          title: "Assassin's Creed Mirage",
          description: "Juego de acción y sigilo en Bagdad medieval",
          price: 49.99,
          releaseDate: new Date("2023-10-05"),
          genres: ["Acción", "Sigilo"],
          developerId: developers[9].id,
          publisherId: publishers[7].id,
        },
      }),
    ]);

    // Crear 10 Users (solo usuarios regulares, los admins los crea seedAdmin.ts)
    console.log("  - Creando 10 Users regulares...");
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: "player1@gamesage.com",
          name: "Player One",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "player2@gamesage.com",
          name: "Player Two",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "gamer@gamesage.com",
          name: "Gamer Pro",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "collector@gamesage.com",
          name: "Game Collector",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "speedrunner@gamesage.com",
          name: "Speedrunner",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "casual@gamesage.com",
          name: "Casual Gamer",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "hardcore@gamesage.com",
          name: "Hardcore Fan",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "reviewer@gamesage.com",
          name: "Game Reviewer",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "streamer@gamesage.com",
          name: "Content Streamer",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
      prisma.user.create({
        data: {
          email: "developer@gamesage.com",
          name: "Game Developer",
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
        },
      }),
    ]);

    console.log("✅ Seed completado:");
    console.log(`   - ${developers.length} Developers creados`);
    console.log(`   - ${publishers.length} Publishers creados`);
    console.log(`   - ${games.length} Games creados`);
    console.log(`   - ${users.length} Users regulares creados`);
  } catch (err) {
    console.error("❌ Error durante el seed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedData().then(() => process.exit(0));
