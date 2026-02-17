/// <reference types="jest" />
import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";
import bcrypt from "bcryptjs";

describe("Purchases Endpoints", () => {
  let authToken: string;
  let userId: number;
  let testGameId: number;
  let purchaseId: number;
  let testPlatformId: number;

  const testUser = {
    email: `purchasetest${Date.now()}@example.com`,
    name: "Purchase Test User",
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
      // Find a game that has platforms
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
      await prisma.purchase.deleteMany({ where: { userId } }).catch(() => {});
      await prisma.cartItem.deleteMany({ where: { userId } }).catch(() => {});
    }

    if (testUser.email) {
      await prisma.user
        .delete({ where: { email: testUser.email } })
        .catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("debe obtener compras vacías para nuevo usuario", async () => {
    const res = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe completar una compra desde el carrito", async () => {
    if (!testGameId) {
      console.warn("No test game available");
      return;
    }

    const cartRes = await request(app)
      .post(`/api/cart`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: testGameId, platformId: testPlatformId, quantity: 1 });

    const cartItemId = cartRes.body.id;

    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ cartItemIds: [cartItemId] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("userId");
    expect(res.body).toHaveProperty("totalPrice");
    expect(res.body).toHaveProperty("status");
    expect(res.body.status).toBe("completed");
    expect(res.body).toHaveProperty("items");
    expect(Array.isArray(res.body.items)).toBe(true);

    if (res.body.items.length > 0) {
      purchaseId = res.body.id;
      expect(res.body.items[0]).toHaveProperty("id");
      expect(res.body.items[0]).toHaveProperty("title");
      expect(res.body.items[0]).toHaveProperty("price");
      expect(res.body.items[0]).toHaveProperty("rating");
      expect(res.body.items[0]).toHaveProperty("itemId");
      expect(res.body.items[0]).toHaveProperty("purchasePrice");
      expect(res.body.items[0]).toHaveProperty("quantity");
    }
  });

  it("debe fallar al hacer checkout sin gameIds", async () => {
    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ cartItemIds: [] });

    expect(res.status).toBe(400);
  });

  it("debe fallar al hacer checkout con formato inválido", async () => {
    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ cartItemIds: "invalid" });

    expect(res.status).toBe(400);
  });

  it("debe fallar al hacer checkout sin carrito items", async () => {
    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ cartItemIds: [99999] });

    expect(res.status).toBe(404);
  });

  it("debe obtener lista de compras del usuario", async () => {
    const res = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("totalPrice");
      expect(res.body[0]).toHaveProperty("items");
    }
  });

  it("debe filtrar compras por status=completed", async () => {
    const res = await request(app)
      .get("/api/purchases?status=completed")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    res.body.forEach((purchase: any) => {
      expect(purchase.status).toBe("completed");
    });
  });

  it("debe obtener detalles de una compra", async () => {
    if (!purchaseId) {
      console.warn("No purchase ID available");
      return;
    }

    const res = await request(app)
      .get(`/api/purchases/${purchaseId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body.id).toBe(purchaseId);
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("totalPrice");
    expect(res.body).toHaveProperty("status");
  });

  it("debe fallar al obtener compra con ID inválido", async () => {
    const res = await request(app)
      .get(`/api/purchases/invalid`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(400);
  });

  it("debe fallar al obtener compra inexistente", async () => {
    const res = await request(app)
      .get(`/api/purchases/99999`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it("debe solicitar reembolso de una compra", async () => {
    if (!purchaseId) {
      console.warn("No purchase ID available");
      return;
    }

    const res = await request(app)
      .post(`/api/purchases/${purchaseId}/refund`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ reason: "No me gustó el juego" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("status");
    expect(res.body.status).toBe("refunded");
    expect(res.body).toHaveProperty("refundReason");
  });

  it("debe fallar al hacer reembolso sin reason", async () => {
    if (!purchaseId) {
      console.warn("No purchase ID available");
      return;
    }

    const res = await request(app)
      .post(`/api/purchases/${purchaseId}/refund`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("debe fallar si ya fue reembolsada", async () => {
    if (!purchaseId) {
      console.warn("No purchase ID available");
      return;
    }

    const res = await request(app)
      .post(`/api/purchases/${purchaseId}/refund`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ reason: "Ya fue reembolsada" });

    expect(res.status).toBe(400);
  });

  it("debe fallar al reembolsar compra inexistente", async () => {
    const res = await request(app)
      .post(`/api/purchases/99999/refund`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ reason: "Test reason" });

    expect(res.status).toBe(404);
  });

  it("debe fallar al reembolsar compra de otro usuario", async () => {
    const otherUser = {
      email: `otheruser${Date.now()}@example.com`,
      name: "Other User",
      surname: "Lastname",
      password: "password123",
    };

    const otherRes = await request(app)
      .post("/api/auth/register")
      .send(otherUser);
    const otherToken = otherRes.body.token;

    if (!purchaseId) {
      console.warn("No purchase ID available");
      return;
    }

    const res = await request(app)
      .post(`/api/purchases/${purchaseId}/refund`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ reason: "Not your purchase" });

    expect(res.status).toBe(404);

    await prisma.user
      .delete({ where: { email: otherUser.email } })
      .catch(() => {});
  });

  it("debe fallar si no hay autenticación", async () => {
    const res = await request(app).get("/api/purchases");

    expect(res.status).toBe(401);
  });
});
