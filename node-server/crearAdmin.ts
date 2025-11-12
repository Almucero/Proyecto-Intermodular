import bcrypt from 'bcrypt';
import { prisma } from './src/config/db.js';

async function crearAdmin() {
  const passwordHash = await bcrypt.hash('12345678', 10);
  await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@example.com',
      passwordHash,
      // Si tu modelo tiene un rol, agrega:
      // role: 'ADMIN'
    },
  });
  console.log('Usuario admin creado');
}

crearAdmin();
