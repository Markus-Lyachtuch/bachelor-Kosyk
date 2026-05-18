import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

export function errorHandler(
  err: unknown,
  _: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  console.error("Unexpected error:", err);
  res.status(500).json({ message: "Internal Server Error" });
}
