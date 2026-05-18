/*
  Warnings:

  - A unique constraint covering the columns `[userId,setId]` on the table `SetRating` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SetRating_userId_setId_key" ON "public"."SetRating"("userId", "setId");
