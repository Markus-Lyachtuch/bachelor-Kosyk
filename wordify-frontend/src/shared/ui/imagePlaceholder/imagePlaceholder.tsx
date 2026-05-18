import { useState } from "react";
import "./imagePlaceholder.styl";
import Trash from "shared/assets/icons/trash.svg?react";
import ImagePlaceholderIcon from "shared/assets/icons/imageWallpaper.svg?react";
import { IWordImage } from "features/sets/api/wordsApi";

interface IImagePlaceholder {
  text: string;
  isSelected?: boolean;
  onClick?: () => void;
  resetImage?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  selectedImage?: IWordImage | null;
}

export const ImagePlaceholder = ({
  text,
  isSelected,
  resetImage,
  onClick,
  selectedImage,
}: IImagePlaceholder) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="image-placeholder-wrapper">
      {selectedImage ? (
        <div className="image-placeholder-selected-img-wrapper">
          <img
            className="image-placeholder-selected-img"
            src={selectedImage.src as string}
            alt="Selected"
          />
          <div onClick={(e) => resetImage?.(e)} className="cursor-pointer flex-center image-placeholder-selected-img-delete-block">
            <Trash width={16} height={16} />
          </div>
        </div>
      ) : (
        <div
          className={`cursor-pointer flex-col flex-y-center image-placeholder ${(isHovered || isSelected) && "image-placeholder-selected"}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={onClick}
        >
          <ImagePlaceholderIcon
            fill={isHovered || isSelected ? "var(--primary)" : "var(--black)"}
          />
          <span>{text}</span>
        </div>
      )}
    </div>
  );
};
