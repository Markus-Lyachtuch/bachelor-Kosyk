-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

UPDATE "User"
SET "isVerified" = true
WHERE "provider" != 'local';