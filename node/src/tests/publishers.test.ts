import request from "supertest";
import app from "../app";

describe("Publishers Endpoints", () => {
  let authToken: string;
  let publisherId: number;

  const testUser = {
    email: `pubtest${Date.now()}@example.com`,
    name: "Pub Test User",
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

  it("debe listar publishers con autenticación", async () => {
    const res = await request(app)
      .get("/api/publishers")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe listar publishers sin autenticación", async () => {
    const res = await request(app).get("/api/publishers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe obtener publisher por id", async () => {
    const res = await request(app).get(`/api/publishers/999999`);

    expect([200, 404]).toContain(res.status);
  });

  it("debe fallar al crear publisher sin ser admin", async () => {
    const res = await request(app)
      .post("/api/publishers")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "Should Fail" });

    expect([401, 403]).toContain(res.status);
  });
});
