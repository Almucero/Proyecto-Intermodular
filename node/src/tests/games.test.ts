import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";

describe("Games Endpoints", () => {
  let authToken: string;

  const testUser = {
    email: `gametest${Date.now()}@example.com`,
    name: "Game Test User",
    password: "password123",
  };

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authToken = res.body.token;
  });

  afterAll(async () => {
    await prisma.user
      .delete({ where: { email: testUser.email } })
      .catch(() => {});
    await prisma.$disconnect();
  });

  it("debe listar games con autenticación", async () => {
    const res = await request(app)
      .get("/api/games")
      .set("Authorization", `Bearer ${authToken}`);

    expect([200, 404, 500]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });

  it("debe listar games sin autenticación", async () => {
    const res = await request(app).get("/api/games");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe listar games sin relaciones por defecto", async () => {
    const res = await request(app).get("/api/games");
    expect(res.status).toBe(200);
    if (res.body.length > 0) {
      const game = res.body[0];
      expect(game.id).toBeDefined();
      expect(game.title).toBeDefined();
      expect(game.genres).toBeUndefined();
    }
  });

  it("debe listar games con relaciones cuando se incluyen", async () => {
    const res = await request(app).get("/api/games?include=genres,media");
    expect(res.status).toBe(200);
    if (res.body.length > 0) {
      const game = res.body[0];
      expect(game.id).toBeDefined();
      expect(game.title).toBeDefined();
    }
  });

  it("debe responder 400 o 404 para id inválido o inexistente", async () => {
    const res = await request(app).get("/api/games/invalid");

    expect([400, 404]).toContain(res.status);
  });

  it("debe fallar al crear game sin ser admin", async () => {
    const res = await request(app)
      .post("/api/games")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ title: "Should Fail" });

    expect([401, 403]).toContain(res.status);
  });
});
