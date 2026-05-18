-- CreateTable
CREATE TABLE "public"."SetRating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "setId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SetRating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SetRating" ADD CONSTRAINT "SetRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SetRating" ADD CONSTRAINT "SetRating_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;
