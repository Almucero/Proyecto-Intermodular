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
          summary: "Verifica el estado del servicio - Desplega el web service",
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
            id: {
              type: "integer",
              description: "ID del usuario",
            },
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
            },
            name: {
              type: "string",
              description: "Nombre del usuario",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación",
            },
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
            password: {
              type: "string",
              minLength: 8,
              description: "Contraseña del usuario",
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
            },
            name: {
              type: "string",
              minLength: 2,
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
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            publisherId: { type: "integer" },
            developerId: { type: "integer" },
            releaseDate: { type: "string", format: "date" },
            genres: { type: "array", items: { type: "string" } },
          },
          required: ["id", "title"],
        },
        Developer: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "name"],
        },
        Publisher: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "name"],
        },
        CreateGameInput: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            publisherId: { type: "integer" },
            developerId: { type: "integer" },
            releaseDate: { type: "string", format: "date" },
            genres: { type: "array", items: { type: "string" } },
          },
          required: ["title"],
        },
        UpdateGameInput: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            publisherId: { type: "integer" },
            developerId: { type: "integer" },
            releaseDate: { type: "string", format: "date" },
            genres: { type: "array", items: { type: "string" } },
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
            id: { type: "integer" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        DevelopersList: {
          type: "array",
          items: { $ref: "#/components/schemas/DeveloperResponse" },
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
        PublisherResponse: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        PublishersList: {
          type: "array",
          items: { $ref: "#/components/schemas/PublisherResponse" },
        },
      },
    },
    // Apply bearer auth globally to paths (can be overridden per-path)
    security: [{ bearerAuth: [] }],
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
    ],
  },
  // Include both .js and .ts route files so development (ts) and built (js) paths are discovered
  apis: [
    join(__dirname, "../modules/**/*.routes.js"),
    join(__dirname, "../modules/**/*.routes.ts"),
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
