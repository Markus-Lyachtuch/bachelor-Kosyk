import { $Enums, Prisma } from "@prisma/client";
import config from "../config/index";
import { prisma } from "../server";
import axios from "axios";
import { ApiError } from "utils/apiError";

export const getSets = async (userId: number) => {
  return await prisma.set.findMany({
    where: {
      userId,
    },
    include: { words: true },
  });
};

export const getSetsSmallResponse = async (userId: number, folderId: number) => {
  const sets = await prisma.set.findMany({
    where: {
      userId,
      folderId,
    },
    include: {
      user: { select: { name: true } },
      level: true,
      folder: { select: { id: true, name: true } },
      _count: { select: { words: true } },
    },
  });

  return sets.map(({ _count, ...set }) => ({
    ...set,
    wordsCount: _count.words,
  }));
};

export const getSetById = async (setId: number, userId: number, isAllowedAccess?: boolean) => {
  const whereCondition = isAllowedAccess ? { id: setId } : { id: setId, userId };

  return await prisma.set.findUnique({
    where: whereCondition,
    include: {
      words: {
        include: {
          word: { select: { level: true, source: true, phonetics: true } },
        },
      },
      user: { select: { name: true, avatarUrl: true } },
      level: true,
      folder: { select: { id: true, name: true } },
      settings: true,
      userSetProgress: true,
      marks: { select: { id: true, rating: true, userId: true } },
    },
  });
};

export const deleteSetById = async (setId: number) => {
  return await prisma.set.delete({
    where: {
      id: setId,
    },
  });
};

export const editSmallSetData = async (setId: number, name: string, folderId: number) => {
  return await prisma.set.update({
    where: { id: setId },
    data: { name, folderId },
    include: {
      words: true,
      user: { select: { name: true } },
      level: true,
      folder: { select: { id: true, name: true } },
    },
  });
};

interface IResetSetProgress {
  setId: number;
  userId: number;
  wordIds: number[];
}

export const resetSetProgress = async ({ setId, wordIds, userId }: IResetSetProgress) => {
  await prisma.$transaction(async () => {
    wordIds.map(
      async (id) =>
        await prisma.userWord.update({
          where: { id },
          data: { status: $Enums.LearningStatus.FLASH_CARD },
        }),
    );

    await prisma.userSetProgress.update({
      where: { setId },
      data: { currentStage: 0, nextReviewDate: null },
    });
  });

  return await getSetById(setId, userId);
};

interface IGetRecommendedSets {
  userId: number;
}

export const getRecommendedSetsService = async ({ userId }: IGetRecommendedSets) => {
  const sets = await prisma.set.findMany({
    take: 5,
    where: {
      userId: { notIn: [userId] },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }, { rating: "desc" }],
    select: {
      id: true,
      name: true,
      level: true,
      rating: true,
      setImage: true,
      timeToStudy: true,
      user: { select: { name: true } },
      _count: { select: { words: true } },
      folder: { select: { id: true, name: true } },
    },
  });

  return sets.map(({ _count, ...set }) => ({
    ...set,
    wordsCount: _count.words,
  }));
};

interface IGetMyLearningSets {
  userId: number;
}

export const getMyLearningSetsService = async ({ userId }: IGetMyLearningSets) => {
  return await prisma.set.findMany({
    take: 5,
    where: {
      userId,
    },
    orderBy: [{ updatedAt: "desc" }],
    include: {
      words: true,
      user: { select: { name: true } },
      level: true,
      folder: { select: { id: true, name: true } },
    },
  });
};

interface IGetSearchSets {
  search: string;
  level: string;
  quantity: number;
  userId: number;
}

export const getSearchSetsService = async ({ search, level, quantity, userId }: IGetSearchSets) => {
  const searchModified = search?.trim() ? search : undefined;
  const levelModified = level?.trim() ? level : undefined;

  const setsWithEnoughWords = await prisma.$queryRaw<{ setId: number }[]>`
    SELECT "setId" FROM "UserWord" 
    GROUP BY "setId" 
    HAVING count(*) >= ${quantity}
  `;
  const setIds = setsWithEnoughWords.map((set) => set.setId);

  const sets = await prisma.set.findMany({
    take: 50,
    where: {
      id: { in: setIds },
      userId: { notIn: [userId] },
      ...(searchModified && { name: { contains: searchModified, mode: "insensitive" } }),
      ...(levelModified && { level: { level: { equals: levelModified, mode: "insensitive" } } }),
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }, { rating: "desc" }],
    select: {
      id: true,
      name: true,
      level: true,
      rating: true,
      setImage: true,
      timeToStudy: true,
      user: { select: { name: true } },
      _count: { select: { words: true } },
      folder: { select: { id: true, name: true } },
    },
  });

  return sets.map(({ _count, ...set }) => ({
    ...set,
    wordsCount: _count.words,
  }));
};

const LEVEL_VALUE_MAP: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
const REVERSE_LEVEL_VALUE_MAP: Record<number, string> = { 1: "A1", 2: "A2", 3: "B1", 4: "B2", 5: "C1", 6: "C2" };

export const processSetWordsAndGetLevel = async (terms: string[], languageId: number) => {
  const uniqueTerms = Array.from(new Set(terms.map((t) => t.toLowerCase())));

  const existingWords = await prisma.word.findMany({
    where: { languageId, word: { in: uniqueTerms } },
  });

  const missingLevelTerms = uniqueTerms.filter((term) => {
    const wordInDb = existingWords.find((w) => w.word === term);
    return !wordInDb || !wordInDb.levelId;
  });

  let mlLevels: Record<string, string> = {};
  if (missingLevelTerms.length > 0) {
    try {
      const res = await axios.get(`${config.mlApiUrl}/word-level`, {
        params: { words: missingLevelTerms.join(",") },
      });
      mlLevels = res.data.words || {};
    } catch (err) {
      console.error("Failed to fetch word levels from ML API", err);
    }
  }

  const allWordLevelsDb = await prisma.wordLevel.findMany();
  const levelToId = new Map(allWordLevelsDb.map((l) => [l.level.toUpperCase(), l.id]));

  for (const term of missingLevelTerms) {
    const levelStr = mlLevels[term]?.toUpperCase();
    if (!levelStr) continue;

    let levelId = levelToId.get(levelStr);
    if (!levelId) {
      const newLevel = await prisma.wordLevel.upsert({
        where: { level: levelStr },
        create: { level: levelStr },
        update: {},
      });
      levelId = newLevel.id;
      levelToId.set(levelStr, levelId);
      allWordLevelsDb.push(newLevel);
    }

    const existing = existingWords.find((w) => w.word === term);
    if (existing) {
      await prisma.word.update({
        where: { id: existing.id },
        data: { levelId, source: "CEFR" },
      });
      existing.levelId = levelId;
    } else {
      const newWord = await prisma.word.create({
        data: { word: term, levelId, languageId, source: "CEFR" },
      });
      existingWords.push(newWord);
    }
  }

  let totalLevelValue = 0;
  let levelCount = 0;

  const wordMap: Record<string, number | null> = {};

  for (const term of uniqueTerms) {
    const wordInDb = existingWords.find((w) => w.word === term);
    if (wordInDb) {
      wordMap[term] = wordInDb.id;
      if (wordInDb.levelId) {
        const levelObj = allWordLevelsDb.find((l) => l.id === wordInDb.levelId);
        if (levelObj) {
          const val = LEVEL_VALUE_MAP[levelObj.level.toUpperCase()];
          if (val) {
            totalLevelValue += val;
            levelCount++;
          }
        }
      }
    } else {
      wordMap[term] = null;
    }
  }

  let setLevelId: number | null = null;
  if (levelCount > 0) {
    const avgValue = Math.round(totalLevelValue / levelCount);
    const avgLevelStr = REVERSE_LEVEL_VALUE_MAP[avgValue];
    if (avgLevelStr) {
      let resolvedId = levelToId.get(avgLevelStr);
      if (!resolvedId) {
        const newLevel = await prisma.wordLevel.upsert({
          where: { level: avgLevelStr },
          create: { level: avgLevelStr },
          update: {},
        });
        resolvedId = newLevel.id;
        levelToId.set(avgLevelStr, resolvedId);
        allWordLevelsDb.push(newLevel);
      }
      setLevelId = resolvedId;
    }
  }

  return { wordMap, setLevelId };
};
export const getSavedSetsService = async ({ userId }: { userId: number }) => {
  const savedSets = await prisma.savedSet.findMany({
    where: {
      userId,
    },
    orderBy: [{ createdAt: "desc" }],
    select: {
      set: {
        include: {
          user: { select: { name: true } },
          level: true,
          savedSet: true,
          folder: { select: { id: true, name: true } },
          _count: { select: { words: true } },
        },
      },
    },
  });

  return savedSets.map((saved) => {
    const { _count, ...set } = saved.set;
    return {
      ...set,
      wordsCount: _count.words,
    };
  });
};

export const saveSetService = async ({ userId, setId }: { userId: number; setId: number }) => {
  const set = await prisma.set.findUnique({
    where: { id: setId },
  });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  const savedSet = await prisma.savedSet.create({
    data: { userId, setId },
  });

  return savedSet;
};

export const unsaveSetService = async ({ userId, setId }: { userId: number; setId: number }) => {
  const set = await prisma.savedSet.findUnique({
    where: { id: setId },
  });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  const savedSet = await prisma.savedSet.delete({
    where: { id: setId },
  });

  return savedSet;
};

export const updateRatingService = async ({
  userId,
  setId,
  rating,
}: {
  userId: number;
  setId: number;
  rating: number;
}) => {
  const set = await prisma.set.findUnique({
    where: { id: setId },
  });

  if (!set) {
    throw new ApiError(404, "Set not found");
  }

  if (set.userId === userId) {
    throw new ApiError(400, "You can not rate your own set");
  }

  const ratedSet = await prisma.setRating.upsert({
    where: {
      userId_setId: {
        userId,
        setId,
      },
    },
    update: { rating },
    create: { userId, setId, rating },
  });

  const updatedSet = await prisma.set.findUnique({
    where: { id: setId },
    include: {
      marks: true,
    },
  });

  if (!updatedSet) return ratedSet;

  const avgRating = updatedSet.marks.reduce((acc, mark) => acc + mark.rating, 0) / updatedSet.marks.length;

  await prisma.set.update({
    where: { id: setId },
    data: { rating: avgRating },
  });

  return ratedSet;
};

export const copySetService = async (
  existingSet: any,
  newUserId: number,
  newFolderId: number,
  newName: string
) => {
  return await prisma.$transaction(async (tx) => {
    const set = await tx.set.create({
      data: {
        name: newName,
        timeToStudy: existingSet.timeToStudy,
        languageId: existingSet.languageId,
        folderId: newFolderId,
        setImage: existingSet.setImage,
        userId: newUserId,
        levelId: existingSet.levelId,
        settings: { create: {} },
        userSetProgress: { create: { userId: newUserId } },
      },
    });

    if (existingSet.words && existingSet.words.length > 0) {
      await tx.userWord.createMany({
        data: existingSet.words.map((w: any) => ({
          wordId: w.wordId,
          setId: set.id,
          term: w.term,
          definition: w.definition,
          image: w.image,
        })),
      });
    }

    return set;
  });
};
