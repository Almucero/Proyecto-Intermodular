/// <reference types="jest" />
import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";
import bcrypt from "bcryptjs";

describe("Chat Endpoints", () => {
  let authToken: string;
  let userId: number;
  let createdSessionId: number;

  const testUser = {
    email: `chattest${Date.now()}@example.com`,
    name: "Chat Test User",
    surname: "Lastname",
    password: "password123",
  };

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    if (userId) {
      await prisma.chatSession
        .deleteMany({ where: { userId } })
        .catch(() => {});
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  afterEach(async () => {
    if (userId && createdSessionId) {
      await prisma.chatSession
        .delete({ where: { id: createdSessionId } })
        .catch(() => {});
      createdSessionId = 0;
    }
  });

  it("debe obtener lista vacía de sesiones para nuevo usuario", async () => {
    const res = await request(app)
      .get("/api/chat/sessions")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("debe crear una nueva sesión al enviar mensaje sin sessionId", async () => {
    const res = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "Hola" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("sessionId");
    expect(res.body).toHaveProperty("text");
    expect(typeof res.body.sessionId).toBe("number");
    createdSessionId = res.body.sessionId;
  });

  it("debe obtener una sesión existente", async () => {
    const session = await prisma.chatSession.create({
      data: { userId, title: "Test Session" },
    });
    createdSessionId = session.id;

    const res = await request(app)
      .get(`/api/chat/sessions/${session.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id", session.id);
    expect(res.body).toHaveProperty("title");
    expect(res.body).toHaveProperty("messages");
  });

  it("debe fallar al obtener sesión inexistente", async () => {
    const res = await request(app)
      .get("/api/chat/sessions/99999")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it("debe eliminar una sesión existente", async () => {
    const session = await prisma.chatSession.create({
      data: { userId, title: "Session to delete" },
    });

    const res = await request(app)
      .delete(`/api/chat/sessions/${session.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("deleted", true);
  });

  it("debe fallar al eliminar sesión inexistente", async () => {
    const res = await request(app)
      .delete("/api/chat/sessions/99999")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(404);
  });

  it("debe fallar sin autenticación", async () => {
    const res = await request(app).get("/api/chat/sessions");

    expect(res.status).toBe(401);
  });

  it("debe listar sesiones después de crear una", async () => {
    const session = await prisma.chatSession.create({
      data: { userId, title: "Listed Session" },
    });
    createdSessionId = session.id;

    const res = await request(app)
      .get("/api/chat/sessions")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty("id");
    expect(res.body[0]).toHaveProperty("title");
    expect(res.body[0]).toHaveProperty("_count");
  });
});
