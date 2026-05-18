/*
  Warnings:

  - The values [NOT_STARTED,LEARNING,MASTERED] on the enum `LearningStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."LearningStatus_new" AS ENUM ('FLASH_CARD', 'VARIANTS', 'CHECK_PRONUNCIATION', 'WRITE', 'LEARNED');
ALTER TABLE "public"."UserWord" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."UserWord" ALTER COLUMN "status" TYPE "public"."LearningStatus_new" USING (
  CASE "status"::text
    WHEN 'NOT_STARTED' THEN 'FLASH_CARD'::"public"."LearningStatus_new"
    WHEN 'LEARNING' THEN 'VARIANTS'::"public"."LearningStatus_new"
    WHEN 'MASTERED' THEN 'LEARNED'::"public"."LearningStatus_new"
    ELSE "status"::text::"public"."LearningStatus_new"
  END
);
ALTER TYPE "public"."LearningStatus" RENAME TO "LearningStatus_old";
ALTER TYPE "public"."LearningStatus_new" RENAME TO "LearningStatus";
DROP TYPE "public"."LearningStatus_old";
ALTER TABLE "public"."UserWord" ALTER COLUMN "status" SET DEFAULT 'FLASH_CARD';
COMMIT;

-- AlterTable
ALTER TABLE "public"."UserWord" ALTER COLUMN "status" SET DEFAULT 'FLASH_CARD';
