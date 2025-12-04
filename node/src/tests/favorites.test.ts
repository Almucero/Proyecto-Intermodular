import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";

import bcrypt from "bcrypt";

describe("Favorites Endpoints", () => {
  let authToken: string;
  let userId: number;
  let testGameId: number;

  const testUser = {
    email: `favtest${Date.now()}@example.com`,
    name: "Favorite Test User",
    surname: "Lastname",
    password: "password123",
  };

  beforeAll(async () => {
    // Crear usuario directamente en BD
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        name: testUser.name,
        surname: testUser.surname,
        passwordHash,
      },
    });
    userId = user.id;

    // Login para obtener token
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });
    authToken = loginRes.body.token;

    // Obtener un juego para las pruebas
    const gamesRes = await request(app).get("/api/games");
    if (gamesRes.body && gamesRes.body.length > 0) {
      testGameId = gamesRes.body[0].id;
    }
  });

  afterAll(async () => {
    // Limpiar favoritos del usuario
    if (userId) {
      await prisma.favorite.deleteMany({ where: { userId } }).catch(() => {});
    }

    // Limpiar usuario de prueba
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Limpiar favoritos después de cada test para no ensuciar la BD
    if (userId) {
      await prisma.favorite.deleteMany({ where: { userId } }).catch(() => {});
    }
  });

  it("debe obtener favoritos vacíos para nuevo usuario", async () => {
    if (!authToken) {
      console.warn("No auth token available");
      return;
    }

    const res = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("debe agregar un juego a favoritos", async () => {
    if (!testGameId || !authToken) {
      console.warn("No test game or auth token available");
      return;
    }

    const res = await request(app)
      .post(`/api/favorites/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.userId).toBe(userId);
    expect(res.body.gameId).toBe(testGameId);
  });

  it("debe fallar al agregar un juego inválido a favoritos", async () => {
    const res = await request(app)
      .post(`/api/favorites/invalid`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
  });

  it("debe fallar al agregar un juego inexistente a favoritos", async () => {
    const res = await request(app)
      .post(`/api/favorites/99999`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it("debe fallar al agregar duplicado a favoritos", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    // Agregar primera vez
    await request(app)
      .post(`/api/favorites/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`);

    // Intentar agregar segunda vez
    const res = await request(app)
      .post(`/api/favorites/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(409);
  });

  it("debe verificar si un juego está en favoritos", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    // Agregar a favoritos
    await request(app)
      .post(`/api/favorites/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .catch(() => {}); // Puede fallar si ya existe

    // Verificar
    const res = await request(app)
      .get(`/api/favorites/check/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("isFavorite");
    expect(typeof res.body.isFavorite).toBe("boolean");
  });

  it("debe verificar que no está en favoritos un juego no agregado", async () => {
    const res = await request(app)
      .get(`/api/favorites/check/99999`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.isFavorite).toBe(false);
  });

  it("debe obtener lista de favoritos", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const res = await request(app)
      .get("/api/favorites")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("game");
      expect(res.body[0].game).toHaveProperty("id");
      expect(res.body[0].game).toHaveProperty("title");
    }
  });

  it("debe remover un juego de favoritos", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    // Agregar a favoritos
    await request(app)
      .post(`/api/favorites/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .catch(() => {}); // Puede fallar si ya existe

    // Remover
    const res = await request(app)
      .delete(`/api/favorites/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("debe fallar al remover un favorito inexistente", async () => {
    const res = await request(app)
      .delete(`/api/favorites/99999`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it("debe fallar si no hay autenticación", async () => {
    const res = await request(app).get("/api/favorites");

    expect(res.status).toBe(401);
  });
});
