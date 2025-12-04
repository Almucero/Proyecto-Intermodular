import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";
import bcrypt from "bcrypt";

describe("Purchases Endpoints", () => {
  let authToken: string;
  let userId: number;
  let testGameId: number;
  let purchaseId: number;

  const testUser = {
    email: `purchasetest${Date.now()}@example.com`,
    name: "Purchase Test User",
    surname: "Lastname",
    password: "password123",
  };

  beforeAll(async () => {
    try {
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
    } catch (err) {
      console.error("beforeAll error:", err);
    }

    // Obtener un juego para las pruebas
    const gamesRes = await request(app).get("/api/games");
    if (gamesRes.body && gamesRes.body.length > 0) {
      testGameId = gamesRes.body[0].id;
    }
  });

  afterAll(async () => {
    // Limpiar compras del usuario
    if (userId) {
      await prisma.purchase.deleteMany({ where: { userId } }).catch(() => {});

      // Limpiar carrito del usuario
      await prisma.cartItem.deleteMany({ where: { userId } }).catch(() => {});
    }

    // Limpiar usuario de prueba
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

    // Agregar al carrito primero
    await request(app)
      .post(`/api/cart/${testGameId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ quantity: 1 });

    // Hacer checkout
    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameIds: [testGameId] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("purchases");
    expect(Array.isArray(res.body.purchases)).toBe(true);
    if (res.body.purchases.length > 0) {
      purchaseId = res.body.purchases[0].id;
      expect(res.body.purchases[0]).toHaveProperty("userId");
      expect(res.body.purchases[0]).toHaveProperty("gameId");
      expect(res.body.purchases[0]).toHaveProperty("price");
      expect(res.body.purchases[0]).toHaveProperty("status");
      expect(res.body.purchases[0].status).toBe("completed");
    }
  });

  it("debe fallar al hacer checkout sin gameIds", async () => {
    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameIds: [] });

    expect(res.status).toBe(400);
  });

  it("debe fallar al hacer checkout con formato inválido", async () => {
    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameIds: "invalid" });

    expect(res.status).toBe(400);
  });

  it("debe fallar al hacer checkout sin carrito items", async () => {
    const res = await request(app)
      .post("/api/purchases/checkout")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameIds: [99999] });

    expect(res.status).toBe(404);
  });

  it("debe obtener lista de compras del usuario", async () => {
    const res = await request(app)
      .get("/api/purchases")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("game");
      expect(res.body[0]).toHaveProperty("userId");
      expect(res.body[0].userId).toBe(userId);
    }
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
    expect(res.body).toHaveProperty("game");
    expect(res.body).toHaveProperty("price");
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
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("purchase");
    if (res.body.purchase) {
      expect(res.body.purchase.status).toBe("refunded");
    }
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

    // Ya debería estar reembolsada del test anterior
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
    // Crear otro usuario
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

    expect(res.status).toBe(403);

    // Limpiar otro usuario
    await prisma.user
      .delete({ where: { email: otherUser.email } })
      .catch(() => {});
  });

  it("debe fallar si no hay autenticación", async () => {
    const res = await request(app).get("/api/purchases");

    expect(res.status).toBe(401);
  });
});
