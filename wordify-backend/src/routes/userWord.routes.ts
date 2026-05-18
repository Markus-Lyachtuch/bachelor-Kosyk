import { Router } from "express";
import { authHandler } from "../middlewares/authHandler";
import { updateUserWordStatus } from "../controllers/userWord.controller";

const router = Router();

router.patch('/status/:id', authHandler, updateUserWordStatus);

export default router;
