-- CreateTable
CREATE TABLE "public"."Language" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" SERIAL NOT NULL,
    "ip" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "userAgent" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "googleId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Word" (
    "id" SERIAL NOT NULL,
    "word" VARCHAR(255) NOT NULL,
    "oxfordLevelId" INTEGER,
    "languageId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WordLevel" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'oxford',

    CONSTRAINT "WordLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meaning" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "partOfSpeech" TEXT NOT NULL,
    "definitions" TEXT[],
    "synonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "antonyms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meaning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Phonetic" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "audioUrl" TEXT,
    "variant" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "Phonetic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Example" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "source" TEXT NOT NULL,

    CONSTRAINT "Example_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Language_code_key" ON "public"."Language"("code");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_userId_ip_userAgent_key" ON "public"."RefreshToken"("userId", "ip", "userAgent");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Word_word_key" ON "public"."Word"("word");

-- CreateIndex
CREATE UNIQUE INDEX "WordLevel_wordId_key" ON "public"."WordLevel"("wordId");

-- CreateIndex
CREATE INDEX "WordLevel_wordId_idx" ON "public"."WordLevel"("wordId");

-- CreateIndex
CREATE INDEX "Meaning_wordId_idx" ON "public"."Meaning"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "Meaning_wordId_partOfSpeech_source_key" ON "public"."Meaning"("wordId", "partOfSpeech", "source");

-- CreateIndex
CREATE INDEX "Phonetic_wordId_idx" ON "public"."Phonetic"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "Phonetic_wordId_variant_source_key" ON "public"."Phonetic"("wordId", "variant", "source");

-- CreateIndex
CREATE INDEX "Example_wordId_idx" ON "public"."Example"("wordId");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Word" ADD CONSTRAINT "Word_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "public"."Language"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WordLevel" ADD CONSTRAINT "WordLevel_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meaning" ADD CONSTRAINT "Meaning_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Phonetic" ADD CONSTRAINT "Phonetic_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Example" ADD CONSTRAINT "Example_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "public"."Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
