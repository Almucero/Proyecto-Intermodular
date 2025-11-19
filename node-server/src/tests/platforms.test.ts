import request from "supertest";
import app from "../app";

describe("Platforms Endpoints", () => {
  let authToken: string;

  const testUser = {
    email: `platest${Date.now()}@example.com`,
    name: "Platform Test User",
    password: "password123",
  };

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authToken = res.body.token;
  });

  it("debe listar platforms con autenticación", async () => {
    const res = await request(app)
      .get("/api/platforms")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe listar platforms sin autenticación", async () => {
    const res = await request(app).get("/api/platforms");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe obtener platform por id", async () => {
    const res = await request(app).get(`/api/platforms/999999`);
    expect([200, 404]).toContain(res.status);
  });

  it("debe fallar al crear platform sin ser admin", async () => {
    const res = await request(app)
      .post("/api/platforms")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Should Fail" });

    expect([401, 403]).toContain(res.status);
  });
});
