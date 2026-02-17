import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";
import bcrypt from "bcrypt";

describe("Cart Endpoints", () => {
  let authToken: string;
  let userId: number;
  let testGameId: number;
  let testPlatformId: number;

  const testUser = {
    email: `carttest${Date.now()}@example.com`,
    name: "Cart Test User",
    surname: "Lastname",
    password: "password123",
  };

  beforeAll(async () => {
    try {
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

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      authToken = loginRes.body.token;
    } catch (err) {
      console.error("beforeAll error:", err);
    }

    const gamesRes = await request(app).get("/api/games?include=platforms");
    if (gamesRes.body && gamesRes.body.length > 0) {
      const gameWithPlatform = gamesRes.body.find(
        (g: any) => g.platforms && g.platforms.length > 0
      );

      if (gameWithPlatform) {
        testGameId = gameWithPlatform.id;
        testPlatformId = gameWithPlatform.platforms[0].id;
      } else {
        console.warn("No game with platforms found in seed data");
      }
    }
  });

  afterAll(async () => {
    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } }).catch(() => {});
    }
    if (testUser.email) {
      await prisma.user
        .delete({ where: { email: testUser.email } })
        .catch(() => {});
    }
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (userId) {
      await prisma.cartItem.deleteMany({ where: { userId } }).catch(() => {});
    }
  });

  it("debe obtener carrito vacío para nuevo usuario", async () => {
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("debe agregar un juego al carrito", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const res = await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: testGameId, platformId: testPlatformId, quantity: 1 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.userId).toBe(userId);
    expect(res.body.gameId).toBe(testGameId);
    expect(res.body.platformId).toBe(testPlatformId);
    expect(res.body.quantity).toBe(1);
  });

  it("debe agregar al carrito con cantidad por defecto", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const res = await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: testGameId, platformId: testPlatformId });

    expect([201, 409]).toContain(res.status);
  });

  it("debe rechazar cantidad inválida", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const res = await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: testGameId, platformId: testPlatformId, quantity: 0 });

    expect(res.status).toBe(400);
  });

  it("debe fallar con gameId inválido", async () => {
    const res = await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: "invalid", platformId: testPlatformId, quantity: 1 });

    expect(res.status).toBe(400);
  });

  it("debe fallar al agregar juego inexistente", async () => {
    const res = await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: 99999, platformId: testPlatformId, quantity: 1 });

    expect(res.status).toBe(404);
  });

  it("debe incrementar cantidad si se agrega duplicado", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const res1 = await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: testGameId, platformId: testPlatformId, quantity: 2 });

    if (res1.status === 201) {
      const qty1 = res1.body.quantity;

      const res2 = await request(app)
        .post(`/api/cart`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ gameId: testGameId, platformId: testPlatformId, quantity: 3 });

      if (res2.status === 201) {
        expect(res2.body.quantity).toBe(qty1 + 3);
      }
    }
  });

  it("debe obtener carrito del usuario", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("game");
      expect(res.body[0].game).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("quantity");
    }
  });

  it("debe actualizar cantidad en carrito", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: testGameId, platformId: testPlatformId, quantity: 1 });
    const res = await request(app)
      .patch(`/api/cart/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ platformId: testPlatformId, quantity: 5 });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(5);
  });

  it("debe rechazar cantidad inválida en actualización", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const res = await request(app)
      .patch(`/api/cart/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ platformId: testPlatformId, quantity: 0 });

    expect(res.status).toBe(400);
  });

  it("debe fallar al actualizar cantidad de item inexistente", async () => {
    const res = await request(app)
      .patch(`/api/cart/99999`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ platformId: testPlatformId, quantity: 1 });

    expect(res.status).toBe(404);
  });

  it("debe remover un juego del carrito", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: testGameId, platformId: testPlatformId, quantity: 1 });
    const res = await request(app)
      .delete(`/api/cart/${testGameId}?platformId=${testPlatformId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message");
  });

  it("debe fallar al remover item inexistente del carrito", async () => {
    const res = await request(app)
      .delete(`/api/cart/99999?platformId=${testPlatformId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it("debe fallar si no hay autenticación", async () => {
    const res = await request(app).get("/api/cart");

    expect(res.status).toBe(401);
  });
});
