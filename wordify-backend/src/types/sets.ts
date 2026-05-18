export interface IParsedUserWord {
  term: string;
  definition: string;
  index: number | null;
  imageUrl: string | null;
}

export interface IParsedSetData {
  name: string;
  folderId: number;
  languageCode: string;
  words: IParsedUserWord[];
}
