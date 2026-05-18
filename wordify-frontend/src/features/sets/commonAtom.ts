import { atom } from "jotai";

export const isLoadingSetsAtom = atom<boolean>(false);
export const selectedWordImageIndexAtom = atom<number | null>(null);
