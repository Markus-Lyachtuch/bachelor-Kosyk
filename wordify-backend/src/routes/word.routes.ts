import multer from 'multer';
import { Router } from "express"
import { checkPronunciation, getWordImage, wordAutocomplete, wordInfo } from "../controllers/word.controller";
import { authHandler } from "../middlewares/authHandler";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() })

router.post("/check-pronunciation", authHandler, upload.single('audio'), checkPronunciation);
router.get("/:lang/:word/autocomplete", authHandler, wordAutocomplete);
router.get("/:lang/:word", authHandler, wordInfo);
router.get("/image", authHandler, getWordImage);

export default router;
