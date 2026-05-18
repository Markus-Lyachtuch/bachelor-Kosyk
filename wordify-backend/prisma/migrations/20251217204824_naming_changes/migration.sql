/*
  Warnings:

  - You are about to drop the column `oxfordLevelId` on the `Word` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[level]` on the table `WordLevel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Word" DROP COLUMN "oxfordLevelId",
ADD COLUMN     "levelId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "WordLevel_level_key" ON "public"."WordLevel"("level");
