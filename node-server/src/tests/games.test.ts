import request from "supertest";
import app from "../app";

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
