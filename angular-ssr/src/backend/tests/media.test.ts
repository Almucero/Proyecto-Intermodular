/// <reference types="jest" />
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/db';

describe('Media API', () => {
  let adminToken: string;
  let gameId: number;
  let userId: number;
  let regularUserToken: string;
  let regularUserId: number;
  let uploadedGameMediaId: number;
  let uploadedUserMediaId: number;
  let adminEmail: string;
  let regularUserEmail: string;

  beforeAll(async () => {
    adminEmail = `admin${Date.now()}@example.com`;
    const adminUser = {
      email: adminEmail,
      name: 'Admin User',
      surname: 'Lastname',
      password: 'password123',
    };

    await request(app).post('/api/auth/register').send(adminUser);

    await prisma.user.update({
      where: { email: adminUser.email },
      data: { isAdmin: true },
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: adminUser.password });

    adminToken = loginRes.body.token;
    const adminData = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    userId = adminData!.id;

    const game = await prisma.game.create({
      data: {
        title: 'Test Game for Media',
        description: 'Test Description',
        price: 10.0,
        releaseDate: new Date(),
      },
    });
    gameId = game.id;

    regularUserEmail = `user${Date.now()}@example.com`;
    const regularUser = {
      email: regularUserEmail,
      name: 'Regular User',
      surname: 'Lastname',
      password: 'password123',
    };
    await request(app).post('/api/auth/register').send(regularUser);
    const regularLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: regularUser.email, password: regularUser.password });
    regularUserToken = regularLogin.body.token;
    const regularData = await prisma.user.findUnique({
      where: { email: regularUserEmail },
    });
    regularUserId = regularData!.id;
  });

  afterAll(async () => {
    await prisma.media.deleteMany({
      where: {
        OR: [{ gameId }, { userId }, { userId: regularUserId }],
      },
    });

    const { v2: cloudinary } = await import('cloudinary');

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (game) {
      const folderName = `gameImages/${game.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')}`;
      try {
        await cloudinary.api.delete_folder(folderName);
        console.log(`Deleted test folder: ${folderName}`);
      } catch (e) {
        console.warn(`Cleanup error: ${folderName}`);
      }
    }
    await prisma.game.delete({ where: { id: gameId } });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const nameToUse = user.name || user.accountId || `user-${userId}`;
      const folderName = `userImages/${nameToUse
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')}`;
      try {
        await cloudinary.api.delete_folder(folderName);
        console.log(`Deleted test folder: ${folderName}`);
      } catch (e) {
        console.warn(`Cleanup error: ${folderName}`);
      }
    }

    const regularUser = await prisma.user.findUnique({
      where: { id: regularUserId },
    });
    if (regularUser) {
      const nameToUse =
        regularUser.name || regularUser.accountId || `user-${regularUserId}`;
      const folderName = `userImages/${nameToUse
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')}`;
      try {
        await cloudinary.api.delete_folder(folderName);
        console.log(`Deleted test folder: ${folderName}`);
      } catch (e) {
        console.warn(`Cleanup error: ${folderName}`);
      }
    }

    if (adminEmail) {
      await prisma.user
        .delete({ where: { email: adminEmail } })
        .catch(() => {});
    }

    if (regularUserEmail) {
      await prisma.user
        .delete({ where: { email: regularUserEmail } })
        .catch(() => {});
    }

    await prisma.$disconnect();
  });

  describe('POST /api/media/upload', () => {
    it('should upload game media successfully (admin only)', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'game')
        .field('id', gameId)
        .attach('file', imageBuffer, 'test-game.png');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('url');
      expect(res.body.gameId).toBe(gameId);
      expect(res.body).not.toHaveProperty('userId');
      expect(res.body.folder).toContain('gameImages');

      uploadedGameMediaId = res.body.id;
    }, 20000);

    it('should reject non-admin uploading game media', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('type', 'game')
        .field('id', gameId)
        .attach('file', imageBuffer, 'test-game.png');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Solo administradores');
    }, 20000);

    it('should upload user media for own profile', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'user')
        .field('id', userId)
        .attach('file', imageBuffer, 'test-user.png');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('url');
      expect(res.body.userId).toBe(userId);
      expect(res.body).not.toHaveProperty('gameId');
      expect(res.body.folder).toContain('userImages');

      uploadedUserMediaId = res.body.id;
    }, 20000);

    it('should allow regular user to upload their own media', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('type', 'user')
        .field('id', regularUserId)
        .attach('file', imageBuffer, 'test-regular-user.png');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('url');
      expect(res.body.userId).toBe(regularUserId);
      expect(res.body).not.toHaveProperty('gameId');
      expect(res.body.folder).toContain('userImages');
    }, 20000);

    it('should reject user uploading media for different profile', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('type', 'user')
        .field('id', userId)
        .attach('file', imageBuffer, 'test-fake.png');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain(
        'Solo puedes subir media para tu propio perfil',
      );
    }, 20000);

    it('should fail without file', async () => {
      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'game')
        .field('id', gameId);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/media', () => {
    it('should list all media', async () => {
      const res = await request(app).get('/api/media');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter by type=game and id', async () => {
      const res = await request(app).get(`/api/media?type=game&id=${gameId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].gameId).toBe(gameId);
      expect(res.body[0]).not.toHaveProperty('userId');
    });

    it('should filter by type=user and id', async () => {
      const res = await request(app).get(`/api/media?type=user&id=${userId}`);
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].userId).toBe(userId);
      expect(res.body[0]).not.toHaveProperty('gameId');
    });
  });

  describe('GET /api/media/:id', () => {
    it('should get media by id', async () => {
      const res = await request(app).get(`/api/media/${uploadedGameMediaId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', uploadedGameMediaId);
    });

    it('should return 404 for non-existent media', async () => {
      const res = await request(app).get('/api/media/999999');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/media/:id/upload', () => {
    it('should allow admin to update game media', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app)
        .put(`/api/media/${uploadedGameMediaId}/upload`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('altText', 'Updated alt text')
        .attach('file', imageBuffer, 'updated.png');

      expect(res.status).toBe(200);
      expect(res.body.altText).toBe('Updated alt text');
    }, 20000);

    it('should reject non-admin from updating game media', async () => {
      const res = await request(app)
        .put(`/api/media/${uploadedGameMediaId}/upload`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('altText', 'Test malicious alt text');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Solo administradores');
    });

    it('should allow user to update their own media', async () => {
      const imageBuffer1 = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const uploadRes = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('type', 'user')
        .field('id', regularUserId)
        .attach('file', imageBuffer1, 'user-image.png');

      const userMediaId = uploadRes.body.id;

      const imageBuffer2 = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
        'base64',
      );

      const res = await request(app)
        .put(`/api/media/${userMediaId}/upload`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('altText', 'My new avatar description')
        .attach('file', imageBuffer2, 'updated-avatar.png');

      expect(res.status).toBe(200);
      expect(res.body.altText).toBe('My new avatar description');
    }, 20000);

    it("should reject user from updating other user's media", async () => {
      const res = await request(app)
        .put(`/api/media/${uploadedUserMediaId}/upload`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('altText', 'Test malicious user media');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Solo puedes editar tu propia media');
    });

    it('should update metadata without file', async () => {
      const res = await request(app)
        .put(`/api/media/${uploadedGameMediaId}/upload`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('altText', 'Metadata only');

      expect(res.status).toBe(200);
      expect(res.body.altText).toBe('Metadata only');
    });
  });

  describe('DELETE /api/media/:id', () => {
    it('should allow admin to delete game media', async () => {
      const res = await request(app)
        .delete(`/api/media/${uploadedGameMediaId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const check = await request(app).get(`/api/media/${uploadedGameMediaId}`);
      expect(check.status).toBe(404);
    }, 20000);

    it('should reject non-admin from deleting game media', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const uploadRes = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('type', 'game')
        .field('id', gameId)
        .attach('file', imageBuffer, 'test-game-delete.png');

      const gameMediaId = uploadRes.body.id;

      const res = await request(app)
        .delete(`/api/media/${gameMediaId}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Solo administradores');

      await request(app)
        .delete(`/api/media/${gameMediaId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }, 20000);

    it('should allow user to delete their own media', async () => {
      const imageBuffer1 = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64',
      );

      const uploadRes = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('type', 'user')
        .field('id', regularUserId)
        .attach('file', imageBuffer1, 'user-media-delete.png');

      const userMediaId = uploadRes.body.id;

      const res = await request(app)
        .delete(`/api/media/${userMediaId}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.status).toBe(200);

      const check = await request(app).get(`/api/media/${userMediaId}`);
      expect(check.status).toBe(404);
    }, 20000);

    it("should reject user from deleting other user's media", async () => {
      const res = await request(app)
        .delete(`/api/media/${uploadedUserMediaId}`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain(
        'Solo puedes eliminar tu propia media',
      );
    });
  });
});
