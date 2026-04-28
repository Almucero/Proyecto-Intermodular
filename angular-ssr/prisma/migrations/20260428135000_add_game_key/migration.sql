ALTER TABLE "Game"
ADD COLUMN "key" TEXT;

CREATE UNIQUE INDEX "Game_key_key" ON "Game"("key");
