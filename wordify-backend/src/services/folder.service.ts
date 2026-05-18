import { prisma } from "../server";
import { deleteFromStorageByUrl } from "../utils/s3";

export const getFolders = async (userId: number) => {
  return prisma.folder.findMany({ where: { userId }, include: { sets: true } });
};

export const getFoldersCount = async (userId: number) => {
  return prisma.folder.count({ where: { userId } });
};

export const getFolderByNameAndUserId = async (
  name: string,
  userId: number,
) => {
  return prisma.folder.findFirst({ where: { name, userId } });
};

export const getFolderById = async (id: number, userId: number) => {
  return prisma.folder.findUnique({ where: { id, userId } });
};

export const createFolder = async (name: string, userId: number) => {
  return prisma.folder.create({ data: { name, userId } });
};

export const updateFolder = async (id: number, name: string) => {
  return prisma.folder.update({ where: { id }, data: { name } });
};

export const deleteFolderDeep = async (folderId: number, userId: number) => {
  const sets = await prisma.set.findMany({
    where: { folderId, userId },
    select: {
      setImage: true,
      words: {
        select: { image: true },
      },
    },
  });

  const urlsToDelete: string[] = [];

  for (const set of sets) {
    if (set.setImage) urlsToDelete.push(set.setImage);
    for (const w of set.words) {
      if (w.image) urlsToDelete.push(w.image);
    }
  }

  await Promise.all(
    urlsToDelete.map((url) => deleteFromStorageByUrl(url))
  );

  await prisma.folder.delete({
    where: { id: folderId },
  });
};

export const deleteFolder = async (id: number) => {
  return prisma.folder.delete({ where: { id } });
};
