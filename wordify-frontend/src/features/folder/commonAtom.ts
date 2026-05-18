import { atom } from "jotai";
import { IFolder } from "./api/folderApi";

export const isFolderLoadingAtom = atom(false);
export const foldersAtom = atom<IFolder[] | null>(null);
export const selectedFolderAtom = atom<IFolder | null>(null);
