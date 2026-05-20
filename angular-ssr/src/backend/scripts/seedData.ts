import 'dotenv/config';

/* eslint-disable security/detect-non-literal-fs-filename, security/detect-object-injection */

import { prisma } from '../config/db';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base de media configurable y tolerante a distintas ubicaciones
function resolveMediaBasePath() {
  if (
    process.env.MEDIA_BASE_PATH &&
    fs.existsSync(process.env.MEDIA_BASE_PATH)
  ) {
    return process.env.MEDIA_BASE_PATH;
  }

  const embeddedMedia = path.join(__dirname, '../../media');
  if (fs.existsSync(embeddedMedia)) {
    return embeddedMedia;
  }

  const backendDataMedia = path.join(
    process.cwd(),
    'backend-data',
    'backend-media',
  );
  if (fs.existsSync(backendDataMedia)) {
    return backendDataMedia;
  }

  const legacyBackendMedia = path.join(process.cwd(), 'backend-media');
  if (fs.existsSync(legacyBackendMedia)) {
    return legacyBackendMedia;
  }

  return embeddedMedia;
}

const MEDIA_BASE_PATH = resolveMediaBasePath();
const GAME_IMAGES_PATH = path.join(MEDIA_BASE_PATH, 'gameImages');
const USER_IMAGES_PATH = path.join(MEDIA_BASE_PATH, 'userImages');

function getJsonPath(fileName: string): string {
  const base = path.join(process.cwd(), 'backend-data');
  const inJsonFolder = path.join(base, 'json', fileName);
  if (fs.existsSync(inJsonFolder)) {
    return inJsonFolder;
  }
  return path.join(base, fileName);
}

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
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Sube todas las imágenes de todos los juegos y usuarios de una sola vez
 * Busca en la base de datos todos los juegos y usuarios, y sube sus imágenes
 * desde las carpetas locales configuradas. Solo acepta archivos .webp
 * @returns Objeto con conteos de imágenes subidas
 */
async function uploadAllMedia() {
  console.log('  - Subiendo media desde carpetas locales...');

  const allGames = await prisma.game.findMany({
    select: { id: true, title: true },
  });

  let totalGameImages = 0;

  for (const game of allGames) {
    const sanitizedName = sanitizeFolderName(game.title);

    let folderName = game.title;
    let gameFolderPath = path.join(GAME_IMAGES_PATH, folderName);

    if (!fs.existsSync(gameFolderPath)) {
      const nameWithHyphen = game.title.replace(/: /g, ' - ');
      const pathWithHyphen = path.join(GAME_IMAGES_PATH, nameWithHyphen);

      if (fs.existsSync(pathWithHyphen)) {
        folderName = nameWithHyphen;
        gameFolderPath = pathWithHyphen;
      } else {
        const nameClean = game.title
          .replace(/[()]/g, '')
          .trim()
          .replace(/\s+/g, ' ');
        const pathClean = path.join(GAME_IMAGES_PATH, nameClean);

        if (fs.existsSync(pathClean)) {
          folderName = nameClean;
          gameFolderPath = pathClean;
        } else {
          const nameColonHyphen = game.title.replace(/:/g, ' -');
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
        `⚠️ Carpeta no encontrada para: "${game.title}" (intentado: "${folderName}")`,
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
          `❌ Error: ${file} no es .webp en la carpeta de "${game.title}". Solo se aceptan archivos .webp en el seed.`,
        );
        continue;
      }

      const filePath = path.join(gameFolderPath, file);
      try {
        const uploadResult = await cloudinary.uploader.upload(filePath, {
          folder: `gameImages/${sanitizedName}`,
          resource_type: 'auto',
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
    const sanitizedName = user.accountAt
      ? user.accountAt.toString()
      : sanitizeFolderName(user.name);
    const folderNameToLookup = user.accountAt
      ? user.accountAt.toString()
      : user.name;
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
        `❌ Error: ${file} no es .webp en la carpeta de "${user.name}". Solo se aceptan archivos .webp en el seed.`,
      );
      continue;
    }

    const filePath = path.join(userFolderPath, file);

    try {
      const uploadResult = await cloudinary.uploader.upload(filePath, {
        folder: `userImages/${sanitizedName}`,
        resource_type: 'auto',
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
    console.log('\n🌱 Iniciando seed de datos...');

    const dataRoot = path.join(process.cwd(), 'backend-data');

    const platformsPath = getJsonPath('platforms.json');
    const platformNames: string[] = JSON.parse(
      fs.readFileSync(platformsPath, 'utf-8'),
    );
    console.log('  - Creando plataformas...');
    await prisma.platform.createMany({
      data: platformNames.map((name: string) => ({ name })),
      skipDuplicates: true,
    });
    const platforms = await prisma.platform.findMany({
      where: { name: { in: platformNames } },
    });
    const platformByName = Object.fromEntries(
      platforms.map((p: { name: any }) => [p.name, p]),
    );

    const genresPath = getJsonPath('genres.json');
    const genreNames: string[] = JSON.parse(
      fs.readFileSync(genresPath, 'utf-8'),
    );
    console.log('  - Creando géneros...');
    await prisma.genre.createMany({
      data: genreNames.map((name: string) => ({ name })),
      skipDuplicates: true,
    });
    const genres = await prisma.genre.findMany({
      where: { name: { in: genreNames } },
    });
    const genreByName = Object.fromEntries(
      genres.map((g: { name: any }) => [g.name, g]),
    );

    const developersPath = getJsonPath('developers.json');
    const developerNames: string[] = JSON.parse(
      fs.readFileSync(developersPath, 'utf-8'),
    );

    const publishersPath = getJsonPath('publishers.json');
    const publisherNames: string[] = JSON.parse(
      fs.readFileSync(publishersPath, 'utf-8'),
    );

    console.log('  - Creando developers...');
    await prisma.developer.createMany({
      data: developerNames.map((n: string) => ({ name: n })),
      skipDuplicates: true,
    });
    console.log('  - Creando publishers...');
    await prisma.publisher.createMany({
      data: publisherNames.map((n: string) => ({ name: n })),
      skipDuplicates: true,
    });
    const developers = await prisma.developer.findMany({
      where: { name: { in: developerNames } },
    });
    const publishers = await prisma.publisher.findMany({
      where: { name: { in: publisherNames } },
    });

    const devByName = Object.fromEntries(
      developers.map((d: { name: any }) => [d.name, d]),
    );
    const pubByName = Object.fromEntries(
      publishers.map((p: { name: any }) => [p.name, p]),
    );

    const gamesPath = getJsonPath('games.json');
    const gamesSource = fs.readFileSync(gamesPath, 'utf-8');
    const rawGames: any[] = JSON.parse(gamesSource);
    const gamesData = rawGames.map((g: any) => ({
      ...g,
      releaseDate:
        g.releaseDate instanceof Date ? g.releaseDate : new Date(g.releaseDate),
    }));

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
      stock?: number;
      stockPc?: number;
      stockPs5?: number;
      stockXboxX?: number;
      stockPs4?: number;
      stockXboxOne?: number;
      stockSwitch?: number;
      videoUrl: string;
    }) => {
      let dev = devByName[g.developer];
      if (!dev) {
        try {
          dev = await prisma.developer.create({ data: { name: g.developer } });
        } catch (e: any) {
          if (e?.code === 'P2002') {
            dev = await prisma.developer.findUnique({
              where: { name: g.developer },
            });
          } else {
            throw e;
          }
        }
        devByName[g.developer] = dev;
      }
      let pub = pubByName[g.publisher];
      if (!pub) {
        try {
          pub = await prisma.publisher.create({ data: { name: g.publisher } });
        } catch (e: any) {
          if (e?.code === 'P2002') {
            pub = await prisma.publisher.findUnique({
              where: { name: g.publisher },
            });
          } else {
            throw e;
          }
        }
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
          const pc = platformByName['PC'];
          if (!pc)
            throw new Error(
              `Platform not found: ${name} (and fallback PC missing)`,
            );
          return { id: pc.id };
        }
        return { id: platform.id };
      });

      const platforms = g.platforms || ['PC'];
      const getStockFor = (platform: string, specificStock?: number) => {
        if (specificStock !== undefined) return specificStock;
        if (platforms.includes(platform)) return g.stock || 0;
        return 0;
      };

      const stockPc = getStockFor('PC', g.stockPc);
      const stockPs5 = getStockFor('PS5', g.stockPs5);
      const stockXboxX = getStockFor('Xbox Series X', g.stockXboxX);
      const stockPs4 = getStockFor('PS4', g.stockPs4);
      const stockXboxOne = getStockFor('Xbox One', g.stockXboxOne);
      const stockSwitch = getStockFor('Switch', g.stockSwitch);

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
          stockPc,
          stockPs5,
          stockXboxX,
          stockPs4,
          stockXboxOne,
          stockSwitch,
          videoUrl: g.videoUrl,
        },
        include: {
          platforms: true,
        },
      });

      return created;
    };

    /**
     * Función que inserta juegos en la base de datos
     * @param gamesData Array de objetos con los datos de los juegos
     * @returns Array de objetos con los datos de los juegos insertados
     */
    console.log('  - Creando juegos...');
    const createdGames: any[] = [];
    for (const g of gamesData as any[]) {
      g.platforms = (g.platforms || ['PC']).map((p: string) =>
        platformByName[p] ? p : 'PC',
      );
      createdGames.push(await createGame(g));
    }

    console.log('  - Creando usuarios no administradores...');
    const saltRounds = 10;
    const usersPath = getJsonPath('users.json');
    const usersData: any[] = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const createdUsers = [];
    for (const userData of usersData) {
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      let user;
      try {
        user = await prisma.user.create({
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
      } catch (e: any) {
        if (e?.code === 'P2002') {
          user = await prisma.user.findUnique({
            where: { email: userData.email },
          });
        } else {
          throw e;
        }
      }
      if (user) {
        createdUsers.push(user);
      }
    }

    const gamesToUse = createdGames.slice(0, 10);

    let favAdded = 0;
    let cartAdded = 0;
    let purchasesAdded = 0;
    let refundsAdded = 0;

    let loggedFavs = false;
    let loggedCarts = false;
    let loggedPurchases = false;
    let loggedRefunds = false;

    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i]!;

      if (!loggedFavs) {
        console.log('  - Creando datos de favoritos...');
        loggedFavs = true;
      }

      const favCount = 2 + (i % 2);
      for (let j = 0; j < favCount && j < gamesToUse.length; j++) {
        await prisma.favorite.create({
          data: {
            userId: user.id,
            gameId: gamesToUse[j]!.id,
            platformId: gamesToUse[j]!.platforms[0]!.id,
          },
        });
        favAdded++;

        if (i === 1 && j === 0 && gamesToUse[j]!.platforms.length > 1) {
          await prisma.favorite.create({
            data: {
              userId: user.id,
              gameId: gamesToUse[j]!.id,
              platformId: gamesToUse[j]!.platforms[1]!.id,
            },
          });
          favAdded++;
        }
      }

      if (!loggedCarts) {
        console.log('  - Creando datos de carritos...');
        loggedCarts = true;
      }

      const cartCount = 1 + (i % 2);
      for (let j = 0; j < cartCount && j < gamesToUse.length; j++) {
        const gameIndex = (favCount + j) % gamesToUse.length;
        const game = gamesToUse[gameIndex]!;

        await prisma.cartItem.create({
          data: {
            userId: user.id,
            gameId: game.id,
            platformId: game.platforms[0]!.id,
            quantity: 1 + (j % 2),
          },
        });
        cartAdded++;

        if (i === 2 && j === 0 && game.platforms.length > 1) {
          await prisma.cartItem.create({
            data: {
              userId: user.id,
              gameId: game.id,
              platformId: game.platforms[1]!.id,
              quantity: 1,
            },
          });
          cartAdded++;
        }
      }

      if (!loggedPurchases) {
        console.log('  - Creando datos de compras...');
        loggedPurchases = true;
      }

      const purchaseCount = 1 + (i % 2);
      for (let j = 0; j < purchaseCount && j < gamesToUse.length; j++) {
        const gameIndex = (favCount + cartCount + j) % gamesToUse.length;
        const game = gamesToUse[gameIndex]!;
        const gamePrice = game.isOnSale ? game.salePrice! : game.price!;

        const purchaseItems = [
          {
            gameId: game.id,
            platformId: game.platforms[0]!.id,
            price: gamePrice,
            quantity: 1,
          },
        ];

        if (i === 0 && j === 0 && game.platforms.length > 1) {
          purchaseItems.push({
            gameId: game.id,
            platformId: game.platforms[1]!.id,
            price: gamePrice,
            quantity: 1,
          });
        }

        await prisma.purchase.create({
          data: {
            userId: user.id,
            totalPrice: gamePrice,
            status: 'completed',
            purchasedAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            ),
            items: {
              create: purchaseItems,
            },
          },
        });
        purchasesAdded++;
      }

      if (!loggedRefunds) {
        console.log('  - Creando datos de devoluciones...');
        loggedRefunds = true;
      }

      if (i < 2) {
        const refundIndex =
          (favCount + cartCount + purchaseCount) % gamesToUse.length;
        const game = gamesToUse[refundIndex]!;
        const gamePrice = game.isOnSale ? game.salePrice! : game.price!;

        await prisma.purchase.create({
          data: {
            userId: user.id,
            totalPrice: gamePrice,
            status: 'refunded',
            refundReason:
              i === 0 ? 'No cumple mis expectativas' : 'Problemas técnicos',
            purchasedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            items: {
              create: [
                {
                  gameId: game.id,
                  platformId: game.platforms[0]!.id,
                  price: gamePrice,
                  quantity: 1,
                },
              ],
            },
          },
        });
        refundsAdded++;
      }
    }

    console.log('  - Creando sesiones de chat...');
    let chatsAdded = 0;
    let messagesAdded = 0;

    const chatTemplatesPath = getJsonPath('chatTemplates.json');
    const chatTemplates: any[] = JSON.parse(
      fs.readFileSync(chatTemplatesPath, 'utf-8'),
    );

    const legacyChatTemplates = [
      {
        title: 'Busco juegos de terror',
        messages: [
          {
            role: 'user',
            content: 'Hola, me gustaría encontrar juegos de terror para jugar',
          },
          {
            role: 'assistant',
            content:
              '¡Hola! Te recomiendo Resident Evil 4 Remake, un juego de survival horror con acción intensa. También está Dead Space Remake y Amnesia: The Dark Descent si buscas terror psicológico.',
          },
          { role: 'user', content: '¿Cuál me recomiendas para PS5?' },
          {
            role: 'assistant',
            content:
              'Para PS5 te recomiendo Resident Evil 4 Remake (39.99€) o Dead Space Remake (39.99€). Ambos tienen gráficos de última generación y aprovechan las funciones del DualSense.',
          },
        ],
      },
      {
        title: 'Recomendaciones de RPG',
        messages: [
          { role: 'user', content: '¿Qué juegos RPG me recomiendas?' },
          {
            role: 'assistant',
            content:
              '¡Excelente elección! Te recomiendo Elden Ring, un RPG de mundo abierto desafiante. También The Witcher 3: Wild Hunt si prefieres una narrativa profunda, o Persona 5 Royal para un JRPG con estilo único.',
          },
        ],
      },
      {
        title: 'Juegos de carreras',
        messages: [
          { role: 'user', content: 'Busco un juego de carreras para PC' },
          {
            role: 'assistant',
            content:
              'Para PC tienes excelentes opciones: Forza Horizon 5 (59.99€) para carreras arcade en mundo abierto, o Assetto Corsa para simulación realista. Need for Speed Unbound también es genial si te gusta el estilo urbano.',
          },
          { role: 'user', content: '¿Y para jugar con amigos?' },
          {
            role: 'assistant',
            content:
              'Forza Horizon 5 tiene un modo multijugador fantástico con carreras cooperativas y competitivas. Rocket League también es muy divertido en grupo y es más accesible.',
          },
        ],
      },
    ];

    for (let i = 0; i < Math.min(createdUsers.length, 3); i++) {
      const user = createdUsers[i]!;
      const template = chatTemplates[i % chatTemplates.length]!;

      const session = await prisma.chatSession.create({
        data: {
          userId: user.id,
          title: template.title,
        },
      });
      chatsAdded++;

      for (const msg of template.messages) {
        await prisma.chatMessage.create({
          data: {
            sessionId: session.id,
            role: msg.role,
            content: msg.content,
          },
        });
        messagesAdded++;
      }
    }

    const mediaCounts = await uploadAllMedia();

    console.log('   ✅ Seed completado:');
    console.log(`   - ${Object.keys(devByName).length} Developers creados`);
    console.log(`   - ${Object.keys(pubByName).length} Publishers creados`);
    console.log(`   - ${genres.length} Géneros creados`);
    console.log(`   - ${platforms.length} Plataformas creadas`);
    console.log(`   - ${createdGames.length} Games creados`);
    console.log(`   - ${createdUsers.length} Usuarios no admin creados`);
    console.log(`   - ${favAdded} Favoritos creados`);
    console.log(`   - ${cartAdded} Items añadidos al carrito`);
    console.log(`   - ${purchasesAdded} Compras completadas`);
    console.log(`   - ${refundsAdded} Compras en estado refunded`);
    console.log(`   - ${mediaCounts.gameImages} Imágenes de juegos subidas`);
    console.log(`   - ${mediaCounts.userAvatars} Avatares de usuarios subidos`);
    console.log(`   - ${chatsAdded} Sesiones de chat creadas`);
    console.log(`   - ${messagesAdded} Mensajes de chat creados`);
  } catch (err) {
    console.error('❌ Error durante el seed: ', err);
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
 * | 19 | The Walking Dead - Season One               |
 * | 20 | Control Deluxe Edition                      |
 * | 21 | Elden Ring                                  |
 * | 22 | The Witcher 3 - Wild Hunt                   |
 * | 23 | Final Fantasy XVI                           |
 * | 24 | The Elder Scrolls V: Skyrim                 |
 * | 25 | Persona 5 Royal                             |
 * | 26 | Divinity: Original Sin 2                    |
 * | 27 | Mass Effect Legendary Edition               |
 * | 28 | Dragon Age: Inquisition                     |
 * | 29 | Cyberpunk 2077                              |
 * | 30 | Pillars of Eternity II - Deadfire           |
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
 * | 44 | Total War - WARHAMMER 2                     |
 * | 45 | Stellaris                                   |
 * | 46 | Crusader Kings III                          |
 * | 47 | Company of Heroes 2                         |
 * | 48 | Anno 1800                                   |
 * | 49 | StarCraft II                                |
 * | 50 | Warcraft III - Reforged                     |
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
 * | 61 | Resident Evil 4 Remake                      |
 * | 62 | Amnesia: The Dark Descent                   |
 * | 63 | Outlast                                     |
 * | 64 | Alien: Isolation                            |
 * | 65 | The Evil Within                             |
 * | 66 | Until Dawn                                  |
 * | 67 | Silent Hill 2 Remake                        |
 * | 68 | Layers of Fear                              |
 * | 69 | Dead Space Remake                           |
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
