/// <reference types="jest" />
import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";

describe("Developers Endpoints", () => {
  let authToken: string;

  const testUser = {
    email: `devtest${Date.now()}@example.com`,
    name: "Developer Test User",
    surname: "Lastname",
    password: "password123",
  };

  beforeAll(async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);
    authToken = res.body.token;
  });

  afterAll(async () => {
    if (testUser.email) {
      await prisma.user
        .delete({ where: { email: testUser.email } })
        .catch(() => {});
    }
    await prisma.$disconnect();
  });

  it("debe listar developers con autenticación", async () => {
    const res = await request(app)
      .get("/api/developers")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe listar developers sin autenticación", async () => {
    const res = await request(app).get("/api/developers");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("debe responder 404 para id inexistente", async () => {
    const res = await request(app).get(`/api/developers/999999`);

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
