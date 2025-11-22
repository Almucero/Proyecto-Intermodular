import request from "supertest";
import app from "../app";

describe("GameImages Endpoints", () => {
  let authToken: string;

  const testUser = {
    email: `imgtest${Date.now()}@example.com`,
    name: "Image Test User",
    password: "password123",
  };

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authToken = res.body.token;
  });

  it("debe listar game images con autenticación", async () => {
    const res = await request(app)
      .get("/api/game-images")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe listar game images sin autenticación", async () => {
    const res = await request(app).get("/api/game-images");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe obtener image por id", async () => {
    const res = await request(app).get(`/api/game-images/999999`);
    expect([200, 404]).toContain(res.status);
  });

  it("debe fallar al crear image sin ser admin", async () => {
    const res = await request(app)
      .post("/api/game-images")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ gameId: 1, url: "https://example.com/img.png" });

    expect([401, 403]).toContain(res.status);
  });
});
