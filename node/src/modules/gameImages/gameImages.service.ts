import { v2 as cloudinary } from "cloudinary";
import { env } from "../../config/env.js";
import { prisma } from "../../config/db.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function listGameImages(filters?: {
  gameId?: number;
  folder?: string;
  format?: string;
  resourceType?: string;
}) {
  const where: any = {};
  if (filters?.gameId) where.gameId = filters.gameId;
  if (filters?.folder) where.folder = filters.folder;
  if (filters?.format) where.format = filters.format;
  if (filters?.resourceType) where.resourceType = filters.resourceType;
  return await prisma.gameImage.findMany({
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
    },
  });
}

export async function findGameImageById(id: number) {
  return await prisma.gameImage.findUnique({
    where: { id } as any,
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
      Game: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          salePrice: true,
          isOnSale: true,
          isRefundable: true,
          numberOfSales: true,
          rating: true,
          releaseDate: true,
        },
      },
    },
  });
}

/**
 * Sanitize game title to create a valid folder name
 */
function sanitizeFolderName(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

export async function uploadGameImage(
  gameId: number,
  file: Express.Multer.File,
  altText?: string
) {
  // Fetch game to get title
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { title: true },
  });

  if (!game) {
    throw new Error("Game not found");
  }

  const folderName = sanitizeFolderName(game.title);

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

  return await prisma.gameImage.create({
    data: {
      gameId,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalName: file.originalname,
      folder: folderName, // Use our sanitized folder name
      altText: altText || file.originalname, // Use provided altText or default to filename
    },
  });
}

/**
 * Update game image with new file upload or metadata change
 * Deletes old image from Cloudinary and uploads new one if file provided
 * Moves image to new folder if gameId changes
 */
export async function updateGameImageWithFile(
  id: number,
  file?: Express.Multer.File,
  altText?: string,
  newGameId?: number
) {
  // Get existing image
  const existingImage = await prisma.gameImage.findUnique({
    where: { id },
    include: {
      Game: {
        select: { id: true, title: true },
      },
    },
  });

  if (!existingImage) {
    throw new Error("Image not found");
  }

  const oldGameId = existingImage.gameId;
  const oldFolder = existingImage.folder;
  const targetGameId = newGameId || oldGameId;

  // Fetch target game if changing
  let targetGame = existingImage.Game;
  if (newGameId && newGameId !== oldGameId) {
    const game = await prisma.game.findUnique({
      where: { id: newGameId },
      select: { id: true, title: true },
    });
    if (!game) {
      throw new Error("Target game not found");
    }
    targetGame = game;
  }

  let updateData: any = {
    gameId: targetGameId,
  };
  if (altText !== undefined) updateData.altText = altText;

  // Case 1: New file provided -> Replace image
  if (file) {
    // Delete old image from Cloudinary
    if (existingImage.publicId) {
      try {
        await cloudinary.uploader.destroy(existingImage.publicId);
      } catch (error) {
        console.error(
          `Failed to delete old image from Cloudinary: ${existingImage.publicId}`,
          error
        );
      }
    }

    // Upload new image to target game's folder
    const folderName = sanitizeFolderName(targetGame.title);

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
      folder: result.folder || null,
      altText: altText || file.originalname,
    };
  }
  // Case 2: No new file, but game changed -> Move image
  else if (newGameId && newGameId !== oldGameId && existingImage.publicId) {
    const folderName = sanitizeFolderName(targetGame.title);
    // Extract filename from publicId (e.g. "folder/filename" -> "filename")
    const filename = existingImage.publicId.split("/").pop();
    const newPublicId = `${folderName}/${filename}`;

    try {
      // Rename in Cloudinary
      const result = await cloudinary.uploader.rename(
        existingImage.publicId,
        newPublicId
      );

      updateData = {
        ...updateData,
        url: result.secure_url,
        publicId: result.public_id,
        folder: folderName, // Update folder in DB
      };
    } catch (error) {
      console.error(`Failed to move image in Cloudinary`, error);
      throw new Error("Failed to move image to new game folder");
    }
  }

  // Update database
  const updated = await prisma.gameImage.update({
    where: { id },
    data: updateData,
  });

  // Check if old folder is now empty (if game changed)
  if (newGameId && newGameId !== oldGameId && oldFolder) {
    const remainingImages = await prisma.gameImage.count({
      where: {
        gameId: oldGameId,
        publicId: { not: null },
      },
    });

    if (remainingImages === 0) {
      try {
        await cloudinary.api.delete_folder(oldFolder);
        console.log(`Deleted empty folder from Cloudinary: ${oldFolder}`);
      } catch (error: any) {
        if (
          error?.error?.http_code === 400 &&
          error?.error?.message?.includes("not empty")
        ) {
          console.log(`Folder ${oldFolder} not empty, skipping deletion.`);
        } else {
          console.warn(
            `Could not delete folder from Cloudinary: ${oldFolder}`,
            error
          );
        }
      }
    }
  }

  return updated;
}

export async function deleteGameImage(id: number) {
  const image = await prisma.gameImage.findUnique({
    where: { id },
    include: {
      Game: {
        select: { id: true, title: true },
      },
    },
  });

  if (!image) {
    throw new Error("Image not found");
  }

  const gameId = image.gameId;
  const folder = image.folder;

  // Delete image from Cloudinary
  if (image.publicId) {
    try {
      await cloudinary.uploader.destroy(image.publicId);
    } catch (error) {
      console.error(
        `Failed to delete image from Cloudinary: ${image.publicId}`,
        error
      );
    }
  }

  // Delete from database
  await prisma.gameImage.delete({ where: { id } as any });

  // Check if there are any remaining images for this game
  const remainingImages = await prisma.gameImage.count({
    where: {
      gameId,
      publicId: { not: null },
    },
  });

  // If no more images for this game, delete the folder from Cloudinary
  if (remainingImages === 0 && folder) {
    try {
      await cloudinary.api.delete_folder(folder);
      console.log(`Deleted empty folder from Cloudinary: ${folder}`);
    } catch (error: any) {
      if (
        error?.error?.http_code === 400 &&
        error?.error?.message?.includes("not empty")
      ) {
        console.log(`Folder ${folder} not empty, skipping deletion.`);
      } else {
        console.warn(
          `Could not delete folder from Cloudinary: ${folder}`,
          error
        );
      }
    }
  }

  return image;
}
