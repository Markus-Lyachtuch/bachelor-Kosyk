import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { AxiosError } from "axios";

export const withTryCatch = (handler: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof AxiosError) {
        throw new ApiError(error.response?.status || 400, error.response?.data.error);
      }

      throw new ApiError(400, error?.message);
    }
  };
};
