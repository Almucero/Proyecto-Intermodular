import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";

describe("Auth Endpoints", () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    name: "Test User",
    surname: "Lastname",
    password: "password123",
  };

  afterAll(async () => {
    await prisma.user
      .deleteMany({
        where: {
          OR: [
            { email: testUser.email },
            { email: { startsWith: "login" } },
            { email: { startsWith: "fail" } },
            { email: { startsWith: "full" } },
            { email: { startsWith: "new@example.com" } },
          ],
        },
      })
      .catch(() => {});

    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("debe registrar un nuevo usuario", async () => {
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.name).toBe(testUser.name);
      expect(res.body.user.surname).toBe(testUser.surname);
      expect(res.body.user).not.toHaveProperty("passwordHash");
    });

    it("debe fallar con email duplicado", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email ya registrado");
    });

    it("debe fallar con email inválido", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "invalid-email" });

      expect(res.status).toBe(400);
    });

    it("debe fallar con contraseña corta", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "new@example.com", password: "123" });

      expect(res.status).toBe(400);
    });

    it("debe fallar con nombre corto", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "new@example.com", name: "A" });

      expect(res.status).toBe(400);
    });

    it("debe fallar con apellido corto", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...testUser, email: "new@example.com", surname: "X" });

      expect(res.status).toBe(400);
    });

    it("debe fallar sin apellido", async () => {
      const { surname, ...userWithoutSurname } = testUser;
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...userWithoutSurname, email: "new2@example.com" });

      expect(res.status).toBe(400);
    });

    it("debe guardar campos opcionales (nickname, addressLine1, city, country)", async () => {
      const userWithOptionalFields = {
        email: `full${Date.now()}@example.com`,
        name: "Full User",
        surname: "Complete",
        password: "password123",
        nickname: "fullnick",
        addressLine1: "123 Main St",
        city: "New York",
        country: "USA",
      };
      const res = await request(app)
        .post("/api/auth/register")
        .send(userWithOptionalFields);

      expect(res.status).toBe(201);
      expect(res.body.user.nickname).toBe("fullnick");
      expect(res.body.user.addressLine1).toBe("123 Main St");
      expect(res.body.user.city).toBe("New York");
      expect(res.body.user.country).toBe("USA");
    });
  });

  describe("POST /api/auth/login", () => {
    const loginUser = {
      email: `login${Date.now()}@example.com`,
      name: "Login User",
      surname: "Lastname",
      password: "password123",
    };

    beforeAll(async () => {
      await request(app).post("/api/auth/register").send(loginUser);
    });

    it("debe hacer login correctamente", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: loginUser.email, password: loginUser.password });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body).toHaveProperty("token");
      expect(res.body.user.email).toBe(loginUser.email);
    });

    it("debe fallar con contraseña incorrecta", async () => {
      const failUser = {
        email: `fail${Date.now()}@example.com`,
        name: "Fail User",
        surname: "Lastname",
        password: "correctpass123",
      };
      await request(app).post("/api/auth/register").send(failUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: failUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Credenciales inválidas");
    });

    it("debe fallar con email inexistente", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: `noexiste${Date.now()}@example.com`,
          password: "password123",
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Credenciales inválidas");
    });
  });
});
