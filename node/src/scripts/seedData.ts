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
    console.log("\n🌱 Iniciando seed de datos...");

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
      "Plataformas",
      "Puzzles",
      "Lucha",
      "Musicales",
      "Acción-Aventura",
      "Shooter",
      "MOBA",
      "Roguelike",
      "Sandbox",
      "MMORPG",
      "Battle Royale",
      "Survival Horror",
      "Metroidvania",
      "RTS",
      "TBS",
      "Hack and Slash",
      "Beat 'Em Up",
      "Novela Visual",
      "CCG",
      "FPS",
      "Táctico",
      "Ciencia Ficción",
      "Educativo",
      "Gestión",
      "Construcción de Ciudades",
      "Exploración",
      "Supervivencia",
      "Horror Psicológico",
      "Stealth",
      "Cinemático",
      "Narrativa",
      "Cooperativo",
      "Arcade",
      "Mundo Abierto",
      "Off-Road",
      "Simcade",
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
      {
        title: "God of War Ragnarök",
        description:
          "God of War Ragnarök es la épica conclusión de la saga nórdica, siguiendo a Kratos y su hijo Atreus mientras se enfrentan a la inminente profecía del Ragnarök, el evento que marcará el fin del mundo. Atreus, en la búsqueda de respuestas sobre su identidad como Loki, busca desesperadamente el conocimiento que le ayude a comprender y quizás evitar la guerra, mientras Kratos se debate entre el miedo a repetir su pasado como destructor de dioses y la necesidad de ser el padre protector que su hijo necesita en estos tiempos apocalípticos. Su viaje los llevará a través de los vastos y peligrosos Nueve Reinos, ahora afectados por el Fimbulwinter (el Gran Invierno). \n\nEnfrentándose a una variedad de criaturas míticas, monstruos y dioses nórdicos —incluyendo a Thor y Odín— Kratos utiliza su arsenal completo, que incluye el Hacha Leviatán, las Espadas del Caos y un renovado Escudo del Guardián, junto con una gran cantidad de nuevas habilidades. El sistema de combate, brutal y fluido, se combina con la exploración de escenarios asombrosamente detallados y la resolución de puzles ambientales. La trama profundiza en las relaciones familiares y los temas del destino, la venganza y el sacrificio, ofreciendo una experiencia narrativa y jugable densa y satisfactoria.",
        price: 69.99,
        isOnSale: false,
        salePrice: 41.99,
        isRefundable: true,
        releaseDate: new Date("2022-11-09"),
        developer: "Sucker Punch Productions",
        publisher: "Sony Interactive Entertainment",
        genres: [
          "Accion",
          "Aventura",
          "RPG",
          "Acción-Aventura",
          "Hack and Slash",
        ],
        platforms: ["PS5", "PS4"],
        rating: 4.8,
        numberOfSales: 850000,
        stock: 100,
        videoUrl: "https://www.youtube.com/watch?v=jb0LtQBNqhY",
      },
      {
        title: "Marvel's Spider-Man 2",
        description:
          "Los Spider-Men, Peter Parker y Miles Morales, regresan en una emocionante nueva aventura de la aclamada franquicia. Ambos héroes deben equilibrar sus vidas personales, amistades y deberes mientras se enfrentan a la amenaza definitiva: el icónico villano Venom y el despiadado Kraven el Cazador. Con el simbionte poniendo a prueba la fuerza y la moralidad de Peter, y Miles luchando por encontrar su lugar, la narrativa profundiza en el sacrificio necesario para ser un héroe.\n\nEl juego expande la Nueva York de Marvel, permitiendo a los jugadores explorar nuevos distritos como Queens y Brooklyn. La jugabilidad se ha revolucionado con las nuevas 'Web Wings' para un desplazamiento más rápido y la capacidad de cambiar casi instantáneamente entre ambos Spider-Men. Cada personaje cuenta con habilidades únicas: Peter con sus nuevos y brutales poderes de simbionte y Miles con sus explosivas capacidades bioeléctricas de veneno.",
        price: 69.99,
        isOnSale: true,
        salePrice: 49.99,
        isRefundable: true,
        releaseDate: new Date("2023-10-20"),
        developer: "Insomniac Games",
        publisher: "Sony Interactive Entertainment",
        genres: ["Accion", "Aventura", "Acción-Aventura", "Sandbox"],
        platforms: ["PS5", "PC"],
        rating: 4.6,
        numberOfSales: 500000,
        stock: 80,
        videoUrl: "https://www.youtube.com/watch?v=1UvGDXIixPE",
      },
      {
        title: "Devil May Cry 5",
        description:
          "La amenaza demoníaca ha vuelto para invadir el mundo una vez más en esta entrega de la legendaria serie de acción. La invasión comienza cuando las semillas de un árbol demoníaco echan raíces en Red Grave City. Esta incursión infernal atrae la atención del joven cazador de demonios Nero, un aliado de Dante que ahora se encuentra sin su brazo demoníaco, el Devil Bringer. Junto a él, el legendario Dante y el misterioso nuevo personaje V unen fuerzas para detener al rey demonio Urizen.\n\nEl juego destaca por su jugabilidad frenética y estilizada, ofreciendo tres personajes jugables con estilos de combate radicalmente diferentes. Nero utiliza sus prótesis mecánicas 'Devil Breakers' para ataques variados, Dante domina con sus cuatro estilos de combate y un arsenal diverso, y V controla bestias demoníacas familiares para luchar por él. Todo ello impulsado por el motor RE Engine, que ofrece gráficos fotorrealistas y una acción fluida a 60 fps.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2019-03-08"),
        developer: "Capcom",
        publisher: "Capcom",
        genres: ["Accion", "Hack and Slash", "Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.4,
        numberOfSales: 420000,
        stock: 23,
        videoUrl: "https://www.youtube.com/watch?v=g_2VZvi0fQ0",
      },
      {
        title: "Doom Eternal",
        description:
          "Los ejércitos del infierno han invadido la Tierra. Conviértete en el Slayer en una campaña épica para un jugador y conquista demonios a través de dimensiones para detener la destrucción final de la humanidad. El juego lleva el combate en primera persona a un nuevo nivel de velocidad y potencia, exigiendo al jugador agresividad constante para obtener recursos: ejecuciones para salud, incineración para armadura y motosierra para munición.\n\nArmado con un arsenal mejorado, como el cañón de hombro con lanzallamas y la hoja retráctil, y nuevas habilidades de movilidad como el impulso rápido, eres más letal que nunca. Además de la campaña, introduce BATTLEMODE, una experiencia multijugador 2 contra 1 donde un Slayer armado hasta los dientes se enfrenta a dos demonios controlados por jugadores en una batalla al mejor de cinco rondas de intensa estrategia.",
        price: 49.99,
        isOnSale: true,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2020-03-20"),
        developer: "id Software",
        publisher: "Bethesda Softworks",
        genres: ["Accion", "Shooter", "FPS"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 4.5,
        numberOfSales: 610000,
        stock: 65,
        videoUrl: "https://www.youtube.com/watch?v=6SRj82vc1Jg",
      },
      {
        title: "Uncharted 4: A Thief's End",
        description:
          "Varios años después de su última aventura, el retirado cazador de fortunas Nathan Drake se ve obligado a regresar al mundo de los ladrones. Con lo que está en juego siendo mucho más personal, Drake se embarca en un viaje alrededor del mundo en busca de una conspiración histórica detrás de un legendario tesoro pirata del Capitán Henry Avery. Su mayor aventura pondrá a prueba sus límites físicos, su determinación y, en última instancia, lo que está dispuesto a sacrificar para salvar a sus seres queridos.\n\nLa narrativa profundiza en la relación de Nathan con su hermano Sam, quien resurge tras ser dado por muerto. Juntos buscan Libertalia, la utopía pirata perdida en los bosques de Madagascar. El juego combina una narrativa cinematográfica de primer nivel con secuencias de acción trepidantes, exploración de entornos exóticos, resolución de puzles y un combate evolucionado que integra el sigilo y la verticalidad con el uso del gancho.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2016-05-10"),
        developer: "Naughty Dog",
        publisher: "Sony Interactive Entertainment",
        genres: [
          "Accion",
          "Aventura",
          "Acción-Aventura",
          "Puzzles",
          "Plataformas",
        ],
        platforms: ["PS4", "PS5", "PC"],
        rating: 4.7,
        numberOfSales: 720000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=34GJ9ZMAKqA",
      },
      {
        title: "Ghost of Tsushima",
        description:
          "A finales del siglo XIII, el imperio mongol ha arrasado naciones enteras en su campaña para conquistar Oriente. La isla de Tsushima es todo lo que se interpone entre el Japón continental y una enorme flota invasora mongola liderada por el despiadado y astuto general Khotun Khan. Mientras la isla arde tras la primera oleada del asalto mongol, el guerrero samurái Jin Sakai se mantiene firme como uno de los últimos supervivientes de su clan.\n\nJin está decidido a hacer lo que sea necesario, a cualquier precio, para proteger a su pueblo y recuperar su hogar. Debe dejar de lado las tradiciones que lo han formado como guerrero para forjar un nuevo camino, el camino del Fantasma, y librar una guerra poco convencional por la libertad de Tsushima. El juego ofrece un vasto mundo abierto feudal japonés para explorar, combate con katana preciso y letal, y mecánicas de sigilo inmersivas.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2020-07-17"),
        developer: "Sucker Punch Productions",
        publisher: "Sony Interactive Entertainment",
        genres: [
          "Accion",
          "Aventura",
          "Acción-Aventura",
          "Sandbox",
          "Hack and Slash",
        ],
        platforms: ["PS4", "PS5", "PC"],
        rating: 4.6,
        numberOfSales: 540000,
        stock: 123,
        videoUrl: "https://www.youtube.com/watch?v=jT9edKarhc8",
      },
      {
        title: "Metal Gear Solid V: The Phantom Pain",
        description:
          "Nueve años después de los eventos de MGSV: Ground Zeroes y la caída de Mother Base, Snake, también conocido como Big Boss, despierta de un coma de casi una década. El juego retoma la historia en 1984, con la Guerra Fría como telón de fondo. Impulsado por la venganza, Snake establece un nuevo ejército privado, Diamond Dogs, y regresa al campo de batalla en Afganistán y la frontera entre Angola y Zaire para perseguir al grupo clandestino XOF.\n\nEste título redefine la serie con un diseño de mundo abierto que ofrece una libertad estratégica sin precedentes. Los jugadores pueden abordar las misiones con sigilo total o fuerza bruta, utilizando una amplia variedad de armas, vehículos y compañeros de IA como Quiet y D-Dog. Además, cuenta con un profundo sistema de gestión de base (Mother Base) que permite desarrollar nuevas tecnologías y equipos para apoyar las operaciones en el campo.",
        price: 19.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2015-09-01"),
        developer: "Kojima Productions",
        publisher: "Konami",
        genres: [
          "Accion",
          "Aventura",
          "Acción-Aventura",
          "Shooter",
          "Sandbox",
          "Táctico",
        ],
        platforms: ["PC", "PS4", "Xbox One", "PS3", "Xbox 360"],
        rating: 4.3,
        numberOfSales: 380000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=Krc1t4HU8GI",
      },
      {
        title: "Batman: Arkham Knight",
        description:
          "En el explosivo final de la serie Arkham, Batman se enfrenta a la amenaza definitiva contra la ciudad que ha jurado proteger. El Espantapájaros regresa para unir a una lista impresionante de supervillanos, incluidos el Pingüino, Dos Caras y Harley Quinn, con el objetivo de destruir al Caballero Oscuro para siempre. Gotham City se presenta como un mundo abierto masivo y detallado, listo para ser explorado y protegido.\n\nEl juego introduce una versión de diseño único del Batmóvil, que se puede conducir por primera vez en la franquicia. La adición de este vehículo legendario, combinada con la aclamada jugabilidad de la serie Arkham, ofrece a los jugadores la experiencia completa de Batman: atravesar las calles a toda velocidad y surcar el horizonte de la ciudad. El combate 'FreeFlow' se ha mejorado, y el sigilo depredador permite nuevas eliminaciones y tácticas.",
        price: 24.99,
        isOnSale: false,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2015-06-23"),
        developer: "Rocksteady Studios",
        publisher: "Warner Bros. Interactive Entertainment",
        genres: [
          "Accion",
          "Aventura",
          "Acción-Aventura",
          "Sandbox",
          "Beat 'Em Up",
        ],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.2,
        numberOfSales: 310000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=L63rDlpJ3_o",
      },
      {
        title: "Control",
        description:
          "Tras una invasión secreta en Nueva York por parte de una amenaza de otro mundo, Jesse Faden se convierte en la nueva Directora de la Oficina Federal de Control luchando por recuperarla. Esta aventura de acción en tercera persona te desafía a dominar una combinación de habilidades sobrenaturales, cargas modificables y entornos reactivos mientras luchas en un mundo profundo e impredecible: la Casa Inmemorial.\n\nDesarrollado por Remedy Entertainment, el juego destaca por su narrativa ambiental y su atmósfera inquietante inspirada en el 'New Weird'. Los jugadores deben explorar la arquitectura cambiante y brutalista de la Oficina, descubrir documentos clasificados y resolver el misterio de la desaparición del hermano de Jesse. El combate es dinámico y exigente, requiriendo el uso creativo de la telequinesis para lanzar objetos y crear escudos, junto con el uso de la 'Service Weapon', un arma de fuego que cambia de forma.",
        price: 39.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2019-08-27"),
        developer: "Remedy Entertainment",
        publisher: "505 Games",
        genres: [
          "Accion",
          "Aventura",
          "Shooter",
          "Metroidvania",
          "Acción-Aventura",
        ],
        platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X", "Switch"],
        rating: 4.0,
        numberOfSales: 220000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=F74LLDhAhhI",
      },
      {
        title: "Assassin's Creed Valhalla",
        description:
          "Ponte en la piel de Eivor, una leyenda vikinga criada entre historias de batallas y gloria. Huyendo de una Noruega asolada por la guerra y la escasez, debes conducir a tu clan a través del mar helado del Norte hacia las ricas tierras de los reinos rotos de Inglaterra. Tu misión es establecer un nuevo hogar permanente, cueste lo que cueste, en un entorno hostil y dinámico de la Edad Oscura.\n\nEl juego ofrece una experiencia RPG profunda donde puedes saquear fortalezas enemigas, expandir tu asentamiento y aumentar tu poder político mediante alianzas. El combate es visceral y brutal, permitiendo empuñar dos armas a la vez, desde hachas hasta escudos, para desmembrar a los enemigos. Todo esto mientras te ves envuelto en el conflicto milenario entre los Ocultos y la Orden de los Antiguos.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2020-11-10"),
        developer: "Ubisoft",
        publisher: "Ubisoft",
        genres: ["Accion", "Aventura", "RPG", "Sandbox", "Acción-Aventura"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 680000,
        stock: 456,
        videoUrl: "https://www.youtube.com/watch?v=rKjUAWlbTJk",
      },
      {
        title: "The Last of Us Part II",
        description:
          "Experimenta una narrativa emocionalmente devastadora y compleja que sigue a Ellie y Abby en un viaje implacable a través de un Estados Unidos postapocalíptico. El juego redefine el género con una jugabilidad de sigilo tensa y un combate visceral cuerpo a cuerpo, donde cada encuentro se siente desesperado y realista. Los jugadores deben navegar por entornos detallados llenos de infectados aterradores y facciones humanas hostiles, enfrentándose a las consecuencias del ciclo de violencia.\n\nCon mejoras técnicas impresionantes, el título ofrece animaciones faciales de vanguardia y un diseño de sonido inmersivo que eleva la tensión a nuevos niveles. La historia desafía las nociones de bien y mal, obligando al jugador a cuestionar sus propias lealtades mientras explora temas de trauma, redención y el costo de la venganza en un mundo donde la moralidad es un lujo escaso.",
        price: 59.99,
        isOnSale: true,
        salePrice: 34.99,
        isRefundable: true,
        releaseDate: new Date("2020-06-19"),
        developer: "Naughty Dog",
        publisher: "Sony Interactive Entertainment",
        genres: ["Acción-Aventura", "Survival Horror", "Shooter", "Terror"],
        platforms: ["PS4", "PS5"],
        rating: 4.9,
        numberOfSales: 980000,
        stock: 0,
        videoUrl: "https://www.youtube.com/watch?v=JdE9U9WW_HM",
      },
      {
        title: "Red Dead Redemption 2",
        description:
          "América, 1899. El ocaso del salvaje oeste ha comenzado y las fuerzas de la ley cazan a las últimas bandas de forajidos. Arthur Morgan y la banda de Van der Linde se ven obligados a huir, robando, luchando y sobreviviendo en el corazón accidentado de América. Con un mundo abierto inmensamente detallado y vivo, el juego ofrece una libertad sin precedentes para interactuar con cada personaje y entorno, estableciendo un nuevo estándar en la inmersión.\n\nLa narrativa profunda explora la lealtad y la traición mientras el estilo de vida de los forajidos choca con la modernización inminente. Además de la historia principal, los jugadores pueden cazar, pescar, jugar al póquer y gestionar el campamento, creando un vínculo único con el mundo y sus habitantes. El sistema de honor dinámico asegura que cada decisión tenga peso en cómo el mundo percibe a Arthur.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2018-10-26"),
        developer: "Rockstar Games",
        publisher: "Rockstar Games",
        genres: ["Acción-Aventura", "Sandbox", "Shooter", "Accion"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.9,
        numberOfSales: 1200000,
        stock: 0,
        videoUrl: "https://www.youtube.com/watch?v=MyaYlbizpvs",
      },
      {
        title: "Life Is Strange",
        description:
          "Sigue la historia de Max Caulfield, una estudiante de fotografía que descubre que puede rebobinar el tiempo al salvar a su mejor amiga, Chloe Price. La pareja pronto se encuentra investigando la misteriosa desaparición de su compañera de estudios Rachel Amber, descubriendo un lado oscuro de la vida en Arcadia Bay. La mecánica de retroceso temporal permite a los jugadores alterar el curso de los eventos, creando un efecto mariposa con consecuencias a corto y largo plazo.\n\nEl juego destaca por su enfoque en la narrativa emocional y el desarrollo de personajes, abordando temas maduros y problemas de la vida real. Con un estilo visual distintivo pintado a mano y una banda sonora indie aclamada, ofrece una experiencia introspectiva donde cada elección, por pequeña que sea, puede cambiar el destino de los personajes y el final de la historia.",
        price: 14.99,
        isOnSale: true,
        salePrice: 6.99,
        isRefundable: true,
        releaseDate: new Date("2015-01-30"),
        developer: "Dontnod Entertainment",
        publisher: "Square Enix",
        genres: ["Aventura", "Novela Visual", "Puzzles"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.1,
        numberOfSales: 240000,
        stock: 78,
        videoUrl: "https://www.youtube.com/watch?v=AURVxvIZrmU",
      },
      {
        title: "The Legend of Zelda: Breath of the Wild",
        description:
          "Olvida todo lo que sabes sobre los juegos de The Legend of Zelda. Entra en un mundo de descubrimiento, exploración y aventura en este juego rompedor de la aclamada serie. Viaja a través de vastos campos, bosques y cumbres de montañas mientras descubres qué ha sido del reino de Hyrule en esta impresionante aventura al aire libre. La libertad es total: puedes ir a cualquier lugar que veas, escalar cualquier superficie y resolver puzzles de múltiples maneras creativas.\n\nLink despierta de un sueño de 100 años para encontrar un mundo dominado por la naturaleza y amenazado por Calamity Ganon. Con un sistema de física robusto y mecánicas de supervivencia como cocinar y gestionar el clima, el juego invita a la experimentación constante. Los santuarios dispersos ofrecen desafíos de ingenio, mientras que el combate exige estrategia y el uso inteligente del entorno y las armas.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2017-03-03"),
        developer: "Nintendo EPD",
        publisher: "Nintendo",
        genres: ["Acción-Aventura", "RPG", "Sandbox", "Puzzles"],
        platforms: ["Switch"],
        rating: 5.0,
        numberOfSales: 1500000,
        stock: 234,
        videoUrl: "https://www.youtube.com/watch?v=zw47_q9wbBE",
      },
      {
        title: "Tomb Raider (2013)",
        description:
          "Este reinicio de la franquicia presenta una historia de origen valiente que explora la intensa transformación de Lara Croft de una joven inexperta a una sobreviviente endurecida. Armada solo con sus instintos y la capacidad de empujar más allá de los límites de la resistencia humana, Lara debe luchar para desentrañar la historia oscura de una isla olvidada y escapar de su dominio implacable. El juego combina exploración, combate y plataformas cinematográficas.\n\nLa narrativa se centra en la supervivencia humana, obligando a Lara a buscar recursos, mejorar sus armas y habilidades, y enfrentarse a los sectarios hostiles conocidos como los Solarii. Los entornos son traicioneros y están llenos de tumbas opcionales que desafían al jugador con puzzles ambientales, mientras que el combate ofrece opciones de sigilo y acción directa en un entorno hostil y misterioso.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2013-03-05"),
        developer: "Crystal Dynamics",
        publisher: "Square Enix",
        genres: ["Acción-Aventura", "Plataformas", "Shooter", "Puzzles"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 320000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=M4SG6DfVvLs",
      },
      {
        title: "Uncharted: The Lost Legacy",
        description:
          "Para recuperar un antiguo artefacto indio legendario y mantenerlo fuera del alcance de un especulador de la guerra despiadado, Chloe Frazer debe recurrir a la ayuda de la renombrada mercenaria Nadine Ross. Juntas, se aventuran en lo profundo de las montañas de los Ghats occidentales de la India para localizar el Colmillo Dorado de Ganesh. En el camino, aprenderán a trabajar juntas y a aprovechar sus fortalezas únicas para desenterrar el misterio.\n\nEl juego ofrece una mezcla exótica de entornos urbanos, selvas y ruinas antiguas, manteniendo la acción cinematográfica y los escenarios espectaculares característicos de la serie. Introduce áreas de mundo más abierto que permiten la exploración libre en vehículo, junto con combates dinámicos y puzzles intrincados. Es una historia independiente sobre la identidad y el legado que expande el universo de Uncharted con nuevas protagonistas carismáticas.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2017-08-22"),
        developer: "Naughty Dog",
        publisher: "Sony Interactive Entertainment",
        genres: ["Acción-Aventura", "Shooter", "Plataformas", "Puzzles"],
        platforms: ["PS4", "PS5", "PC"],
        rating: 4.3,
        numberOfSales: 260000,
        stock: 5,
        videoUrl: "https://www.youtube.com/watch?v=-PhhiKPHTWM",
      },
      {
        title: "Firewatch",
        description:
          "El año es 1989. Eres Henry, un hombre que se ha retirado de su vida desordenada para trabajar como vigilante de incendios en el desierto de Wyoming. Encaramado en lo alto de una montaña, es tu trabajo buscar humo y mantener seguro el entorno natural. Tu única conexión con el mundo exterior es Delilah, tu supervisora, disponible en todo momento a través de una pequeña radio portátil.\n\nPero cuando algo extraño te saca de tu torre de vigilancia y te lleva al bosque, explorarás un entorno salvaje y desconocido, enfrentándote a preguntas y tomando decisiones que pueden construir o destruir la única relación significativa que tienes. Es un misterio en primera persona que enfatiza la narración madura y el diálogo reactivo, donde la belleza del aislamiento se mezcla con una creciente sensación de paranoia.",
        price: 9.99,
        isOnSale: true,
        salePrice: 3.99,
        isRefundable: true,
        releaseDate: new Date("2016-02-09"),
        developer: "Campo Santo",
        publisher: "Annapurna Interactive",
        genres: ["Aventura", "Simulacion", "Novela Visual"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.2,
        numberOfSales: 145000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=d02lhvvVSy8",
      },
      {
        title: "Outer Wilds",
        description:
          "Eres el nuevo recluta de Outer Wilds Ventures, un programa espacial incipiente que busca respuestas en un sistema solar extraño y en constante evolución. Los planetas de Outer Wilds están llenos de ubicaciones ocultas que cambian con el paso del tiempo. Visita una ciudad subterránea antes de que sea tragada por la arena, o esquiva ciclones gigantes en la superficie de un planeta oceánico.\n\nAtrapado en un bucle temporal infinito, cada expedición te permite aprender más sobre los antiguos Nomai y el misterio que rodea la inminente supernova. Armado con tu equipo de exploración, debes descifrar textos antiguos, seguir señales y resolver el enigma final del universo antes de que el sol explote y todo se reinicie. Es una experiencia única de descubrimiento impulsada por la curiosidad del jugador.",
        price: 24.99,
        isOnSale: false,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2019-05-28"),
        developer: "Mobius Digital",
        publisher: "Annapurna Interactive",
        genres: ["Aventura", "Puzzles", "Simulacion"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.7,
        numberOfSales: 180000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=d6LGnVCL1_A",
      },
      {
        title: "The Walking Dead: Season One",
        description:
          "Juega como Lee Everett, un criminal convicto al que se le ha dado una segunda oportunidad en la vida en un mundo devastado por los no muertos. Con cadáveres volviendo a la vida y supervivientes que no se detendrán ante nada para mantener su propia seguridad, proteger a una niña huérfana llamada Clementine puede ofrecerle redención en un mundo que se ha ido al infierno.\n\nEsta serie de juegos episódicos se centra en la narrativa y las consecuencias de tus decisiones. Cada elección que hagas, desde qué decir en una conversación hasta a quién salvar en una situación de vida o muerte, afectará el desarrollo de la historia y las relaciones con otros personajes. No se trata solo de sobrevivir a los zombis, sino de sobrevivir a la pérdida de humanidad en los vivos.",
        price: 14.99,
        isOnSale: true,
        salePrice: 7.99,
        isRefundable: true,
        releaseDate: new Date("2012-04-24"),
        developer: "Telltale Games",
        publisher: "Skybound Games",
        genres: ["Aventura", "Terror", "Novela Visual", "Survival Horror"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.1,
        numberOfSales: 290000,
        stock: 25,
        videoUrl: "https://www.youtube.com/watch?v=N40uY51s5Z0",
      },
      {
        title: "Control Deluxe Edition",
        description:
          "Tras una agencia secreta en Nueva York ser invadida por una amenaza de otro mundo, te conviertes en la nueva Directora luchando por recuperar el Control. Esta aventura de acción en tercera persona te desafía a dominar la combinación de habilidades sobrenaturales, cargas modificables y entornos reactivos mientras luchas a través de un mundo profundo e impredecible dentro de la 'Casa Inmemorial'.\n\nEl juego destaca por su ambientación de 'New Weird', mezclando la burocracia gubernamental con lo paranormal. Jesse Faden debe descubrir los secretos de la Oficina Federal de Control, utilizando telequinesis para lanzar objetos y enemigos, y levitar para navegar por una arquitectura brutalista y cambiante. La narrativa es críptica y fascinante, invitando a la exploración para entender la verdadera naturaleza del Hiss y el lugar de Jesse en todo ello.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2019-08-27"),
        developer: "Remedy Entertainment",
        publisher: "505 Games",
        genres: ["Acción-Aventura", "Shooter", "Metroidvania", "Accion"],
        platforms: ["PC", "PS4", "PS5", "Xbox One", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 200000,
        stock: 456,
        videoUrl: "https://www.youtube.com/watch?v=w6bE11FrSFM",
      },
      {
        title: "Elden Ring",
        description:
          "La Orden Dorada se ha roto. Levántate, Sinluz, y déjate guiar por la gracia para esgrimir el poder del Círculo de Elden y convertirte en un Señor del Círculo en las Tierras Intermedias. Este vasto mundo conecta a la perfección paisajes inmensos y mazmorras laberínticas de diseños complejos. Atraviesa el impresionante mundo a pie o a caballo, solo o en línea con otros jugadores, y sumérgete completamente en las llanuras de hierba, pantanos sofocantes y castillos premonitorios.\n\nEl juego define el género con su jugabilidad de rol de acción desafiante pero gratificante, ofreciendo una amplia variedad de armas, habilidades mágicas y estilos de combate que los jugadores pueden personalizar. Creado en colaboración con George R. R. Martin, el lore es profundo y misterioso, incentivando la exploración no lineal para descubrir secretos antiguos y enfrentar jefes colosales que pondrán a prueba tu habilidad y paciencia.",
        price: 59.99,
        isOnSale: true,
        salePrice: 39.99,
        isRefundable: true,
        releaseDate: new Date("2022-02-25"),
        developer: "FromSoftware",
        publisher: "Bandai Namco",
        genres: ["RPG", "Acción-Aventura", "Hack and Slash", "Sandbox"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 4.9,
        numberOfSales: 1400000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=CptaXqVY6-E",
      },
      {
        title: "The Witcher 3 - Wild Hunt",
        description:
          "Eres Geralt de Rivia, un cazador de monstruos mercenario. Ante ti se extiende un continente infestado de monstruos y devastado por la guerra que puedes explorar a tu antojo. Tu contrato actual: encontrar a Ciri, la niña de la profecía, un arma viviente que puede alterar la forma del mundo. El mundo abierto establece nuevos estándares en tamaño, profundidad y complejidad, con un ciclo día/noche dinámico y clima que afecta el juego.\n\nLa narrativa ramificada asegura que cada decisión tenga consecuencias significativas, a menudo grises moralmente, que pueden cambiar el destino de comunidades enteras. Además del combate con espadas y magia de señales, el juego ofrece un rico ecosistema de actividades secundarias, desde contratos de caza detallados hasta el adictivo juego de cartas Gwent. Es una obra maestra de la narración ambiental y el diseño de misiones.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2015-05-19"),
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        genres: ["RPG", "Acción-Aventura", "Accion"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.9,
        numberOfSales: 1300000,
        stock: 0,
        videoUrl: "https://www.youtube.com/watch?v=53MyR_Z3i1w",
      },

      {
        title: "Final Fantasy XVI",
        description:
          "Una oscura y madura reinvención de la legendaria franquicia que sigue a Clive Rosfield, el Primer Escudo de Rosaria, en una trágica búsqueda de venganza. El mundo de Valisthea se muere lentamente mientras la Plaga se extiende, y las naciones luchan por el control de los Cristales Madre. A diferencia de sus predecesores, este título apuesta por un combate de acción en tiempo real vertiginoso y visceral, donde el jugador puede encadenar ataques y habilidades mágicas devastadoras.\n\nEl punto culminante del juego son las batallas entre Eikons, enfrentamientos colosales y espectaculares entre las invocaciones más poderosas de la saga que redefinen la escala épica. La narrativa, rica en intriga política y drama personal, explora temas como el destino, la libertad y el sacrificio, ofreciendo una experiencia cinematográfica sin interrupciones que mantiene al jugador al borde de su asiento de principio a fin.",
        price: 69.99,
        isOnSale: false,
        salePrice: 41.99,
        isRefundable: true,
        releaseDate: new Date("2023-06-22"),
        developer: "Square Enix",
        publisher: "Square Enix",
        genres: ["RPG", "Accion", "Hack and Slash", "Aventura"],
        platforms: ["PS5", "PC"],
        rating: 4.2,
        numberOfSales: 240000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=iaJ4VVFGIa8",
      },
      {
        title: "The Elder Scrolls V: Skyrim",
        description:
          "Como el Dovahkiin, el Sangre de Dragón profetizado, eres el único capaz de enfrentarte a Alduin, el Devorador de Mundos, en una tierra desgarrada por la guerra civil. Skyrim ofrece una libertad inigualable en un mundo abierto masivo lleno de montañas nevadas, ciudades antiguas y mazmorras profundas. El sistema de progresión permite que 'seas lo que juegas', mejorando tus habilidades con el uso en lugar de elegir una clase predefinida, lo que permite crear desde un mago sigiloso hasta un guerrero con armadura pesada.\n\nLa inmersión es total con cientos de misiones secundarias, gremios a los que unirse y secretos por descubrir en cada rincón del mapa. Con la adición de la capacidad de construir casas, adoptar niños y luchar contra dragones en cualquier momento, el juego ofrece cientos de horas de contenido donde la curiosidad del jugador es la única brújula necesaria en esta provincia nórdica de Tamriel.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2011-11-11"),
        developer: "Bethesda Game Studios",
        publisher: "Bethesda Softworks",
        genres: ["RPG", "Aventura", "Sandbox", "Accion"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.8,
        numberOfSales: 1600000,
        stock: 876,
        videoUrl: "https://www.youtube.com/watch?v=6umhTJQltak",
      },
      {
        title: "Persona 5 Royal",
        description:
          "Ponte la máscara de Joker y únete a los Ladrones Fantasma de Corazones en esta versión definitiva del aclamado RPG. De día, eres un estudiante de secundaria en Tokio, gestionando tu tiempo entre clases, trabajos parciales y relaciones sociales que fortalecen tus habilidades. De noche, te infiltras en el Metaverso, una dimensión cognitiva donde robas los deseos distorsionados de adultos corruptos para reformar la sociedad.\n\nRoyal expande la experiencia original con un nuevo semestre, nuevos personajes jugables y mecánicas de combate refinadas que añaden profundidad estratégica a los enfrentamientos por turnos. Con un estilo visual inconfundible, una banda sonora de acid jazz vibrante y una narrativa que critica las injusticias sociales modernas, es una obra maestra de estilo y sustancia que te atrapará en su elegante mundo.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2020-03-31"),
        developer: "Atlus",
        publisher: "SEGA",
        genres: ["RPG", "TBS", "Simulacion", "Aventura"],
        platforms: ["PS4", "PS5", "Switch", "PC", "Xbox One", "Xbox Series X"],
        rating: 4.7,
        numberOfSales: 420000,
        stock: 54,
        videoUrl: "https://www.youtube.com/watch?v=SKpSpvFCZRw",
      },
      {
        title: "Divinity: Original Sin 2",
        description:
          "El Divino ha muerto, el Vacío se acerca y los poderes que yacen dormidos dentro de ti pronto despertarán. Elige tu raza y origen, o crea el tuyo propio, y embárcate en un viaje con hasta tres compañeros, cada uno con sus propias motivaciones y misiones personales. Este RPG destaca por su libertad táctica sin precedentes, donde el entorno es tu arma: usa la altura para obtener bonificaciones, moja a los enemigos para luego electrocutarlos o congela el suelo para hacerlos resbalar.\n\nLa interactividad del mundo es asombrosa; puedes hablar con cualquier NPC (e incluso con animales si tienes el talento), matar a cualquiera y encontrar múltiples soluciones para cada misión. Ya sea jugando solo o en cooperativo con amigos, la narrativa reactiva y el profundo sistema de combate por turnos aseguran que no haya dos partidas iguales en el mundo de Rivellon.",
        price: 44.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2017-09-14"),
        developer: "Larian Studios",
        publisher: "Larian Studios",
        genres: ["RPG", "TBS", "Estrategia", "Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.8,
        numberOfSales: 380000,
        stock: 90,
        videoUrl: "https://www.youtube.com/watch?v=bTWTFX8qzPI",
      },
      {
        title: "Mass Effect Legendary Edition",
        description:
          "Una persona es todo lo que se interpone entre la humanidad y la mayor amenaza a la que se haya enfrentado jamás. Revive la leyenda del Comandante Shepard en la aclamada trilogía remasterizada, con texturas mejoradas, modelos actualizados y mejoras en la jugabilidad. Tus decisiones tienen consecuencias profundas que se transmiten de un juego a otro, determinando quién vive, quién muere y el destino de civilizaciones enteras en la galaxia.\n\nExplora un universo rico y detallado, recluta un equipo de personajes diversos e inolvidables y entabla relaciones que van desde la lealtad inquebrantable hasta el romance. La mezcla de acción de disparos en tercera persona con elementos profundos de rol permite personalizar el combate y la historia, creando una odisea espacial personal y épica que ha definido el género de la ciencia ficción en los videojuegos.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2021-05-14"),
        developer: "BioWare",
        publisher: "Electronic Arts",
        genres: ["RPG", "Shooter", "Acción-Aventura", "Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.5,
        numberOfSales: 300000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=n8i53TtQ6IQ",
      },
      {
        title: "Dragon Age: Inquisition",
        description:
          "El cielo se ha abierto y llueve caos sobre el mundo de Thedas. Como el Inquisidor, es tu misión restaurar el orden y liderar una organización de héroes para descubrir la verdad detrás de la brecha. Este RPG combina la exploración de vastas regiones abiertas con una profunda gestión política y estratégica desde tu fortaleza, donde debes juzgar a prisioneros, enviar agentes a misiones y forjar alianzas.\n\nEl combate ofrece una mezcla de acción en tiempo real y pausa táctica, permitiéndote controlar a cada miembro de tu grupo para ejecutar combos devastadores. Con un elenco de compañeros complejos y una historia que cambia según tu raza, clase y decisiones morales, te enfrentarás a dragones de alto nivel y fuerzas demoníacas en una lucha épica por la supervivencia del mundo.",
        price: 19.99,
        isOnSale: true,
        salePrice: 7.99,
        isRefundable: true,
        releaseDate: new Date("2014-11-18"),
        developer: "BioWare",
        publisher: "Electronic Arts",
        genres: ["RPG", "Estrategia", "Acción-Aventura"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.1,
        numberOfSales: 350000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=jJqxfkgSUog",
      },
      {
        title: "Cyberpunk 2077",
        description:
          "Bienvenido a Night City, una megalópolis obsesionada con el poder, el glamur y la modificación corporal. Juegas como V, un mercenario proscrito que busca un implante único que es la clave de la inmortalidad. Personaliza el ciberware, las habilidades y el estilo de juego de tu personaje mientras exploras una ciudad inmensa donde las decisiones dan forma a la historia y al mundo que te rodea.\n\nComparte tu mente con el fantasma digital del rockero rebelde Johnny Silverhand, interpretado por Keanu Reeves, mientras te enfrentas a corporaciones despiadadas y pandillas callejeras. El juego ofrece una variedad de enfoques, desde el combate directo con armas futuristas hasta el hackeo sigiloso de redes neuronales, todo ambientado en un futuro distópico visualmente deslumbrante y narrativamente maduro.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2020-12-10"),
        developer: "CD Projekt Red",
        publisher: "CD Projekt",
        genres: ["RPG", "Shooter", "Sandbox", "Acción-Aventura"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.8,
        numberOfSales: 1100000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=VhM3NRu23Sk",
      },
      {
        title: "Pillars of Eternity II - Deadfire",
        description:
          "Persigue a un dios rebelde por tierra y mar en esta secuela del galardonado RPG isométrico. El dios Eothas ha despertado, matándote en el proceso, pero has regresado para cazarlo a través del archipiélago de Deadfire. Capitanea tu propio barco, que actúa como tu fortaleza móvil, mejorándolo y gestionando a tu tripulación para sobrevivir a encuentros navales tácticos y tormentas peligrosas.\n\nEl juego profundiza en las mecánicas de rol clásico con un sistema de doble clase que permite una personalización de personajes inmensa. Explora islas exóticas llenas de culturas diversas y conflictos políticos, donde tus elecciones pueden alinear o enemistar a facciones enteras. Ofrece la opción de jugar con combate en tiempo real con pausa o en un modo por turnos completo, adaptándose a tu estilo de estrategia preferido.",
        price: 34.99,
        isOnSale: true,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2018-05-08"),
        developer: "Obsidian Entertainment",
        publisher: "Paradox Interactive",
        genres: ["RPG", "Estrategia", "RTS", "TBS"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.4,
        numberOfSales: 95000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=lsZARCYYxME",
      },
      {
        title: "FIFA 23",
        description:
          "El juego del mundo cobra vida con la tecnología HyperMotion2, que ofrece un realismo de juego aún mayor, y la inclusión de la Copa Mundial de la FIFA masculina y femenina. Juega con los equipos de clubes femeninos por primera vez en la historia de la franquicia y disfruta de funciones de juego cruzado que facilitan jugar con amigos en diferentes plataformas. El modo carrera se ha profundizado, permitiéndote definir tu personalidad como jugador o gestionar un club con mayor autenticidad.\n\nFIFA Ultimate Team (FUT) sigue siendo el corazón del juego, con nuevas formas de construir tu plantilla soñada y Momentos FUT para desafíos rápidos. Con miles de jugadores, cientos de equipos y docenas de estadios licenciados, ofrece la experiencia de fútbol más completa, cerrando una era histórica bajo el nombre de FIFA con la entrega más ambiciosa hasta la fecha.",
        price: 59.99,
        isOnSale: true,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2022-09-27"),
        developer: "EA Sports",
        publisher: "Electronic Arts",
        genres: ["Deportes", "Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 3.7,
        numberOfSales: 2000000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=o3V-GvvzjE4",
      },
      {
        title: "NBA 2K23",
        description:
          "Ponte a la altura de las circunstancias y demuestra tu potencial en NBA 2K23. Revive la carrera de Michael Jordan con el regreso de los Desafíos Jordan, recreando sus hazañas más icónicas con una presentación de época auténtica. El modo Mi CARRERA te lleva a través de una narrativa cinematográfica donde debes navegar por la música, la moda y el baloncesto para convertirte en una leyenda, todo dentro de una Ciudad o Barrio masivo y vibrante.\n\nEl juego presenta mejoras significativas en la jugabilidad, con un nuevo arsenal de movimientos ofensivos y una defensa más intuitiva. MyTEAM ofrece la experiencia definitiva de colección de cartas de fantasía, permitiéndote formar equipos con estrellas actuales y leyendas de todos los tiempos. La atención al detalle en las animaciones y la presentación televisiva hacen que cada partido se sienta como una transmisión real de la NBA.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2022-09-09"),
        developer: "Visual Concepts",
        publisher: "2K Games",
        genres: ["Deportes", "Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 3.9,
        numberOfSales: 850000,
        stock: 1200,
        videoUrl: "https://www.youtube.com/watch?v=rBZ_q6wIJKY",
      },
      {
        title: "Madden NFL 23",
        description:
          "Juega a tu manera en los libros de historia con Madden NFL 23. La nueva tecnología FieldSENSE en las consolas de nueva generación proporciona una base para una jugabilidad consistente y ultrarrealista, dándote más control en cada posición. Toma decisiones ejecutivas en el modo Franchise con actualizaciones en la agencia libre y la lógica comercial, o crea tu propio legado en Face of the Franchise: The League.\n\nEl juego rinde homenaje al legendario John Madden, con una presentación que celebra su impacto en el deporte. Madden Ultimate Team te permite construir la lista de fantasía más poderosa con superestrellas actuales y leyendas del Salón de la Fama. Las mejoras en la IA defensiva y las mecánicas de pase de precisión ofrecen batallas más equilibradas y gratificantes en el campo.",
        price: 59.99,
        isOnSale: false,
        salePrice: 35.99,
        isRefundable: true,
        releaseDate: new Date("2022-08-19"),
        developer: "EA Tiburon",
        publisher: "Electronic Arts",
        genres: ["Deportes", "Simulacion", "Estrategia"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.5,
        numberOfSales: 420000,
        stock: 873,
        videoUrl: "https://www.youtube.com/watch?v=Qv6G_w8RUOo",
      },
      {
        title: "F1 23",
        description:
          "Sé el último en frenar en EA SPORTS F1 23, el videojuego oficial del Campeonato Mundial de Fórmula 1 de la FIA. El nuevo capítulo del emocionante modo historia 'Braking Point' ofrece drama de alta velocidad y rivalidades acaloradas. Experimenta la nueva pista de Las Vegas y el circuito de Qatar, y siente la acción con un manejo mejorado y la introducción de la tecnología Precision Drive para jugadores con mando.\n\nEl hub F1 World es un nuevo espacio que conecta varios modos de juego, ofreciendo contenido diario, semanal y estacional que pone a prueba tus habilidades. Gestiona tu equipo, mejora tu coche y compite en carreras multijugador clasificatorias. Con físicas de vehículos refinadas y una presentación de transmisión auténtica, es la simulación más inmersiva y accesible de la categoría reina del automovilismo hasta la fecha.",
        price: 59.99,
        isOnSale: true,
        salePrice: 39.99,
        isRefundable: true,
        releaseDate: new Date("2023-06-16"),
        developer: "Codemasters",
        publisher: "Electronic Arts",
        genres: ["Deportes", "Carreras", "Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 4.2,
        numberOfSales: 260000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=wHNgoRCWqTg",
      },
      {
        title: "Rocket League",
        description:
          "Fútbol y conducción chocan en esta secuela de alto octanaje basada en la física. Elige entre una variedad de vehículos de alto vuelo equipados con enormes cohetes propulsores y vuela por los aires para marcar goles aéreos increíbles y realizar paradas que cambian el juego. Es un deporte híbrido arcade que es fácil de aprender pero difícil de dominar, con una profundidad competitiva que ha generado una escena masiva de deportes electrónicos.\n\nEl juego ofrece personalización casi infinita de coches, modos de juego variados como baloncesto y hockey sobre hielo, y una jugabilidad cruzada completa entre todas las plataformas. La clave es el trabajo en equipo y el control preciso del vehículo, permitiendo jugadas espectaculares que desafían la gravedad. Con actualizaciones constantes y temporadas competitivas, la acción nunca se detiene en la arena.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2015-07-07"),
        developer: "Psyonix",
        publisher: "Psyonix",
        genres: ["Deportes", "Carreras", "Accion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 4.3,
        numberOfSales: 900000,
        stock: 3,
        videoUrl: "https://www.youtube.com/watch?v=SgSX3gOrj60",
      },
      {
        title: "Tony Hawk's Pro Skater 1 + 2",
        description:
          "Vuelve a disfrutar de los juegos de skate más icónicos de la historia, completamente remasterizados en una colección épica. Patina como el legendario Tony Hawk y la lista original de profesionales, además de nuevos talentos olímpicos, todo con gráficos en HD y una jugabilidad modernizada que mantiene la sensación clásica de los combos fluidos. La banda sonora que definió una era regresa junto con nuevos temas vibrantes.\n\nTodos los modos de juego originales están presentes, incluido el modo Carrera y el multijugador local a pantalla dividida. Las herramientas de creación 'Create-A-Park' y 'Create-A-Skater' han sido mejoradas, permitiéndote compartir tus creaciones con el mundo. Es una carta de amor al skateboarding que combina nostalgia pura con un diseño técnico pulido, perfecto tanto para veteranos de la serie como para nuevos jugadores.",
        price: 39.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2020-09-04"),
        developer: "Vicarious Visions",
        publisher: "Activision",
        genres: ["Deportes", "Simulacion", "Accion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 4.1,
        numberOfSales: 310000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=4paYDD0WIVY",
      },
      {
        title: "Football Manager 2023",
        description:
          "No te limites a elegir tácticas, crea tu propio estilo y dirígete a la gloria europea en la simulación de gestión de fútbol más realista. Toma el control total de tu club favorito, desde la gestión de los entrenamientos y las transferencias hasta las instrucciones en el día del partido. Con la licencia oficial de la UEFA Champions League y otras competiciones de clubes de la UEFA, la inmersión en la élite del fútbol es total.\n\nLa inteligencia artificial de los oponentes y el mercado de fichajes se han refinado para ofrecer un desafío más auténtico. Analiza el rendimiento con un centro de datos exhaustivo y utiliza la red de ojeadores para descubrir a la próxima superestrella mundial. Es un juego de profundidad infinita donde cada decisión cuenta y la narrativa de tu carrera se escribe partido a partido.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2022-11-08"),
        developer: "Sports Interactive",
        publisher: "SEGA",
        genres: ["Deportes", "Estrategia", "Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "Xbox One", "PS4", "Switch"],
        rating: 4.6,
        numberOfSales: 450000,
        stock: 65,
        videoUrl: "https://www.youtube.com/watch?v=ISJxT7VLzYg",
      },
      {
        title: "eFootball 2023",
        description:
          "Una nueva era de fútbol digital ha comenzado: 'PES' evoluciona a 'eFootball'. Este título gratuito ofrece una experiencia de simulación de fútbol centrada en el realismo y la jugabilidad justa. Construye tu propio 'Dream Team' fichando y desarrollando a tus jugadores y entrenadores favoritos, y compite contra usuarios de todo el mundo en torneos y ligas online.\n\nEl juego recibe actualizaciones semanales en vivo que reflejan los datos del mundo real, afectando las condiciones y valoraciones de los jugadores. Aunque se lanzó con una recepción mixta, las actualizaciones continuas han buscado refinar las mecánicas de pase, regate y defensa para ofrecer un control más preciso. Es una plataforma en constante evolución diseñada para ser el punto de encuentro de los aficionados al fútbol virtual.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2021-09-30"),
        developer: "Konami",
        publisher: "Konami",
        genres: ["Deportes", "Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 2.8,
        numberOfSales: 150000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=27Fa0aH2Pgg",
      },
      {
        title: "PGA Tour 2K23",
        description:
          "Toma tu lugar en el tee y domina el green en la experiencia de golf más auténtica y visualmente impresionante hasta la fecha. PGA Tour 2K23 te permite jugar como los profesionales, incluido Tiger Woods, o crear tu propio legado en el modo MyPLAYER. Personaliza tu golfista con marcas y ropa del mundo real, y desarrolla tus habilidades a medida que compites en campos de golf con licencia oficial meticulosamente recreados.\n\nEl juego presenta un nuevo sistema de swing de tres clics opcional para mayor accesibilidad, además del tradicional stick analógico. El diseñador de campos te permite construir el campo de tus sueños y compartirlo con la comunidad en línea. Con modos multijugador competitivos como Divot Derby y sociedades en línea, hay infinitas formas de probar tu hándicap contra jugadores de todo el mundo.",
        price: 49.99,
        isOnSale: true,
        salePrice: 24.99,
        isRefundable: true,
        releaseDate: new Date("2022-10-14"),
        developer: "HB Studios",
        publisher: "2K Games",
        genres: ["Deportes", "Simulacion", "Estrategia"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 95000,
        stock: 78,
        videoUrl: "https://www.youtube.com/watch?v=tgTgzWFVtS0",
      },
      {
        title: "MotoGP 23",
        description:
          "Siente la adrenalina pura de las carreras de motos de élite con el videojuego oficial del campeonato. MotoGP 23 introduce un sistema de clima dinámico que puede cambiar las condiciones de la carrera en tiempo real, obligándote a tomar decisiones estratégicas como entrar en boxes para cambiar de moto en las carreras 'Flag to Flag'. La inteligencia artificial neuronal avanzada garantiza que cada oponente reaccione de manera realista a tus movimientos.\n\nEl modo carrera renovado te permite empezar desde Moto3 y ascender hasta la categoría reina, gestionando relaciones con otros pilotos y equipos a través de una red social dentro del juego. Con ayudas de conducción personalizables y la nueva Academia MotoGP, tanto los veteranos como los novatos pueden encontrar su ritmo en la pista y competir por el título mundial.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2023-04-06"),
        developer: "Milestone",
        publisher: "Milestone",
        genres: ["Deportes", "Carreras", "Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 3.8,
        numberOfSales: 60000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=0ebBuFz44LQ",
      },
      {
        title: "Civilization VI",
        description:
          "Construye un imperio que resista el paso del tiempo, desde la Edad de Piedra hasta la Era de la Información. En esta entrega, las ciudades se expanden físicamente por el mapa, creando nuevos desafíos estratégicos y oportunidades para aprovechar el terreno. Investiga tecnologías y culturas para desbloquear nuevos potenciales y compite o coopera con líderes históricos famosos, cada uno con sus propias agendas y habilidades únicas.\n\nEl juego ofrece múltiples caminos hacia la victoria, ya sea a través de la dominación militar, la supremacía cultural, la ciencia avanzada o la diplomacia religiosa. La diplomacia dinámica evoluciona a medida que avanza el juego, desde interacciones primitivas hasta alianzas y negociaciones complejas en la era moderna. Es una experiencia profunda y adictiva de 'un turno más' que desafía tu capacidad para planificar y adaptarte.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2016-10-21"),
        developer: "Firaxis Games",
        publisher: "2K Games",
        genres: ["Estrategia", "TBS", "Simulacion"],
        platforms: ["PC", "Switch", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.4,
        numberOfSales: 780000,
        stock: 65,
        videoUrl: "https://www.youtube.com/watch?v=5KdE0p2joJw",
      },
      {
        title: "XCOM 2",
        description:
          "La Tierra ha cambiado. Veinte años han pasado desde que los líderes mundiales ofrecieron una rendición incondicional a las fuerzas alienígenas. Ahora, los extraterrestres construyen ciudades brillantes que prometen un futuro brillante para la humanidad, mientras ocultan una agenda siniestra. Como comandante de una fuerza paramilitar olvidada, XCOM, debes encender una resistencia global para reclamar nuestro mundo y salvar a la humanidad.\n\nGestiona tu base móvil, el Avenger, investiga tecnología alienígena y entrena a soldados con habilidades únicas para enfrentarte a enemigos superiores en combates tácticos por turnos. El juego introduce mecánicas de sigilo y escenarios procedimentales que aseguran que cada misión sea única y desafiante. La tensión es constante, ya que cada decisión puede significar la diferencia entre la victoria y la pérdida permanente de tus mejores soldados.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2016-02-05"),
        developer: "Firaxis Games",
        publisher: "2K Games",
        genres: ["Estrategia", "TBS", "Ciencia Ficción"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.2,
        numberOfSales: 420000,
        stock: 556,
        videoUrl: "https://www.youtube.com/watch?v=ZlF4_o3qALo",
      },
      {
        title: "Age of Empires IV",
        description:
          "Regresa la aclamada franquicia de estrategia en tiempo real, poniéndote en el centro de las batallas históricas épicas que dieron forma al mundo moderno. Elige entre 8 civilizaciones diversas, desde los ingleses hasta los mongoles, y guíalas a través de cuatro campañas distintas con 35 misiones que abarcan 500 años de historia. El juego combina una jugabilidad clásica y familiar con innovaciones modernas y gráficos en 4K impresionantes.\n\nDocumentales históricos de estilo cinematográfico acompañan a las campañas, sumergiéndote en el contexto real de tus batallas. Las mecánicas de asedio, la guerra naval y las emboscadas en bosques añaden capas de profundidad estratégica. Ya sea jugando contra la IA o compitiendo en línea, el juego desafía tu capacidad para gestionar recursos, construir ejércitos y ejecutar tácticas militares en tiempo real.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2021-10-28"),
        developer: "Relic Entertainment",
        publisher: "Microsoft Studios",
        genres: ["Estrategia", "RTS", "Simulacion"],
        platforms: ["PC", "Xbox Series X", "Xbox One"],
        rating: 3.9,
        numberOfSales: 200000,
        stock: 223,
        videoUrl: "https://www.youtube.com/watch?v=5TnynE3PuDE",
      },
      {
        title: "Total War - WARHAMMER 2",
        description:
          "La secuela del galardonado juego de estrategia ofrece una campaña de exploración, expansión y conquista a través del Nuevo Mundo. Elige entre cuatro razas únicas: los Altos Elfos, los Elfos Oscuros, los Hombres Lagarto y los Skaven, cada una con sus propias mecánicas de campaña y unidades de batalla distintivas. Lucha por el control del Gran Vórtice en una carrera narrativa tensa o simplemente conquista a tus enemigos en el modo sandbox.\n\nEl juego combina una gestión de imperio por turnos profunda con batallas en tiempo real masivas y espectaculares, donde miles de soldados, monstruos y héroes legendarios chocan en el campo de batalla. La magia juega un papel crucial, permitiendo desatar hechizos devastadores que pueden cambiar el rumbo de la guerra. Es una fusión épica de la escala de Total War con la rica fantasía de Warhammer.",
        price: 39.99,
        isOnSale: true,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2017-09-28"),
        developer: "Creative Assembly",
        publisher: "SEGA",
        genres: ["Estrategia", "RTS", "TBS"],
        platforms: ["PC"],
        rating: 4.3,
        numberOfSales: 350000,
        stock: 654,
        videoUrl: "https://www.youtube.com/watch?v=fXxe897bW-A",
      },
      {
        title: "Stellaris",
        description:
          "Explora una galaxia vasta y llena de maravillas en este juego de gran estrategia de ciencia ficción. Comienza con una civilización que acaba de descubrir el viaje interestelar y expande tu imperio a través de las estrellas. Encuentra una miríada de especies alienígenas generadas proceduralmente, cada una con sus propios rasgos y filosofías, y decide si interactuar con ellas a través de la diplomacia, el comercio o la guerra.\n\nEl juego ofrece una profundidad inmensa en la gestión de tu imperio, desde el diseño de naves espaciales hasta la política interna y la investigación científica. Eventos aleatorios y crisis de final de juego aseguran que cada partida sea una historia emergente única. Es un sandbox galáctico donde puedes ser un explorador pacífico, un tirano conquistador o el líder de una federación galáctica.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2016-05-09"),
        developer: "Paradox Interactive",
        publisher: "Paradox Interactive",
        genres: ["Estrategia", "RTS", "Simulacion"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.1,
        numberOfSales: 260000,
        stock: 234,
        videoUrl: "https://www.youtube.com/watch?v=zW3YB2ptGws",
      },
      {
        title: "Crusader Kings III",
        description:
          "Tu legado espera. Elige una casa noble y guía a tu dinastía a través de los siglos en la Edad Media. Gestiona tus tierras, títulos y vasallos en un mapa que se extiende desde Islandia hasta la India. Pero el verdadero corazón del juego son los personajes: cada uno tiene una personalidad única, rasgos y secretos que influyen en sus acciones y relaciones. La intriga, el asesinato y los matrimonios políticos son herramientas tan válidas como la guerra.\n\nEl juego combina la gran estrategia con elementos de juego de rol, permitiéndote vivir la vida de un gobernante medieval con todas sus complejidades y dramas. Crea tu propia religión, desarrolla tu cultura y asegúrate de tener un heredero digno para continuar tu linaje. Es un simulador de historias dinámico donde el drama personal y la política global se entrelazan.",
        price: 49.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2020-09-01"),
        developer: "Paradox Development Studio",
        publisher: "Paradox Interactive",
        genres: ["Estrategia", "RPG", "Simulacion"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 4.5,
        numberOfSales: 220000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=xjn66Cl3pMA",
      },
      {
        title: "Company of Heroes 2",
        description:
          "Experimenta la brutalidad del Frente Oriental en la Segunda Guerra Mundial. Toma el mando del Ejército Rojo soviético en su lucha desesperada para repeler a los invasores nazis de la Madre Rusia. El motor Essence 3.0 ofrece gráficos realistas y un sistema de destrucción ambiental que cambia el campo de batalla dinámicamente. La tecnología TrueSight simula la línea de visión real de las unidades, añadiendo una capa profunda de táctica y sigilo.\n\nEl clima extremo juega un papel fundamental; el 'General Invierno' puede congelar a tus tropas o romper el hielo bajo los tanques enemigos. Además de la campaña cinematográfica, el juego cuenta con un multijugador competitivo robusto donde la gestión de recursos, el posicionamiento de unidades y el uso combinado de armas son clave para la victoria en batallas intensas y estratégicas.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2013-06-25"),
        developer: "Relic Entertainment",
        publisher: "SEGA",
        genres: ["Estrategia", "RTS"],
        platforms: ["PC"],
        rating: 4.0,
        numberOfSales: 180000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=cUdezMxCY9s",
      },
      {
        title: "Anno 1800",
        description:
          "Bienvenido al amanecer de la Era Industrial. Elige tu camino y define tu mundo en un momento de rápido cambio tecnológico y social. Construye ciudades enormes, crea redes logísticas complejas, coloniza nuevos continentes exóticos y domina a tus oponentes mediante la diplomacia, el comercio o la guerra. El juego ofrece una experiencia de construcción de ciudades rica y detallada con una profunda gestión de cadenas de producción.\n\nEquilibra las necesidades de tu población creciente con las demandas de la industria y el impacto ambiental. Las expediciones y el comercio internacional añaden una dimensión global a tu imperio. Con modos de campaña, sandbox y multijugador, Anno 1800 desafía tanto a los planificadores meticulosos como a los estrategas oportunistas en uno de los simuladores económicos más completos disponibles.",
        price: 39.99,
        isOnSale: true,
        salePrice: 14.99,
        isRefundable: true,
        releaseDate: new Date("2019-04-16"),
        developer: "Blue Byte",
        publisher: "Ubisoft",
        genres: ["Estrategia", "Simulacion", "RTS"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 4.1,
        numberOfSales: 210000,
        stock: 5,
        videoUrl: "https://www.youtube.com/watch?v=JEYiNIJHUa8",
      },
      {
        title: "StarCraft II",
        description:
          "El juego que definió los deportes electrónicos modernos. Lidera a los terran, los protoss o los zerg en una guerra intergaláctica por la supervivencia. Con tres campañas épicas que siguen a personajes icónicos como Jim Raynor y Kerrigan, la historia explora traiciones, redenciones y conflictos cósmicos. La jugabilidad de estrategia en tiempo real es rápida, precisa y equilibrada, exigiendo reflejos rápidos y pensamiento táctico agudo.\n\nEl modo multijugador es legendario por su profundidad competitiva y su techo de habilidad casi infinito. Además, el modo cooperativo permite a los jugadores unirse para enfrentar misiones desafiantes con comandantes únicos y habilidades especiales. Con un editor de mapas potente y una comunidad activa, StarCraft II sigue siendo el referente de oro para el género RTS.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2010-07-27"),
        developer: "Blizzard Entertainment",
        publisher: "Blizzard Entertainment",
        genres: ["Estrategia", "RTS"],
        platforms: ["PC"],
        rating: 4.2,
        numberOfSales: 950000,
        stock: 10,
        videoUrl: "https://www.youtube.com/watch?v=aVtXac6if14",
      },
      {
        title: "Warcraft III - Reforged",
        description:
          "Revive los eventos que dieron forma al mundo de Azeroth en esta reimaginación completa del clásico de estrategia en tiempo real. Comanda a los Elfos de la Noche, los No Muertos, los Orcos y los Humanos a medida que las alianzas cambian y los ejércitos chocan en una campaña narrativa épica con más de 60 misiones. Los gráficos han sido completamente actualizados con nuevos modelos y entornos, manteniendo el estilo artístico distintivo de Blizzard.\n\nEl juego incluye tanto 'Reign of Chaos' como su expansión 'The Frozen Throne'. El editor de mundos mejorado permite a la comunidad crear modos de juego personalizados, continuando el legado que dio origen a géneros enteros como los MOBA. Aunque el lanzamiento tuvo controversias, sigue ofreciendo una jugabilidad RTS clásica centrada en héroes poderosos y gestión de bases.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2020-01-28"),
        developer: "Blizzard Entertainment",
        publisher: "Blizzard Entertainment",
        genres: ["Estrategia", "RTS"],
        platforms: ["PC"],
        rating: 2.9,
        numberOfSales: 120000,
        stock: 23,
        videoUrl: "https://www.youtube.com/watch?v=Q2zfx5hQ3CE",
      },
      {
        title: "Microsoft Flight Simulator",
        description:
          "Surca los cielos y experimenta la alegría de volar en la próxima generación de Microsoft Flight Simulator. El mundo está al alcance de tu mano: viaja por un planeta increíblemente detallado con más de 37 mil aeropuertos, 2 millones de ciudades, 1.5 mil millones de edificios, montañas reales, carreteras, árboles, ríos, animales, tráfico y más. Todo recreado con datos satelitales y tecnología de inteligencia artificial de Azure.\n\nPon a prueba tus habilidades de pilotaje en una variedad de aeronaves, desde aviones ligeros hasta jets comerciales de fuselaje ancho, con modelos de vuelo altamente realistas. El sistema de clima en tiempo real y el ciclo día/noche dinámico hacen que cada vuelo sea una experiencia única y visualmente espectacular. Es más que un juego; es una simulación técnica y una carta de amor a la aviación y a nuestro planeta.",
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
        videoUrl: "https://www.youtube.com/watch?v=BTETsm79D3A",
      },
      {
        title: "The Sims 4",
        description:
          "Da rienda suelta a tu imaginación y crea un mundo único de Sims que sea una expresión de ti mismo. Personaliza cada detalle de tus Sims, desde su apariencia y personalidad hasta sus aspiraciones y estilos de caminar. Construye la casa perfecta para ellos con el modo de construcción intuitivo, eligiendo muebles y decoraciones que se adapten a tu estilo.\n\nGuía las historias de tus Sims, gestionando sus carreras, relaciones y habilidades. Explora mundos vibrantes, conoce nuevos vecindarios y descubre lugares interesantes. Con actualizaciones constantes y una gran cantidad de paquetes de expansión, las posibilidades son infinitas. Es el simulador de vida definitivo que te permite jugar con la vida y contar historias divertidas, dramáticas o extrañas.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2014-09-02"),
        developer: "Maxis",
        publisher: "Electronic Arts",
        genres: ["Simulacion", "Estrategia"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 1100000,
        stock: 298,
        videoUrl: "https://www.youtube.com/watch?v=DyNv44QR14g",
      },
      {
        title: "Euro Truck Simulator 2",
        description:
          "Viaja por Europa como el rey de la carretera, un camionero que entrega cargas importantes a través de distancias impresionantes. Con docenas de ciudades para explorar desde el Reino Unido hasta Italia, tu resistencia, habilidad y velocidad serán puestas a prueba al límite. Construye tu propia flota de camiones, compra garajes, contrata conductores y gestiona tu empresa para obtener el máximo beneficio.\n\nEl juego ofrece una recreación fiel de camiones reales con miles de opciones de personalización, desde el rendimiento hasta la estética. Las carreteras y los puntos de referencia están basados en lugares reales, ofreciendo una experiencia de conducción relajante e inmersiva. Con una comunidad de modding activa y soporte continuo de los desarrolladores, es el simulador de transporte por excelencia.",
        price: 9.99,
        isOnSale: true,
        salePrice: 3.99,
        isRefundable: true,
        releaseDate: new Date("2012-10-19"),
        developer: "SCS Software",
        publisher: "SCS Software",
        genres: ["Simulacion", "Carreras"],
        platforms: ["PC"],
        rating: 4.3,
        numberOfSales: 650000,
        stock: 234,
        videoUrl: "https://www.youtube.com/watch?v=5uvwfskYwl0",
      },
      {
        title: "Cities - Skylines",
        description:
          "Cities: Skylines ofrece una versión moderna de la simulación clásica de ciudades. El juego introduce nuevos elementos de juego para darse cuenta de la emoción y las dificultades de crear y mantener una ciudad real, al tiempo que expande algunos tropos bien establecidos de la experiencia de construcción de ciudades. Desde la zonificación y la construcción de carreteras hasta la gestión de servicios públicos y políticas fiscales, tienes el control total.\n\nEl sistema de transporte es profundo y realista, permitiéndote optimizar el flujo de tráfico y el transporte público para evitar atascos. Gestiona la educación, la salud, la seguridad y el ocio para mantener felices a tus ciudadanos. Con un soporte robusto para mods, puedes personalizar tu ciudad hasta el último detalle o descargar creaciones de la comunidad para expandir tu experiencia urbana.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2015-03-10"),
        developer: "Colossal Order",
        publisher: "Paradox Interactive",
        genres: ["Simulacion", "Estrategia"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.5,
        numberOfSales: 420000,
        stock: 345,
        videoUrl: "https://www.youtube.com/watch?v=CpWe03NhXKs",
      },
      {
        title: "Kerbal Space Program",
        description:
          "Toma el control del programa espacial de la raza alienígena Kerbal, criaturas hilarantes y propensas a accidentes. Tu misión es construir cohetes, aviones y rovers que funcionen, y lanzarlos al espacio para cumplir misiones de exploración. El juego se basa en una simulación de física orbital (N-body simulation) precisa y brutal, lo que significa que el éxito requiere una comprensión genuina de la aerodinámica y la mecánica orbital.\n\nDesde simples vuelos suborbitales hasta complejas misiones de acoplamiento y viajes interplanetarios al planeta Jool (una parodia de Júpiter), cada logro se siente ganado con esfuerzo. El juego fomenta la experimentación y el 'falla rápido' mientras gestionas tu centro espacial y desarrollas nuevas tecnologías. Es una mezcla única de sandbox de construcción, simulador educativo de ciencia y comedia de muñecos de trapo espacial.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2015-04-27"),
        developer: "Squad",
        publisher: "Private Division",
        genres: [
          "Simulacion",
          "Estrategia",
          "Educativo",
          "Sandbox",
          "Ciencia Ficción",
        ],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X", "Switch"],
        rating: 4.4,
        numberOfSales: 200000,
        stock: 231,
        videoUrl: "https://www.youtube.com/watch?v=aAa9Ao26gtM",
      },
      {
        title: "Assetto Corsa",
        description:
          "Considerado un referente en la simulación de carreras, Assetto Corsa se centra en proporcionar la experiencia de conducción más realista posible. Su motor de física avanzada recrea con precisión el comportamiento dinámico de cada vehículo, desde la interacción con la superficie de la pista hasta la simulación detallada del desgaste de los neumáticos. Cada milisegundo de tu tiempo de vuelta depende de la precisión de tu entrada y de cómo gestionas la transferencia de peso.\n\nEl juego cuenta con una selección de coches deportivos de ensueño y circuitos de carreras legendarios recreados mediante tecnología de escaneo láser para una fidelidad de superficie sin igual. Aunque es un juego para entusiastas de la simulación, su robusto soporte para modding en PC ha extendido su vida útil y su contenido más allá de la oferta oficial, consolidándolo como una plataforma de carreras virtual para competidores serios.",
        price: 19.99,
        isOnSale: true,
        salePrice: 7.99,
        isRefundable: true,
        releaseDate: new Date("2014-12-19"),
        developer: "Kunos Simulazioni",
        publisher: "505 Games",
        genres: ["Simulacion", "Carreras", "Deportes"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.2,
        numberOfSales: 175000,
        stock: 6,
        videoUrl: "https://www.youtube.com/watch?v=TDFN-E30jhU",
      },
      {
        title: "Farming Simulator 22",
        description:
          "Vive la vida de un agricultor moderno y construye tu granja en tres entornos diversos, inspirados en paisajes europeos y americanos. El juego ofrece una profundidad sin igual en la simulación agrícola, con el manejo de maquinaria auténtica y licenciada de más de 100 marcas reales, incluyendo John Deere, CLAAS y Case IH. Las cadenas de producción añaden una capa de gestión económica: procesa tus cultivos en bienes valiosos como pan o aceite para aumentar tus ingresos.\n\nLa principal adición a esta entrega es la inclusión de ciclos estacionales, obligándote a planificar con antelación las siembras y cosechas. Además, el multijugador cooperativo permite a varios amigos gestionar la misma granja juntos. Cosecha, cría ganado y explora la silvicultura en este gigantesco sandbox agrícola.",
        price: 34.99,
        isOnSale: false,
        salePrice: 20.99,
        isRefundable: true,
        releaseDate: new Date("2021-11-22"),
        developer: "Giants Software",
        publisher: "Focus Home Interactive",
        genres: ["Simulacion", "Estrategia", "Sandbox", "Gestión"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.8,
        numberOfSales: 90000,
        stock: 876,
        videoUrl: "https://www.youtube.com/watch?v=qg9VPiUtaic",
      },
      {
        title: "Planet Coaster",
        description:
          "Crea y gestiona el parque de atracciones de tus sueños con herramientas de construcción creativas sin igual. Planet Coaster te permite diseñar montañas rusas espectaculares, pieza por pieza, sin límites de creatividad. Desde giros que desafían la gravedad hasta inmersiones de vértigo, el proceso de diseño es tan satisfactorio como ver a tus Sims (los visitantes) disfrutar de la atracción. \n\nLa simulación de gestión es profunda: equilibra tus finanzas, contrata y capacita a tu personal (incluidos mecánicos y encargados de limpieza) y mantén felices a tus visitantes ajustando precios y asegurando que las colas sean cortas. La comunidad puede compartir sus creaciones, desde atracciones hasta escenarios completos, en la plataforma de intercambio, proporcionando una fuente inagotable de contenido. Es una experiencia de construcción de ciudades y gestión llena de encanto y posibilidades.",
        price: 29.99,
        isOnSale: true,
        salePrice: 12.99,
        isRefundable: true,
        releaseDate: new Date("2016-11-17"),
        developer: "Frontier Developments",
        publisher: "Frontier Developments",
        genres: [
          "Simulacion",
          "Estrategia",
          "Construcción de Ciudades",
          "Gestión",
        ],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.1,
        numberOfSales: 160000,
        stock: 1233,
        videoUrl: "https://www.youtube.com/watch?v=91Kli1Uwk9g",
      },
      {
        title: "No Man's Sky",
        description:
          "Lánzate a un universo infinito generado por procedimientos donde cada estrella es un sol que puedes visitar. Comienza varado en un planeta inexplorado, y tu viaje te llevará a través de la exploración, la supervivencia, el combate, el comercio y el descubrimiento. El corazón del juego es la libertad de explorar planetas con ecosistemas, flora y fauna únicos, nombrar nuevos descubrimientos y recopilar recursos para mejorar tu traje, nave y armamento.\n\nEl juego ha evolucionado drásticamente desde su lanzamiento con actualizaciones masivas que han añadido multijugador completo, creación de bases, gestión de flotas, viajes en vehículos terrestres y una narrativa más profunda. Es una odisea de ciencia ficción que te invita a forjar tu propio camino y a desentrañar los misterios del Atlas en el centro de la galaxia.",
        price: 49.99,
        isOnSale: false,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2016-08-09"),
        developer: "Hello Games",
        publisher: "Hello Games",
        genres: [
          "Simulacion",
          "Exploración",
          "Supervivencia",
          "Ciencia Ficción",
          "Aventura",
        ],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 4.0,
        numberOfSales: 750000,
        stock: 123,
        videoUrl: "https://www.youtube.com/watch?v=OjoTHi2FI04",
      },
      {
        title: "Ship Simulator Extremes",
        description:
          "Simulador naval que pone a prueba tus habilidades de navegación y manejo en algunas de las condiciones marítimas más extremas del mundo. Toma el mando de una variedad de embarcaciones, desde lanchas rápidas y yates de lujo hasta remolcadores gigantes y petroleros. Las misiones varían desde rescates dramáticos en aguas bravas y transporte de mercancías peligrosas hasta la participación en operaciones de protesta ambiental con barcos de Greenpeace.\n\nEl juego enfatiza el realismo del manejo y los desafíos ambientales, con simulaciones de olas, corrientes y clima muy detalladas. Navega por puertos icónicos del mundo y domina las complejidades de la física de la navegación para completar tus contratos y enfrentar los peligros del mar abierto. Es una simulación de nicho para aquellos fascinados por la vida marítima y los desafíos de la ingeniería naval.",
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
        videoUrl: "https://www.youtube.com/watch?v=rnny6Ux643o",
      },
      {
        title: "Resident Evil 4 Remake",
        description:
          "El clásico que redefinió el género de terror de supervivencia y acción regresa reimaginado para una audiencia moderna. El agente del gobierno Leon S. Kennedy es enviado a una aldea rural en España para rescatar a Ashley Graham, la hija del presidente, y se enfrenta a los Ganados, un nuevo tipo de enemigo infectado por el parásito 'Las Plagas'. El remake mantiene la tensión opresiva y los puzles del original, pero con una cámara sobre el hombro completamente modernizada y controles de disparo fluidos.\n\nSe han añadido nuevas mecánicas, como la capacidad de Leon de parar ataques con su cuchillo, lo que introduce un elemento estratégico en el combate cuerpo a cuerpo. Los gráficos de última generación elevan la atmósfera de terror y desesperación, haciendo que los encuentros icónicos y las persecuciones sean más aterradoras y viscerales que nunca. Es la forma definitiva de experimentar una obra maestra del terror de acción.",
        price: 39.99,
        isOnSale: true,
        salePrice: 24.99,
        isRefundable: true,
        releaseDate: new Date("2023-03-24"),
        developer: "Capcom",
        publisher: "Capcom",
        genres: ["Survival Horror", "Accion", "Aventura", "Shooter"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4"],
        rating: 4.5,
        numberOfSales: 540000,
        stock: 45,
        videoUrl: "https://www.youtube.com/watch?v=O75Ip4o1bs8",
      },
      {
        title: "Amnesia: The Dark Descent",
        description:
          "Uno de los juegos que popularizó la nueva ola de horror de supervivencia sin combate. Asumes el papel de Daniel, que despierta sin memoria en el lúgubre Castillo de Brennenburg. El terror reside en la vulnerabilidad: no tienes armas y la única forma de sobrevivir es correr, esconderte y resolver puzles mientras gestionas tu cordura (Sanity).\n\nEl sistema de cordura es central: permanecer demasiado tiempo en la oscuridad o mirar directamente a los monstruos reducirá tu salud mental, lo que provocará alucinaciones y hará que Daniel sea un blanco más fácil. La atmósfera opresiva, el sonido ambiental y la narrativa de terror psicológico te sumergen en una pesadilla donde la luz es tu única amiga y el miedo es tu peor enemigo. Es un pilar del horror moderno que se basa en la indefensión para generar pánico genuino.",
        price: 9.99,
        isOnSale: false,
        salePrice: 5.99,
        isRefundable: true,
        releaseDate: new Date("2010-09-08"),
        developer: "Frictional Games",
        publisher: "Frictional Games",
        genres: ["Horror Psicológico", "Aventura", "Supervivencia", "Puzzles"],
        platforms: ["PC", "PS4", "Xbox One", "Switch"],
        rating: 4.2,
        numberOfSales: 220000,
        stock: 87,
        videoUrl: "https://www.youtube.com/watch?v=u1nY_5-UrY4",
      },
      {
        title: "Outlast",
        description:
          "Un intenso juego de terror en primera persona que te pone en la piel de Miles Upshur, un periodista de investigación que se infiltra en el Mount Massive Asylum, un hospital psiquiátrico remoto. Desarmado e incapaz de luchar, tu única herramienta para navegar por los oscuros pasillos es una videocámara con visión nocturna, cuya batería se agota constantemente, añadiendo una capa de gestión de recursos y tensión.\n\nEl juego se centra en la mecánica de **esconderse y huir**. Debes evitar a los pacientes enloquecidos y a las figuras siniestras mientras intentas documentar los horrores del manicomio. La atmósfera de 'found footage' y los momentos de persecución implacable lo convierten en una experiencia de terror visceral y trepidante, famosa por sus jumpscares y su entorno claustrofóbico.",
        price: 14.99,
        isOnSale: true,
        salePrice: 4.99,
        isRefundable: true,
        releaseDate: new Date("2013-09-04"),
        developer: "Red Barrels",
        publisher: "Red Barrels",
        genres: [
          "Survival Horror",
          "Stealth",
          "Aventura",
          "Horror Psicológico",
        ],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 310000,
        stock: 56,
        videoUrl: "https://www.youtube.com/watch?v=uKA-IA4locM",
      },
      {
        title: "Alien: Isolation",
        description:
          "Juega como Amanda Ripley, la hija de Ellen Ripley, en una misión para descubrir la verdad detrás de la desaparición de su madre, diez años después de los eventos de la película 'Alien'. Varada en la estación espacial Sevastopol, te enfrentarás a un único y persistente Xenomorfo que es implacablemente inteligente y adaptable. Este juego se centra en el horror de supervivencia puro, obligándote a usar el sigilo, el ingenio y el ruido para evadir a tu depredador.\n\nEl juego recrea fielmente la estética retro-futurista de 1979, y el Alien utiliza una IA dinámica que no sigue patrones predecibles, lo que significa que la tensión es constante y la sensación de vulnerabilidad es máxima. La escasez de recursos y la necesidad de fabricar herramientas te obligarán a tomar decisiones difíciles mientras luchas por sobrevivir, no solo contra el Alien, sino también contra androides hostiles y humanos desesperados.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2014-10-07"),
        developer: "Creative Assembly",
        publisher: "SEGA",
        genres: ["Survival Horror", "Stealth", "Ciencia Ficción"],
        platforms: ["PC", "PS4", "Xbox One", "PS3", "Xbox 360", "Switch"],
        rating: 4.4,
        numberOfSales: 290000,
        stock: 23,
        videoUrl: "https://www.youtube.com/watch?v=7h0cgmvIrZw",
      },
      {
        title: "The Evil Within",
        description:
          "Del creador de Resident Evil, Shinji Mikami, llega una visión del terror donde el detective Sebastian Castellanos se adentra en un mundo de pesadilla después de investigar una escena de asesinato masivo. Atrapado en una realidad distorsionada y volátil, debe enfrentarse a criaturas grotescas y descubrir la fuente de la maldad. El juego combina el terror psicológico con la acción tensa, donde la munición es escasa y cada encuentro es un desafío de vida o muerte.\n\nLa atmósfera es opresiva, con cambios de entorno instantáneos que reflejan el estado mental fracturado del protagonista. Las trampas mortales y los puzles retorcidos se encuentran en cada esquina, obligándote a usar la estrategia para conservar recursos y superar a enemigos que desafían toda lógica. Es una vuelta a las raíces del survival horror, pero con una capa moderna de diseño de niveles impredecible y visceral.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2014-10-14"),
        developer: "Tango Gameworks",
        publisher: "Bethesda Softworks",
        genres: ["Survival Horror", "Accion", "Horror Psicológico"],
        platforms: ["PC", "PS4", "Xbox One", "PS3", "Xbox 360"],
        rating: 3.9,
        numberOfSales: 140000,
        stock: 1,
        videoUrl: "https://www.youtube.com/watch?v=hvbBhouZHIU",
      },
      {
        title: "Until Dawn",
        description:
          "Ocho amigos se reúnen en una cabaña remota en la montaña para conmemorar el aniversario de la desaparición de dos de sus amigos. Lo que comienza como una reunión se convierte rápidamente en una pesadilla de terror donde cada decisión tiene el potencial de salvar o matar a un miembro del grupo. Este juego de horror cinematográfico se basa en el 'efecto mariposa', donde las elecciones sutiles o drásticas influyen en la narrativa ramificada, llevando a múltiples finales.\n\nCon un reparto de Hollywood y gráficos fotorrealistas, el juego te sumerge en los clichés de las películas de terror, subvirtiéndolos con giros de guion. Los Quick Time Events (QTE) de alta tensión y la necesidad de permanecer quieto durante las escenas clave ponen a prueba tus nervios, ya que la supervivencia de los personajes depende enteramente de tu capacidad para reaccionar bajo presión. Es una experiencia de terror interactiva rejugable que garantiza que ninguna partida será igual a la anterior.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2015-08-25"),
        developer: "Supermassive Games",
        publisher: "Sony Interactive Entertainment",
        genres: ["Survival Horror", "Aventura", "Cinemático"],
        platforms: ["PS4", "PS5"],
        rating: 4.1,
        numberOfSales: 170000,
        stock: 76,
        videoUrl: "https://www.youtube.com/watch?v=LUk77c7fMC8",
      },
      {
        title: "Silent Hill 2 Remake",
        description:
          "Una remasterización hipotética del aclamado clásico de horror psicológico. La historia sigue a James Sunderland, quien recibe una carta de su difunta esposa que lo atrae a la niebla de Silent Hill. Esta ciudad maldita actúa como un espejo del subconsciente de James, manifestando sus culpas y miedos en monstruos icónicos como Pyramid Head. La narrativa es una exploración profunda de temas como la pérdida, la culpa y la salud mental.\n\nAunque el original es una obra maestra de PS2, un remake moderno conservaría el enfoque atmosférico y los puzles complejos, mientras que actualizaría la jugabilidad y los gráficos a los estándares actuales. La banda sonora inquietante y la atmósfera opresiva de la ciudad seguirían siendo el corazón de una de las historias más oscuras y emocionalmente resonantes en la historia de los videojuegos de terror.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2001-09-24"),
        developer: "Konami",
        publisher: "Konami",
        genres: [
          "Survival Horror",
          "Horror Psicológico",
          "Aventura",
          "Puzzles",
        ],
        platforms: ["PS2", "PS3", "PS4", "PC", "Xbox"],
        rating: 4.8,
        numberOfSales: 520000,
        stock: 90,
        videoUrl: "https://www.youtube.com/watch?v=pyC_qiW_4ZY",
      },
      {
        title: "Layers of Fear",
        description:
          "Adéntrate en la mente de un pintor perturbado y desciende a la locura en esta aventura de terror psicológico en primera persona. Explora una mansión victoriana en constante cambio, donde cada paso puede reconfigurar el entorno que te rodea, jugando con tus percepciones de la realidad. La historia se desarrolla a través de fragmentos de notas, recuerdos y el arte del protagonista, revelando una trágica historia de obsesión, familia y deterioro artístico.\n\nEl juego brilla por su atmósfera inmersiva y su estilo de horror basado en la desorientación y las ilusiones, en lugar de los sustos baratos. No hay combate; la supervivencia depende de avanzar y desentrañar los secretos del artista a medida que su obra maestra final toma forma. Es una experiencia narrativa y artística que utiliza el terror para contar una historia sombría y emotiva.",
        price: 14.99,
        isOnSale: true,
        salePrice: 6.99,
        isRefundable: true,
        releaseDate: new Date("2016-02-16"),
        developer: "Bloober Team",
        publisher: "Bloober Team",
        genres: ["Horror Psicológico", "Aventura", "Narrativa"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 3.7,
        numberOfSales: 75000,
        stock: 2,
        videoUrl: "https://www.youtube.com/watch?v=HUoyagyEVHA",
      },
      {
        title: "Dead Space Remake",
        description:
          "El clásico de ciencia ficción de terror de supervivencia regresa totalmente reconstruido desde cero. Eres Isaac Clarke, un ingeniero enviado a reparar la nave minera USG Ishimura, solo para descubrir que la tripulación ha sido masacrada y se ha transformado en monstruosidades llamadas Necromorfos. El combate se basa en la 'desmembración estratégica': desmembrar a los enemigos es clave para sobrevivir, y la ausencia de una interfaz de usuario tradicional (todos los medidores están integrados en el traje de Isaac) aumenta la inmersión.\n\nEl remake presenta una atmósfera opresiva con audio 3D mejorado que te hace sentir el peligro desde todas las direcciones. La Ishimura es ahora un solo espacio explorable sin interrupciones, con nuevas amenazas y entornos. Conserva la acción intensa y el terror visceral, mientras profundiza en la narrativa del ingeniero que lucha por su vida en el borde de la locura.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2023-01-27"),
        developer: "Motive Studio",
        publisher: "Electronic Arts",
        genres: ["Survival Horror", "Ciencia Ficción", "Accion"],
        platforms: ["PC", "PS5", "Xbox Series X"],
        rating: 4.0,
        numberOfSales: 160000,
        stock: 657,
        videoUrl: "https://www.youtube.com/watch?v=4kRHnEi57gE",
      },
      {
        title: "Phasmophobia",
        description:
          "Un juego de terror psicológico cooperativo en línea para 4 jugadores donde tú y tu equipo sois investigadores paranormales que se adentran en lugares encantados para recopilar pruebas de actividad paranormal. Utilizando equipos de caza de fantasmas como medidores EMF, cajas de espíritus y termómetros, debes identificar el tipo de fantasma que acecha en el lugar antes de que te atrape. La inmersión es clave, y el juego utiliza el reconocimiento de voz para que los fantasmas reaccionen si hablas, incluso si estás solo en una habitación oscura.\n\nEl juego presenta una variedad de fantasmas con comportamientos únicos, lo que garantiza que cada misión de investigación sea diferente y aterradora. El énfasis está en el trabajo en equipo, el sigilo y la gestión del miedo, ya que la locura de los personajes aumenta a medida que presencian eventos paranormales, atrayendo la ira del fantasma. Es una experiencia multijugador tensa y de alta rejugabilidad.",
        price: 12.99,
        isOnSale: true,
        salePrice: 4.99,
        isRefundable: true,
        releaseDate: new Date("2020-09-18"),
        developer: "Kinetic Games",
        publisher: "Kinetic Games",
        genres: ["Survival Horror", "Cooperativo", "Simulacion"],
        platforms: ["PC", "VR"],
        rating: 4.2,
        numberOfSales: 230000,
        stock: 12,
        videoUrl: "https://www.youtube.com/watch?v=adFNARIHlOs",
      },
      {
        title: "Forza Horizon 5",
        description:
          "Explora los vibrantes y diversos paisajes de mundo abierto de México con una libertad y un rendimiento sin igual. Forza Horizon 5 es el festival de carreras definitivo, ofreciendo cientos de coches con licencia y una vasta geografía que incluye desiertos, selvas, ciudades históricas, cañones y un volcán nevado. El juego introduce un sistema meteorológico dinámico con tormentas de arena y lluvias tropicales que cambian el entorno en tiempo real.\n\nParticipa en un sinfín de actividades, desde carreras callejeras y eventos off-road hasta acrobacias peligrosas y desafíos de historia. El modo 'Horizon Arcade' ofrece mini-juegos multijugador de ritmo rápido, mientras que la herramienta 'EventLab' permite a los jugadores diseñar sus propias carreras y desafíos. Es el estándar de oro para los juegos de carreras arcade de mundo abierto, celebrando la cultura automovilística con diversión y espectáculo.",
        price: 59.99,
        isOnSale: true,
        salePrice: 34.99,
        isRefundable: true,
        releaseDate: new Date("2021-11-09"),
        developer: "Playground Games",
        publisher: "Microsoft Studios",
        genres: ["Carreras", "Arcade", "Mundo Abierto", "Deportes"],
        platforms: ["PC", "Xbox Series X", "Xbox One"],
        rating: 4.6,
        numberOfSales: 820000,
        stock: 54,
        videoUrl: "https://www.youtube.com/watch?v=sfAxRnc6640",
      },
      {
        title: "Gran Turismo 7",
        description:
          "Una celebración del mundo del automóvil que fusiona el realismo de la simulación de carreras con el atractivo de la cultura automovilística. Colecciona, tunea y compite con más de 400 coches en circuitos clásicos y pistas legendarias recreadas con una fidelidad gráfica impresionante. El juego utiliza un motor de física avanzado para ofrecer una experiencia de conducción auténtica, que se siente tanto a través del mando DualSense (en PS5) como del volante de simulación.\n\nEl modo 'GT Campaign' te guía a través de la historia del automóvil y los fundamentos de la conducción deportiva. Las características clásicas como el 'Modo Foto' y los extensos 'Tuning Parts' ofrecen posibilidades infinitas para coleccionistas y personalizadores. Es el simulador de carreras definitivo para PlayStation, equilibrando la accesibilidad para novatos con la profundidad exigida por los puristas.",
        price: 69.99,
        isOnSale: false,
        salePrice: 41.99,
        isRefundable: true,
        releaseDate: new Date("2022-03-04"),
        developer: "Polyphony Digital",
        publisher: "Sony Interactive Entertainment",
        genres: ["Carreras", "Simulacion", "Deportes"],
        platforms: ["PS5", "PS4"],
        rating: 4.0,
        numberOfSales: 300000,
        stock: 123,
        videoUrl: "https://www.youtube.com/watch?v=cVNGpCgryVA",
      },
      {
        title: "Need for Speed Unbound",
        description:
          "Una inyección de estilo urbano y adrenalina al género de carreras arcade. Corre contra el tiempo, supera a la policía y enfréntate a las carreras de clasificación semanales para llegar al desafío de Lakeshore definitivo, The Grand. El juego destaca por su estética de grafiti animado y cel-shading que se combina con coches fotorrealistas, dándole un estilo visual único.\n\nLas persecuciones policiales son intensas y estratégicas, con un sistema de 'Heat' (Calor) que aumenta el riesgo y la recompensa. Personaliza tu garaje con cientos de opciones cosméticas y de rendimiento para crear el coche definitivo y demuestra tu estilo en las calles. Es una experiencia de mundo abierto multijugador y de un solo jugador que celebra la cultura del coche callejero con un enfoque audaz y artístico.",
        price: 59.99,
        isOnSale: true,
        salePrice: 39.99,
        isRefundable: true,
        releaseDate: new Date("2023-12-01"),
        developer: "Criterion Games",
        publisher: "Electronic Arts",
        genres: ["Carreras", "Arcade", "Accion", "Mundo Abierto"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 4.2,
        numberOfSales: 95000,
        stock: 1500,
        videoUrl: "https://www.youtube.com/watch?v=kZpDoljJWNI",
      },
      {
        title: "Need for Speed Heat",
        description:
          "Corre y compite de día en el Speedhunter Showdown, una competición con licencia donde ganas dinero para personalizar y mejorar tus coches. Por la noche, la acción se traslada a carreras callejeras ilegales, donde te enfrentas a una fuerza policial corrupta y ganas puntos de 'Reputación'. El ciclo día/noche es el núcleo del juego, ofreciendo experiencias de conducción y desafíos completamente diferentes.\n\nLa personalización de coches es profunda, con una gran variedad de opciones de rendimiento y un completo sistema de personalización visual. Cuanto mayor sea tu nivel de Heat (Calor) por la noche, más intensa será la persecución policial, pero mayores serán las recompensas. Es un juego de carreras arcade de mundo abierto que se centra en la adrenalina, la personalización y la dualidad entre el riesgo y la recompensa.",
        price: 29.99,
        isOnSale: false,
        salePrice: 17.99,
        isRefundable: true,
        releaseDate: new Date("2019-11-08"),
        developer: "Ghost Games",
        publisher: "Electronic Arts",
        genres: ["Carreras", "Arcade", "Accion", "Mundo Abierto"],
        platforms: ["PC", "PS4", "Xbox One"],
        rating: 3.6,
        numberOfSales: 220000,
        stock: 98,
        videoUrl: "https://www.youtube.com/watch?v=DPwFhezJcVY",
      },
      {
        title: "Dirt 5",
        description:
          "Un juego de carreras off-road audaz y deslumbrante que se enfoca en la acción arcade, el espectáculo y un modo carrera narrativo. Compite en más de 70 rutas globales a través de 10 ubicaciones únicas, desde los cañones de Arizona hasta las minas de mármol de Italia y las calles de Nueva York. El juego presenta un sistema de clima dinámico extremo que incluye nieve, hielo, lluvia y tormentas eléctricas, afectando drásticamente el manejo.\n\nLa variedad de clases de coches es amplia, incluyendo buggies, camiones gigantes y coches de rally. El modo 'Playgrounds' permite a los jugadores crear y compartir sus propios escenarios de acrobacias. Con su enfoque en la diversión multijugador local (pantalla dividida) y en línea, y su estilo visual llamativo, Dirt 5 es una experiencia de carreras todoterreno vibrante y accesible.",
        price: 39.99,
        isOnSale: true,
        salePrice: 19.99,
        isRefundable: true,
        releaseDate: new Date("2020-11-06"),
        developer: "Codemasters",
        publisher: "Codemasters",
        genres: ["Carreras", "Off-Road", "Arcade", "Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One"],
        rating: 3.9,
        numberOfSales: 90000,
        stock: 100,
        videoUrl: "https://www.youtube.com/watch?v=q0BnGyQ6SGk",
      },
      {
        title: "Burnout Paradise Remastered",
        description:
          "Regresa el clásico juego de carreras de mundo abierto, reimaginado con gráficos de alta resolución y todo el contenido descargable lanzado anteriormente. Paradise City es tu patio de juegos: un vasto mundo abierto sin pantallas de carga donde las carreras, los choques y las acrobacias se encuentran en cada esquina. La característica distintiva es 'Takedown', donde golpear a los rivales contra el tráfico o las estructuras es tan importante como cruzar la línea de meta.\n\nEl sistema 'EasyDrive' te permite pasar sin problemas de la conducción en solitario al multijugador, donde los jugadores pueden competir en desafíos cooperativos o competitivos por toda la ciudad. La banda sonora de rock clásico y el enfoque en el caos vehicular y la destrucción lo convierten en una de las experiencias de carreras arcade más divertidas y adictivas jamás creadas.",
        price: 19.99,
        isOnSale: false,
        salePrice: 11.99,
        isRefundable: true,
        releaseDate: new Date("2018-03-16"),
        developer: "Criterion Games",
        publisher: "Electronic Arts",
        genres: ["Carreras", "Arcade", "Mundo Abierto", "Accion"],
        platforms: ["PC", "PS4", "Xbox One", "Switch", "PS5", "Xbox Series X"],
        rating: 4.2,
        numberOfSales: 210000,
        stock: 10,
        videoUrl: "https://www.youtube.com/watch?v=BS6U6iU3jPk",
      },
      {
        title: "Project CARS 3",
        description:
          "El tercer capítulo de la franquicia Project CARS se aleja de la simulación pura para adoptar un enfoque más de 'simcade', accesible a un público más amplio. El juego presenta una gran variedad de coches, desde deportivos hasta GT y prototipos, y una amplia selección de pistas reales y ficticias. El modo carrera está estructurado para que los jugadores progresen, ganen créditos y mejoren sus coches en un sistema de progresión más tradicional.\n\nEl manejo es un punto intermedio entre el arcade y la simulación, manteniendo una sensación de realismo sin ser excesivamente punitivo. La personalización del rendimiento y la estética es clave para crear tu máquina de carreras definitiva. Aunque controvertido entre los puristas de la simulación, ofrece una experiencia de carreras divertida y visualmente impresionante con un fuerte enfoque en el coleccionismo y la mejora de coches.",
        price: 29.99,
        isOnSale: true,
        salePrice: 9.99,
        isRefundable: true,
        releaseDate: new Date("2020-08-28"),
        developer: "Slightly Mad Studios",
        publisher: "Bandai Namco",
        genres: ["Carreras", "Simcade", "Deportes"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 3.4,
        numberOfSales: 45000,
        stock: 89,
        videoUrl: "https://www.youtube.com/watch?v=_NlG01OiUg8",
      },
      {
        title: "Assetto Corsa Competizione",
        description:
          "El videojuego oficial de la serie Blancpain GT Series, Competizione se centra en la simulación de carreras de GT con un nivel de fidelidad inigualable. El juego modela cada aspecto de la física de la competición con gran detalle, incluyendo la aerodinámica, el agarre de los neumáticos, la deformación de la suspensión y el comportamiento del motor. Es una experiencia dedicada a aquellos que buscan el pináculo del realismo en las carreras virtuales.\n\nCorre en los circuitos oficiales del calendario GT World Challenge, recreados con una precisión milimétrica gracias a la tecnología de escaneo láser. El multijugador se distingue por su sistema de clasificación de pilotos, que valora la consistencia, la habilidad y el juego limpio. El sistema de clima dinámico y el ciclo de día y noche crean carreras de resistencia épicas donde la estrategia de boxes y el manejo bajo presión son cruciales.",
        price: 39.99,
        isOnSale: false,
        salePrice: 23.99,
        isRefundable: true,
        releaseDate: new Date("2019-05-29"),
        developer: "Kunos Simulazioni",
        publisher: "505 Games",
        genres: ["Carreras", "Simulacion", "Deportes"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 4.1,
        numberOfSales: 125000,
        stock: 534,
        videoUrl: "https://www.youtube.com/watch?v=FfUj-C31MKQ",
      },
      {
        title: "Trackmania",
        description:
          "Un juego de carreras arcade que desafía la gravedad, la lógica y el tiempo. Olvídate de la personalización de coches y concéntrate en la persecución del tiempo de vuelta perfecto. El juego se centra en carreras rápidas, reintentos instantáneos y la creación de pistas extravagantes. La jugabilidad es pura habilidad: dominar la física y encontrar la línea de carrera perfecta es la clave para ascender en las clasificaciones globales.\n\nEl corazón del juego es su poderoso editor de pistas y la comunidad. Millones de pistas únicas, desde complejas creaciones de parkour hasta circuitos de alta velocidad, están disponibles para competir. El modelo de servicio en vivo ofrece temporadas competitivas y contenido nuevo constante, haciendo de Trackmania una plataforma de carreras eSports accesible y altamente competitiva.",
        price: 0.0,
        isOnSale: false,
        salePrice: 0.0,
        isRefundable: true,
        releaseDate: new Date("2020-07-01"),
        developer: "Nadeo",
        publisher: "Ubisoft",
        genres: ["Carreras", "Arcade", "Deportes", "Plataformas"],
        platforms: ["PC", "PS4", "Xbox One", "PS5", "Xbox Series X"],
        rating: 3.8,
        numberOfSales: 90000,
        stock: 768,
        videoUrl: "https://www.youtube.com/watch?v=oA5l_Svdyu4",
      },
      {
        title: "MotoGP 23 (Racing)",
        description:
          "Experimenta la emoción y el desafío de la categoría reina del motociclismo con la simulación oficial de la temporada de MotoGP. Este juego incluye todos los pilotos y circuitos oficiales de las temporadas de MotoGP, Moto2 y Moto3. El motor de físicas se ha ajustado para ofrecer una sensación de pilotaje más auténtica, donde el equilibrio, el control del acelerador y la temperatura de los neumáticos son cruciales para el rendimiento.\n\nEl juego introduce nuevas características como el 'Flag-to-Flag' (carreras con cambio de moto) y ayudas neuronales que se adaptan a tu nivel de habilidad. El modo carrera ofrece la oportunidad de forjar tu propia rivalidad con la nueva 'Red Social' y progresar desde las categorías inferiores hasta convertirte en leyenda. Es la experiencia definitiva para los entusiastas de las motos de carreras, ofreciendo un equilibrio entre la simulación y el desafío.",
        price: 49.99,
        isOnSale: true,
        salePrice: 29.99,
        isRefundable: true,
        releaseDate: new Date("2023-04-06"),
        developer: "Milestone",
        publisher: "Milestone",
        genres: ["Carreras", "Simulacion", "Deportes"],
        platforms: ["PC", "PS5", "Xbox Series X", "PS4", "Xbox One", "Switch"],
        rating: 3.7,
        numberOfSales: 47000,
        stock: 456,
        videoUrl: "https://www.youtube.com/watch?v=PvgTSrE5bzA",
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
    console.log("  - Creando juegos...");
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

    console.log("   ✅ Seed completado:");
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
