import { Router } from "express";
import { resetDailyUsageLimits, processSetsLevels } from "../controllers/cronJob.controller";

const router = Router();

router.patch("/reset-daily-usage-limits", resetDailyUsageLimits);
router.get("/process-words-levels", processSetsLevels);

export default router;
