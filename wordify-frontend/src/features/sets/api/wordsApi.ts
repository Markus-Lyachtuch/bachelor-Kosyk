import { apiGet, ApiParamsFNs } from "shared/api/base";

export interface IWordImage {
  id: number | string;
  src: string | ArrayBuffer;
  alt: string;
}

interface IFetchWordQuery extends ApiParamsFNs {
  term: string;
}

interface IWordInfo {
  level: {
    id: number;
    level: string;
  } | null;
  language: {
    code: string;
    id: number;
    name: string;
  };
  meanings: {
    id: number;
    source: string;
    createdAt: Date;
    updatedAt: Date;
    wordId: number;
    partOfSpeech: string;
    definitions: string[];
    synonyms: string[];
    antonyms: string[];
  }[];
  phonetics: {
    id: number;
    source: string;
    wordId: number;
    text: string | null;
    audioUrl: string | null;
    variant: string | null;
  }[];
  examples: {
    id: number;
    source: string;
    wordId: number;
    text: string;
  }[];
}

interface IFetchWordInfoQuery extends ApiParamsFNs {
  term: string;
  langCode: string;
}

export interface IWordAutocompleteResponse {
  id: number;
  word: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  languageId: number;
  levelId: number | null;

  meanings: {
    id: number;
    partOfSpeech: string;
    definitions: string[];
  }[];
}

export const fetchWordImages = async ({
  loaderFNNegative,
  loaderFNPositive,
  term,
}: IFetchWordQuery) => {
  return await apiGet<IWordImage[]>({
    url: `/word/image?term=${term}`,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const fetchWordInfo = async ({
  loaderFNNegative,
  loaderFNPositive,
  term,
  langCode,
}: IFetchWordInfoQuery) => {
  return await apiGet<IWordInfo[]>({
    url: `/word/${langCode}/${term}`,
    loaderFNNegative,
    loaderFNPositive,
  });
};

export const fetchWordsAutoComplete = async ({
  loaderFNNegative,
  loaderFNPositive,
  term,
  langCode,
}: IFetchWordInfoQuery) => {
  return await apiGet<IWordAutocompleteResponse[]>({
    url: `/word/${langCode}/${term}/autocomplete`,
    loaderFNNegative,
    loaderFNPositive,
  });
};
