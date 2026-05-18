import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { validateToken } from "../utils/validateToken";
import { ApiError } from "../utils/apiError";

export async function authHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const payload = validateToken(req.cookies?.accessToken);
  const userInfo = await authService.getUserById({ id: payload.userId });

  if (!userInfo?.isVerified) {
    throw new ApiError(403, "User is not verified");
  }

  res.locals.payload = payload;
  next();
}
