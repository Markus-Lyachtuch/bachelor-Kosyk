type source = "dictionaryApi" | "oxford" | "datamuseApi";

interface IMeaining {
  id: number;
  wordId: number;
  partOfSpeech: string;
  definitions: string[];
  synonyms: string[];
  antonyms: string[];
  source: source;
  createdAt: string;
  updatedAt: string;
}

export interface IPhonetic {
  id: number;
  wordId: number;
  text: string;
  audioUrl: string | null;
  variant: string | null;
  source: source;
}

interface IExample {
  id: number;
  wordId: number;
  text: string;
  source: source;
}

interface ILevel {
  id: number;
  level: string;
}

interface ILanguage {
  id: number;
  code: string;
  name: string;
}

export interface IWord {
  id: number;
  word: string;
  levelId: number | null;
  languageId: number;
  source: source;
  createdAt: string;
  updatedAt: string;
  meanings: IMeaining[];
  phonetics: IPhonetic[];
  examples: IExample[];
  level: ILevel | null;
  language: ILanguage;
}

interface IFeedbackPronunciation {
  word: string;
    distance: number;
    feedback: string;
    isCorrect: boolean;
    recognizedRaw: string;
    recognizedSimple: string;
    score: number;
    targetSimple: string;
}

export interface IPronunciationCheck {
  feedback: IFeedbackPronunciation[];
}
