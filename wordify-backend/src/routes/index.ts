import { Router } from "express";
import setRoutes from "./set.routes";
import authRoutes from "./auth.routes";
import wordRoutes from "./word.routes";
import folderRoutes from "./folder.routes";
import cronJobRoutes from "./cronJob.routes";
import userWordRoutes from "./userWord.routes";
import healthCheckRoutes from "./healthСheck.route";

export const apiRoutes = Router();
apiRoutes.use("/sets", setRoutes);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/word", wordRoutes);
apiRoutes.use("/cron", cronJobRoutes);
apiRoutes.use("/folders", folderRoutes);
apiRoutes.use("/user-word", userWordRoutes);

export const defaultRoutes = Router();
defaultRoutes.use("/health", healthCheckRoutes);
