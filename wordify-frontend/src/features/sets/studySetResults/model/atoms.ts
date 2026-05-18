import { atom } from "jotai";

export const recommendationForStudiedSetAtom = atom<string | null>(null);
export const missedWordsAndTheirCountAtom = atom<Map<any, any>>(new Map());

export const setWordInfoMissed = (prev: Map<any, any>, term: string) => {
  const copyPrev = structuredClone(prev);

  if (copyPrev?.has(term)) {
    const countMissed = copyPrev.get(term);
    copyPrev.set(term, countMissed + 1);
  } else {
    copyPrev?.set(term, 1);
  }

  return copyPrev;
};
