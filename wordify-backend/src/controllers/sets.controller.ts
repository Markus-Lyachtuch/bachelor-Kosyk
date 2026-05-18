import { Request, Response, NextFunction } from "express";

import { prisma } from "../server";

import { decodeJwt } from "../utils/jwt";
import { ApiError } from "../utils/apiError";
import { deleteFromStorageByUrl, getS3PublicUrl, uploadToStorageAndGetUrl } from "../utils/s3";

import {
  getSets,
  getSetById,
  deleteSetById,
  resetSetProgress,
  editSmallSetData,
  getSetsSmallResponse,
  getRecommendedSetsService,
  getMyLearningSetsService,
  getSearchSetsService,
  processSetWordsAndGetLevel,
  getSavedSetsService,
  saveSetService,
  unsaveSetService,
  updateRatingService,
  copySetService,
} from "../services/sets.service";
import { getLanguage } from "../services/word.service";

import { MulterRequest } from "../types/common";
import { IParsedSetData } from "../types/sets";
import { getFolderById } from "../services/folder.service";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_MEGABYTES_PER_FILE,
  MIN_WORDS_COUNT,
  MINUTES_FOR_STUDY_ONE_WORD,
  SET_LIMIT,
  WORDS_LIMIT,
} from "../const/set";
import { LearningStatus } from "@prisma/client";
import { DEFAULT_S3_IMAGE_NAME } from "../const/s3";
import { enableOneOfTheFieldsInSettingsSet, setUserUsageInfoById } from "../services/userUsage.service";
import axios, { AxiosError } from "axios";
import config from "../config/index";
import { getUserById } from "../services/auth.service";
import { getUserSetProgressBySetId, scheduleDirectEmail } from "../services/emailScheduler.service";
import { formatCreatedAtEn } from "../utils/formatDate";

const checkSetByFolderAndLanguage = async (parsedData: IParsedSetData, userId: number) => {
  if (parsedData.words.length > WORDS_LIMIT || parsedData.words.length < MIN_WORDS_COUNT) {
    throw new ApiError(
      400,
      `The count of words in set must not be more than ${WORDS_LIMIT} and not be less than ${MIN_WORDS_COUNT}`,
    );
  }

  const languageId = (await getLanguage({ code: parsedData.languageCode })).id;
  if (!languageId) {
    throw new ApiError(400, "Unsupported language code");
  }

  const folder = await getFolderById(parsedData.folderId, userId);
  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  return { languageId, folder };
};

const checkSetByName = async (name: string, userId: number) => {
  const userSets = await getSets(userId);
  if (userSets.some((set) => set.name === name)) {
    throw new ApiError(409, "Set with this name already exists");
  }

  return userSets;
};

const checkSetByUserAndId = async (req: Request, isAllowedAccess?: boolean) => {
  const { userId } = decodeJwt(req.cookies.accessToken);
  const { id } = req.params;
  const setId = Number(id);

  if (isNaN(setId)) {
    throw new ApiError(400, "Invalid set ID");
  }

  const existingSet = await getSetById(setId, userId, isAllowedAccess);

  if (!existingSet) {
    throw new ApiError(404, "Set not found or the set is not yours");
  }

  return existingSet;
};

const checkSetImagesFilesSizeAndType = (req: MulterRequest) => {
  const setImageFile = (req.files as any)?.setImage?.[0] || null;
  const wordImageFiles: MulterRequest["file"][] = (req.files as any)?.wordImages || [];

  if (setImageFile && setImageFile.size > MAX_FILE_SIZE) {
    throw new ApiError(400, `Set image is too large. Max size is ${MAX_MEGABYTES_PER_FILE}MB.`);
  }

  if (
    setImageFile &&
    setImageFile.mimetype &&
    (!setImageFile.mimetype.startsWith("image/") || !ALLOWED_FILE_TYPES.includes(setImageFile.mimetype))
  ) {
    throw new ApiError(400, "Set image must be an image file");
  }

  for (const file of wordImageFiles) {
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, `One of word images is too large. Max size is ${MAX_MEGABYTES_PER_FILE}MB.`);
    }

    if (file.mimetype && (!file.mimetype.startsWith("image/") || !ALLOWED_FILE_TYPES.includes(file.mimetype))) {
      throw new ApiError(400, "All word images must be image files");
    }
  }

  return { setImageFile, wordImageFiles };
};

export const getFullSetsController = async (req: Request, res: Response, _: NextFunction) => {
  const existingSet = await checkSetByUserAndId(req, true);
  res.status(200).json(existingSet);
};

export const getSetsController = async (req: Request, res: Response, _: NextFunction) => {
  const { folderId } = req.query;

  if (!folderId) {
    throw new ApiError(400, "folderId query parameter is required");
  }

  const { userId } = decodeJwt(req.cookies.accessToken);
  const sets = await getSetsSmallResponse(userId, Number(folderId));
  res.status(200).json(sets);
};

export const createSetController = async (req: MulterRequest, res: Response, _: NextFunction) => {
  const { setData } = req.body;
  const { userId } = decodeJwt(req.cookies.accessToken);
  const parsedData: IParsedSetData = JSON.parse(setData);

  const userSets = await checkSetByName(parsedData.name, userId);

  if (userSets.length >= SET_LIMIT) {
    throw new ApiError(400, `Count of sets exceeded the limit of ${SET_LIMIT}`);
  }

  const { languageId, folder } = await checkSetByFolderAndLanguage(parsedData, userId);
  const { setImageFile, wordImageFiles } = checkSetImagesFilesSizeAndType(req);

  const wordsWithImages = await Promise.all(
    parsedData.words.map(async (word) => {
      let imageUrl = word.imageUrl ?? null;

      const file = word?.index !== undefined && word?.index !== null && wordImageFiles?.[word.index];
      if (file) {
        imageUrl = await uploadToStorageAndGetUrl(file);
      }

      return {
        term: word.term,
        definition: word.definition ?? null,
        image: imageUrl,
      };
    }),
  );

  const setImageUrl = setImageFile
    ? await uploadToStorageAndGetUrl(setImageFile)
    : getS3PublicUrl() + `/${DEFAULT_S3_IMAGE_NAME}`;

  const termsToProcess = wordsWithImages.map((w) => w.term);
  const { wordMap, setLevelId } = await processSetWordsAndGetLevel(termsToProcess, languageId);

  const created = await prisma.$transaction(async (tx) => {
    const set = await tx.set.create({
      data: {
        name: parsedData.name,
        timeToStudy: MINUTES_FOR_STUDY_ONE_WORD * parsedData.words.length,
        languageId,
        folderId: folder.id,
        setImage: setImageUrl,
        userId,
        levelId: setLevelId,
        settings: { create: {} },
        userSetProgress: { create: { userId } },
      },
    });

    await tx.userWord.createMany({
      data: wordsWithImages.map((w) => {
        const termLower = w.term.toLowerCase();
        return {
          wordId: wordMap[termLower] ?? null,
          setId: set.id,
          term: w.term,
          definition: w.definition,
          image: w.image,
        };
      }),
    });

    return set;
  });

  res.status(201).json(created);
};

export const editNameAndFolderController = async (req: Request, res: Response, _: NextFunction) => {
  const { name, folderId } = req.body;
  const { userId } = decodeJwt(req.cookies.accessToken);
  const { id: setId } = await checkSetByUserAndId(req);
  await checkSetByName(name, userId);
  const updatedSet = await editSmallSetData(setId, name, folderId);
  res.status(200).json(updatedSet);
};

export const editSetController = async (req: Request, res: Response, _: NextFunction) => {
  const { setData } = req.body;
  const parsedData = JSON.parse(setData);
  const { userId, words: oldWords, id: setId, setImage: existingSetImage } = await checkSetByUserAndId(req);
  const { setImageFile, wordImageFiles } = checkSetImagesFilesSizeAndType(req);
  await checkSetByName(parsedData.name, userId);

  const { languageId, folder } = await checkSetByFolderAndLanguage(parsedData, userId);

  const newWords = parsedData.words;
  const termsToProcess = newWords.map((w: any) => w.term);
  const { wordMap, setLevelId } = await processSetWordsAndGetLevel(termsToProcess, languageId);

  const existingWords = newWords.filter((w: any) => w.id);
  const existingWordsWithEditedImageIds = new Set(
    existingWords
      .filter((w: any) => w.imageUrl === null || (w.index !== null && w.index !== undefined))
      .map((w: any) => w.id),
  );
  const existingIds = new Set(existingWords.map((w) => w.id));
  const wordsToDelete = oldWords.filter((old) => !existingIds.has(old.id));
  const wordsToKeepButDeleteOldImg = oldWords.filter((old) => existingWordsWithEditedImageIds.has(old.id));

  const edited = await prisma.$transaction(
    async (tx) => {
      for (const word of wordsToDelete) {
        if (word.image) {
          await deleteFromStorageByUrl(word.image);
        }
      }

      for (const word of wordsToKeepButDeleteOldImg) {
        if (word.image) {
          await deleteFromStorageByUrl(word.image);
        }
      }

      await tx.userWord.deleteMany({
        where: {
          id: { in: wordsToDelete.map((w) => w.id) },
        },
      });

      let setImageUrl: string | undefined = undefined;

      if (setImageFile) {
        existingSetImage && (await deleteFromStorageByUrl(existingSetImage));
        setImageUrl = await uploadToStorageAndGetUrl(setImageFile);
      }

      const set = await tx.set.update({
        data: {
          name: parsedData.name,
          timeToStudy: MINUTES_FOR_STUDY_ONE_WORD * newWords.length,
          languageId,
          folderId: folder.id,
          setImage: setImageUrl,
          userId,
          levelId: setLevelId,
        },
        where: { id: setId },
      });

      const wordsWithImages = await Promise.all(
        newWords.map(async (word) => {
          let imageUrl = word.imageUrl ?? null;

          const file = wordImageFiles?.[word.index];
          if (file) {
            imageUrl = await uploadToStorageAndGetUrl(file);
          }

          return {
            id: word?.id ?? null,
            term: word.term,
            definition: word.definition ?? null,
            image: imageUrl,
          };
        }),
      );

      await Promise.all(
        wordsWithImages
          .filter((w) => w.id !== null)
          .map(async (w) => {
            const termLower = w.term.toLowerCase();
            const foundWordId = wordMap[termLower] ?? null;
            const isNeedToChangeStatus = oldWords.find((ow) => ow.id === w.id)?.term !== w.term;

            await tx.userWord.update({
              where: { id: w.id as number },
              data: {
                wordId: foundWordId,
                term: w.term,
                definition: w.definition ?? null,
                image: w.image ?? null,
                status: isNeedToChangeStatus ? ("FLASH_CARD" as LearningStatus) : undefined,
              },
            });
          }),
      );

      const newWordsData = wordsWithImages
        .filter((w) => w.id === null)
        .map((w) => {
          const termLower = w.term.toLowerCase();
          const foundWordId = wordMap[termLower] ?? null;

          return {
            setId,
            wordId: foundWordId,
            term: w.term,
            definition: w.definition ?? null,
            image: w.image ?? null,
            status: "FLASH_CARD" as LearningStatus,
          };
        });

      if (newWordsData.length > 0) {
        await tx.userWord.createMany({
          data: newWordsData,
        });
      }

      return set;
    },
    { timeout: 20_000 },
  );

  res.status(200).json(edited);
};

export const deleteSetController = async (req: Request, res: Response, _: NextFunction) => {
  const existingSet = await checkSetByUserAndId(req);

  if (existingSet.setImage) {
    await deleteFromStorageByUrl(existingSet.setImage);
  }

  await Promise.all(existingSet.words.map(async (word) => word.image && (await deleteFromStorageByUrl(word.image))));
  await deleteSetById(existingSet.id);

  res.status(204).send();
};

export const generateSetStoryController = async (req: Request, res: Response, _: NextFunction) => {
  const { words } = req.body;
  const { userUsageId, aiGeneratedStoriesCount } = res.locals;

  try {
    const {
      data: { story },
    } = await axios.post(`${config.mlApiUrl}/v3/generate/story`, { words });
    await setUserUsageInfoById({
      userUsageId,
      aiGeneratedStoriesCount: aiGeneratedStoriesCount + 1,
    });
    res.status(200).send({
      usedWords: story.used_words,
      maskedStory: story.masked_story,
      originalStory: story.original_story,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(400, error.response?.data.error);
    }

    throw new ApiError(500, `The problem with ml service occured.`);
  }
};

export const generateWordsController = async (req: Request, res: Response, _: NextFunction) => {
  const { words } = req.body;
  const { userUsageId, aiGeneratedWordsCount } = res.locals;

  try {
    const {
      data: { words: generatedSimilarWords },
    } = await axios.post(`${config.mlApiUrl}/v3/generate/words`, { words });
    await setUserUsageInfoById({
      userUsageId,
      aiGeneratedWordsCount: aiGeneratedWordsCount + 1,
    });
    res.status(200).send({
      words: generatedSimilarWords
        .split(",")
        .map((word) => word.trim())
        .filter((word) => word !== "" && word.length > 1),
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(400, error.response?.data.error);
    }

    throw new ApiError(500, `The problem with ml service occured.`);
  }
};

export const changeSetSettings = async (req: Request, res: Response, _: NextFunction) => {
  const { userId, id } = await checkSetByUserAndId(req);
  const user = await getUserById({ id: userId });

  if (req.body?.isForgettingCurveEnabled !== undefined && !user?.isVerified) {
    throw new ApiError(400, "Verify your email first");
  }

  await enableOneOfTheFieldsInSettingsSet(id, req.body);
  res.status(204).send();
};

export const resetProgress = async (req: Request, res: Response, _: NextFunction) => {
  const { id, userId, words } = await checkSetByUserAndId(req);
  const updatedSet = await resetSetProgress({
    setId: id,
    userId,
    wordIds: words.map((word) => word.id),
  });
  res.status(200).send(updatedSet);
};

export const sendEmailAccordingToForgettingCurve = async (req: Request, res: Response, _: NextFunction) => {
  const existingSet = await checkSetByUserAndId(req);
  const user = await getUserById({ id: existingSet.userId });
  const { scorePercentage } = req.body;

  if (scorePercentage === undefined) {
    throw new ApiError(400, "Score is missing");
  }

  if (!user?.isVerified) throw new ApiError(400, "Can not send email, because user's email is not verified");

  if (!existingSet.settings?.isForgettingCurveEnabled) throw new ApiError(400, "Forgetting curve is not enabled");

  const currentDate = new Date().getTime();
  const userSetProgress = await getUserSetProgressBySetId(existingSet);
  const reviewDate = userSetProgress?.nextReviewDate ? new Date(userSetProgress?.nextReviewDate).getTime() : null;

  if (reviewDate && reviewDate - currentDate > 0) {
    res.status(204).send();
    return;
  }

  if (!existingSet.userSetProgress?.currentStage && existingSet.userSetProgress?.currentStage !== 0)
    throw new ApiError(500, "CurrentStage was not found");

  const currentStage = existingSet.userSetProgress?.currentStage;
  let nextStage = currentStage;

  if (scorePercentage < 50) {
    nextStage = Math.max(1, currentStage - 2);
  } else if (scorePercentage >= 50 && scorePercentage < 80) {
    nextStage = currentStage;
  } else {
    nextStage = currentStage + 1;
  }

  let nextReviewDate = new Date();

  switch (nextStage) {
    case 0:
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 120);
      break;
    case 1:
      nextReviewDate.setHours(nextReviewDate.getHours() + 4);
      break;
    case 2:
      nextReviewDate.setHours(nextReviewDate.getHours() + 25);
      break;
    case 3:
      nextReviewDate.setDate(nextReviewDate.getDate() + 3);
      break;
    case 4:
      nextReviewDate.setDate(nextReviewDate.getDate() + 7);
      break;
    case 5:
      nextReviewDate.setDate(nextReviewDate.getDate() + 14);
      break;
    case 6:
      nextReviewDate.setDate(nextReviewDate.getDate() + 30);
      break;
    default:
      throw new ApiError(400, "You have already studied your set, you can reset progress if you want to continue.");
  }

  await scheduleDirectEmail({
    user,
    set: existingSet,
    nextTimeReviewDate: nextReviewDate,
    currentStage: nextStage,
  });
  res.status(200).send({ message: `Recommend to review set ${formatCreatedAtEn(nextReviewDate.toISOString())}` });
};

export const generateImageController = async (req: Request, res: Response, _: NextFunction) => {
  const { term, definition } = req.body;
  const { userUsageId, aiGeneratedImagesCount } = res.locals;

  if (!term || term.length > 255) {
    throw new ApiError(400, "Term is required or is too long (max 255 characters)");
  }

  if (definition && definition.length > 255) {
    throw new ApiError(400, "Definition is too long (max 255 characters)");
  }

  try {
    const {
      data: { image },
    } = await axios.post(`${config.mlApiUrl}/v3/generate/image`, { term, definition });
    await setUserUsageInfoById({
      userUsageId,
      aiGeneratedImagesCount: aiGeneratedImagesCount + 1,
    });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    const fakeMulterFile = {
      fieldname: "image",
      originalname: "generated-image.png",
      encoding: "7bit",
      mimetype: "image/png",
      buffer: imageBuffer,
      size: imageBuffer.length,
    } as MulterRequest["file"];

    const uploadedImage = await uploadToStorageAndGetUrl(fakeMulterFile);
    res.status(200).send({ image: uploadedImage });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new ApiError(400, error.response?.data.error);
    }

    throw new ApiError(500, `The problem with ml service occured.`);
  }
};

export const getRecommendedSets = async (__: Request, res: Response, _: NextFunction) => {
  const {
    payload: { userId },
  } = res.locals;

  const recommendedSets = await getRecommendedSetsService({ userId });
  res.status(200).send(recommendedSets);
};

export const getMyLearningSets = async (__: Request, res: Response, _: NextFunction) => {
  const {
    payload: { userId },
  } = res.locals;

  const learningSets = await getMyLearningSetsService({ userId });
  res.status(200).send(learningSets);
};

export const getSearchSets = async (req: Request, res: Response, _: NextFunction) => {
  const { search, level, quantity } = req.query;
  const { userId } = res.locals.payload;

  if (search && (search as string).length > 50) {
    throw new ApiError(400, "Search is too long (max 50 characters)");
  }

  if (quantity && Number(quantity) > 1000) {
    throw new ApiError(400, "Quantity is too large (max 1000)");
  }

  const searchSets = await getSearchSetsService({
    search: search as string,
    level: level as string,
    quantity: Number(quantity),
    userId: userId as number,
  });
  res.status(200).send(searchSets);
};

export const getSavedSets = async (__: Request, res: Response, _: NextFunction) => {
  const {
    payload: { userId },
  } = res.locals;

  const savedSets = await getSavedSetsService({ userId });
  res.status(200).send(savedSets);
};

export const saveSet = async (req: Request, res: Response, _: NextFunction) => {
  const { setId } = req.params;
  const { userId } = res.locals.payload;
  const savedSet = await saveSetService({ userId, setId: Number(setId) });
  res.status(200).send(savedSet);
};

export const unsaveSet = async (req: Request, res: Response, _: NextFunction) => {
  const { setId } = req.params;
  const { userId } = res.locals.payload;
  await unsaveSetService({ userId, setId: Number(setId) });
  res.status(204).send();
};

export const updateRating = async (req: Request, res: Response, _: NextFunction) => {
  const { rating } = req.body;
  const { setId } = req.params;
  const { userId } = res.locals.payload;

  const rate = await updateRatingService({ userId, setId: Number(setId), rating });
  res.status(200).send(rate);
};

export const copySetController = async (req: Request, res: Response, _: NextFunction) => {
  const { folderId, name } = req.body;
  const { userId } = decodeJwt(req.cookies.accessToken);

  if (!folderId) {
    throw new ApiError(400, "folderId is required");
  }

  const existingSet = await checkSetByUserAndId(req, true);

  const folder = await getFolderById(folderId, userId);
  if (!folder) {
    throw new ApiError(404, "Folder not found");
  }

  const newName = name || existingSet.name;
  const userSets = await checkSetByName(newName, userId);

  if (userSets.length >= SET_LIMIT) {
    throw new ApiError(400, `Count of sets exceeded the limit of ${SET_LIMIT}`);
  }

  const copiedSet = await copySetService(existingSet, userId, folderId, newName);
  res.status(201).json(copiedSet);
};
