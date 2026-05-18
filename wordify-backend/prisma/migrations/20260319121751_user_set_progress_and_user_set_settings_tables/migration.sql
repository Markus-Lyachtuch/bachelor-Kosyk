-- CreateTable
CREATE TABLE "public"."SetSettings" (
    "id" SERIAL NOT NULL,
    "isForgettingCurveEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isAutoPlayAudioEnabled" BOOLEAN NOT NULL DEFAULT false,
    "setId" INTEGER NOT NULL,

    CONSTRAINT "SetSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSetProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "setId" INTEGER NOT NULL,
    "currentStage" INTEGER NOT NULL DEFAULT 0,
    "nextReviewDate" TIMESTAMP(3),

    CONSTRAINT "UserSetProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SetSettings_setId_key" ON "public"."SetSettings"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetProgress_setId_key" ON "public"."UserSetProgress"("setId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSetProgress_userId_setId_key" ON "public"."UserSetProgress"("userId", "setId");

-- AddForeignKey
ALTER TABLE "public"."SetSettings" ADD CONSTRAINT "SetSettings_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSetProgress" ADD CONSTRAINT "UserSetProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserSetProgress" ADD CONSTRAINT "UserSetProgress_setId_fkey" FOREIGN KEY ("setId") REFERENCES "public"."Set"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "SetSettings" ("setId", "isForgettingCurveEnabled", "isAutoPlayAudioEnabled")
SELECT id, false, false
FROM "Set"
WHERE id NOT IN (SELECT "setId" FROM "SetSettings");

INSERT INTO "UserSetProgress" ("userId", "setId", "currentStage", "nextReviewDate")
SELECT "userId", id, 0, NULL
FROM "Set"
ON CONFLICT ("userId", "setId") DO NOTHING;