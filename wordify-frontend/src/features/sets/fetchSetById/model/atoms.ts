import { atom } from "jotai";
import { ISetFullInfo } from "features/sets/api/setsApi";

export const fullInfoSetAtom = atom<ISetFullInfo | null>(null);
