import jwt from "jsonwebtoken";
import { ApiError } from "./apiError";
import { verifyJwt } from "./jwt";

export const validateToken = (token: string) => {
  try {
    if (!token) {
      throw new ApiError(401, "No token provided");
    }

    const payload = verifyJwt(token);

    if (!payload) {
      throw new ApiError(401, "Wrong token provided");
    }

    return payload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, "Session expired");
    } else {
      throw new ApiError(401, err as string);
    }
  }
};
