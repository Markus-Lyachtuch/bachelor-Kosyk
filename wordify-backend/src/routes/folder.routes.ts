import { Router } from "express";
import {
  createFolderController,
  deleteFolderController,
  editFolderController,
  getFoldersController,
} from "../controllers/folder.controller";
import { authHandler } from "../middlewares/authHandler";
import { validate } from "../middlewares/validateRequest";
import { folderSchema } from "../dtos/folder.dto";

const router = Router();

router.get("/", authHandler, getFoldersController);
router.post("/", authHandler, validate(folderSchema), createFolderController);
router.patch("/:id", authHandler, validate(folderSchema), editFolderController);
router.delete("/:id", authHandler, deleteFolderController);

export default router;
