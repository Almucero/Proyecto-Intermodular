import { prisma } from '../../config/db.js';

export async function listGames() {
	return prisma.game.findMany({ orderBy: { id: 'asc' } as any });
}

export async function findGameById(id: number) {
	return prisma.game.findUnique({ where: { id } as any });
}

export async function createGame(data: any) {
	return prisma.game.create({ data });
}

export async function updateGame(id: number, data: any) {
	return prisma.game.update({ where: { id } as any, data });
}

export async function deleteGame(id: number) {
	return prisma.game.delete({ where: { id } as any });
}

