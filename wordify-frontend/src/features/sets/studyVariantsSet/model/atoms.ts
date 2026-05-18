import { atom } from "jotai";

export enum StudyOption {
  STUDY = "STUDY",
  WRITE = "WRITE",
  LEARN_WITH_AI = "LEARN_WITH_AI",
}

export const usersChoiceStudyOptionAtom = atom<StudyOption | null>(null);
