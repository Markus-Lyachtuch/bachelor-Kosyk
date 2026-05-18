import { NextFunction, Request, Response } from "express";
import {
  createFolder,
  deleteFolderDeep,
  getFolderById,
  getFolderByNameAndUserId,
  getFolders,
  getFoldersCount,
  updateFolder,
} from "../services/folder.service";
import { decodeJwt } from "../utils/jwt";
import { ApiError } from "../utils/apiError";
import { FOLDERS_LIMIT } from "../const/folder";

const checkFolderId = async (id: string, userId: number): Promise<void> => {
  if (!id) {
    throw new ApiError(400, "Folder id is required");
  }

  const folder = await getFolderById(Number(id), userId);
  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }
};

export const getFoldersController = async (
  req: Request,
  res: Response,
  __: NextFunction,
): Promise<void> => {
  const { userId } = decodeJwt(req.cookies.accessToken);
  const folders = (await getFolders(userId)).map(({ name, id }) => ({
    name,
    id,
  }));

  res.status(200).json(folders);
};

export const createFolderController = async (
  req: Request,
  res: Response,
  __: NextFunction,
): Promise<void> => {
  const { name } = req.body;
  const { userId } = decodeJwt(req.cookies.accessToken);

  const existingFolder = await getFolderByNameAndUserId(name, userId);
  const folderCount = await getFoldersCount(userId);

  if (folderCount >= FOLDERS_LIMIT) {
    throw new ApiError(400, `Folder limit reached (${FOLDERS_LIMIT})`);
  }

  if (existingFolder) {
    throw new ApiError(409, "Folder with this name already exists");
  }

  const folder = await createFolder(name, userId);

  res.status(201).json(folder);
};

export const editFolderController = async (
  req: Request,
  res: Response,
  __: NextFunction,
): Promise<void> => {
  const { userId } = decodeJwt(req.cookies.accessToken);
  const { name } = req.body;
  const { id } = req.params;

  await checkFolderId(id, userId);

  const updatedFolder = await updateFolder(Number(id), name);
  res.status(200).json(updatedFolder);
};

export const deleteFolderController = async (
  req: Request,
  res: Response,
  __: NextFunction,
): Promise<void> => {
  const { userId } = decodeJwt(req.cookies.accessToken);
  const { id } = req.params;
  await checkFolderId(id, userId);

  await deleteFolderDeep(Number(id), userId);
  res.status(204).send();
};
