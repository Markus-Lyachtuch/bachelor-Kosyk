import { apiGet, apiPost } from "shared/api/base";
import { IPronunciationCheck, IWord } from "../words/model/word";

interface IFetchWordInfo {
  word: string;
  langCode: string;
}

interface ICheckPronunciation {
  targetWord: string;
  targetPhonetic: string;
  audio: Blob;
}

export const fetchWordInfo = async ({
  word,
  langCode = "en",
}: IFetchWordInfo) => await apiGet<IWord>({ url: `/word/${langCode}/${word}` });

export const checkPronunciation = async ({
  targetPhonetic,
  targetWord,
  audio,
}: ICheckPronunciation) => {
  const formData = new FormData();
  formData.append("audio", audio, 'record.wav');  
  formData.append("targetPhonetic", targetPhonetic);
  formData.append("targetWord", targetWord);
  return await apiPost<IPronunciationCheck>({ url: "/word/check-pronunciation", payload: formData });
};
