import { createStore, atom } from "jotai";
import { sessionAtom } from "entities/session/model/sessionsAtom";
import { foldersAtom, selectedFolderAtom, isFolderLoadingAtom } from "features/folder/commonAtom";
import { isCreateFolderModalOpenAtom } from "features/folder/createFolder/model/atoms";
import { isEditFolderModalOpenAtom } from "features/folder/editFolder/model/atoms";
import { isDeleteFolderModalOpenAtom } from "features/folder/deleteFolder/model/atoms";
import { isCreateSetModalOpenedAtom } from "features/sets/createSet/model/atoms";
import { isEditSetModalOpenedAtom } from "features/sets/editSet/model/atoms";
import { isDeleteModalSetShowedAtom } from "features/sets/deleteSet/model/atoms";

export const store = createStore();

/**
 * Write-only atom that resets all application state to defaults.
 * Use on logout to prevent stale data from leaking between sessions.
 */
export const resetAllAtom = atom(null, (_, set) => {
  set(sessionAtom, null);

  set(foldersAtom, null);
  set(selectedFolderAtom, null);
  set(isFolderLoadingAtom, false);
  set(isCreateFolderModalOpenAtom, false);
  set(isEditFolderModalOpenAtom, false);
  set(isDeleteFolderModalOpenAtom, false);

  set(isCreateSetModalOpenedAtom, false);
  set(isEditSetModalOpenedAtom, false);
  set(isDeleteModalSetShowedAtom, false);
});
