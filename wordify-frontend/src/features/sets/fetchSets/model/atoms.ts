import { atom } from "jotai";
import { ISet } from "features/sets/api/setsApi";

export const setsAtom = atom<ISet[] | null>(null);
