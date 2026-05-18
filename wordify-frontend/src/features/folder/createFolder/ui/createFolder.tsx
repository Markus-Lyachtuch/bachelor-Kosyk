import { useAtom } from "jotai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createFolder } from "features/folder/api/folderApi";
import { FolderFormData, folderSchema } from "features/folder/common";
import { foldersAtom, isFolderLoadingAtom } from "features/folder/commonAtom";
import { ModalFolder } from "widgets/modalFolder";

import { Input } from "shared/ui/input";

import { isCreateFolderModalOpenAtom } from "../model/atoms";

export const CreateFolder = () => {
  const [isModalCreateFolderOpen, setIsModalCreateFolderOpen] = useAtom(
    isCreateFolderModalOpenAtom,
  );
  const [isLoading, setIsLoading] = useAtom(isFolderLoadingAtom);
  const [_, setFolders] = useAtom(foldersAtom);

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors },
  } = useForm<FolderFormData>({ resolver: zodResolver(folderSchema) });

  const addFolder = async (data: FolderFormData) => {
    setIsLoading(true);
    const result = await createFolder(data.name);
    setIsLoading(false);
    if (result.ok) {
      resetField("name");
      setIsModalCreateFolderOpen(false);
      setFolders((prev) => (prev ? [...prev, result.data] : [result.data]));
    }
  };

  const closeAddModal = () => setIsModalCreateFolderOpen(false);

  return (
    <ModalFolder
      onClose={closeAddModal}
      isModalShowed={isModalCreateFolderOpen}
      title="Create Folder"
      isLoading={isLoading}
      confirmBtnProps={{ onClick: handleSubmit(addFolder), text: "Create" }}
      cancelBtnProps={{
        onClick: closeAddModal,
        text: "Cancel",
      }}
    >
      <Input
        {...register("name")}
        error={errors.name?.message}
        placeholder="Folder name"
        variant="default"
      />
    </ModalFolder>
  );
};
