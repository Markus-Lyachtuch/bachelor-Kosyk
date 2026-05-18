import "./editSetPage.styl";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "shared/ui/button";
import { ImagePlaceholder } from "shared/ui/imagePlaceholder";
import { Title } from "shared/ui/title";
import { CreatedSetCard } from "widgets/createdSetCard";

import Head from "shared/assets/icons/head.svg?react";
import { removeFromLocalStorage } from "shared/lib/localStorage";
import { LocalStorageKeys } from "shared/const/localstorageKeys";
import { useFieldArray, useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileInput } from "shared/ui/fileInput";
import { useFile } from "shared/hooks/useFile";
import { IWordImage } from "features/sets/api/wordsApi";
import { IMAGE_ALLOWED_FILE_TYPES } from "shared/const/file";
import {
  editInfoSet,
  fetchSetById,
  generateSimilarWords,
  ISetFullInfo,
} from "features/sets/api/setsApi";
import { Loader } from "shared/ui/loader";
import { setSchemaStep2, SetSchemaStep2 } from "features/sets/setSchema";
import { useAtom } from "jotai";
import { fullInfoSetAtom } from "features/sets/fetchSetById/model/atoms";

const generateId = () => crypto.randomUUID();

export interface IWordFileImage {
  id: string | number;
  file: File;
}

export const EditSetPage = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSetInfo, setIsLoadingSetInfo] = useState(false);
  const [fullSetInfo, setFullSetInfo] = useAtom(fullInfoSetAtom);
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
      words: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "words",
  });

  const { errors } = useFormState({ control });

  const nav = useNavigate();
  const wordsContainerRef = useRef<HTMLDivElement>(null);
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
        folderId: fullSetInfo?.folderId,
        languageCode: "en",
      }),
    );

    setIsLoading(true);
    const result = await editInfoSet({
      data: formData,
      setId: fullSetInfo?.id as number,
      loaderFinally: () => setIsLoading(false),
    });
    if (result.ok) {
      nav(`/home/folders/${fullSetInfo?.folderId}/sets/${result.data.id}`);
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

  const setFetchedInfo = (data: ISetFullInfo) => {
    const { setImage, words, name } = data;
    if (setImage) {
      setSelectedImage({
        id: generateId(),
        src: setImage,
        alt: `${name}-image`,
      });
    }

    words.forEach((word) => {
      append({
        term: word.term,
        definition: word?.definition || "",
        id: word.id,
        imageUrl: word?.image,
      });
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
    if (!fullSetInfo) {
      const fetchSetInfo = async () => {
        setIsLoadingSetInfo(true);
        const result = await fetchSetById({
          setId: Number(id),
          loaderFNNegative: () => nav("/home/folders"),
          loaderFinally: () => setIsLoadingSetInfo(false),
        });
        if (result.ok) {
          setFullSetInfo(result.data);
          setFetchedInfo(result.data);
        }
      };
      fetchSetInfo();
    } else {
        setFetchedInfo(fullSetInfo);
    }
  }, [id]);

  useEffect(() => {
    if (wordsContainerRef.current && triggerScroll) {
      wordsContainerRef.current.scrollTop =
        wordsContainerRef.current.scrollHeight;
    }
  }, [triggerScroll]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="h-full create-set-page flex-col"
    >
      {isLoadingSetInfo ? (
        <Loader />
      ) : (
        <>
          <div className="flex-col create-set-page-title-words-container">
            <div className="flex-between-center">
              <Title variant="primary">
                {fullSetInfo?.name || "Untitled Set"}
              </Title>
              <FileInput
                accept={IMAGE_ALLOWED_FILE_TYPES.join(",")}
                ref={fileInputRef}
                id={`${fullSetInfo?.name}-set-image`}
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
                    editMode={true}
                    control={control}
                    addFile={addFile}
                    onDelete={() => remove(index)}
                    wordsFilesImages={wordsFilesImages}
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
                  Update Set
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </form>
  );
};
