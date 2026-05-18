import { LearningStatus } from "@prisma/client";
import { Request, Response } from "express";
import {
  changeUserWordStatus,
  findUserWordById,
} from "../services/userWord.service";
import { ApiError } from "../utils/apiError";

export async function updateUserWordStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  const userWordId = +id;

  if (isNaN(userWordId)) {
    throw new ApiError(400, "Invalid user word ID");
  }

  const foundUserWord = await findUserWordById(userWordId);

  if (!foundUserWord) {
    throw new ApiError(404, "User word not found");
  }

  if (status in LearningStatus) {
    await changeUserWordStatus(status as LearningStatus, userWordId);
    res.status(204).send();
  } else {
    throw new ApiError(400, "Invalid learning status");
  }
}
