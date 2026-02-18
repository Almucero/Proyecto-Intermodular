/*
  Warnings:

  - You are about to drop the column `stock` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "stock",
ADD COLUMN     "stockPc" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockPs4" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockPs5" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockSwitch" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockXboxOne" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stockXboxX" INTEGER NOT NULL DEFAULT 0;
