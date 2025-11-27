import "dotenv/config";
import { prisma } from "../config/db.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_BASE_PATH = path.join(__dirname, "../../media");
const GAME_IMAGES_PATH = path.join(MEDIA_BASE_PATH, "gameImages");
const USER_IMAGES_PATH = path.join(MEDIA_BASE_PATH, "userImages");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

/**
 * Función que sanitiza un nombre de carpeta
 * @param name Nombre de la carpeta
 * @returns Nombre sanitizado
 */
function sanitizeFolderName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Sube todas las imágenes de todos los juegos y usuarios de una sola vez
 * Busca en la base de datos todos los juegos y usuarios, y sube sus imágenes
 * desde las carpetas locales configuradas. Solo acepta archivos .webp
 * @returns Objeto con conteos de imágenes subidas
 */
async function uploadAllMedia() {
  console.log("  - Subiendo media desde carpetas locales...");

  const allGames = await prisma.game.findMany({
    select: { id: true, title: true },
  });

  let totalGameImages = 0;

  for (const game of allGames) {
    const sanitizedName = sanitizeFolderName(game.title);

    let folderName = game.title;
    let gameFolderPath = path.join(GAME_IMAGES_PATH, folderName);

    if (!fs.existsSync(gameFolderPath)) {
      const nameWithHyphen = game.title.replace(/: /g, " - ");
      const pathWithHyphen = path.join(GAME_IMAGES_PATH, nameWithHyphen);

      if (fs.existsSync(pathWithHyphen)) {
        folderName = nameWithHyphen;
        gameFolderPath = pathWithHyphen;
      } else {
        const nameClean = game.title
          .replace(/[()]/g, "")
          .trim()
          .replace(/\s+/g, " ");
        const pathClean = path.join(GAME_IMAGES_PATH, nameClean);

        if (fs.existsSync(pathClean)) {
          folderName = nameClean;
          gameFolderPath = pathClean;
        } else {
          const nameColonHyphen = game.title.replace(/:/g, " -");
          const pathColonHyphen = path.join(GAME_IMAGES_PATH, nameColonHyphen);
          if (fs.existsSync(pathColonHyphen)) {
            folderName = nameColonHyphen;
            gameFolderPath = pathColonHyphen;
          }
        }
      }
    }

    if (!fs.existsSync(gameFolderPath)) {
      console.warn(
        `⚠️ Carpeta no encontrada para: "${game.title}" (intentado: "${folderName}")`
      );
      continue;
    }

    const imageFiles = fs
      .readdirSync(gameFolderPath)
      .filter((file) => /\.(jpg|jpeg|jfif|png|gif|webp)$/i.test(file));

    if (imageFiles.length === 0) continue;

    for (const file of imageFiles) {
      if (!/\.webp$/i.test(file)) {
        console.error(
          `❌ Error: ${file} no es .webp en la carpeta de "${game.title}". Solo se aceptan archivos .webp en el seed.`
        );
        continue;
      }

      const filePath = path.join(gameFolderPath, file);
      try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: `gameImages/${sanitizedName}`,
          resource_type: "auto",
        });

        await prisma.media.create({
          data: {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            resourceType: uploadResult.resource_type,
            bytes: uploadResult.bytes,
            width: uploadResult.width ?? null,
            height: uploadResult.height ?? null,
            originalName: file,
            folder: `gameImages/${sanitizedName}`,
            altText: `${game.title} - ${file}`,
            gameId: game.id,
          },
        });

        totalGameImages++;
      } catch (error) {
        console.error(`❌ Error subiendo ${file} para ${game.title}:`, error);
      }
    }
  }

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, accountAt: true },
  });

  let totalUserAvatars = 0;

  for (const user of allUsers) {
    const sanitizedName = user.accountAt || sanitizeFolderName(user.name);
    const folderNameToLookup = user.accountAt || user.name;
    const userFolderPath = path.join(USER_IMAGES_PATH, folderNameToLookup);

    if (!fs.existsSync(userFolderPath)) continue;

    const imageFiles = fs
      .readdirSync(userFolderPath)
      .filter((file) => /\.(jpg|jpeg|jfif|png|gif|webp)$/i.test(file));

    if (imageFiles.length === 0) continue;

    const file = imageFiles[0];
    if (!file) continue;

    if (!/\.webp$/i.test(file)) {
      console.error(
        `❌ Error: ${file} no es .webp en la carpeta de "${user.name}". Solo se aceptan archivos .webp en el seed.`
      );
      continue;
    }

    const filePath = path.join(userFolderPath, file);

    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: `userImages/${sanitizedName}`,
        resource_type: "auto",
      });

      await prisma.media.create({
        data: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          resourceType: uploadResult.resource_type,
          bytes: uploadResult.bytes,
          width: uploadResult.width ?? null,
          height: uploadResult.height ?? null,
          originalName: file,
          folder: `userImages/${sanitizedName}`,
          altText: `${user.name} avatar`,
          userId: user.id,
        },
      });

      totalUserAvatars++;
    } catch (error) {
      console.error(`❌ Error subiendo avatar para ${user.name}:`, error);
    }
  }

  return {
    gameImages: totalGameImages,
    userAvatars: totalUserAvatars,
  };
}

/**
 * Función que semilla los datos iniciales en la base de datos
 * @returns Objeto con conteos de datos semillados
 */
async function seedData() {
  try {
    console.log("🌱 Iniciando seed de datos...");

    const platformNames = [
      "PC",
      "PS5",
      "Xbox Series X",
      "Switch",
      "PS4",
      "Xbox One",
    ];
    console.log("  - Creando plataformas...");
    const platforms = await Promise.all(
      platformNames.map((name) => prisma.platform.create({ data: { name } }))
    );
    const platformByName = Object.fromEntries(
      platforms.map((p) => [p.name, p])
    );

    const genreNames = [
      "Accion",
      "Aventura",
      "RPG",
      "Deportes",
      "Estrategia",
      "Simulacion",
      "Terror",
      "Carreras",
    ];
    console.log("  - Creando géneros...");
    const genres = await Promise.all(
      genreNames.map((name) => prisma.genre.create({ data: { name } }))
    );
    const genreByName = Object.fromEntries(genres.map((g) => [g.name, g]));

    const developerNames = [
      "Kojima Productions",
      "FromSoftware",
      "Bethesda Game Studios",
      "Rockstar Games",
      "Naughty Dog",
      "CD Projekt Red",
      "Insomniac Games",
      "Capcom",
      "Square Enix",
      "Ubisoft",
      "PlatinumGames",
      "id Software",
      "Sucker Punch Productions",
      "Remedy Entertainment",
      "Annapurna Interactive",
      "Larian Studios",
      "Firaxis Games",
      "Paradox Interactive",
      "Creative Assembly",
      "Asobo Studio",
      "EA Sports",
      "Codemasters",
      "Playground Games",
      "Polyphony Digital",
      "Frontier Developments",
      "SCS Software",
      "Hello Games",
      "Frictional Games",
      "Bloober Team",
      "Kunos Simulazioni",
      "Psyonix",
      "Sports Interactive",
      "Turn 10 Studios",
      "Ghost Games",
    ];
    const publisherNames = [
      "Sony Interactive Entertainment",
      "Microsoft Studios",
      "Nintendo",
      "Bandai Namco",
      "Take-Two Interactive",
      "Electronic Arts",
      "Ubisoft",
      "SEGA",
      "Capcom",
      "Square Enix",
      "Activision",
      "CD Projekt",
      "Annapurna Interactive",
      "Paradox Interactive",
      "2K Games",
      "Valve",
      "Bethesda Softworks",
      "Konami",
      "Psyonix",
      "EA Sports",
    ];

    console.log("  - Creando developers...");
    const developers = await Promise.all(
      developerNames.map((n) => prisma.developer.create({ data: { name: n } }))
    );
    console.log("  - Creando publishers...");
    const publishers = await Promise.all(
      publisherNames.map((n) => prisma.publisher.create({ data: { name: n } }))
    );

    const devByName = Object.fromEntries(developers.map((d) => [d.name, d]));
    const pubByName = Object.fromEntries(publishers.map((p) => [p.name, p]));

    const gamesData = [
      // ----- ACCION (10) -----
      {
        title: "God of War Ragnarök",
        description: "Acción épica y narrativa basada en mitología nórdica.",
        price: 69.99,
        isOnSale: false,
        salePrice: 41.99,
        isRefundable: true,
        releaseDate: new Date("2022-11-09"),
        developer: "Sucker Punch Productions",
        publisher: "Sony Interactive Entertainment",
        genres: ["Accion"],
        platforms: ["PS5"],
        rating: 4.8,
        numberOfSales: 850000,
        stock: 100,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Marvel's Spider-Man 2",
        description: "Acción y parkour con combate dinámico en NYC.",
        price: 69.99,
        isOnSale: true,
        salePrice: 49.99,
        isRefundable: true,
        releaseDate: new Date("2023-10-20"),
        developer: "Insomniac Games",
        publisher: "Sony Interactive Entertainment",
        genres: ["Accion"],
        platforms: ["PS5"],
        rating: 4.6,
        numberOfSales: 500000,
        stock: 80,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Devil May Cry 5",
        description: "Hack'n'slash estilizado con combates vertiginosos.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2019-03-08"),
        developer: "Capcom",
        publisher: "Capcom",
        genres: ["Accion"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.4,
        numberOfSales: 420000,
        stock: 23,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Doom Eternal",
        description: "FPS de acción frenética contra hordas demoníacas.",
        price: 49.99,
        isOnSale: true,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2020-03-20"),
        developer: "id Software",
        publisher: "Bethesda Softworks",
        genres: ["Accion"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 4.5,
        numberOfSales: 610000,
        stock: 65,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Uncharted 4: A Thief's End",
        description:
          "Aventura-acción cinematográfica con toques de plataformas.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2016-05-10"),
        developer: "Naughty Dog",
        publisher: "Sony Interactive Entertainment",
        genres: ["Accion"],
        platforms: ["PS4", "PS5"],
        rating: 4.7,
        numberOfSales: 720000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Ghost of Tsushima",
        description: "Acción samurái con mundo abierto y combate con katana.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2020-07-17"),
        developer: "Sucker Punch Productions",
        publisher: "Sony Interactive Entertainment",
        genres: ["Accion"],
        platforms: ["PS4", "PS5"],
        rating: 4.6,
        numberOfSales: 540000,
        stock: 123,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Metal Gear Solid V: The Phantom Pain",
        description: "Acción y sigilo en mundo abierto con base militar.",
        price: 19.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2015-09-01"),
        developer: "Kojima Productions",
        publisher: "Konami",
        genres: ["Accion"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.3,
        numberOfSales: 380000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Batman: Arkham Knight",
        description:
          "Acción y combate cuerpo a cuerpo con gadgets del murciélago.",
        price: 24.99,
        isOnSale: false,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2015-06-23"),
        developer: "Rocksteady Studios",
        publisher: "Warner Bros. Interactive Entertainment",
        genres: ["Accion"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.2,
        numberOfSales: 310000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Control",
        description:
          "Acción sobrenatural en un entorno misterioso y destructible.",
        price: 39.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2019-08-27"),
        developer: "Remedy Entertainment",
        publisher: "505 Games",
        genres: ["Accion"],
        platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 220000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Assassin's Creed Valhalla",
        description: "Acción y exploración vikinga con árbol de habilidades.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2020-11-10"),
        developer: "Ubisoft",
        publisher: "Ubisoft",
        genres: ["Accion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 680000,
        stock: 456,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },

      // ----- Aventura (10) -----
      {
        title: "The Last of Us Part II",
        description: "Aventura narrativa y supervivencia emocional.",
        price: 59.99,
        isOnSale: true,
        salePrice: 34.99,
        isRefundable: true,
        releaseDate: new Date("2020-06-19"),
        developer: "Naughty Dog",
        publisher: "Sony Interactive Entertainment",
        genres: ["Aventura"],
        platforms: ["PS4", "PS5"],
        rating: 4.9,
        numberOfSales: 980000,
        stock: 0,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Red Dead Redemption 2",
        description: "Aventura western con mundo abierto y narrativa profunda.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2018-10-26"),
        developer: "Rockstar Games",
        publisher: "Rockstar Games",
        genres: ["Aventura"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.9,
        numberOfSales: 1200000,
        stock: 0,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Life Is Strange",
        description: "Aventura episódica centrada en narrativa y decisiones.",
        price: 14.99,
        isOnSale: true,
        salePrice: 6.99,
        isRefundable: true,
        releaseDate: new Date("2015-01-30"),
        developer: "Dontnod Entertainment",
        publisher: "Square Enix",
        genres: ["Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.1,
        numberOfSales: 240000,
        stock: 78,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "The Legend of Zelda: Breath of the Wild",
        description: "Aventura abierta con exploración y puzzles en Hyrule.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2017-03-03"),
        developer: "Nintendo EPD",
        publisher: "Nintendo",
        genres: ["Aventura"],
        platforms: ["Switch"],
        rating: 5.0,
        numberOfSales: 1500000,
        stock: 234,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Tomb Raider (2013)",
        description: "Reboot de Aventura y exploración arqueológica.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2013-03-05"),
        developer: "Crystal Dynamics",
        publisher: "Square Enix",
        genres: ["Aventura"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.0,
        numberOfSales: 320000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Uncharted: The Lost Legacy",
        description: "Aventura-acción independiente con exploración y puzles.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2017-08-22"),
        developer: "Naughty Dog",
        publisher: "Sony Interactive Entertainment",
        genres: ["Aventura"],
        platforms: ["PS4", "PS5"],
        rating: 4.3,
        numberOfSales: 260000,
        stock: 5,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Firewatch",
        description:
          "Aventura narrativa en primera persona ambientada en un bosque.",
        price: 9.99,
        isOnSale: true,
        salePrice: 3.99,
        isRefundable: true,
        releaseDate: new Date("2016-02-09"),
        developer: "Campo Santo",
        publisher: "Annapurna Interactive",
        genres: ["Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.2,
        numberOfSales: 145000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Outer Wilds",
        description: "Aventura espacial de exploración y descubrimiento.",
        price: 24.99,
        isOnSale: false,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2019-05-28"),
        developer: "Mobius Digital",
        publisher: "Annapurna Interactive",
        genres: ["Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.7,
        numberOfSales: 180000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "The Walking Dead: Season One",
        description: "Aventura episódica centrada en decisiones emocionales.",
        price: 14.99,
        isOnSale: true,
        salePrice: 7.99,
        isRefundable: true,
        releaseDate: new Date("2012-04-24"),
        developer: "Telltale Games",
        publisher: "Skybound Games",
        genres: ["Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.1,
        numberOfSales: 290000,
        stock: 25,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Control (Deluxe Edition)",
        description: "Aventura sobrenatural con narrativa surrealista.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2019-08-27"),
        developer: "Remedy Entertainment",
        publisher: "505 Games",
        genres: ["Aventura"],
        platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 200000,
        stock: 456,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },

      // ----- RPG (10) -----
      {
        title: "Elden Ring",
        description: "RPG de acción en mundo abierto creado por FromSoftware.",
        price: 59.99,
        isOnSale: true,
        salePrice: 39.99,
        isRefundable: true,
        releaseDate: new Date("2022-02-25"),
        developer: "FromSoftware",
        publisher: "Bandai Namco",
        genres: ["RPG"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 4.9,
        numberOfSales: 1400000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "The Witcher 3: Wild Hunt",
        description: "RPG narrativo con mundo abierto y decisiones profundas.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2015-05-19"),
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        genres: ["RPG"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.9,
        numberOfSales: 1300000,
        stock: 0,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Final Fantasy XVI",
        description: "RPG épico con combate en tiempo real y relato dramático.",
        price: 69.99,
        isOnSale: false,
        salePrice: 41.99,
        isRefundable: true,
        releaseDate: new Date("2023-06-22"),
        developer: "Square Enix",
        publisher: "Square Enix",
        genres: ["RPG"],
        platforms: ["PS5"],
        rating: 4.2,
        numberOfSales: 240000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "The Elder Scrolls V: Skyrim",
        description: "RPG de fantasía enorme y sistema de progresión abierto.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2011-11-11"),
        developer: "Bethesda Game Studios",
        publisher: "Bethesda Softworks",
        genres: ["RPG"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.8,
        numberOfSales: 1600000,
        stock: 876,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Persona 5 Royal",
        description: "RPG japonés centrado en turnos, estilo y narrativa.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2020-03-31"),
        developer: "Atlus",
        publisher: "SEGA",
        genres: ["RPG"],
        platforms: ["PS4", "PS5", "Switch", "PC"],
        rating: 4.7,
        numberOfSales: 420000,
        stock: 54,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Divinity: Original Sin 2",
        description: "RPG táctico con profunda interacción ambiental.",
        price: 44.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2017-09-14"),
        developer: "Larian Studios",
        publisher: "Larian Studios",
        genres: ["RPG"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.8,
        numberOfSales: 380000,
        stock: 90,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Mass Effect Legendary Edition",
        description: "Trilogía remasterizada de RPGs de ciencia ficción.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2021-05-14"),
        developer: "BioWare",
        publisher: "Electronic Arts",
        genres: ["RPG"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.5,
        numberOfSales: 300000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Dragon Age: Inquisition",
        description: "RPG con decisiones políticas y grandes batallas.",
        price: 19.99,
        isOnSale: true,
        salePrice: 7.99,
        isRefundable: true,
        releaseDate: new Date("2014-11-18"),
        developer: "BioWare",
        publisher: "Electronic Arts",
        genres: ["RPG"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.1,
        numberOfSales: 350000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Cyberpunk 2077",
        description: "RPG futurista con mundo abierto y narrativa adulta.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2020-12-10"),
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        genres: ["RPG"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 3.8,
        numberOfSales: 1100000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Pillars of Eternity II: Deadfire",
        description:
          "RPG isométrico con narrativa profunda y party-based combat.",
        price: 34.99,
        isOnSale: true,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2018-05-08"),
        developer: "Obsidian Entertainment",
        publisher: "Paradox Interactive",
        genres: ["RPG"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.4,
        numberOfSales: 95000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },

      // ----- Deportes (10) -----
      {
        title: "FIFA 23",
        description:
          "Simulación de fútbol con modos online y clubes licenciados.",
        price: 59.99,
        isOnSale: true,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2022-09-27"),
        developer: "EA Sports",
        publisher: "Electronic Arts",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.7,
        numberOfSales: 2000000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "NBA 2K23",
        description:
          "Simulación de baloncesto con énfasis en carrera y MyTeam.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2022-09-09"),
        developer: "Visual Concepts",
        publisher: "2K Games",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 850000,
        stock: 1200,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Madden NFL 23",
        description:
          "Simulación de fútbol americano con modos carrera y online.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2022-08-19"),
        developer: "EA Tiburon",
        publisher: "Electronic Arts",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.5,
        numberOfSales: 420000,
        stock: 873,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "F1 23",
        description: "Simulación de Fórmula 1 con físicas y gestión de equipo.",
        price: 59.99,
        isOnSale: true,
        salePrice: 39.99,
        isRefundable: true,
        releaseDate: new Date("2023-06-16"),
        developer: "Codemasters",
        publisher: "Electronic Arts",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 4.2,
        numberOfSales: 260000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Rocket League",
        description: "Deporte con coches: fútbol vehicular competitivo.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2015-07-07"),
        developer: "Psyonix",
        publisher: "Psyonix",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "Switch", "PS4", "Xbox One"],
        rating: 4.3,
        numberOfSales: 900000,
        stock: 3,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Tony Hawk's Pro Skater 1 + 2",
        description: "Skateboarding arcade con tablas y combos extremos.",
        price: 39.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2020-09-04"),
        developer: "Vicarious Visions",
        publisher: "Activision",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 4.1,
        numberOfSales: 310000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Football Manager 2023",
        description: "Gestión futbolística profunda y simulación de club.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2022-11-08"),
        developer: "Sports Interactive",
        publisher: "SEGA",
        genres: ["Deportes"],
        platforms: ["PC"],
        rating: 4.6,
        numberOfSales: 450000,
        stock: 65,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "eFootball 2023",
        description: "Simulador de fútbol free-to-play de Konami.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2021-09-30"),
        developer: "Konami",
        publisher: "Konami",
        genres: ["Deportes"],
        platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X"],
        rating: 2.8,
        numberOfSales: 150000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "PGA Tour 2K23",
        description: "Simulación de golf con licencias del PGA Tour.",
        price: 49.99,
        isOnSale: true,
        salePrice: 24.99,
        isRefundable: true,
        releaseDate: new Date("2022-10-14"),
        developer: "HB Studios",
        publisher: "2K Games",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 95000,
        stock: 78,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "MotoGP 23",
        description: "Simulación de motos con físicas realistas.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2023-04-06"),
        developer: "Milestone",
        publisher: "Milestone",
        genres: ["Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.8,
        numberOfSales: 60000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },

      // ----- Estrategia (10) -----
      {
        title: "Civilization VI",
        description:
          "Estrategia por turnos: construcción y gestión de imperios.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2016-10-21"),
        developer: "Firaxis Games",
        publisher: "2K Games",
        genres: ["Estrategia"],
        platforms: ["PC", "Switch", "PS4", "Xbox One"],
        rating: 4.4,
        numberOfSales: 780000,
        stock: 65,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "XCOM 2",
        description: "Estrategia táctica contra invasión alienígena.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2016-02-05"),
        developer: "Firaxis Games",
        publisher: "2K Games",
        genres: ["Estrategia"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.2,
        numberOfSales: 420000,
        stock: 556,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Age of Empires IV",
        description: "Estrategia en tiempo real con civilizaciones históricas.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2021-10-28"),
        developer: "Relic Entertainment",
        publisher: "Microsoft Studios",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 3.9,
        numberOfSales: 200000,
        stock: 223,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Total War: WARHAMMER II",
        description: "Gran Estrategia y batallas en tiempo real con facciones.",
        price: 39.99,
        isOnSale: true,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2017-09-28"),
        developer: "Creative Assembly",
        publisher: "SEGA",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 4.3,
        numberOfSales: 350000,
        stock: 654,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Stellaris",
        description:
          "Estrategia espacial de gran escala y exploración galáctica.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2016-05-09"),
        developer: "Paradox Interactive",
        publisher: "Paradox Interactive",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 4.1,
        numberOfSales: 260000,
        stock: 234,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Crusader Kings III",
        description: "Estrategia grandiosa centrada en dinastías y política.",
        price: 49.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2020-09-01"),
        developer: "Paradox Development Studio",
        publisher: "Paradox Interactive",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 4.5,
        numberOfSales: 220000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Company of Heroes 2",
        description: "Estrategia táctica en la Segunda Guerra Mundial.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2013-06-25"),
        developer: "Relic Entertainment",
        publisher: "SEGA",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 4.0,
        numberOfSales: 180000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Anno 1800",
        description:
          "Estrategia y construcción de ciudades en la era industrial.",
        price: 39.99,
        isOnSale: true,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2019-04-16"),
        developer: "Blue Byte",
        publisher: "Ubisoft",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 4.1,
        numberOfSales: 210000,
        stock: 5,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "StarCraft II",
        description: "Estrategia en tiempo real con tres razas competitivas.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2010-07-27"),
        developer: "Blizzard Entertainment",
        publisher: "Blizzard Entertainment",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 4.2,
        numberOfSales: 950000,
        stock: 10,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Warcraft III: Reforged",
        description: "Remasterización de un clásico de Estrategia y narrativa.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2020-01-28"),
        developer: "Blizzard Entertainment",
        publisher: "Blizzard Entertainment",
        genres: ["Estrategia"],
        platforms: ["PC"],
        rating: 2.9,
        numberOfSales: 120000,
        stock: 23,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },

      // ----- Simulacion (10) -----
      {
        title: "Microsoft Flight Simulator",
        description: "Simulador de vuelo con recreación real del planeta.",
        price: 59.99,
        isOnSale: true,
        salePrice: 39.99,
        isRefundable: true,
        releaseDate: new Date("2020-08-18"),
        developer: "Asobo Studio",
        publisher: "Xbox Game Studios",
        genres: ["Simulacion"],
        platforms: ["PC", "Xbox Series X"],
        rating: 4.7,
        numberOfSales: 480000,
        stock: 0,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "The Sims 4",
        description: "Simulación de vida con creación de personajes y hogares.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2014-09-02"),
        developer: "Maxis",
        publisher: "Electronic Arts",
        genres: ["Simulacion"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.0,
        numberOfSales: 1100000,
        stock: 298,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Euro Truck Simulator 2",
        description: "Simulación de conducción de camiones por Europa.",
        price: 9.99,
        isOnSale: true,
        salePrice: 3.99,
        isRefundable: true,
        releaseDate: new Date("2012-10-19"),
        developer: "SCS Software",
        publisher: "SCS Software",
        genres: ["Simulacion"],
        platforms: ["PC"],
        rating: 4.3,
        numberOfSales: 650000,
        stock: 234,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Cities: Skylines",
        description:
          "Simulación y construcción de ciudades con detalle urbano.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2015-03-10"),
        developer: "Colossal Order",
        publisher: "Paradox Interactive",
        genres: ["Simulacion"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.5,
        numberOfSales: 420000,
        stock: 345,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Kerbal Space Program",
        description:
          "Simulación espacial con física realista y construcción de cohetes.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2015-04-27"),
        developer: "Squad",
        publisher: "Private Division",
        genres: ["Simulacion"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.4,
        numberOfSales: 200000,
        stock: 231,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Assetto Corsa",
        description:
          "Simulación de conducción con enfoque en físicas realistas.",
        price: 19.99,
        isOnSale: true,
        salePrice: 7.99,
        isRefundable: true,
        releaseDate: new Date("2014-12-19"),
        developer: "Kunos Simulazioni",
        publisher: "505 Games",
        genres: ["Simulacion"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.2,
        numberOfSales: 175000,
        stock: 6,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Farming Simulator 22",
        description: "Simulación agrícola con maquinaria y economía de granja.",
        price: 34.99,
        isOnSale: false,
        salePrice: 20.99,
        isRefundable: true,
        releaseDate: new Date("2021-11-22"),
        developer: "Giants Software",
        publisher: "Focus Home Interactive",
        genres: ["Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.8,
        numberOfSales: 90000,
        stock: 876,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Planet Coaster",
        description: "Simulación y construcción de parques de atracciones.",
        price: 29.99,
        isOnSale: true,
        salePrice: 12.99,
        isRefundable: true,
        releaseDate: new Date("2016-11-17"),
        developer: "Frontier Developments",
        publisher: "Frontier Developments",
        genres: ["Simulacion"],
        platforms: ["PC"],
        rating: 4.1,
        numberOfSales: 160000,
        stock: 1233,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "No Man's Sky",
        description:
          "Simulación espacial exploratoria con actualizaciones constantes.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2016-08-09"),
        developer: "Hello Games",
        publisher: "Hello Games",
        genres: ["Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 4.0,
        numberOfSales: 750000,
        stock: 123,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Ship Simulator Extremes",
        description: "Simulación marítima y de navegación.",
        price: 14.99,
        isOnSale: true,
        salePrice: 4.99,
        isRefundable: true,
        releaseDate: new Date("2009-10-30"),
        developer: "VSTEP",
        publisher: "Paradox Interactive",
        genres: ["Simulacion"],
        platforms: ["PC"],
        rating: 3.6,
        numberOfSales: 12000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },

      // ----- Terror (10) -----
      {
        title: "Resident Evil 4 (Remake)",
        description: "Survival horror con tensión, puzzles y acción.",
        price: 39.99,
        isOnSale: true,
        salePrice: 24.99,
        isRefundable: true,
        releaseDate: new Date("2023-03-24"),
        developer: "Capcom",
        publisher: "Capcom",
        genres: ["Terror"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 4.5,
        numberOfSales: 540000,
        stock: 45,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Amnesia: The Dark Descent",
        description:
          "Horror atmosférico centrado en sigilo y miedo psicológico.",
        price: 9.99,
        isOnSale: false,
        salePrice: 5.99,
        isRefundable: true,
        releaseDate: new Date("2010-09-08"),
        developer: "Frictional Games",
        publisher: "Frictional Games",
        genres: ["Terror"],
        platforms: ["PC"],
        rating: 4.2,
        numberOfSales: 220000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Outlast",
        description:
          "Survival horror en primera persona con cámara como herramienta.",
        price: 14.99,
        isOnSale: true,
        salePrice: 4.99,
        isRefundable: true,
        releaseDate: new Date("2013-09-04"),
        developer: "Red Barrels",
        publisher: "Red Barrels",
        genres: ["Terror"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.0,
        numberOfSales: 310000,
        stock: 56,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Alien: Isolation",
        description: "Horror de supervivencia ambientado en el universo Alien.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2014-10-07"),
        developer: "Creative Assembly",
        publisher: "SEGA",
        genres: ["Terror"],
        platforms: ["PC", "PS4", "Xbox One", "PS3", "Xbox 360"],
        rating: 4.4,
        numberOfSales: 290000,
        stock: 23,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "The Evil Within",
        description: "Horror psicológico con combates intensos.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2014-10-14"),
        developer: "Tango Gameworks",
        publisher: "Bethesda Softworks",
        genres: ["Terror"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 140000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Until Dawn",
        description:
          "Horror cinematográfico con ramas narrativas y decisiones.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2015-08-25"),
        developer: "Supermassive Games",
        publisher: "Sony Interactive Entertainment",
        genres: ["Terror"],
        platforms: ["PS4", "PS5"],
        rating: 4.1,
        numberOfSales: 170000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Silent Hill 2 Remake",
        description: "Clásico del horror psicológico — remaster hipotético.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2001-09-24"),
        developer: "Konami",
        publisher: "Konami",
        genres: ["Terror"],
        platforms: ["PS2", "PS3", "PS4"],
        rating: 4.8,
        numberOfSales: 520000,
        stock: 90,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Layers of Fear",
        description: "Horror psicológico centrado en el artista perturbado.",
        price: 14.99,
        isOnSale: true,
        salePrice: 6.99,
        isRefundable: true,
        releaseDate: new Date("2016-02-16"),
        developer: "Bloober Team",
        publisher: "Bloober Team",
        genres: ["Terror"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 3.7,
        numberOfSales: 75000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Dead Space (Remake)",
        description: "Survival horror espacial con atmósfera opresiva.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2023-01-27"),
        developer: "Motive Studio",
        publisher: "Electronic Arts",
        genres: ["Terror"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 160000,
        stock: 657,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Phasmophobia",
        description: "Horror cooperativo centrado en caza de fantasmas.",
        price: 12.99,
        isOnSale: true,
        salePrice: 4.99,
        isRefundable: true,
        releaseDate: new Date("2020-09-18"),
        developer: "Kinetic Games",
        publisher: "Kinetic Games",
        genres: ["Terror"],
        platforms: ["PC"],
        rating: 4.2,
        numberOfSales: 230000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },

      // ----- Carreras (10) -----
      {
        title: "Forza Horizon 5",
        description: "Arcade-racing en mundo abierto con desafíos y eventos.",
        price: 59.99,
        isOnSale: true,
        salePrice: 34.99,
        isRefundable: true,
        releaseDate: new Date("2021-11-09"),
        developer: "Playground Games",
        publisher: "Microsoft Studios",
        genres: ["Carreras"],
        platforms: ["PC", "Xbox Series X", "Xbox One"],
        rating: 4.6,
        numberOfSales: 820000,
        stock: 54,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Gran Turismo 7",
        description:
          "Simulador de conducción con atención al detalle y físicas.",
        price: 69.99,
        isOnSale: false,
        salePrice: 41.99,
        isRefundable: true,
        releaseDate: new Date("2022-03-04"),
        developer: "Polyphony Digital",
        publisher: "Sony Interactive Entertainment",
        genres: ["Carreras"],
        platforms: ["PS5", "PS4"],
        rating: 4.0,
        numberOfSales: 300000,
        stock: 123,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Need for Speed Unbound",
        description:
          "Juego de carreras de acción con personalización de coches, circuitos urbanos y persecuciones llenas de adrenalina.",
        price: 59.99,
        isOnSale: true,
        salePrice: 39.99,
        isRefundable: true,
        releaseDate: new Date("2023-12-01"),
        developer: "Criterion Games",
        publisher: "Electronic Arts",
        genres: ["Carreras"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 4.2,
        numberOfSales: 95000,
        stock: 1500,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Need for Speed Heat",
        description: "Carreras callejeras y personalización de coches.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2019-11-08"),
        developer: "Ghost Games",
        publisher: "Electronic Arts",
        genres: ["Carreras"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 3.6,
        numberOfSales: 220000,
        stock: 98,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Dirt 5",
        description:
          "Carreras off-road con énfasis en espectáculo y multijugador.",
        price: 39.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2020-11-06"),
        developer: "Codemasters",
        publisher: "Codemasters",
        genres: ["Carreras"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 90000,
        stock: 100,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Burnout Paradise Remastered",
        description: "Arcade racing con choques masivos y eventos urbanos.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2018-03-16"),
        developer: "Criterion Games",
        publisher: "Electronic Arts",
        genres: ["Carreras"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.2,
        numberOfSales: 210000,
        stock: 10,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Project CARS 3",
        description: "Simcade con amplio roster de coches y pistas.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2020-08-28"),
        developer: "Slightly Mad Studios",
        publisher: "Bandai Namco",
        genres: ["Carreras"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 3.4,
        numberOfSales: 45000,
        stock: 89,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Assetto Corsa Competizione",
        description: "Simulación GT con físicas de competición y licencia SRO.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2019-05-29"),
        developer: "Kunos Simulazioni",
        publisher: "505 Games",
        genres: ["Carreras"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 4.1,
        numberOfSales: 125000,
        stock: 534,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "Trackmania",
        description:
          "Arcade racing centrado en tiempos y pistas creadas por la comunidad.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2020-07-01"),
        developer: "Nadeo",
        publisher: "Ubisoft",
        genres: ["Carreras"],
        platforms: ["PC"],
        rating: 3.8,
        numberOfSales: 90000,
        stock: 768,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
      {
        title: "MotoGP 23 (Racing)",
        description: "Simulación de MotoGP con físicas y temporadas oficiales.",
        price: 49.99,
        isOnSale: true,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2023-04-06"),
        developer: "Milestone",
        publisher: "Milestone",
        genres: ["Carreras"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.7,
        numberOfSales: 47000,
        stock: 456,
        videoUrl: "https://www.youtube.com/watch?v=nugrbr8dvvk",
      },
    ];

    /**
     * Función que crea un juego en la base de datos
     * @param g Objeto con los datos del juego
     * @returns Objeto con los datos del juego creado
     */
    const createGame = async (g: {
      title: string;
      description: string;
      price: number;
      isOnSale: boolean;
      salePrice: number;
      isRefundable: boolean;
      releaseDate: Date;
      developer: string;
      publisher: string;
      genres: string[];
      platforms: string[];
      rating: number;
      numberOfSales: number;
      stock: number;
      videoUrl: string;
    }) => {
      let dev = devByName[g.developer];
      if (!dev) {
        dev = await prisma.developer.create({ data: { name: g.developer } });
        devByName[g.developer] = dev;
      }
      let pub = pubByName[g.publisher];
      if (!pub) {
        pub = await prisma.publisher.create({ data: { name: g.publisher } });
        pubByName[g.publisher] = pub;
      }

      const genreConnect = (g.genres || []).map((name) => {
        const genre = genreByName[name];
        if (!genre) throw new Error(`Genre not found: ${name}`);
        return { id: genre.id };
      });

      const platformConnect = (g.platforms || []).map((name) => {
        const platform = platformByName[name];
        if (!platform) {
          const pc = platformByName["PC"];
          if (!pc)
            throw new Error(
              `Platform not found: ${name} (and fallback PC missing)`
            );
          return { id: pc.id };
        }
        return { id: platform.id };
      });

      const created = await prisma.game.create({
        data: {
          title: g.title,
          description: g.description,
          price: g.price,
          salePrice: g.salePrice,
          isOnSale: g.isOnSale,
          isRefundable: g.isRefundable,
          releaseDate: g.releaseDate,
          developerId: dev.id,
          publisherId: pub.id,
          genres: { connect: genreConnect },
          platforms: { connect: platformConnect },
          rating: g.rating,
          numberOfSales: g.numberOfSales,
          stock: g.stock,
          videoUrl: g.videoUrl,
        },
      });

      return created;
    };

    /**
     * Función que inserta juegos en la base de datos
     * @param gamesData Array de objetos con los datos de los juegos
     * @returns Array de objetos con los datos de los juegos insertados
     */
    console.log("  - Insertando juegos...");
    const createdGames = [];
    for (const g of gamesData) {
      g.platforms = (g.platforms || ["PC"]).map((p) =>
        platformByName[p] ? p : "PC"
      );
      createdGames.push(await createGame(g));
    }

    // ----- USUARIOS NO ADMINISTRADORES -----
    console.log("  - Creando usuarios no administradores...");
    const saltRounds = 10;
    const usersData = [
      {
        email: "Carlos@gmail.com",
        password: "Password1!",
        name: "Carlos",
        surname: "García",
        nickname: "carlosG",
        balance: 150.5,
        points: 250,
        addressLine1: "Calle Mayor 123",
        addressLine2: "Piso 3, Puerta B",
        city: "Madrid",
        region: "Madrid",
        postalCode: "28013",
        country: "Spain",
        accountAt: "@carlosG",
      },
      {
        email: "Maria@gmail.com",
        password: "Password2!",
        name: "María",
        surname: "López",
        nickname: "maria_l",
        balance: 75.0,
        points: 180,
        addressLine1: "Avenida Diagonal 456",
        addressLine2: null,
        city: "Barcelona",
        region: "Catalonia",
        postalCode: "08019",
        country: "Spain",
        accountAt: "@maria_lopez",
      },
      {
        email: "Juan@gmail.com",
        password: "Password3!",
        name: "Juan",
        surname: "Martínez",
        nickname: "juanm",
        balance: 0.0,
        points: 50,
        addressLine1: "Calle de la Cruz 78",
        addressLine2: "Bajo A",
        city: "Valencia",
        region: "Valencian Community",
        postalCode: "46002",
        country: "Spain",
        accountAt: "@juanm",
      },
      {
        email: "Ana@gmail.com",
        password: "Password4!",
        name: "Ana",
        surname: "Rodríguez",
        nickname: "anita_r",
        balance: 200.75,
        points: 420,
        addressLine1: "Plaza de España 15",
        addressLine2: "Torre 2, 5º C",
        city: "Sevilla",
        region: "Andalusia",
        postalCode: "41013",
        country: "Spain",
        accountAt: "@anita_rodriguez",
      },
      {
        email: "Pedro@gmail.com",
        password: "Password5!",
        name: "Pedro",
        surname: "Fernández",
        nickname: "pedroF",
        balance: 50.25,
        points: 100,
        addressLine1: "Carretera de la Sierra 89",
        addressLine2: "Chalet 12",
        city: "Bilbao",
        region: "Basque Country",
        postalCode: "48004",
        country: "Spain",
        accountAt: "@pedroF",
      },
    ];

    const createdUsers = [];
    for (const userData of usersData) {
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          surname: userData.surname,
          nickname: userData.nickname,
          passwordHash,
          balance: userData.balance,
          points: userData.points,
          isAdmin: false,
          addressLine1: userData.addressLine1,
          addressLine2: userData.addressLine2,
          city: userData.city,
          region: userData.region,
          postalCode: userData.postalCode,
          country: userData.country,
          accountAt: userData.accountAt,
        },
      });
      createdUsers.push(user);
    }

    const mediaCounts = await uploadAllMedia();

    console.log("✅ Seed completado:");
    console.log(`   - ${Object.keys(devByName).length} Developers creados`);
    console.log(`   - ${Object.keys(pubByName).length} Publishers creados`);
    console.log(`   - ${genres.length} Géneros creados`);
    console.log(`   - ${platforms.length} Plataformas creadas`);
    console.log(`   - ${createdGames.length} Games creados`);
    console.log(`   - ${createdUsers.length} Usuarios no admin creados`);
    console.log(`   - ${mediaCounts.gameImages} Imágenes de juegos subidas`);
    console.log(`   - ${mediaCounts.userAvatars} Avatares de usuarios subidos`);
  } catch (err) {
    console.error("❌ Error durante el seed: ", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedData().then(() => process.exit(0));

/**
 *
 * URLs útiles:
 *
 * Url a poner en buscador para encontrar imágenes de juegos: <https://www.google.com/search?tbm=isch&q=JUEGO+NAME+filetype:webp&tbs=isz:ex,iszw:1920,iszh:1080>
 * Url a poner en buscador para encontrar imágenes de usuarios: <https://www.google.com/search?tbm=isch&q=portrait+filetype:webp&tbs=isz:ex,iszw:256,iszh:256>
 *
 *
 * JUEGOS YA INTRODUCIDOS:
 * |----|---------------------------------------------|
 * | 01 | God of War Ragnarök                         |
 * | 02 | Marvel's Spider-Man 2                       |
 * | 03 | Devil May Cry 5                             |
 * | 04 | Doom Eternal                                |
 * | 05 | Uncharted 4: A Thief's End                  |
 * | 06 | Ghost of Tsushima                           |
 * | 07 | Metal Gear Solid V: The Phantom Pain        |
 * | 08 | Batman: Arkham Knight                       |
 * | 09 | Control                                     |
 * | 10 | Assassin's Creed Valhalla                   |
 * | 11 | The Last of Us Part II                      |
 * | 12 | Red Dead Redemption 2                       |
 * | 13 | Life is Strange                             |
 * | 14 | The Legend of Zelda: Breath of the Wild     |
 * | 15 | Tomb Raider (2013)                          |
 * | 16 | Uncharted: The Lost Legacy                  |
 * | 17 | Firewatch                                   |
 * | 18 | Outer Wilds                                 |
 * | 19 | The Walking Dead: Season One                |
 * | 20 | Control (Deluxe Edition)                    |
 * | 21 | Elden Ring                                  |
 * | 22 | The Witcher 3: Wild Hunt                    |
 * | 23 | Final Fantasy XVI                           |
 * | 24 | The Elder Scrolls V: Skyrim                 |
 * | 25 | Persona 5 Royal                             |
 * | 26 | Divinity: Original Sin 2                    |
 * | 27 | Mass Effect Legendary Edition               |
 * | 28 | Dragon Age: Inquisition                     |
 * | 29 | Cyberpunk 2077                              |
 * | 30 | Pillars of Eternity II: Deadfire            |
 * | 31 | FIFA 23                                     |
 * | 32 | NBA 2K23                                    |
 * | 33 | Madden NFL 23                               |
 * | 34 | F1 23                                       |
 * | 35 | Rocket League                               |
 * | 36 | Tony Hawk's Pro Skater 1 + 2                |
 * | 37 | Football Manager 2023                       |
 * | 38 | eFootball 2023                              |
 * | 39 | PGA Tour 2K23                               |
 * | 40 | MotoGP 23                                   |
 * | 41 | Civilization VI                             |
 * | 42 | XCOM 2                                      |
 * | 43 | Age of Empires IV                           |
 * | 44 | Total War: WARHAMMER 2                      |
 * | 45 | Stellaris                                   |
 * | 46 | Crusader Kings III                          |
 * | 47 | Company of Heroes 2                         |
 * | 48 | Anno 1800                                   |
 * | 49 | StarCraft II                                |
 * | 50 | Warcraft III: Reforged                      |
 * | 51 | Microsoft Flight Simulator                  |
 * | 52 | The Sims 4                                  |
 * | 53 | Euro Truck Simulator 2                      |
 * | 54 | Cities: Skylines                            |
 * | 55 | Kerbal Space Program                        |
 * | 56 | Assetto Corsa                               |
 * | 57 | Farming Simulator 22                        |
 * | 58 | Planet Coaster                              |
 * | 59 | No Man's Sky                                |
 * | 60 | Ship Simulator Exptremes                    |
 * | 61 | Resident Evil 4 (Remake)                    |
 * | 62 | Amnesia: The Dark Descent                   |
 * | 63 | Outlast                                     |
 * | 64 | Alien: Isolation                            |
 * | 65 | The Evil Within                             |
 * | 66 | Until Dawn                                  |
 * | 67 | Silent Hill 2 (Remake)                      |
 * | 68 | Layers of Fear                              |
 * | 69 | Dead Space (Remake)                         |
 * | 70 | Phasmophobia                                |
 * | 71 | Forza Horizon 5                             |
 * | 72 | Gran Turismo 7                              |
 * | 73 | Need for Speed Unbound                      |
 * | 74 | Need for Speed Heat                         |
 * | 75 | Dirt 5                                      |
 * | 76 | Burnout Paradise Remastered                 |
 * | 77 | Project CARS 3                              |
 * | 78 | Assetto Corsa Competizione                  |
 * | 79 | Trackmania                                  |
 * | 80 | MotoGP 23 (Racing)                          |
 * |----|---------------------------------------------|
 *
 */
