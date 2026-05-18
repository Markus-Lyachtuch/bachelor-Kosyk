import { atom } from "jotai";
import { SetSchemaStep1 } from "features/sets/setSchema";

export const isCreateSetModalOpenedAtom = atom(false);
export const createSetFullInfoAtom = atom<SetSchemaStep1 | null>(null);
