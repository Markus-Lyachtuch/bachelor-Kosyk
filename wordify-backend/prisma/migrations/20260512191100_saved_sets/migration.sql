-- CreateTable
CREATE TABLE "public"."SavedSet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "setId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SavedSet_userId_setId_key" ON "public"."SavedSet"("userId", "setId");

-- AddForeignKey
ALTER TABLE "public"."SavedSet" ADD CONSTRAINT "SavedSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SavedSet" ADD CONSTRAINT "SavedSet_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;
