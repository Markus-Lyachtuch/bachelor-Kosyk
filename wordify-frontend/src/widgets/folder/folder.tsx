import "./folder.styl";
import { useState } from "react";
import { Popover } from "shared/ui/popover";
import { ThreeDots } from "shared/ui/threeDots";
import { ActionItem } from "shared/ui/actionItem";
import { BREAKPOINTS } from "shared/const/breakpoints";
import { useClickOutside } from "shared/hooks/useClickOutside";

import Pen from "shared/assets/icons/pen.svg?react";
import Trash from "shared/assets/icons/trash.svg?react";
import FolderIcon from "shared/assets/icons/folder.svg?react";
import { useDropdown } from "shared/hooks/useDropdown";

interface IFolder {
  title: string;
  onClick?: () => void;
  editClick?: () => void;
  deleteClick?: () => void;
  onDoubleClick?: () => void;
}

export const Folder = ({ title, onClick, editClick, deleteClick, onDoubleClick }: IFolder) => {
  const [isHovered, setIsHovered] = useState(false);
  const { containerRef, popoverRef, isDropdownVisible, setIsDropdownVisible } = useDropdown();

  const hideDropdown = () => setIsDropdownVisible(false);
  const handleEditClick = () => {
    editClick && editClick();
    hideDropdown();
  };
  
  const handleDeleteClick = () => {
    deleteClick && deleteClick();
    hideDropdown();
  };

  const handleClickFolder = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const target = e.target as HTMLElement;

    if (
      !target.classList.contains("three-dots-container") &&
      target.getAttribute("name") !== "Edit" &&
      target.getAttribute("name") !== "Delete" &&
      target.textContent !== "Edit" &&
      target.textContent !== "Delete" &&
      onClick
    ) {
      onClick();
    }
  };

  useClickOutside(containerRef, hideDropdown);

  return (
    <div
      ref={containerRef}
      onClick={handleClickFolder}
      onDoubleClick={onDoubleClick}
      className="folder flex-between-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ActionItem title={title} Icon={FolderIcon} />

      <ThreeDots
        gapVariant="small"
        className={`folder-dots-container ${window.innerWidth > BREAKPOINTS.LG && isHovered ? "show" : "hide"} ${window.innerWidth <= BREAKPOINTS.LG && "show"}`}
        onClick={() => setIsDropdownVisible(true)}
      />

      <Popover ref={popoverRef} className={isDropdownVisible ? "show" : "hide"}>
        <ActionItem
          iconName="Edit"
          title="Edit"
          Icon={Pen}
          onClick={handleEditClick}
        />
        <ActionItem
          iconName="Delete"
          title="Delete"
          Icon={Trash}
          onClick={handleDeleteClick}
        />
      </Popover>
    </div>
  );
};
