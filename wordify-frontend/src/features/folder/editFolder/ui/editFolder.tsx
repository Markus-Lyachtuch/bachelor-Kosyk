import { FieldErrors, FieldValues, useForm, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import { ModalFolder } from "widgets/modalFolder";
import { isEditFolderModalOpenAtom } from "../model/atoms";
import { useAtom } from "jotai";
import {
  foldersAtom,
  isFolderLoadingAtom,
  selectedFolderAtom,
} from "features/folder/commonAtom";
import { Input } from "shared/ui/input";
import { FolderFormData } from "features/folder/common";
import { editFolder } from "features/folder/api/folderApi";

interface IEditFolder {
  errorsEdit: FieldErrors<FolderFormData>;
  registerEdit: UseFormRegister<FolderFormData>;
  handleSubmitEdit: UseFormHandleSubmit<FolderFormData, FolderFormData>;
}

export const EditFolder = ({
  registerEdit,
  handleSubmitEdit,
  errorsEdit,
}: IEditFolder) => {
  const [isEditModalShowed, setIsEditModalShowed] = useAtom(
    isEditFolderModalOpenAtom,
  );
  const [isLoading, setIsLoading] = useAtom(isFolderLoadingAtom);
  const [__, setFolders] = useAtom(foldersAtom);
  const [selectedFolder, _] = useAtom(selectedFolderAtom);

  const handleEditFolder = async (data: FolderFormData) => {
    console.log("edit data", data);
    setIsLoading(true);
    if (selectedFolder) {
      const result = await editFolder(selectedFolder?.id, data.name);
      setIsLoading(false);
      if (result.ok) {
        setIsEditModalShowed(false);
        setFolders((prev) =>
          prev
            ? prev.map((folder) =>
                folder.id === selectedFolder.id ? result.data : folder,
              )
            : [result.data],
        );
      }
    }
  };

  return (
    <ModalFolder
      onClose={() => setIsEditModalShowed(false)}
      isModalShowed={isEditModalShowed}
      title="Edit Folder"
      isLoading={isLoading}
      confirmBtnProps={{
        onClick: handleSubmitEdit(handleEditFolder),
        text: "Edit",
      }}
      cancelBtnProps={{
        onClick: () => setIsEditModalShowed(false),
        text: "Cancel",
      }}
    >
      <Input
        {...registerEdit("name")}
        error={errorsEdit.name?.message}
        placeholder="Folder name"
        variant="default"
      />
    </ModalFolder>
  );
};
