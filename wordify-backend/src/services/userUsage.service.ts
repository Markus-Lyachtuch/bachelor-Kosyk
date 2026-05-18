import { Prisma } from "@prisma/client";
import { ApiError } from "utils/apiError";
import { prisma } from "../server";

export const getUserUsageInfoById = async (userId: number) => {
  return await prisma.userUsage.findFirst({ where: { userId } });
};

interface ISetUserUsageInfoById {
  userUsageId: number;
  aiGeneratedStoriesCount?: number;
  aiGeneratedWordsCount?: number;
  aiGeneratedImagesCount?: number;
}

export const setUserUsageInfoById = async ({
  userUsageId,
  aiGeneratedStoriesCount,
  aiGeneratedWordsCount,
  aiGeneratedImagesCount,
}: ISetUserUsageInfoById) => {
  return await prisma.userUsage.update({
    where: { id: userUsageId },
    data: { aiGeneratedStoriesCount, aiGeneratedWordsCount, aiGeneratedImagesCount },
  });
};

export const resetUserUsageInfo = async () => {
  return await prisma.userUsage.updateMany({
    data: {
      aiGeneratedImagesCount: 0,
      aiGeneratedStoriesCount: 0,
      aiGeneratedWordsCount: 0,
    },
  });
};

export const enableOneOfTheFieldsInSettingsSet = async (
  setId: number,
  payload: Prisma.SetSettingsUpdateInput
) => {
  const settings = await prisma.setSettings.findUnique({ where: { setId } });

  if (!settings) {
    throw new ApiError(400, "Set settings not found")
  };

  return prisma.setSettings.update({
    where: { setId },
    data: payload,
  });
};
