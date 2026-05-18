import { Request, Response, NextFunction } from "express";

export async function healthCheck(_: Request, res: Response, __: NextFunction): Promise<void> {
  res.status(200).json({ status: "OKS", timestamp: new Date().toISOString() });
}
