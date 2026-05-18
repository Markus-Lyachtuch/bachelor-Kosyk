import { Request, Response, NextFunction } from "express";
import {
  createMeaning,
  createPhonetic,
  createWord,
  getLanguage,
  getPhonetic,
  getWord,
  getWordsByStartingLetters,
  updateMeaning,
} from "../services/word.service";
import { ApiError } from "../utils/apiError";
import config from "../config/index";
import axios, { AxiosError } from "axios";
import { getPronunciation } from "../utils/getPronunciation";
import { MulterRequest } from "../types/common";

const { dictionaryApiUrl, datamuseApiUrl, mlApiUrl } = config;

interface Definition {
  definition: string;
  synonyms: string[];
  antonyms: string[];
}

interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}

interface Phonetic {
  text: string;
  audio: string;
  sourceUrl: string;
}

interface IDictionaryResponse {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
}

interface IDictionaryApiErrorResponse {
  response: {
    data: {
      title: string;
      message: string;
      resolution: string;
    };
  };
}

function createStructuredMeanings(
  data: IDictionaryResponse[],
  partOfSpeechesArr: string[],
) {
  const appropriateMeanings = partOfSpeechesArr.flatMap((partOfSpeech) => {
    return data.flatMap((word) => {
      return word.meanings.filter(
        (wordMeaning) => wordMeaning.partOfSpeech === partOfSpeech,
      );
    });
  });

  return appropriateMeanings;
}

function getLangCodeForPhoneticVariant(audioUrl: string, word: string) {
  const splittedStrByWord = audioUrl.split(word)[1].split(".")[0];
  const variant = splittedStrByWord.slice(1, splittedStrByWord.length);
  return variant;
}

function checkWordAndLangParams(req: Request) {
  const { lang, word } = req.params;
  if (lang.length < 2 || word.length > 255) {
    console.warn(`[wordInfo] Validation failed: lang=${lang}, word=${word}`);
    throw new ApiError(400, "Wrong language code or word");
  }

  return { lang, word };
}

async function fetchWordInfoFromApis(word: string, lang: string) {
  const foundWord = await getWord(lang, word);

  const isSomeOfMeaningsEmpty = foundWord
    ? foundWord.meanings.some(
        (meaning) =>
          meaning.definitions.length === 0 ||
          meaning.antonyms.length === 0 ||
          meaning.synonyms.length === 0,
      ) || foundWord.meanings.length === 0
    : true;

  if (!foundWord || isSomeOfMeaningsEmpty) {
    try {
      const response = await axios.get<IDictionaryResponse[]>(
        `${dictionaryApiUrl}/entries/${lang}/${word}`,
      );

      if (isSomeOfMeaningsEmpty && foundWord) {
        const meaningsPromises = foundWord.meanings.map((meaning) => {
          const appropriateMeanings = response.data.map((word) => {
            return word.meanings.filter(
              (wordMeaning) =>
                wordMeaning.partOfSpeech === meaning.partOfSpeech,
            );
          });

          const modifiedAppropriateDefinitions = appropriateMeanings
            .flat()
            .map((meaning) => meaning.definitions.map((def) => def.definition))
            .flat();
          const synonyms = appropriateMeanings
            .flat()
            .map((meaning) => meaning.synonyms)
            .flat();
          const antonyms = appropriateMeanings
            .flat()
            .map((meaning) => meaning.antonyms)
            .flat();

          return updateMeaning({
            wordId: foundWord.id,
            definitions: modifiedAppropriateDefinitions,
            partOfSpeech: meaning.partOfSpeech,
            antonyms,
            synonyms,
            source: "dictionaryApi",
          });
        });
        await Promise.all(meaningsPromises);
      }

      const isPhoneticsEmpty = response.data.some(
        (wordObj) => wordObj?.phonetic === undefined,
      );

      let computedWordId;
      if (!foundWord || isPhoneticsEmpty) {
        const language = await getLanguage({ code: lang });

        let createdWord;
        if (!foundWord) {
          createdWord = await createWord({
            word,
            source: "dictionaryApi",
            languageId: language.id,
            levelId: null,
          });
          console.log(`[wordInfo] Created new word: ID=${createdWord?.id}`);

          if (createdWord?.id) {
            const allMeanings = response.data.flatMap((word) => word.meanings);
            const partOfSpeeches = [
              ...new Set(
                allMeanings.flatMap((meaning) => meaning.partOfSpeech),
              ),
            ];
            const appropriateMeanings = createStructuredMeanings(
              response.data,
              partOfSpeeches,
            );

            for (const part of partOfSpeeches) {
              const filteredMeaningsByPart = appropriateMeanings.filter(
                (meaning) => meaning.partOfSpeech === part,
              );
              const definitions = filteredMeaningsByPart
                .flatMap((meaning) => meaning.definitions)
                .flatMap((def) => def.definition);
              const synonyms = filteredMeaningsByPart.flatMap(
                (meaning) => meaning.synonyms,
              );
              const antonyms = filteredMeaningsByPart.flatMap(
                (meaning) => meaning.antonyms,
              );
              await createMeaning({
                wordId: createdWord?.id,
                synonyms,
                antonyms,
                definitions,
                partOfSpeech: part,
                source: "dictionaryApi",
              });
            }
            console.log(`[wordInfo] Meanings created for new word`);
          }
        }

        computedWordId = foundWord ? foundWord.id : createdWord.id;

        const foundPhonetics = await getPhonetic(
          foundWord ? foundWord.id : computedWordId,
        );

        if (foundPhonetics.length === 0) {
          // when we have a newly created word and want to create phonetics with phonetics that exist in dictionaryApi
          const mappedPhonetics = [
            ...new Set(
              response.data
                .flatMap((word) => word.phonetics)
                .filter(
                  (phonetic) => phonetic.text && phonetic.text.length > 0,
                ),
            ),
          ];

          for (const phonetic of mappedPhonetics) {
            const variant = phonetic?.audio
              ? getLangCodeForPhoneticVariant(phonetic.audio, word)
              : null;
            await createPhonetic({
              variant,
              wordId: foundWord ? foundWord.id : computedWordId,
              audioUrl: phonetic?.audio || null,
              text: phonetic.text,
              source: "dictionaryApi",
            });
          }
        }

        const updatedPhonetics = await getPhonetic(
          foundWord ? foundWord.id : computedWordId,
        );

        if (isPhoneticsEmpty && updatedPhonetics.length === 0) {
          console.log(`[wordInfo] Phonetics missing, trying Datamuse API`);
          const datamuseApiResult = await axios.get(
            `${datamuseApiUrl}?sp=${word}&md=drpf&max=1`,
          );
          const retrievedResult = datamuseApiResult.data[0].tags.find((str) =>
            str.startsWith("pron:"),
          ) as string;

          const pronunciation = getPronunciation(retrievedResult);
          const audioUrls = response.data
            .flatMap((word) => word.phonetics.map((phonetic) => phonetic.audio))
            .filter((phonetic) => phonetic.length > 0);
          const variant = audioUrls?.[0]
            ? getLangCodeForPhoneticVariant(audioUrls[0], word)
            : null;

          await createPhonetic({
            text: pronunciation || "",
            wordId: computedWordId,
            source: "datamuseApi",
            audioUrl: audioUrls[0] ? audioUrls[0] : null,
            variant,
          });
          console.log(
            `[wordInfo] Created phonetic from Datamuse: ${pronunciation}`,
          );
        }
      }
    } catch (error) {
      const modifiedError = error as IDictionaryApiErrorResponse;
      throw new ApiError(400, modifiedError.response.data.title);
    }
  }
}

export async function wordAutocomplete(
  req: Request,
  res: Response,
  _: NextFunction,
): Promise<void> {
  const { lang, word } = checkWordAndLangParams(req);
  const result = await getLanguage({ code: lang });

  const lowercasedWord = word.toLowerCase();

  if (!result) {
    throw new ApiError(400, "Language is not supported");
  }

  let words = await getWordsByStartingLetters(result.id, lowercasedWord);

  if (
    words.some((word) =>
      word.meanings.some((mean) => mean.definitions.length === 0),
    ) ||
    words.length === 0
  ) {
    await fetchWordInfoFromApis(lowercasedWord, lang);
    words = await getWordsByStartingLetters(result.id, lowercasedWord);
  }

  res.status(200).send(words);
}

export async function wordInfo(
  req: Request,
  res: Response,
  _: NextFunction,
): Promise<void> {
  const { lang, word } = checkWordAndLangParams(req);

  await fetchWordInfoFromApis(word, lang);

  const updatedModifiedWord = await getWord(lang, word);
  console.log(`[wordInfo] Returning updated word info. Success.`);
  res.status(200).send(updatedModifiedWord);
}

export async function checkPronunciation(
  req: MulterRequest,
  res: Response,
  _: NextFunction,
) {
  const file = req.file;
  const { targetWord, targetPhonetic } = req.body;

  const { buffer, mimetype } = file;
  const blob = new Blob([buffer], { type: mimetype });

  const formData = new FormData();
  formData.append("target_word", targetWord);
  formData.append("audio", blob, "record.wav");
  formData.append("target_ipa", targetPhonetic);

  try {
    const {
      distance,
      feedback,
      is_correct,
      recognized_raw,
      recognized_simple,
      score,
      target_simple,
    } = (await axios.post(`${mlApiUrl}/v3/check_pronunciation`, formData)).data;

    res.status(200).send({
      distance,
      feedback,
      isCorrect: is_correct,
      recognizedRaw: recognized_raw,
      recognizedSimple: recognized_simple,
      score,
      targetSimple: target_simple,
    });
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new ApiError(error.response.status, error.response.data);
    } else {
      throw new ApiError(500, "ML service is unavailable right now");
    }
  }
}

export async function getWordImage(
  req: Request,
  res: Response,
  _: NextFunction,
) {
  const { term } = req.query;
  try {
    const { data } = await axios.get(
      `${config.pexelsBaseUrl}/search?query=${term}&per_page=5`,
      { headers: { Authorization: config.pexelsApiKey } },
    );

    res.status(200).send(
      data.photos.map((photo) => ({
        src: photo.src.tiny,
        alt: photo.alt,
        id: photo.id,
      })),
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).send(error.response.data);
    } else {
      throw new ApiError(500, "Failed to fetch image");
    }
  }
}
