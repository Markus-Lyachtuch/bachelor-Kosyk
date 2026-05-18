import { Request, Response } from "express";
import config from "../config/index";
import { processSetsLevelsService, resetDailyUsageLimitsService } from "../services/cronJob.service";

export const resetDailyUsageLimits = async (req: Request, res: Response) => {
  const { secretKey } = req.body;

  if (secretKey !== config.jwtSecret) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  await resetDailyUsageLimitsService();
  res.status(200).json({ message: "Daily usage limits reset successfully" });
};

export const processSetsLevels = async (_: Request, res: Response) => {
  await processSetsLevelsService();
  res.status(200).json({ message: "Sets levels processed successfully" });
};
