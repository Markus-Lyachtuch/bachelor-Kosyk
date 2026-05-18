import { IWordImage } from "features/sets/api/wordsApi";
import { atom } from "jotai";

export const imagesForSliderAtom = atom<IWordImage[]>([]);
