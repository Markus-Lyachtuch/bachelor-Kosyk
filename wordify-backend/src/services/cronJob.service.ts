import { prisma } from "../server";
import { processSetWordsAndGetLevel } from "./sets.service";

export const resetDailyUsageLimitsService = async () => {
  try {
    await prisma.userUsage.updateMany({
      data: {
        aiGeneratedImagesCount: 0,
        aiGeneratedWordsCount: 0,
        aiGeneratedStoriesCount: 0,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const processSetsLevelsService = async () => {
  try {
    const sets = await prisma.set.findMany({
      where: { levelId: null },
      select: { words: true, languageId: true, id: true },
    });

    for (const set of sets) {
      const setsTerms = set.words.map((word) => word.term);
      const { setLevelId } = await processSetWordsAndGetLevel(setsTerms, set.languageId);

      await prisma.set.update({
        where: {
          id: set.id,
        },
        data: {
          levelId: setLevelId,
        },
      });
    }
  } catch (error) {
    throw error;
  }
};
