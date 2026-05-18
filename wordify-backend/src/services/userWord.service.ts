import { LearningStatus } from "@prisma/client";
import { prisma } from "../server";

export const findUserWordById = async (id: number) => {
  return await prisma.userWord.findUnique({
    where: { id },
  });
};

export const changeUserWordStatus = async (
  status: LearningStatus,
  wordId: number,
) => {
  return await prisma.userWord.update({
    where: { id: wordId },
    data: {
      status: status,
    },
  });
};
