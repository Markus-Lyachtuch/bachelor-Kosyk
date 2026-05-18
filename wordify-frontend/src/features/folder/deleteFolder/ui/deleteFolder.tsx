import { useAtom } from "jotai";
import { ModalFolder } from "widgets/modalFolder";
import { isDeleteFolderModalOpenAtom } from "../model/atoms";
import {
    foldersAtom,
  isFolderLoadingAtom,
  selectedFolderAtom,
} from "features/folder/commonAtom";
import { deleteFolder } from "features/folder/api/folderApi";

export const DeleteFolder = () => {
  const [_, setFolders] = useAtom(foldersAtom);
  const [selectedFolder, __] = useAtom(selectedFolderAtom);
  const [isLoading, setIsLoading] = useAtom(isFolderLoadingAtom);
  const [isDeleteModalShowed, setIsDeleteModalShowed] = useAtom(isDeleteFolderModalOpenAtom);

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;
    setIsLoading(true);
    const result = await deleteFolder(selectedFolder.id);
    if (result.ok) {
      setFolders((prev) =>
        prev ? prev.filter((folder) => folder.id !== selectedFolder.id) : null,
      );
      setIsDeleteModalShowed(false);
    }
    setIsLoading(false);
  };

  return (
    <ModalFolder
      onClose={() => setIsDeleteModalShowed(false)}
      isModalShowed={isDeleteModalShowed}
      title="Delete Folder"
      isLoading={isLoading}
      confirmBtnProps={{
        onClick: handleDeleteFolder,
        text: "Delete",
        variant: "danger",
      }}
      cancelBtnProps={{
        onClick: () => setIsDeleteModalShowed(false),
        text: "Cancel",
      }}
    >
      Are you sure you want to delete {selectedFolder?.name} folder?
    </ModalFolder>
  );
};
