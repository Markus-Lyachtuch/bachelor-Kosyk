import { IFolder } from "features/folder/api/folderApi";
import { IPhonetic } from "features/study/words/model/word";
import { apiDelete, apiGet, ApiParamsFNs, apiPatch, apiPost, apiPut } from "shared/api/base";

export interface IRecommendedSet {
  id: number;
  name: string;
  setImage: string | null;
  rating: number | null;
  folder: IFolder;
  level: {
    level: string;
  } | null;
  wordsCount: number | null;
  timeToStudy: number | null;
  user: { name: string | null };
}

export interface IMyLearningSet {
  id: number;
  name: string;
  setImage: string | null;
  languageId: number;
  folderId: number;
  updatedAt: string;
  createdAt: string;
  rating: number | null;
  timeToStudy: number | null;
  userId: number;
  levelId: number | null;
  words: {
    id: number;
    setId: number;
    wordId: number;
    term: string;
    definition: string;
    image: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  user: {
    name: string | null;
  };
  level: {
    level: string;
  } | null;
  folder: {
    id: number;
    name: string;
  };
}

export interface ISet {
  id: number;
  name: string;
  setImage: string | null;
  languageId: number;
  folderId: number;
  updatedAt: string;
  createdAt: string;
  rating: number | null;
  timeToStudy: number | null;
  userId: number;
  levelId: number | null;
  wordsCount: number | null;
  folder: IFolder;
  level: {
    level: string;
  } | null;
  user: {
    name: string | null;
    avatarUrl?: string | null;
  };
}

export enum LearningStatus {
  FLASH_CARD = "FLASH_CARD",
  VARIANTS = "VARIANTS",
  CHECK_PRONUNCIATION = "CHECK_PRONUNCIATION",
  WRITE = "WRITE",
  LEARNED = "LEARNED",
}

interface IMark {
  id: number;
  rating: number;
  userId: number;
}

export interface ISetFullInfo extends ISet {
  marks: IMark[];
  words: {
    id: number;
    createdAt: string;
    updatedAt: string;
    term: string;
    image: string | null;
    definition: string | null;
    setId: number;
    wordId: number | null;
    status: LearningStatus;
    word: {
      level: {
        id: number;
        level: string;
      } | null;
      source: string;
      phonetics: IPhonetic[];
    };
  }[];
  settings: {
    id: number;
    isForgettingCurveEnabled: boolean;
    isAutoPlayAudioEnabled: boolean;
    setId: number;
  } | null;
  userSetProgress: {
    id: number;
    userId: number;
    currentStage: number;
    nextReviewDate: Date | null;
    setId: number;
  };
}

interface IFetchSetsQuery extends ApiParamsFNs {
  folderId: number;
}

interface IFetchSetByIdQuery extends ApiParamsFNs {
  setId: number;
}

interface ISetDataQuery extends ApiParamsFNs {
  data: FormData;
}

interface IDeleteSetQuery extends ApiParamsFNs {
  setId: number;
}

interface IEditSmallInfoSetQuery extends ApiParamsFNs {
  setId: number;
  data: {
    name: string;
    folderId: number;
  };
}

interface IEditSetInfo extends ISetDataQuery {
  setId: number;
}

interface ISetGenerateStory extends ApiParamsFNs {
  words: string[];
}

interface ISetGenerateStoryResponse {
  usedWords: string[];
  maskedStory: string;
  originalStory: string;
}

interface ISetGenerateWordsResponse {
  words: string[];
}

interface ISetSettings extends ApiParamsFNs {
  id: number;
  isForgettingCurveEnabled?: boolean;
  isAutoPlayAudioEnabled?: boolean;
}

interface ISetResetProgress extends ApiParamsFNs {
  setId: number;
}

interface ISetScheduledNotification extends ApiParamsFNs {
  setId: number;
  scorePercentage: number;
}

interface ISetGenerateImageForTerm extends ApiParamsFNs {
  term: string;
  definition?: string;
}

interface ISetGenerateImageForTermResponse {
  image: string;
}

export interface IFetchSearchSets extends ApiParamsFNs {
  search?: string;
  level?: string | null;
  quantity?: number;
}

interface ISaveSetQuery extends ApiParamsFNs {
  setId: number;
}

interface ISavedSet {
  id: number;
  createdAt: Date;
  userId: number;
  setId: number;
}

export interface ISaveSetResponse extends IRecommendedSet {
  savedSet: ISavedSet[];
}

interface IRateSetQuery extends ApiParamsFNs {
  rating: number;
  setId: number;
}

interface ICopySetQuery extends ApiParamsFNs {
  setId: number;
  folderId: number;
  name: string;
}

export const fetchSets = async ({ loaderFNNegative, loaderFNPositive, folderId }: IFetchSetsQuery) => {
  return await apiGet<ISet[]>({
    url: `/sets?folderId=${folderId}`,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const fetchSetById = async ({
  setId,
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
}: IFetchSetByIdQuery) => {
  return await apiGet<ISetFullInfo>({
    url: `/sets/${setId}`,
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const createSet = async ({ data, loaderFNNegative, loaderFNPositive, loaderFinally }: ISetDataQuery) => {
  return await apiPost<ISet>({
    url: "/sets",
    payload: data,
    config: { headers: { "Content-Type": "multipart/form-data" } },
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const editSmallInfoSet = async ({ loaderFinally, loaderFNPositive, setId, data }: IEditSmallInfoSetQuery) => {
  return await apiPatch<ISetFullInfo>({
    url: `/sets/${setId}`,
    payload: data,
    loaderFinally,
    loaderFNPositive,
  });
};

export const editInfoSet = async ({ loaderFinally, loaderFNPositive, setId, data }: IEditSetInfo) => {
  return await apiPut<ISetFullInfo>({
    url: `/sets/${setId}`,
    payload: data,
    loaderFinally,
    loaderFNPositive,
    config: { headers: { "Content-Type": "multipart/form-data" } },
  });
};

export const deleteSet = async ({ setId, loaderFNNegative, loaderFNPositive, loaderFinally }: IDeleteSetQuery) => {
  return await apiDelete({
    url: `/sets/${setId}`,
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const generateAiStory = async ({
  words,
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
}: ISetGenerateStory) => {
  return await apiPost<ISetGenerateStoryResponse>({
    url: `/sets/generate/story`,
    payload: { words },
    loaderFinally,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const generateSimilarWords = async ({
  words,
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
}: ISetGenerateStory) => {
  return await apiPost<ISetGenerateWordsResponse>({
    url: `/sets/generate/words`,
    payload: { words },
    loaderFinally,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const generateImageForTerm = async ({
  term,
  definition,
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
}: ISetGenerateImageForTerm) => {
  return await apiPost<ISetGenerateImageForTermResponse>({
    url: `/sets/generate/image`,
    payload: { term, definition },
    loaderFinally,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const toggleSetSettings = async ({
  isAutoPlayAudioEnabled,
  isForgettingCurveEnabled,
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
  id,
}: ISetSettings) => {
  return await apiPatch({
    url: `/sets/${id}/settings`,
    payload: { isAutoPlayAudioEnabled, isForgettingCurveEnabled },
    loaderFinally,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const resetSetProgress = async ({
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
  setId,
}: ISetResetProgress) => {
  return await apiPatch<ISetFullInfo>({
    url: `/sets/${setId}/reset-progress`,
    loaderFinally,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const sendScheduledEmail = async ({
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
  setId,
  scorePercentage,
}: ISetScheduledNotification) => {
  return await apiPost<{ message: string }>({
    url: `/sets/${setId}/forgetting-curve/email`,
    payload: { scorePercentage },
    loaderFinally,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const fetchRecommendedSets = async ({
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
}: ApiParamsFNs = {}) => {
  return await apiGet<IRecommendedSet[]>({
    url: "/sets/recommended",
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const fetchMyLearningSets = async ({ loaderFNNegative, loaderFNPositive, loaderFinally }: ApiParamsFNs = {}) => {
  return await apiGet<ISetFullInfo[]>({
    url: "/sets/my-learning",
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const fetchSearchSets = async ({
  search,
  level,
  quantity,
  loaderFNNegative,
  loaderFNPositive,
  loaderFinally,
}: IFetchSearchSets) => {
  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (level) queryParams.append("level", level);
  if (quantity !== undefined) queryParams.append("quantity", quantity.toString());

  return await apiGet<IRecommendedSet[]>({
    url: `/sets/search?${queryParams.toString()}`,
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const fetchSavedSets = async ({ loaderFNNegative, loaderFNPositive, loaderFinally }: ApiParamsFNs = {}) => {
  return await apiGet<ISaveSetResponse[]>({
    url: "/sets/saved",
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const saveSet = async ({ setId, loaderFNNegative, loaderFNPositive, loaderFinally }: ISaveSetQuery) => {
  return await apiPost<ISaveSetResponse>({
    url: `/sets/saved/${setId}`,
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const unsaveSet = async ({ setId, loaderFNNegative, loaderFNPositive, loaderFinally }: ISaveSetQuery) => {
  return await apiDelete({
    url: `/sets/saved/${setId}`,
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const rateSet = async ({ setId, rating, loaderFNNegative, loaderFNPositive, loaderFinally }: IRateSetQuery) => {
  return await apiPatch<IMark>({
    url: `/sets/rating/${setId}`,
    payload: { rating },
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};

export const copySet = async ({ setId, folderId, name, loaderFNNegative, loaderFNPositive, loaderFinally }: ICopySetQuery) => {
  return await apiPost<ISetFullInfo>({
    url: `/sets/copy/${setId}`,
    payload: { folderId, name },
    loaderFNNegative,
    loaderFNPositive,
    loaderFinally,
  });
};
