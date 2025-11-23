import swaggerJsdoc from "swagger-jsdoc";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { env } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "GameSage API",
      version: "1.0.0",
      description:
        "API REST para gestión de videojuegos, desarrolladores y publishers con autenticación JWT, validación Zod, rate limiting y testing completo",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Servidor de desarrollo",
      },
      {
        url: `https://gamesage-service.onrender.com`,
        description: "Servidor de producción",
      },
    ],
    paths: {
      "/health": {
        get: {
          summary: "Verifica el estado del servicio - Despliega el web service",
          tags: ["Health"],
          security: [],
          responses: {
            "200": {
              description: "Servicio funcionando correctamente",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/HealthResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            ok: {
              type: "boolean",
              description: "Estado del servicio",
            },
            message: {
              type: "string",
              description: "Mensaje de estado (en caso de error)",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID del usuario" },
            accountId: { type: "string", description: "CUID de la cuenta" },
            accountAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de asociación de cuenta",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
            },
            name: { type: "string", description: "Nombre del usuario" },
            surname: { type: "string", description: "Apellido del usuario" },
            nickname: { type: "string", description: "Apodo del usuario" },
            points: { type: "integer", description: "Puntos de recompensa" },
            balance: {
              type: "number",
              format: "float",
              description: "Saldo del usuario",
            },
            isAdmin: {
              type: "boolean",
              description: "Indica si el usuario es administrador",
            },
            addressLine1: {
              type: "string",
              description: "Primera línea de dirección",
            },
            addressLine2: {
              type: "string",
              description: "Segunda línea de dirección",
            },
            city: { type: "string", description: "Ciudad" },
            region: { type: "string", description: "Región/Provincia" },
            postalCode: { type: "string", description: "Código postal" },
            country: { type: "string", description: "País" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["email", "name", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
            },
            name: {
              type: "string",
              minLength: 2,
              description: "Nombre del usuario",
            },
            surname: {
              type: "string",
              description: "Apellido del usuario",
            },
            password: {
              type: "string",
              minLength: 8,
              description: "Contraseña del usuario",
            },
            nickname: {
              type: "string",
              description: "Apodo del usuario",
            },
            addressLine1: {
              type: "string",
              description: "Primera línea de dirección",
            },
            addressLine2: {
              type: "string",
              description: "Segunda línea de dirección",
            },
            city: {
              type: "string",
              description: "Ciudad",
            },
            region: {
              type: "string",
              description: "Región/Provincia",
            },
            postalCode: {
              type: "string",
              description: "Código postal",
            },
            country: {
              type: "string",
              description: "País",
            },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
            },
            password: {
              type: "string",
              minLength: 8,
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            user: {
              $ref: "#/components/schemas/User",
            },
            token: {
              type: "string",
              description: "JWT token",
            },
          },
        },
        UpdateProfileInput: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
            },
            name: {
              type: "string",
              minLength: 2,
              description: "Nombre del usuario",
            },
            surname: {
              type: "string",
              description: "Apellido del usuario",
            },
            nickname: {
              type: "string",
              description: "Apodo del usuario",
            },
            addressLine1: {
              type: "string",
              description: "Primera línea de dirección",
            },
            addressLine2: {
              type: "string",
              description: "Segunda línea de dirección",
            },
            city: {
              type: "string",
              description: "Ciudad",
            },
            region: {
              type: "string",
              description: "Región/Provincia",
            },
            postalCode: {
              type: "string",
              description: "Código postal",
            },
            country: {
              type: "string",
              description: "País",
            },
          },
        },
        ChangePasswordInput: {
          type: "object",
          required: ["currentPassword", "newPassword"],
          properties: {
            currentPassword: {
              type: "string",
            },
            newPassword: {
              type: "string",
              minLength: 8,
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
            },
          },
        },
        Game: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID del juego" },
            title: { type: "string", description: "Título del juego" },
            description: {
              type: "string",
              description: "Descripción del juego",
            },
            price: {
              type: "number",
              format: "float",
              description: "Precio del juego",
            },
            salePrice: {
              type: "number",
              format: "float",
              description: "Precio de oferta",
            },
            isOnSale: {
              type: "boolean",
              description: "Indica si el juego está en oferta",
            },
            isRefundable: {
              type: "boolean",
              description: "Indica si el juego es reembolsable",
            },
            numberOfSales: { type: "integer", description: "Número de ventas" },
            rating: {
              type: "number",
              format: "float",
              description: "Calificación del juego",
            },
            releaseDate: {
              type: "string",
              format: "date",
              description: "Fecha de lanzamiento",
            },
            developer: {
              type: "object",
              properties: {
                id: { type: "integer", description: "ID del desarrollador" },
                name: {
                  type: "string",
                  description: "Nombre del desarrollador",
                },
              },
              required: ["id", "name"],
            },
            publisher: {
              type: "object",
              properties: {
                id: { type: "integer", description: "ID del publisher" },
                name: { type: "string", description: "Nombre del publisher" },
              },
              required: ["id", "name"],
            },
            genres: {
              type: "array",
              items: { $ref: "#/components/schemas/Genre" },
            },
            platforms: {
              type: "array",
              items: { $ref: "#/components/schemas/Platform" },
            },
            images: {
              type: "array",
              items: { $ref: "#/components/schemas/GameImage" },
            },
          },
          required: ["id", "title"],
        },
        Genre: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID del género" },
            name: { type: "string", description: "Nombre del género" },
          },
          required: ["id", "name"],
        },
        GenreDetail: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID del género" },
            name: { type: "string", description: "Nombre del género" },
            games: {
              type: "array",
              items: { $ref: "#/components/schemas/Game" },
              description: "Juegos asociados al género",
            },
          },
          required: ["id", "name"],
        },
        Platform: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID de la plataforma" },
            name: { type: "string", description: "Nombre de la plataforma" },
          },
          required: ["id", "name"],
        },
        PlatformDetail: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID de la plataforma" },
            name: { type: "string", description: "Nombre de la plataforma" },
            games: {
              type: "array",
              items: { $ref: "#/components/schemas/Game" },
              description: "Juegos disponibles en esta plataforma",
            },
          },
          required: ["id", "name"],
        },
        GameImage: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID de la imagen" },
            url: {
              type: "string",
              format: "uri",
              description: "URL de la imagen",
            },
            publicId: {
              type: "string",
              description: "ID público en Cloudinary",
            },
            format: { type: "string", description: "Formato de imagen" },
            resourceType: { type: "string", description: "Tipo de recurso" },
            bytes: { type: "integer", description: "Tamaño en bytes" },
            width: { type: "integer", description: "Ancho" },
            height: { type: "integer", description: "Alto" },
            originalName: { type: "string", description: "Nombre original" },
            folder: { type: "string", description: "Carpeta en Cloudinary" },
            altText: { type: "string", description: "Texto alternativo" },
            gameId: {
              type: "integer",
              description: "ID del juego relacionado",
            },
          },
        },
        GameImageDetail: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID de la imagen" },
            url: {
              type: "string",
              format: "uri",
              description: "URL de la imagen",
            },
            publicId: {
              type: "string",
              description: "ID público en Cloudinary",
            },
            format: { type: "string", description: "Formato de imagen" },
            resourceType: { type: "string", description: "Tipo de recurso" },
            bytes: { type: "integer", description: "Tamaño en bytes" },
            width: { type: "integer", description: "Ancho" },
            height: { type: "integer", description: "Alto" },
            originalName: { type: "string", description: "Nombre original" },
            folder: { type: "string", description: "Carpeta en Cloudinary" },
            altText: { type: "string", description: "Texto alternativo" },
            gameId: {
              type: "integer",
              description: "ID del juego relacionado",
            },
            Game: {
              type: "object",
              properties: {
                id: { type: "integer", description: "ID del juego" },
                title: { type: "string", description: "Título del juego" },
                description: { type: "string", description: "Descripción" },
                price: { type: "number", description: "Precio" },
                salePrice: { type: "number", description: "Precio en oferta" },
                isOnSale: { type: "boolean", description: "¿Está en oferta?" },
                isRefundable: {
                  type: "boolean",
                  description: "¿Es reembolsable?",
                },
                numberOfSales: { type: "integer", description: "Ventas" },
                rating: { type: "number", description: "Valoración" },
                releaseDate: {
                  type: "string",
                  format: "date",
                  description: "Fecha de lanzamiento",
                },
              },
            },
          },
        },
        UpdateGameInput: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            salePrice: { type: "number" },
            isOnSale: { type: "boolean" },
            isRefundable: { type: "boolean" },
            rating: { type: "number" },
            numberOfSales: { type: "integer" },
            publisherId: { type: "integer" },
            developerId: { type: "integer" },
            releaseDate: { type: "string", format: "date" },
            genres: { type: "array", items: { type: "string" } },
            platforms: { type: "array", items: { type: "string" } },
          },
        },
        CreateDeveloperInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Nombre del desarrollador" },
          },
        },
        UpdateDeveloperInput: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nombre del desarrollador" },
          },
        },
        DeveloperResponse: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID del desarrollador" },
            name: { type: "string", description: "Nombre del desarrollador" },
            games: {
              type: "array",
              items: { $ref: "#/components/schemas/Game" },
              description: "Juegos desarrollados",
            },
          },
        },
        DevelopersList: {
          type: "array",
          items: { $ref: "#/components/schemas/DeveloperResponse" },
        },
        PublisherResponse: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID del publisher" },
            name: { type: "string", description: "Nombre del publisher" },
            games: {
              type: "array",
              items: { $ref: "#/components/schemas/Game" },
              description: "Juegos publicados",
            },
          },
        },
        PublishersList: {
          type: "array",
          items: { $ref: "#/components/schemas/PublisherResponse" },
        },
        GenreResponse: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID del género" },
            name: { type: "string", description: "Nombre del género" },
          },
        },
        GenresList: {
          type: "array",
          items: { $ref: "#/components/schemas/GenreResponse" },
        },
        PlatformResponse: {
          type: "object",
          properties: {
            id: { type: "integer", description: "ID de la plataforma" },
            name: { type: "string", description: "Nombre de la plataforma" },
          },
        },
        PlatformsList: {
          type: "array",
          items: { $ref: "#/components/schemas/PlatformResponse" },
        },
        CreateGenreInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Nombre del género" },
          },
        },
        UpdateGenreInput: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nombre del género" },
          },
        },
        CreatePublisherInput: {
          type: "object",
          required: ["name"],
          properties: {
            name: { type: "string", description: "Nombre del publisher" },
          },
        },
        UpdatePublisherInput: {
          type: "object",
          properties: {
            name: { type: "string", description: "Nombre del publisher" },
          },
        },
        CreateGameImageInput: {
          type: "object",
          required: ["gameId", "url"],
          properties: {
            gameId: { type: "integer", description: "ID del juego" },
            url: {
              type: "string",
              format: "uri",
              description: "URL de la imagen",
            },
            altText: { type: "string", description: "Texto alternativo" },
            order: { type: "integer", description: "Orden de la imagen" },
          },
        },
        UpdateGameImageInput: {
          type: "object",
          properties: {
            url: {
              type: "string",
              format: "uri",
              description: "URL de la imagen",
            },
            altText: { type: "string", description: "Texto alternativo" },
            order: { type: "integer", description: "Orden de la imagen" },
          },
        },
      },
    },
    // No global security: endpoints opt-in with `security: [{ bearerAuth: [] }]`
    tags: [
      {
        name: "Health",
        description: "Estado del servicio",
      },
      {
        name: "Auth",
        description: "Endpoints de autenticación",
      },
      {
        name: "Users",
        description: "Gestión de usuarios",
      },
      {
        name: "Games",
        description: "Gestión de juegos",
      },
      {
        name: "Developers",
        description: "Gestión de desarrolladores (CRUD)",
      },
      {
        name: "Publishers",
        description: "Gestión de publishers (CRUD)",
      },
      {
        name: "Genres",
        description: "Gestión de géneros (CRUD)",
      },
      {
        name: "Platforms",
        description: "Gestión de plataformas (CRUD)",
      },
      {
        name: "GameImages",
        description: "Gestión de imágenes de juego (CRUD)",
      },
    ],
  },
  // Include both .js and .ts route files so development (ts) and built (js) paths are discovered
  apis: [
    join(__dirname, "../modules/**/*.routes.js"),
    join(__dirname, "../modules/**/*.routes.ts"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
