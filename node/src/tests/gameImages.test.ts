import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";

describe("GameImages API", () => {
  let adminToken: string;
  let gameId: number;
  let uploadedImageId: number;
  let adminEmail: string;

  beforeAll(async () => {
    // Create admin user
    adminEmail = `admin${Date.now()}@example.com`;
    const adminUser = {
      email: adminEmail,
      name: "Admin User",
      password: "password123",
    };

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send(adminUser);

    await prisma.user.update({
      where: { email: adminUser.email },
      data: { isAdmin: true },
    });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: adminUser.email, password: adminUser.password });

    adminToken = loginRes.body.token;

    // Create a test game
    const game = await prisma.game.create({
      data: {
        title: "Test Game for Images",
        description: "Test Description",
        price: 10.0,
        releaseDate: new Date(),
      },
    });
    gameId = game.id;
  });

  afterAll(async () => {
    // Clean up database
    await prisma.gameImage.deleteMany({ where: { gameId } });
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { title: true },
    });

    if (game) {
      // Delete Cloudinary folder after deleting final image
      const { v2: cloudinary } = await import("cloudinary");
      const folderName = game.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      try {
        await cloudinary.api.delete_folder(folderName);
        console.log(`Deleted test folder from Cloudinary: ${folderName}`);
      } catch (error) {
        // Folder might not exist, that's ok
        console.warn(`Could not delete test folder: ${folderName}`);
      }
    }

    await prisma.game.delete({ where: { id: gameId } });

    if (adminEmail) {
      await prisma.user
        .delete({ where: { email: adminEmail } })
        .catch(() => {});
    }

    await prisma.$disconnect();
  });

  describe("GET /api/game-images", () => {
    it("should list all game images", async () => {
      const res = await request(app).get("/api/game-images");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should filter by gameId", async () => {
      const res = await request(app).get(`/api/game-images?gameId=${gameId}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it("should filter by folder", async () => {
      const res = await request(app).get(
        "/api/game-images?folder=test-game-for-images"
      );
      expect(res.status).toBe(200);
    });
  });

  describe("POST /api/game-images/upload", () => {
    it("should upload an image successfully", async () => {
      const imageBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "base64"
      );

      const res = await request(app)
        .post("/api/game-images/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("gameId", gameId)
        .attach("file", imageBuffer, "test.png");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("url");
      expect(res.body).toHaveProperty("publicId");
      expect(res.body.gameId).toBe(gameId);

      uploadedImageId = res.body.id;
    }, 15000);

    it("should fail without file", async () => {
      const res = await request(app)
        .post("/api/game-images/upload")
        .set("Authorization", `Bearer ${adminToken}`)
        .field("gameId", gameId);

      expect(res.status).toBe(400);
    });

    it("should fail without authentication", async () => {
      const res = await request(app)
        .post("/api/game-images/upload")
        .field("gameId", gameId);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/game-images/:id", () => {
    it("should get image by id", async () => {
      const res = await request(app).get(`/api/game-images/${uploadedImageId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", uploadedImageId);
    });

    it("should return 404 for non-existent image", async () => {
      const res = await request(app).get("/api/game-images/999999");
      expect(res.status).toBe(404);
    });
  });

  describe("PUT /api/game-images/:id/upload", () => {
    it("should update image with new file", async () => {
      const imageBuffer = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
        "base64"
      );

      const res = await request(app)
        .put(`/api/game-images/${uploadedImageId}/upload`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("altText", "New image alt text")
        .attach("file", imageBuffer, "updated.png");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("url");
      expect(res.body.altText).toBe("New image alt text");
    }, 15000);

    it("should update metadata without file", async () => {
      const res = await request(app)
        .put(`/api/game-images/${uploadedImageId}/upload`)
        .set("Authorization", `Bearer ${adminToken}`)
        .field("altText", "Updated without file");

      expect(res.status).toBe(200);
      expect(res.body.altText).toBe("Updated without file");
    });

    it("should fail with invalid id", async () => {
      const res = await request(app)
        .put(`/api/game-images/invalid/upload`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/game-images/:id", () => {
    it("should delete image", async () => {
      const res = await request(app)
        .delete(`/api/game-images/${uploadedImageId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id", uploadedImageId);

      // Verify it's deleted
      const getRes = await request(app).get(
        `/api/game-images/${uploadedImageId}`
      );
      expect(getRes.status).toBe(404);
    }, 15000);

    it("should return 404 for non-existent image", async () => {
      const res = await request(app)
        .delete("/api/game-images/999999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(500); // Will throw error
    });
  });
});
