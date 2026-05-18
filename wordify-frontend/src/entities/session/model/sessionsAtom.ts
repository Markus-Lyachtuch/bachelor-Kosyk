import { atom } from "jotai";

export type SessionUser = {
  id: number;
  email: string;
  name?: string;
  picture?: string;
  provider?: string;
  isVerified: boolean;
};

export type Session = {
  user: SessionUser;
};

export const sessionAtom = atom<Session | null | undefined>(undefined);
