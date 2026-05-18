-- AlterTable
ALTER TABLE "public"."Set" ADD COLUMN     "levelId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Set" ADD CONSTRAINT "Set_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."WordLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
