import { useEffect, useRef, useState } from "react";
import { fetchWordImages, IWordImage } from "features/sets/api/wordsApi";
import { SetImagesSlider } from "widgets/setImagesSlider";

interface IFetchImageForTerm {
  term: string;
  editMode?: boolean;
  images: IWordImage[];
  isPageLoaded: boolean;
  debouncedSearchTerm: string;
  selectedImage: IWordImage | null;
  selectedImageIndex: number | null;
  onSelectSlide: (index: number) => void;
  updateImages: (images: IWordImage[]) => void;
}

export const FetchImageForTerm = ({
  debouncedSearchTerm,
  selectedImageIndex,
  selectedImage,
  onSelectSlide,
  isPageLoaded,
  updateImages,
  editMode,
  images,
  term,
}: IFetchImageForTerm) => {
  const [isLoading, setIsLoading] = useState(false);
  const prevSearchTermRef = useRef(debouncedSearchTerm);

  useEffect(() => {
    const getImagesForSlider = async () => {
      setIsLoading(true);
      const result = await fetchWordImages({ term: debouncedSearchTerm });
      if (result.ok) {
        updateImages(result.data);
      }
      setIsLoading(false);
    };

    const shouldFetch = isPageLoaded && ((debouncedSearchTerm !== prevSearchTermRef.current) || (editMode && selectedImage === null && images.length === 0));

    if (shouldFetch && debouncedSearchTerm.trim() !== "") {
      if ((editMode && selectedImage === null) || !editMode) {
        getImagesForSlider();
        prevSearchTermRef.current = debouncedSearchTerm;
      }
    }
  }, [debouncedSearchTerm, selectedImage, isPageLoaded, editMode, images.length]);

  return (
    <SetImagesSlider
      key={term}
      slides={images}
      selectedSlideIndex={selectedImageIndex}
      onSelectSlide={(index) => onSelectSlide(index)}
      isLoading={isLoading}
      keyForImage="src"
      keyForAlt="alt"
      keyForId="id"
    />
  );
};
