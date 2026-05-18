-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('user', 'premium');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."UserRole" NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "public"."UserUsage" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "aiGeneratedStoriesCount" INTEGER NOT NULL DEFAULT 0,
    "aiGeneratedImagesCount" INTEGER NOT NULL DEFAULT 0,
    "aiGeneratedWordsCount" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserUsage_userId_key" ON "public"."UserUsage"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserUsage" ADD CONSTRAINT "UserUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "UserUsage" ("userId") SELECT "id" FROM "User" WHERE "id" NOT IN (SELECT "userId" FROM "UserUsage");
