import "./createSet.styl";
import { useAtom } from "jotai";
import { Input } from "shared/ui/input";
import { ModalSet } from "widgets/modalSet";
import { Dropdown } from "shared/ui/dropdown";
import {
  createSetFullInfoAtom,
  isCreateSetModalOpenedAtom,
} from "../model/atoms";
import { foldersAtom } from "features/folder/commonAtom";
import { useEffect, useState } from "react";
import { fetchFolders } from "features/folder/api/folderApi";
import { FileInput } from "shared/ui/fileInput";

import Chevron from "shared/assets/icons/chevron.svg?react";
import { useFile } from "shared/hooks/useFile";
import { Button } from "shared/ui/button";
import {
  MODAL_SET_CREATE_ALLOWED_FILE_TYPES,
  MODAL_SET_CREATE_FILE_SEPARATOR_OPTIONS,
} from "shared/const/file";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { LocalStorageKeys } from "shared/const/localstorageKeys";
import { saveToLocalStorage } from "shared/lib/localStorage";
import { SetSchemaStep1, setSchemaStep1 } from "features/sets/setSchema";
import { sessionAtom } from "entities/session/model/sessionsAtom";

interface ICreateSetProps {
  id?: number;
}

export const CreateSet = ({ id }: ICreateSetProps) => {
  const nav = useNavigate();
  const [isCreateSetModalOpened, setIsCreateSetModalOpened] = useAtom(
    isCreateSetModalOpenedAtom,
  );
  const [createSetInfo, setCreateSetInfo] = useAtom(createSetFullInfoAtom);
  const [folders, setFolders] = useAtom(foldersAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [session] = useAtom(sessionAtom);
  const { file, onFileChange, base64File, fileInputRef, resetFile } = useFile({
    onLoadedFile: (file) => setValue("uploadedFile", file),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(setSchemaStep1),
    mode: "onChange",
  });

  const onSubmit = (data: SetSchemaStep1) => {
    setCreateSetInfo({ ...createSetInfo, ...data });
    setIsCreateSetModalOpened(false);
    saveToLocalStorage(LocalStorageKeys.TEMP_SET_INFO, {
      ...createSetInfo,
      ...data,
      uploadedFile: base64File,
      fileName: file?.name,
    });
    nav("/home/sets/create");
  };

  useEffect(() => {
    if (!folders || folders.length === 0) {
      const getFolders = async () => {
        if (session === null) return;

        setIsLoading(true);
        const response = await fetchFolders();
        if (response.ok) {
          setFolders(response.data);
        }
        setIsLoading(false);
      };
      getFolders();
    }

    return () => {
      setValue("uploadedFile", undefined);
      resetFile(fileInputRef);
    };
  }, []);

  return (
    <ModalSet
      isOpened={isCreateSetModalOpened}
      onClose={() => setIsCreateSetModalOpened(false)}
      title="Create Set"
    >
      <form
        className="flex-col create-set-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          error={errors.name?.message}
          variant="default"
          placeholder="name"
          {...register("name")}
        />
        <Dropdown
          placeholder="Select a folder"
          isLoading={isLoading}
          options={folders}
          keyForName="name"
          keyForValue="id"
          onSelectOption={(option) => setValue("folderId", option.id)}
          error={errors.folderId?.message}
          selectedOption={
            id ? folders?.find((folder) => folder.id === id) : undefined
          }
        />
        <FileInput
          accept={MODAL_SET_CREATE_ALLOWED_FILE_TYPES.join(",")}
          labelClassName="cursor-pointer flex-between-center"
          error={errors.uploadedFile?.message}
          onChange={onFileChange}
          id="create-set-file"
          type="file"
        >
          <span className="file-input-label-placeholder">
            {file ? file.name : "Or choose file from your device"}
          </span>
          <Chevron fill="var(--grey)" />
        </FileInput>
        {file && (
          <Dropdown
            onSelectOption={(option) => setValue("separator", option.value)}
            options={MODAL_SET_CREATE_FILE_SEPARATOR_OPTIONS}
            error={errors.separator?.message}
            placeholder="Select a separator"
            isLoading={isLoading}
            keyForValue="value"
            keyForName="name"
          />
        )}
        <Button variant="primary">Next</Button>
      </form>
    </ModalSet>
  );
};
