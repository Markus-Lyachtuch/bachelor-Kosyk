import { Request, Response, NextFunction } from "express";
import { decodeJwt } from "../utils/jwt";
import { getUserUsageInfoById } from "../services/userUsage.service";
import { ApiError } from "../utils/apiError";
import { $Enums } from "@prisma/client";
import {
  AI_GENERATED_IMAGES_ALLOWED_COUNT_FOR_DEFAULT_USER,
  AI_GENERATED_IMAGES_ALLOWED_COUNT_FOR_PREMIUM_USER,
  AI_GENERATED_STORIES_ALLOWED_COUNT_FOR_DEFAULT_USER,
  AI_GENERATED_STORIES_ALLOWED_COUNT_FOR_PREMIUM_USER,
  AI_GENERATED_WORDS_ALLOWED_COUNT_FOR_DEFAULT_USER,
  AI_GENERATED_WORDS_ALLOWED_COUNT_FOR_PREMIUM_USER,
} from "../const/set";

type AiLimitType = "story" | "words" | "image";

export const aiLimitHandler = (limitType: AiLimitType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new ApiError(401, "No token provided");
      }

      const { userId, role } = decodeJwt(token);

      const userUsageInfo = await getUserUsageInfoById(userId);

      if (!userUsageInfo) {
        throw new ApiError(500, "Info about usersUsage not found");
      }

      if (limitType === "story") {
        const { aiGeneratedStoriesCount } = userUsageInfo;
        if (
          (aiGeneratedStoriesCount >= AI_GENERATED_STORIES_ALLOWED_COUNT_FOR_DEFAULT_USER &&
            role === $Enums.UserRole.user) ||
          (aiGeneratedStoriesCount >= AI_GENERATED_STORIES_ALLOWED_COUNT_FOR_PREMIUM_USER &&
            role === $Enums.UserRole.premium)
        ) {
          throw new ApiError(429, "You exceeded your limit of daily usage of generating ai stories");
        }
      } else if (limitType === "words") {
        const { aiGeneratedWordsCount } = userUsageInfo;
        if (
          (aiGeneratedWordsCount >= AI_GENERATED_WORDS_ALLOWED_COUNT_FOR_DEFAULT_USER &&
            role === $Enums.UserRole.user) ||
          (aiGeneratedWordsCount >= AI_GENERATED_WORDS_ALLOWED_COUNT_FOR_PREMIUM_USER &&
            role === $Enums.UserRole.premium)
        ) {
          throw new ApiError(429, "You exceeded your limit of daily usage of generating similar words");
        }
      } else if (limitType === "image") {
        const { aiGeneratedImagesCount } = userUsageInfo;
        if (
          (aiGeneratedImagesCount >= AI_GENERATED_IMAGES_ALLOWED_COUNT_FOR_DEFAULT_USER &&
            role === $Enums.UserRole.user) ||
          (aiGeneratedImagesCount >= AI_GENERATED_IMAGES_ALLOWED_COUNT_FOR_PREMIUM_USER &&
            role === $Enums.UserRole.premium)
        ) {
          throw new ApiError(429, "You exceeded your limit of daily usage of generating images");
        }
      }

      res.locals.userUsageId = userUsageInfo.id;
      res.locals.aiGeneratedStoriesCount = userUsageInfo.aiGeneratedStoriesCount;
      res.locals.aiGeneratedWordsCount = userUsageInfo.aiGeneratedWordsCount;
      res.locals.aiGeneratedImagesCount = userUsageInfo.aiGeneratedImagesCount;

      next();
    } catch (error) {
      next(error);
    }
  };
};
