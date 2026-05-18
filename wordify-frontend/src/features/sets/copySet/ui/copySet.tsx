import { ModalSet } from "widgets/modalSet";
import { isCopySetModalOpenedAtom } from "../model/atoms";
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
import { copySet } from "features/sets/api/setsApi";
import { useNavigate } from "react-router-dom";
import { Loader } from "shared/ui/loader";

export const CopySet = () => {
  const nav = useNavigate();
  const [isCopySetModalOpened, setIsCopySetModalOpened] = useAtom(
    isCopySetModalOpenedAtom,
  );
  const [fullSetInfo] = useAtom(fullInfoSetAtom);
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
  });

  const onSave = async (data: SetSchemaStep1) => {
    if (!fullSetInfo?.id) return;

    setIsLoadingSetInfoSave(true);
    const result = await copySet({
      setId: fullSetInfo.id,
      name: data.name,
      folderId: data.folderId,
      loaderFNPositive: () => {
        setIsCopySetModalOpened(false);
      },
      loaderFinally: () => setIsLoadingSetInfoSave(false),
    });

    if (result.ok) {
      setIsCopySetModalOpened(false);
      nav(`/home/folders/${result.data.folderId}/sets/${result.data.id}`);
    }
  };

  useEffect(() => {
    if (!folders || folders.length === 0) {
      setIsLoading(true);

      const fetchFoldersData = async () => {
        const result = await fetchFolders({
          loaderFinally: () => setIsLoading(false),
        });

        if (result.ok) {
          console.log('result.data', result.data);

          setFolders(result.data);
        }
      };

      fetchFoldersData();
    }
  }, [folders]);

  useEffect(() => {
    if (fullSetInfo && isCopySetModalOpened && folders && folders.length > 0) {
      reset({
        name: fullSetInfo.name ? `${fullSetInfo.name} copy` : "",
        folderId: folders[0].id,
      });
    }
  }, [fullSetInfo, reset, isCopySetModalOpened, folders]);

  return (
    <ModalSet
      isOpened={isCopySetModalOpened}
      onClose={() => setIsCopySetModalOpened(false)}
      title="Copy Set"
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
        {folders && folders.length > 0 && <Dropdown
          placeholder="Select a folder"
          isLoading={isLoading}
          options={folders}
          keyForName="name"
          keyForValue="id"
          error={errors.folderId?.message}
          selectedOption={folders?.[0]}
          onSelectOption={(option) => setValue("folderId", option.id)}
        />}

        {isLoadingSetInfoSave ? (
          <Loader />
        ) : (
          <div className="flex-center">
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit(onSave)}
            >
              Save
            </Button>
          </div>
        )}
      </form>
    </ModalSet>
  );
};
