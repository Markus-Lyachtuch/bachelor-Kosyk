import "./createSetPage.styl";
import { createSetFullInfoAtom } from "features/sets/createSet/model/atoms";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "shared/ui/button";
import { ImagePlaceholder } from "shared/ui/imagePlaceholder";
import { Title } from "shared/ui/title";
import { CreatedSetCard } from "widgets/createdSetCard";

import Head from "shared/assets/icons/head.svg?react";
import {
  getFromLocalStorage,
  removeFromLocalStorage,
} from "shared/lib/localStorage";
import { LocalStorageKeys } from "shared/const/localstorageKeys";
import { base64ToFile } from "shared/lib/base64ToFile";
import { readTextFromBrowserFile } from "shared/lib/readFile";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileInput } from "shared/ui/fileInput";
import { useFile } from "shared/hooks/useFile";
import { IWordImage } from "features/sets/api/wordsApi";
import { IMAGE_ALLOWED_FILE_TYPES } from "shared/const/file";
import { createSet, generateSimilarWords } from "features/sets/api/setsApi";
import { Loader } from "shared/ui/loader";
import { SetSchemaStep1, SetSchemaStep1LocalStorage, setSchemaStep2, SetSchemaStep2 } from "features/sets/setSchema";

const generateId = () => crypto.randomUUID();

export interface IWordFileImage {
  id: string | number;
  file: File;
}

export const CreateSetPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [wordsFilesImages, setWordsFilesImages] = useState<IWordFileImage[]>(
    [],
  );
  const [selectedImage, setSelectedImage] = useState<IWordImage | null>(null);
  const {
    onFileChange,
    resetFile,
    fileInputRef,
    file: setImageFile,
  } = useFile({
    onLoadedFile: (file) =>
      setValue("setImageFile", file, { shouldValidate: true }),
    onResultImage: ({ result }) =>
      !errors.setImageFile?.message &&
      setSelectedImage({
        id: generateId(),
        src: result as string,
        alt: "set-image",
      }),
  });
  const { control, handleSubmit, setValue } = useForm<SetSchemaStep2>({
    mode: "onChange",
    resolver: zodResolver(setSchemaStep2),
    defaultValues: {
      words: [{ term: "", definition: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  const { errors } = useFormState({ control });

  const nav = useNavigate();
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const [createsetInfoFromModal, setCreateInfoFromModal] = useAtom(
    createSetFullInfoAtom,
  );
  const [triggerScroll, setTriggerScroll] = useState(false);

  const onAddWord = () => {
    append({ term: "", definition: "" });
    setTriggerScroll((prev) => !prev);
  };

  const onCancel = () => {
    nav(-1);
    removeFromLocalStorage(LocalStorageKeys.TEMP_SET_INFO);
  };

  const onSubmit = async (data: SetSchemaStep2) => {
    const formData = new FormData();
    setImageFile && formData.append("setImage", setImageFile);
    wordsFilesImages
      .map((wordImg) => wordImg.file)
      .forEach((imageFile) => formData.append("wordImages", imageFile));
    formData.append(
      "setData",
      JSON.stringify({
        ...data,
        ...createsetInfoFromModal,
        languageCode: "en",
      }),
    );

    setIsLoading(true);
    const result = await createSet({
      data: formData,
      loaderFinally: () => setIsLoading(false),
    });
    if (result.ok) {
      removeFromLocalStorage(LocalStorageKeys.TEMP_SET_INFO);
      nav(
        `/home/folders/${createsetInfoFromModal?.folderId}/sets/${result.data.id}`,
      );
    }
  };

  const resetSetImage = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    resetFile(fileInputRef);
    setSelectedImage(null);
  };

  const addFile = (file: File, id: string | number) => {
    setWordsFilesImages((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { id, file };
        return updated;
      }
      return [...prev, { id, file }];
    });
  };

  const generateMoreWords = async () => {
      setIsLoading(true);
      const result = await generateSimilarWords({
        words: fields.map((word) => word.term),
        loaderFinally: () => setIsLoading(false),
      });
  
      if (result.ok) {
        result.data.words.forEach((word) => {
          append({
            term: word,
            definition: "",
          });
        });
      }
  }

  useEffect(() => {
    if (wordsContainerRef.current && triggerScroll) {
      wordsContainerRef.current.scrollTop =
        wordsContainerRef.current.scrollHeight;
    }
  }, [triggerScroll]);

  useEffect(() => {
    if (!createsetInfoFromModal) {
      const infoFromStorage: SetSchemaStep1LocalStorage | null =
        getFromLocalStorage(LocalStorageKeys.TEMP_SET_INFO);

      if (!infoFromStorage) {
        nav("/home/folders");
        return;
      }

      if (infoFromStorage?.uploadedFile) {
        infoFromStorage.uploadedFile = base64ToFile(
          infoFromStorage.uploadedFile as string,
          infoFromStorage.fileName as string,
        );
      }

      setCreateInfoFromModal(infoFromStorage as SetSchemaStep1);
    }
  }, []);

  useEffect(() => {
    if (
      createsetInfoFromModal?.uploadedFile &&
      createsetInfoFromModal?.separator
    ) {
      const handleReadFile = async () => {
        const text = (await readTextFromBrowserFile(
          createsetInfoFromModal.uploadedFile as File,
        )) as string;

        const parsedWords = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .map((line) => ({
            term: line.split(createsetInfoFromModal.separator as string)[0],
            definition: line.split(
              createsetInfoFromModal.separator as string,
            )[1],
          }));

        parsedWords.forEach((word) => append(word));
      };

      handleReadFile();
    }
  }, [createsetInfoFromModal]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full create-set-page flex-col"
    >
      <div className="flex-col create-set-page-title-words-container">
        <div className="flex-between-center">
          <Title variant="primary">
            {createsetInfoFromModal?.name || "Untitled Set"}
          </Title>
          <FileInput
            accept={IMAGE_ALLOWED_FILE_TYPES.join(",")}
            ref={fileInputRef}
            id={`${createsetInfoFromModal?.name}-set-image`}
            resetDefaultStyles
            type="file"
            onChange={onFileChange}
          >
            <ImagePlaceholder
              resetImage={resetSetImage}
              selectedImage={selectedImage}
              text="Place set image"
            />
          </FileInput>
        </div>

        <div
          ref={wordsContainerRef}
          className="no-scrollbar create-set-page-words-container-wrapper"
        >
          <div className="create-set-page-words-container flex-col">
            {fields.map((word, index) => (
              <CreatedSetCard
                id={word.id}
                key={word.id}
                index={index}
                wordsFilesImages={wordsFilesImages}
                control={control}
                addFile={addFile}
                onDelete={() => remove(index)}
              />
            ))}
          </div>
        </div>

        {!isLoading && (
          <Button
            type="button"
            variant="rounded"
            onClick={onAddWord}
            className="plus-btn"
          >
            <Title variant="primary">+</Title>
          </Button>
        )}
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="create-set-page-btns flex-between-center">
          <Button onClick={generateMoreWords} className="flex-center" type="button" variant="ai">
            <span>Generate more</span>
            <Head width={16} height={16} />
          </Button>

          <div className="flex-y-center create-set-page-btns-key-actions">
            <Button type="button" onClick={onCancel} variant="outline">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Set
            </Button>
          </div>
        </div>
      )}
    </form>
  );
};
