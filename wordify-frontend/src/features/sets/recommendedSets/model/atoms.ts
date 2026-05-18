import { atom } from "jotai";
import { IRecommendedSet } from "features/sets/api/setsApi";

export const recommendedSetsAtom = atom<IRecommendedSet[]>([]);
