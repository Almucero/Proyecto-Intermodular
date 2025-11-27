import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";
import { prisma } from "../../config/db.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function listMedia(filters?: {
  type?: "user" | "game";
  id?: number;
  folder?: string;
  format?: string;
  resourceType?: string;
}) {
  const where: any = {};

  if (filters?.type && filters?.id) {
    if (filters.type === "game") {
      where.gameId = filters.id;
    } else if (filters.type === "user") {
      where.userId = filters.id;
    }
  }

  if (filters?.folder) where.folder = filters.folder;
  if (filters?.format) where.format = filters.format;
  if (filters?.resourceType) where.resourceType = filters.resourceType;

  const results = await prisma.media.findMany({
    where,
    select: {
      id: true,
      url: true,
      publicId: true,
      format: true,
      resourceType: true,
      bytes: true,
      width: true,
      height: true,
      originalName: true,
      folder: true,
      altText: true,
      gameId: true,
      userId: true,
    },
  });

  return results.map((item) => {
    const cleaned: any = { ...item };
    if (item.gameId !== null) {
      delete cleaned.userId;
    } else if (item.userId !== null) {
      delete cleaned.gameId;
    }
    return cleaned;
  });
}

export async function findMediaById(id: number) {
  return await prisma.media.findUnique({
    where: { id },
    select: {
      id: true,
      url: true,
      publicId: true,
      format: true,
      resourceType: true,
      bytes: true,
      width: true,
      height: true,
      originalName: true,
      folder: true,
      altText: true,
      gameId: true,
      userId: true,
      Game: {
        select: {
          id: true,
          title: true,
        },
      },
      User: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

function sanitizeFolderName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uploadMedia(
  type: "user" | "game",
  id: number,
  file: Express.Multer.File,
  altText?: string
) {
  let folderName = "";
  let gameId: number | undefined;
  let userId: number | undefined;

  if (type === "game") {
    const game = await prisma.game.findUnique({
      where: { id },
      select: { title: true },
    });
    if (!game) throw new Error("Game not found");
    folderName = `gameImages/${sanitizeFolderName(game.title)}`;
    gameId = id;
  } else if (type === "user") {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { name: true, accountId: true, accountAt: true },
    });
    if (!user) throw new Error("User not found");
    const folderIdentifier =
      user.accountAt ||
      sanitizeFolderName(user.name || user.accountId || `user-${id}`);
    folderName = `userImages/${folderIdentifier}`;
    userId = id;
  } else {
    throw new Error("Invalid media type");
  }

  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderName,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });

  return await prisma.media.create({
    data: {
      ...(gameId !== undefined && { gameId }),
      ...(userId !== undefined && { userId }),
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalName: file.originalname,
      folder: folderName,
      altText: altText || file.originalname,
    },
  });
}

export async function updateMedia(
  id: number,
  file?: Express.Multer.File,
  altText?: string,
  newType?: "user" | "game",
  newId?: number
) {
  const existingMedia = await prisma.media.findUnique({
    where: { id },
    include: {
      Game: { select: { id: true, title: true } },
      User: { select: { id: true, name: true, accountId: true } },
    },
  });

  if (!existingMedia) {
    throw new Error("Media not found");
  }

  const currentType = existingMedia.gameId ? "game" : "user";
  const currentOwnerId = existingMedia.gameId || existingMedia.userId!;

  const targetType = newType || currentType;
  const targetId = newId || currentOwnerId;

  let updateData: any = {};
  let targetFolderName = existingMedia.folder!;

  if (targetType !== currentType || targetId !== currentOwnerId) {
    if (targetType === "game") {
      const game = await prisma.game.findUnique({
        where: { id: targetId },
        select: { title: true },
      });
      if (!game) throw new Error("Target game not found");
      targetFolderName = `gameImages/${sanitizeFolderName(game.title)}`;
      updateData.gameId = targetId;
      updateData.userId = null;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: targetId },
        select: { name: true, accountId: true, accountAt: true },
      });
      if (!user) throw new Error("Target user not found");
      // Use accountAt directly if available (preserves @), otherwise sanitize name
      const folderIdentifier =
        user.accountAt ||
        sanitizeFolderName(user.name || user.accountId || `user-${targetId}`);
      targetFolderName = `userImages/${folderIdentifier}`;
      updateData.userId = targetId;
      updateData.gameId = null;
    }
  }

  if (altText !== undefined) {
    updateData.altText = altText;
  }

  if (file) {
    if (existingMedia.publicId) {
      try {
        await cloudinary.uploader.destroy(existingMedia.publicId);
      } catch (error) {
        console.error(
          `Failed to delete old image: ${existingMedia.publicId}`,
          error
        );
      }
    }

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: targetFolderName,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    updateData = {
      ...updateData,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalName: file.originalname,
      folder: targetFolderName,
    };
    if (altText === undefined) {
      updateData.altText = existingMedia.altText || file.originalname;
    }
  } else if (
    targetFolderName !== existingMedia.folder &&
    existingMedia.publicId
  ) {
    const filename = existingMedia.publicId.split("/").pop();
    const newPublicId = `${targetFolderName}/${filename}`;

    try {
      const result = await cloudinary.uploader.rename(
        existingMedia.publicId,
        newPublicId
      );
      updateData = {
        ...updateData,
        url: result.secure_url,
        publicId: result.public_id,
        folder: targetFolderName,
      };
    } catch (error) {
      console.error(`Failed to move image in Cloudinary`, error);
      throw new Error("Failed to move image to new folder");
    }
  }

  const updated = await prisma.media.update({
    where: { id },
    data: updateData,
  });

  if (targetFolderName !== existingMedia.folder && existingMedia.folder) {
    await cleanupFolderIfEmpty(existingMedia.folder);
  }

  return updated;
}

export async function deleteMedia(id: number) {
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new Error("Media not found");

  if (media.publicId) {
    try {
      await cloudinary.uploader.destroy(media.publicId);
    } catch (error) {
      console.error(
        `Failed to delete image from Cloudinary: ${media.publicId}`,
        error
      );
    }
  }

  await prisma.media.delete({ where: { id } });

  if (media.folder) {
    await cleanupFolderIfEmpty(media.folder);
  }

  return media;
}

async function cleanupFolderIfEmpty(folder: string) {
  const remaining = await prisma.media.count({
    where: { folder, publicId: { not: null } },
  });

  if (remaining === 0) {
    try {
      await cloudinary.api.delete_folder(folder);
      console.log(`Deleted empty folder: ${folder}`);
    } catch (error: any) {
      if (error?.error?.http_code !== 404) {
        console.warn(`Could not delete folder: ${folder}`, error);
      }
    }
  }
}
