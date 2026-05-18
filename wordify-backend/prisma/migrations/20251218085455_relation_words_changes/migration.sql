/*
  Warnings:

  - You are about to drop the column `source` on the `WordLevel` table. All the data in the column will be lost.
  - You are about to drop the column `wordId` on the `WordLevel` table. All the data in the column will be lost.
  - Added the required column `source` to the `Word` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."WordLevel" DROP CONSTRAINT "WordLevel_wordId_fkey";

-- DropIndex
DROP INDEX "public"."WordLevel_wordId_idx";

-- DropIndex
DROP INDEX "public"."WordLevel_wordId_key";

-- AlterTable
ALTER TABLE "public"."Word" ADD COLUMN     "source" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."WordLevel" DROP COLUMN "source",
DROP COLUMN "wordId";

-- AddForeignKey
ALTER TABLE "public"."Word" ADD CONSTRAINT "Word_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."WordLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
