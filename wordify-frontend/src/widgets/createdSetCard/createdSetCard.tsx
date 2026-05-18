import "./createdSetCard.styl";
import { Input } from "shared/ui/input";
import { ImagePlaceholder } from "shared/ui/imagePlaceholder";
import { useEffect, useRef, useState } from "react";
import { XIconBtn } from "shared/ui/xIconBtn";
import { Button } from "shared/ui/button";

import Head from "shared/assets/icons/head.svg?react";
import CloudArrowUp from "shared/assets/icons/cloudArrowup.svg?react";
import { FetchImageForTerm } from "features/sets/fetchImageForTerm/ui";
import {
  Control,
  FieldErrors,
  useController,
  useFormState,
} from "react-hook-form";
import {
  fetchWordsAutoComplete,
  IWordAutocompleteResponse,
  IWordImage,
} from "features/sets/api/wordsApi";
import { useFile } from "shared/hooks/useFile";
import { FileInput } from "shared/ui/fileInput";
import { IMAGE_ALLOWED_FILE_TYPES } from "shared/const/file";
import { IWordFileImage } from "pages/createSetPage/createSetPage";
import { SetSchemaStep2 } from "features/sets/setSchema";
import { Popover } from "shared/ui/popover/popover";
import { useDropdown } from "shared/hooks/useDropdown";
import { ActionItem } from "shared/ui/actionItem/actionItem";
import useDebounce from "shared/hooks/useDebounce";
import { Loader } from "shared/ui/loader";
import { generateImageForTerm } from "features/sets/api/setsApi";

interface ICreatedSetCard {
  index: number;
  editMode?: boolean;
  id: string | number;
  control: Control<SetSchemaStep2>;
  wordsFilesImages: IWordFileImage[];
  onDelete: (id: string | number) => void;
  addFile: (file: File, id: string | number) => void;
}

interface IWordImageWithFile extends IWordImage {
  file?: File;
}

export const CreatedSetCard = ({
  id,
  index,
  control,
  addFile,
  onDelete,
  editMode,
  wordsFilesImages,
}: ICreatedSetCard) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreatedSetCardLoading, setIsCreatedSetCardLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [autoCompleteWords, setAutoCompleteWords] = useState<
    IWordAutocompleteResponse[]
  >([]);
  const [imagesForSlider, setImagesForSlider] = useState<IWordImageWithFile[]>(
    [],
  );
  const [isImagePlaceholderSelected, setIsImagePlaceholderSelected] =
    useState(false);
  const [selectedImageIndex, setSelectedWordImageIndex] = useState<
    number | null
  >(null);
  const [selectedImage, setSelectedImage] = useState<IWordImageWithFile | null>(
    null,
  );

  const {
    containerRef: termContainerRef,
    popoverRef,
    isDropdownVisible,
    setIsDropdownVisible,
  } = useDropdown();
  const [selectedTermFromAutoComplete, setSelectedTermFromAutoComplete] =
    useState<IWordAutocompleteResponse | null>(null);

  const {
    containerRef: definitionContainerRef,
    popoverRef: definitionPopoverRef,
    setIsDropdownVisible: setIsDefinitionDropdownVisible,
  } = useDropdown();

  const { onFileChange, file } = useFile({
    onLoadedFile: (file) => {
      imageField.onChange(file);
    },
    onResultImage: ({ result, file }) =>
      result &&
      !imageUrlErrorMsg &&
      !imageErrors.error?.message &&
      setImagesForSlider((prev) => {
        setSelectedWordImageIndex(prev.length);
        return [
          ...prev,
          {
            src: result,
            file: file as File,
            id: prev.length + 1,
            alt: `${termField.value}-uploaded-${prev.length + 1}`,
          },
        ];
      }),
  });

  const { field: termField, fieldState: termErrors } = useController({
    name: `words.${index}.term`,
    control,
  });

  const { field: definitionField, fieldState: definitionErrors } =
    useController({
      name: `words.${index}.definition`,
      control,
    });

  const { field: imageField, fieldState: imageErrors } = useController({
    name: `words.${index}.imageUrl`,
    control,
  });

  const { field: indexField, fieldState: indexErrors } = useController({
    name: `words.${index}.index`,
    control,
  });

  const debouncedSearchTerm = useDebounce(termField.value, 1000);

  const { errors } = useFormState({ control });
  const modifiedErrors = errors as { words: FieldErrors<SetSchemaStep2> };

  const termErrorMsg = modifiedErrors?.words?.words?.[index]?.term?.message;
  const definitionErrorMsg =
    modifiedErrors?.words?.words?.[index]?.definition?.message;
  const imageUrlErrorMsg =
    modifiedErrors?.words?.words?.[index]?.imageUrl?.message;

  const resetImage = () => {
    setSelectedImage(null);
  };

  const handleImageSelect = (imageIndex: number) => {
    const selected = imagesForSlider[imageIndex];
    setSelectedImage(selected);
    const { src } = selected;

    if (
      typeof src === "string" &&
      src.startsWith("data:") &&
      src.includes(";base64,") &&
      file
    ) {
      imageField.onChange(null);
      selected?.file && addFile(selected?.file, id);
      const foundIndex = wordsFilesImages.findIndex((item) => item.id === id);
      indexField.onChange(
        foundIndex === -1 ? wordsFilesImages.length : foundIndex,
      );
    } else {
      indexField.onChange(null);
      imageField.onChange(src);
    }
  };

  const updateImages = (images: IWordImage[]) => {
    setImagesForSlider(images);
  };

  const handleClickActionItem = (word: IWordAutocompleteResponse) => {
    termField.onChange(word.word);
    setIsDropdownVisible(false);
    setSelectedTermFromAutoComplete(word);
  };

  const handleClickDefinitionActionItem = (
    _: React.MouseEvent<HTMLDivElement, MouseEvent>,
    definition: string,
  ) => {
    definitionField.onChange(definition);
    setIsDefinitionDropdownVisible(false);
    setSelectedTermFromAutoComplete(null);
  };

  const onGenerateImage = async () => {
    if (!termField.value) return;

    setIsCreatedSetCardLoading(true);
    const result = await generateImageForTerm({
      term: termField.value,
      definition: definitionField.value,
    });
    if (result.ok) {
      setSelectedImage({
        src: result.data.image,
        alt: `${termField.value}-selected`,
        id: `${id}-selected`,
      });
      setImagesForSlider(prev => {
        setSelectedWordImageIndex(prev.length);
        return [...prev, {
          src: result.data.image,
          alt: `${termField.value}-selected`,
          id: `${id}-selected`,
        }]
      });
    }
    setIsCreatedSetCardLoading(false);
  }

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  useEffect(() => {
    if (imageField.value && typeof imageField.value === "string") {
      setSelectedImage({
        src: imageField.value as string,
        alt: `${termField.value}-selected`,
        id: `${id}-selected`,
      });
    }
  }, []);

  useEffect(() => {
    if (debouncedSearchTerm && isDropdownVisible) {
      const fetchWordsAutoCompleteCall = async () => {
        const result = await fetchWordsAutoComplete({
          term: debouncedSearchTerm.toLowerCase(),
          langCode: "en",
        });
        if (result.ok && popoverRef.current) {
          setAutoCompleteWords(result.data);
        }
      };

      fetchWordsAutoCompleteCall();
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (autoCompleteWords.length > 0 && popoverRef.current) {
      setIsDropdownVisible(true);
      popoverRef.current.style.height = `${popoverRef.current.scrollHeight}px`;
    }
  }, [autoCompleteWords]);

  return (
    <div
      className={`created-set-card-wrapper ${isImagePlaceholderSelected && "created-set-card-wrapper-selected"}`}
    >
      <div
        className={`flex-col created-set-card ${isImagePlaceholderSelected && "created-set-card-selected"} ${isPageLoaded ? "show" : "hide"}`}
      >
        <div className="flex-between-center">
          <span>{index + 1}</span>
          <XIconBtn onClick={() => onDelete(id)} width={20} height={20} />
        </div>
        <div className="flex-between-center created-set-card-content">
          <div
            className="created-set-card-term-input-container"
            ref={termContainerRef}
          >
            <Input
              {...termField}
              placeholder="Enter word"
              onFocus={() => setIsDropdownVisible(true)}
              onBlur={() => setIsDropdownVisible(false)}
            />
            <Popover ref={popoverRef} className={`no-scrollbar`}>
              {autoCompleteWords.length > 0 &&
                autoCompleteWords.map((term) => (
                  <ActionItem
                    onClick={() => handleClickActionItem(term)}
                    key={term.id}
                  >
                    <span>{term.word}</span>{" "}
                    <span>{term.meanings[0].partOfSpeech}</span>
                  </ActionItem>
                ))}
            </Popover>
          </div>
          <div className="created-set-card-vertical-line"></div>
          <div className="flex-y-center created-set-card-definition-input-container">
            <div className="relative" ref={definitionContainerRef}>
              <Input
                {...definitionField}
                onFocus={() => setIsDefinitionDropdownVisible(true)}
                onBlur={() => setIsDefinitionDropdownVisible(false)}
                placeholder="Enter definition"
              />
              <Popover ref={definitionPopoverRef} className={`no-scrollbar`}>
                {selectedTermFromAutoComplete &&
                  selectedTermFromAutoComplete.meanings.map(
                    ({ definitions, id, partOfSpeech }) => {
                      const modifiedDefinitions = definitions.join(", ");
                      return (
                        <ActionItem
                          onClick={(e) =>
                            handleClickDefinitionActionItem(
                              e,
                              modifiedDefinitions,
                            )
                          }
                          key={id}
                        >
                          <span>{partOfSpeech}</span>{" "}
                          <span>{modifiedDefinitions}</span>
                        </ActionItem>
                      );
                    },
                  )}
              </Popover>
            </div>
            <div className="created-set-card-vertical-line"></div>
            <ImagePlaceholder
              onClick={() => setIsImagePlaceholderSelected((prev) => !prev)}
              isSelected={isImagePlaceholderSelected}
              selectedImage={selectedImage}
              resetImage={resetImage}
              text="Place image"
            />
          </div>
        </div>
        <p className="text-error">
          {termErrors.error?.message ||
            definitionErrors.error?.message ||
            imageErrors.error?.message ||
            indexErrors.error?.message ||
            imageUrlErrorMsg ||
            termErrorMsg ||
            definitionErrorMsg}
        </p>
      </div>
      <div
        className={`${isImagePlaceholderSelected ? "show created-set-card-image-info-selected" : "hide created-set-card-image-info"}`}
      >
        <FetchImageForTerm
          editMode={editMode}
          images={imagesForSlider}
          updateImages={updateImages}
          isPageLoaded={isPageLoaded}
          term={termField.value || ""}
          selectedImage={selectedImage}
          onSelectSlide={handleImageSelect}
          selectedImageIndex={selectedImageIndex}
          debouncedSearchTerm={debouncedSearchTerm}
        />
        <div className={`created-set-card-additional-info-btns ${isCreatedSetCardLoading ? "flex-center" : "flex-y-center flex-x-end"}`}>
          {isCreatedSetCardLoading ? <Loader /> : <>
            <FileInput
              ref={fileInputRef}
              resetDefaultStyles
              accept={IMAGE_ALLOWED_FILE_TYPES.join(",")}
              onChange={onFileChange}
              id={`${index}-upload-image-file`}
              type="file"
            >
              <Button
                onClick={() =>
                  fileInputRef.current && fileInputRef.current?.click()
                }
                type="button"
                className="flex-center"
                variant="outline"
              >
                Upload <CloudArrowUp />
              </Button>
            </FileInput>
            <Button onClick={onGenerateImage} type="button" className="flex-center" variant="outline">
              Generate image <Head />
            </Button>
            <Button
              type="button"
              onClick={() => setIsImagePlaceholderSelected(false)}
              variant="outline"
            >
              Close
            </Button>
          </>}
        </div>
      </div>
    </div>
  );
};
