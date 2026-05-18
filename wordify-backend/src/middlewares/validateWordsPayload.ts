import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export const validateWordsPayload = (
  req: Request,
  _: Response,
  next: NextFunction,
): void => {
  const { words } = req.body;

  if (!words || (Array.isArray(words) && words.length === 0)) {
    throw new ApiError(400, "Words for set is not given");
  }

  next();
};
