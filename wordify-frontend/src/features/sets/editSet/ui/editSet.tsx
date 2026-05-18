import "./editSet.styl";
import { ModalSet } from "widgets/modalSet";
import { isEditSetModalOpenedAtom } from "../model/atoms";
import { useAtom } from "jotai";
import { Input } from "shared/ui/input";
import { Button } from "shared/ui/button";
import { Dropdown } from "shared/ui/dropdown";
import { useForm } from "react-hook-form";
import { SetSchemaStep1, setSchemaStep1 } from "features/sets/setSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { foldersAtom, isFolderLoadingAtom } from "features/folder/commonAtom";
import { useEffect, useState } from "react";
import { fetchFolders } from "features/folder/api/folderApi";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";
import { editSmallInfoSet } from "features/sets/api/setsApi";
import { useNavigate } from "react-router-dom";
import { Loader } from "shared/ui/loader";

export const EditSet = () => {
  const nav = useNavigate();
  const [isEditSetModalOpened, setIsEditSetModalOpened] = useAtom(
    isEditSetModalOpenedAtom,
  );
  const [fullSetInfo, setFullSetInfo] = useAtom(fullInfoSetAtom);
  const [folders, setFolders] = useAtom(foldersAtom);
  const [isLoading, setIsLoading] = useAtom(isFolderLoadingAtom);
  const [isLoadingSetInfoSave, setIsLoadingSetInfoSave] = useState(false);

  const {
    formState: { errors },
    handleSubmit,
    register,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(setSchemaStep1),
    mode: "onChange",
    defaultValues: { name: fullSetInfo?.name, folderId: fullSetInfo?.folderId },
  });

  const sendEditSetRequest = async (
    data: SetSchemaStep1,
    successCallback: () => void,
  ) => {
    if (!fullSetInfo?.id) return;
    if (fullSetInfo.name === data.name && fullSetInfo.folderId === data.folderId) {
      successCallback();
      return;
    }
    setIsLoadingSetInfoSave(true);
    const result = await editSmallInfoSet({
      setId: fullSetInfo.id,
      data,
      loaderFNPositive: successCallback,
      loaderFinally: () => setIsLoadingSetInfoSave(false),
    });

    if (result.ok) {
      setFullSetInfo(result.data)
    }
  };

  const onSubmit = async (data: SetSchemaStep1) => {
    await sendEditSetRequest(data, () => {
      setIsEditSetModalOpened(false);
      nav(`/home/sets/edit/${fullSetInfo?.id}`);
    });
  };

  const onSave = async (data: SetSchemaStep1) => {
    if (!(fullSetInfo?.id)) return;

    await sendEditSetRequest(data, () => {
      setIsEditSetModalOpened(false);
      reset(data);
    });
  };

  useEffect(() => {
    if (!folders || folders.length === 0) {
      setIsLoading(true);

      const fetchFoldersData = async () => {
        const result = await fetchFolders({
          loaderFinally: () => setIsLoading(false),
        });

        if (result.ok) {
          setFolders(result.data);
        }
      };

      fetchFoldersData();
    }
  }, [folders]);

  useEffect(() => {
    if (fullSetInfo) {
      reset({
        name: fullSetInfo.name,
        folderId: fullSetInfo.folderId,
      });
    }
  }, [fullSetInfo, reset]);

  return (
    <ModalSet
      isOpened={isEditSetModalOpened}
      onClose={() => setIsEditSetModalOpened(false)}
      title="Edit Set"
    >
      <form
        className="flex-col create-set-form"
        onSubmit={(e) => e.preventDefault()}
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
            fullSetInfo?.folderId
              ? folders?.find((folder) => folder.id === fullSetInfo.folderId)
              : undefined
          }
        />

        {isLoadingSetInfoSave ? (
          <Loader />
        ) : (
          <div className="flex-center edit-set-modal-btns-container">
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit(onSave)}
            >
              Save
            </Button>
            <Button onClick={handleSubmit(onSubmit)} variant="primary">
              Next
            </Button>
          </div>
        )}
      </form>
    </ModalSet>
  );
};
