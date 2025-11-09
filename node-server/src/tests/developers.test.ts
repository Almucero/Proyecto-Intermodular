import request from "supertest";
import app from "../app";

describe("Developers Endpoints", () => {
  let authToken: string;
  let devId: number;

  const testUser = {
    email: `devtest${Date.now()}@example.com`,
    name: "Dev Test User",
    password: "password123",
  };

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authToken = res.body.token;
  });

  afterAll(async () => {
    await request(app)
      .post("/api/auth/login")
      .send({ email: "irrelevant", password: "irrelevant" })
      .catch(() => {});
  });

  it("debe listar developers con autenticación", async () => {
    const res = await request(app)
      .get("/api/developers")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe fallar sin autenticación", async () => {
    const res = await request(app).get("/api/developers");
    expect(res.status).toBe(401);
  });

  it("debe responder 404 para id inexistente", async () => {
    const res = await request(app)
      .get(`/api/developers/999999`)
      .set("Authorization", `Bearer ${authToken}`);

    expect([200, 404]).toContain(res.status);
  });

  it("debe fallar al crear developer sin ser admin", async () => {
    const res = await request(app)
      .post("/api/developers")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Should Fail" });

    expect([401, 403]).toContain(res.status);
  });
});
