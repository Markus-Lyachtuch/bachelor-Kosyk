import { prisma } from "../server";
import { ApiError } from "../utils/apiError";

interface IGetLanguage {
  code?: string;
  id?: number;
}

interface IUpdateMeaning {
  wordId: number;
  definitions: string[];
  partOfSpeech: string;
  synonyms: string[];
  antonyms: string[];
  source: string;
}

interface ICreateWord {
  word: string;
  levelId: number | null;
  languageId: number;
  source: string;
}

interface ICreateMeaning extends Omit<IUpdateMeaning, "meaningId"> {
  partOfSpeech: string;
}

interface ICreatePhonetic {
  text: string;
  wordId: number;
  audioUrl: string | null;
  variant: string | null;
  source: string;
}

export async function getLanguage(languageParams: IGetLanguage) {
  const language = await prisma.language.findUnique({
    where: { code: languageParams?.code, id: languageParams?.id },
  });
  if (!language) {
    throw new ApiError(400, "Language is not supported");
  }

  return language;
}

export async function getWord(langCode: string, word: string) {
  const result = await getLanguage({ code: langCode });

  const wordInfo = await prisma.word.findFirst({
    where: { languageId: result.id, word },
    include: {
      meanings: true,
      phonetics: true,
      examples: true,
      level: true,
      language: true,
    },
  });

  return wordInfo;
}

export async function getLevel(id: number) {
  return await prisma.wordLevel.findFirst({ where: { id } });
}

export async function updateMeaning(updateParams: IUpdateMeaning): Promise<void> {
  if (updateParams) {
    const { definitions, wordId, synonyms, antonyms, source, partOfSpeech } = updateParams;
    
    await prisma.meaning.upsert({
      where: { 
        wordId_partOfSpeech_source: {
          wordId,
          partOfSpeech,
          source
        }
      },
      update: {
        definitions,
        synonyms,
        antonyms,
        updatedAt: new Date().toISOString(),
      },
      create: {
        wordId,
        partOfSpeech,
        definitions,
        synonyms,
        antonyms,
        source,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }
}

export async function createWord(createWordInfo: ICreateWord) {
  if (createWordInfo) {
    const { word, levelId, languageId, source } = createWordInfo;
    return await prisma.word.create({
      data: { word, levelId, languageId, source },
    });
  }
}

export async function createMeaning(createMeaningInfo: ICreateMeaning) {
  if (createMeaningInfo) {
    const { wordId, definitions, source, synonyms, antonyms, partOfSpeech } =
      createMeaningInfo;
    return await prisma.meaning.create({
      data: { wordId, definitions, source, synonyms, antonyms, partOfSpeech },
    });
  }
}

export async function createPhonetic(createPhoneticParams: ICreatePhonetic) {
  if (createPhoneticParams) {
    const { text, audioUrl, source, wordId, variant } = createPhoneticParams;
    return await prisma.phonetic.create({
      data: { text, audioUrl, source, wordId, variant },
    });
  }
}

export async function getPhonetic(wordId: number) {
  return await prisma.phonetic.findMany({ where: { wordId } });
}

export async function getWordsByStartingLetters(langId: number, word: string) {
  return await prisma.word.findMany({
    where: {
      languageId: langId,
      word: {
        startsWith: word,
      },
    },
    include: {
      meanings: { select: { id: true, partOfSpeech: true, definitions: true, synonyms: true, antonyms: true } },
      examples: true,
      level: true,
    },
    take: 5,
  });
}
