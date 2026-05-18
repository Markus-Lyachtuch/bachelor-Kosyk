import multer from "multer";
import { Router } from "express";
import { authHandler } from "../middlewares/authHandler";
import { validate } from "../middlewares/validateRequest";
import {
  createSetController,
  deleteSetController,
  editNameAndFolderController,
  editSetController,
  changeSetSettings,
  generateSetStoryController,
  getFullSetsController,
  getSetsController,
  sendEmailAccordingToForgettingCurve,
  resetProgress,
  generateWordsController,
  generateImageController,
  getRecommendedSets,
  getMyLearningSets,
  getSearchSets,
  getSavedSets,
  saveSet,
  unsaveSet,
  updateRating,
  copySetController,
} from "../controllers/sets.controller";
import { WORDS_LIMIT } from "../const/set";
import { setSettingsSchema } from "../dtos/setSettings.dto";
import { aiLimitHandler } from "../middlewares/aiLimitHandler";
import { validateWordsPayload } from "../middlewares/validateWordsPayload";
import { withTryCatch } from "../middlewares/withTryCatch";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });
const uploadSets = upload.fields([
  { name: "setImage", maxCount: 1 },
  { name: "wordImages", maxCount: WORDS_LIMIT },
]);

const uploadSetsMiddleware = (req, res, next) => {
  uploadSets(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        message: `Too many files uploaded. Maximum ${WORDS_LIMIT} images per set.`,
        code: err.code,
      });
    }
    next();
  });
};

router.get("/recommended", authHandler, getRecommendedSets);

router.get("/search", authHandler, getSearchSets);

router.patch("/rating/:setId", authHandler, withTryCatch(updateRating));

router.get("/saved", authHandler, getSavedSets);
router.post("/saved/:setId", authHandler, saveSet);
router.delete("/saved/:setId", authHandler, unsaveSet);

router.post("/copy/:id", authHandler, copySetController);

router.get("/my-learning", authHandler, getMyLearningSets);

router.post("/generate/image", authHandler, aiLimitHandler("image"), generateImageController);
router.post("/generate/story", authHandler, validateWordsPayload, aiLimitHandler("story"), generateSetStoryController);
router.post("/generate/words", authHandler, validateWordsPayload, aiLimitHandler("words"), generateWordsController);

router.get("/", authHandler, getSetsController);
router.get("/:id", authHandler, getFullSetsController);
router.patch("/:id", authHandler, editNameAndFolderController);
router.post("/", authHandler, uploadSetsMiddleware, createSetController);
router.put("/:id", authHandler, uploadSetsMiddleware, editSetController);
router.delete("/:id", authHandler, deleteSetController);

router.patch("/:id/settings", authHandler, validate(setSettingsSchema), changeSetSettings);
router.post("/:id/forgetting-curve/email", authHandler, sendEmailAccordingToForgettingCurve);
router.patch("/:id/reset-progress", authHandler, resetProgress);

export default router;
