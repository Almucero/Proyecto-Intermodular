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

    // Borrar datos existentes (excepto admins) y resetear secuencias
    await prisma.gameImage.deleteMany();
    await prisma.game.deleteMany();
    await prisma.developer.deleteMany();
    await prisma.publisher.deleteMany();
    await prisma.genre.deleteMany();
    await prisma.platform.deleteMany();
    await prisma.user.deleteMany({ where: { isAdmin: false } });

    // Resetear secuencias de autoincremento (PostgreSQL)
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
    await prisma.$executeRawUnsafe(
      'ALTER SEQUENCE "User_id_seq" RESTART WITH 1'
    );

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

    // Crear géneros y plataformas
    console.log("  - Creando Genres y Platforms...");
    const genreNames = [
      "Acción",
      "Aventura",
      "RPG",
      "Sigilo",
      "Fantasía",
      "Horror",
      "Ciencia Ficción",
      "Crimen",
    ];

    const platformNames = ["PC", "PS5", "Xbox Series X", "Switch"];

    const genres = await Promise.all(
      genreNames.map((name) => prisma.genre.create({ data: { name } }))
    );

    const platforms = await Promise.all(
      platformNames.map((name) => prisma.platform.create({ data: { name } }))
    );

    const genreByName = Object.fromEntries(genres.map((g) => [g.name, g]));
    const platformByName = Object.fromEntries(
      platforms.map((p) => [p.name, p])
    );

    // Crear 10 Games conectando géneros y platforms
    console.log("  - Creando 10 Games (con genres y platforms)...");
    const games = [] as any[];
    let imagesCreated = 0;

    const createGame = async (data: any) => {
      const created = await prisma.game.create({
        data: {
          title: data.title,
          description: data.description,
          price: data.price,
          salePrice: data.salePrice,
          isOnSale: data.isOnSale,
          isRefundable: data.isRefundable,
          releaseDate: data.releaseDate,
          developerId: data.developerId,
          publisherId: data.publisherId,
          genres: {
            connect: data.genres.map((n: string) => ({
              id: (genreByName[n] as any)?.id,
            })),
          },
          platforms: {
            connect: data.platforms.map((n: string) => ({
              id: (platformByName[n] as any)?.id,
            })),
          },
        },
      });
      // Add 5 images, first is cover
      const imageUrls = [
        data.coverUrl ?? "https://placehold.co/600x400?text=Portada",
        "https://placehold.co/600x400?text=Imagen+2",
        "https://placehold.co/600x400?text=Imagen+3",
        "https://placehold.co/600x400?text=Imagen+4",
        "https://placehold.co/600x400?text=Imagen+5",
      ];
      for (let i = 0; i < imageUrls.length; i++) {
        await prisma.gameImage.create({
          data: {
            gameId: created.id,
            url: imageUrls[i],
            altText:
              i === 0
                ? `${data.title} (Portada)`
                : `${data.title} Imagen ${i + 1}`,
          },
        });
        imagesCreated++;
      }
      return created;
    };

    games.push(
      await createGame({
        title: "Metal Gear Solid V",
        description: "Un juego de sigilo épico con mecánicas innovadoras",
        price: 49.99,
        platforms: ["PS5", "PC"],
        genres: ["Sigilo", "Acción"],
        developerId: developers[0].id,
        publisherId: publishers[0].id,
        releaseDate: new Date("2015-09-01"),
      })
    );
    games.push(
      await createGame({
        title: "Elden Ring",
        description: "RPG de acción desafiante en mundo abierto",
        price: 59.99,
        platforms: ["PC", "PS5"],
        genres: ["RPG", "Acción"],
        developerId: developers[1].id,
        publisherId: publishers[4].id,
        releaseDate: new Date("2022-02-25"),
      })
    );
    games.push(
      await createGame({
        title: "The Elder Scrolls V: Skyrim",
        description: "Épico RPG de fantasía medieval en mundo abierto",
        price: 59.99,
        platforms: ["PC"],
        genres: ["RPG", "Fantasía"],
        developerId: developers[2].id,
        publisherId: publishers[1].id,
        releaseDate: new Date("2011-11-11"),
      })
    );
    games.push(
      await createGame({
        title: "Grand Theft Auto V",
        description: "Juego de acción y crimen en ciudad abierta",
        price: 69.99,
        platforms: ["PC", "Xbox Series X"],
        genres: ["Acción", "Crimen"],
        developerId: developers[3].id,
        publisherId: publishers[4].id,
        releaseDate: new Date("2013-09-17"),
      })
    );
    games.push(
      await createGame({
        title: "The Last of Us",
        description:
          "Juego de acción y supervivencia en mundo post-apocalíptico",
        price: 59.99,
        platforms: ["PS5"],
        genres: ["Acción", "Aventura"],
        developerId: developers[4].id,
        publisherId: publishers[0].id,
        releaseDate: new Date("2013-06-14"),
      })
    );
    games.push(
      await createGame({
        title: "Cyberpunk 2077",
        description: "RPG de acción en un futuro distópico",
        price: 59.99,
        platforms: ["PC", "PS5"],
        genres: ["RPG", "Ciencia Ficción"],
        developerId: developers[5].id,
        publisherId: publishers[8].id,
        releaseDate: new Date("2020-12-10"),
      })
    );
    games.push(
      await createGame({
        title: "Spider-Man: Miles Morales",
        description: "Juego de superhéroes de acción en Nueva York",
        price: 49.99,
        platforms: ["PS5"],
        genres: ["Acción", "Aventura"],
        developerId: developers[6].id,
        publisherId: publishers[0].id,
        releaseDate: new Date("2020-11-12"),
      })
    );
    games.push(
      await createGame({
        title: "Resident Evil 4",
        description: "Juego de horror de acción con tensión constante",
        price: 39.99,
        platforms: ["PC", "PS5"],
        genres: ["Horror", "Acción"],
        developerId: developers[7].id,
        publisherId: publishers[8].id,
        releaseDate: new Date("2023-03-24"),
      })
    );
    games.push(
      await createGame({
        title: "Final Fantasy XVI",
        description: "RPG épico de fantasía con combate dinámico",
        price: 69.99,
        platforms: ["PS5"],
        genres: ["RPG", "Fantasía"],
        developerId: developers[8].id,
        publisherId: publishers[0].id,
        releaseDate: new Date("2023-06-22"),
      })
    );
    games.push(
      await createGame({
        title: "Assassin's Creed Mirage",
        description: "Juego de acción y sigilo en Bagdad medieval",
        price: 49.99,
        platforms: ["PC"],
        genres: ["Acción", "Sigilo"],
        developerId: developers[9].id,
        publisherId: publishers[7].id,
        releaseDate: new Date("2023-10-05"),
      })
    );

    // Crear 10 Users (solo usuarios regulares, los admins los crea seedAdmin.ts)
    console.log("  - Creando 10 Users regulares...");
    const users = await Promise.all([
      prisma.user.create({
        data: {
          email: "player1@gamesage.com",
          name: "Player One",
          surname: "Ramos",
          nickname: "PlayerOne",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 12.5,
          addressLine1: "Av. Central 123",
          addressLine2: "Piso 4",
          city: "Madrid",
          region: "Comunidad de Madrid",
          postalCode: "28013",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "player2@gamesage.com",
          name: "Player Two",
          surname: "Gómez",
          nickname: "PlayerTwo",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 5.0,
          addressLine1: "Calle Luna 7",
          addressLine2: "",
          city: "Sevilla",
          region: "Andalucía",
          postalCode: "41001",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "gamer@gamesage.com",
          name: "Gamer Pro",
          surname: "Vega",
          nickname: "GamerPro",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 42.0,
          addressLine1: "Plaza Mayor 1",
          addressLine2: "",
          city: "Barcelona",
          region: "Cataluña",
          postalCode: "08002",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "collector@gamesage.com",
          name: "Game Collector",
          surname: "López",
          nickname: "GameCollector",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 150.0,
          addressLine1: "Rambla 45",
          addressLine2: "Local 3",
          city: "Valencia",
          region: "Comunidad Valenciana",
          postalCode: "46001",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "speedrunner@gamesage.com",
          name: "Speedrunner",
          surname: "Martín",
          nickname: "Speedrunner",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 8.75,
          addressLine1: "C/ Carrera 12",
          addressLine2: "Apto 2B",
          city: "Bilbao",
          region: "País Vasco",
          postalCode: "48001",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "casual@gamesage.com",
          name: "Casual Gamer",
          surname: "Núñez",
          nickname: "CasualGamer",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 3.5,
          addressLine1: "Av. de la Constitución 9",
          addressLine2: "",
          city: "Málaga",
          region: "Andalucía",
          postalCode: "29001",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "hardcore@gamesage.com",
          name: "Hardcore Fan",
          surname: "Torres",
          nickname: "HardcoreFan",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 75.0,
          addressLine1: "Calle Fuego 3",
          addressLine2: "",
          city: "Zaragoza",
          region: "Aragón",
          postalCode: "50001",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "reviewer@gamesage.com",
          name: "Game Reviewer",
          surname: "Silva",
          nickname: "GameReviewer",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 20.0,
          addressLine1: "C/ del Libro 5",
          addressLine2: "",
          city: "A Coruña",
          region: "Galicia",
          postalCode: "15001",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "streamer@gamesage.com",
          name: "Content Streamer",
          surname: "Pérez",
          nickname: "ContentStreamer",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 60.0,
          addressLine1: "Ronda Norte 22",
          addressLine2: "",
          city: "Murcia",
          region: "Región de Murcia",
          postalCode: "30001",
          country: "España",
        },
      }),
      prisma.user.create({
        data: {
          email: "developer@gamesage.com",
          name: "Game Developer",
          surname: "Morales",
          nickname: "GameDeveloper",
          accountAt: new Date().toISOString(),
          passwordHash: await bcrypt.hash("Password123!", saltRounds),
          isAdmin: false,
          balance: 200.0,
          addressLine1: "Polígono Industrial, Nave 8",
          addressLine2: "",
          city: "Valladolid",
          region: "Castilla y León",
          postalCode: "47001",
          country: "España",
        },
      }),
    ]);

    console.log("✅ Seed completado:");
    console.log(`   - ${developers.length} Developers creados`);
    console.log(`   - ${publishers.length} Publishers creados`);
    console.log(`   - ${genres.length} Géneros creados`);
    console.log(`   - ${platforms.length} Plataformas creadas`);
    console.log(`   - ${games.length} Games creados`);
    console.log(`   - ${imagesCreated} GameImages creadas`);
    console.log(`   - ${users.length} Users regulares creados`);
  } catch (err) {
    console.error("❌ Error durante el seed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedData().then(() => process.exit(0));
